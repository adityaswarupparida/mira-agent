import logging
import httpx
import os

from dotenv import load_dotenv
from livekit.agents import (
    Agent,
    AgentSession,
    JobContext,
    JobProcess,
    MetricsCollectedEvent,
    RoomInputOptions,
    WorkerOptions,
    cli,
    metrics,
)
from livekit.plugins import noise_cancellation, silero
from livekit.plugins.turn_detector.multilingual import MultilingualModel
from livekit.agents import function_tool, RunContext
from livekit.agents import ChatContext, ChatMessage
from kb import KnowledgeBase
from sub import Subscriber

logger = logging.getLogger("agent")

load_dotenv(".env.local")


class Assistant(Agent):
    def __init__(self, ctx: JobContext) -> None:
        super().__init__(
            instructions="""You are Mira, a polite and professional voice AI assistant for Live Beauty Salon. 
            The user is interacting with you via voice, even if you perceive the conversation as text. 
            You warmly greet callers and assist them with accurate information about salon services, appointments, prices, stylists, and policies based on your current knowledge. 

            If the user asks a question and you have information, answer it briefly and ask if they need anything else and then pause, for user to respond.  
            IMPORTANT: If you are uncertain or the question is outside your knowledge, say "Let me check with my supervisor and get back to you" and trigger a help request to a human supervisor. 
            If the user says "No", "That's all", "I'm good", "Thanks", or similar conclusive responses, then thank them warmly and wish them well (e.g., "Thank you for calling! Have a wonderful day ahead!")
            If the user's response is not conclusive or unclear or ambiguous, politely ask clarifying questions (e.g., "I didn't quite catch that. Could you please repeat?" or "What would you like to know about?")
            DO NOT raise help requests for: casual greetings, thank you messages, "no" responses, or end-of-conversation signals

            Your tone is calm, friendly, and confident, like a helpful salon receptionist. 
            Your responses are short, natural, and conversational without complex punctuation, emojis, or symbols. 
            You never guess, or provide incomplete information. 
            You always aim to make the caller feel heard, valued, and cared for.""",
        )
        self.kb = None
        self.room = ctx.room
        self.agent_identity = None
        self.sub = Subscriber()

        # self.room.on("data_received", self.on_data_received)

    async def on_enter(self) -> None:
        self.kb = await KnowledgeBase.create()

        await self.session.say(
            "Hello. I am Mira from Live Beauty Salon. How can I help you?",
            allow_interruptions=False,
        )
        self.agent_identity = str(self.room.local_participant.sid) if self.room.local_participant else None
        await self.start_listening(f"Channel:{self.agent_identity}")
        
        # logging.debug(self.agent_identity)
        # logging.debug(self.room.local_participant)


    async def on_user_turn_completed(self, turn_ctx: ChatContext, new_message: ChatMessage):
        rag_content = await self.kb.search_knowledge(new_message.text_content)
        # logging.debug(rag_content)

        turn_ctx.add_message(
            role="assistant", 
            content=f"""Additional information relevant to the user's next message: {rag_content}.
            IMPORTANT: If you don't find any answer to user's query in above message, then say politely to user: {"Let me check with my supervisor and get back to you."} 
            and raise help request to supervisor without informing about this to user and also ask if any other help you could provide in meantime
            """
        )


    # async def on_data_received(self, data_packet: rtc.DataPacket):
    #     payload = json.loads(data_packet.data.decode('utf-8'))      
    #     logging.info(payload)
    #     response = str(payload)
    async def start_listening(self, channel: str):
        pubsub = await self.sub.get_pubsub(channel)
        async for message in pubsub.listen():
            if message["type"] == "message":
                decoded_message = message['data'].decode('utf-8')
                logging.info(f"{decoded_message}")
                await self.kb.add_knowledge([decoded_message])


    @function_tool
    async def raise_help_request(self, context: RunContext, query: str):
        """Use this tool to raise help request to supervisor for query whose response couldn't be found.
    
        Args:
            query: The question asked by user about Salon like services offered, timings, etc.
        """
    
        logging.info(f"Raising help requests for {query}")
        data = {
            "query": query,
            "room": self.room.name,
            "agent_identity": self.agent_identity
        }
        logging.debug(data)
    
        try:
            async with httpx.AsyncClient() as client:
                await client.post(f"{os.getenv('BACKEND_URL')}/api/help-requests", json=data)
                return

        except httpx.ReadTimeout:
            logging.error("Backend took too long to respond while raising help request.")



def prewarm(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load()


async def entrypoint(ctx: JobContext):
    # Logging setup
    # Add any other context you want in all log entries here
    ctx.log_context_fields = {
        "room": ctx.room.name,
    }

    # Set up a voice AI pipeline using OpenAI, Cartesia, AssemblyAI, and the LiveKit turn detector
    session = AgentSession(
        stt="assemblyai/universal-streaming:en",
        llm="openai/gpt-4.1-mini",
        tts="cartesia/sonic-2:9626c31c-bec5-4cca-baa8-f8ba9e84c8bc",
        turn_detection=MultilingualModel(),
        vad=ctx.proc.userdata["vad"],

        # preemptive_generation=True,
    )

    usage_collector = metrics.UsageCollector()

    @session.on("metrics_collected")
    def _on_metrics_collected(ev: MetricsCollectedEvent):
        metrics.log_metrics(ev.metrics)
        usage_collector.collect(ev.metrics)

    async def log_usage():
        summary = usage_collector.get_summary()
        logger.info(f"Usage: {summary}")

    ctx.add_shutdown_callback(log_usage)

    # Start the session, which initializes the voice pipeline and warms up the models
    await session.start(
        agent=Assistant(ctx),
        room=ctx.room,
        room_input_options=RoomInputOptions(
            # For telephony applications, use `BVCTelephony` for best results
            noise_cancellation=noise_cancellation.BVC(),
        ),
    )

    # Join the room and connect to the user
    await ctx.connect()


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint, prewarm_fnc=prewarm))
