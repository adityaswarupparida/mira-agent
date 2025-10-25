import os
import json
from dotenv import load_dotenv
from qdrant_client import AsyncQdrantClient
from groq import Groq

load_dotenv(".env.local")

COLLECTION_NAME = "salon_knowledge_base"
LOCAL_MEMORY_FILE = "learned_answers.json"

class KnowledgeBase:
    def __init__(self, collection_name=COLLECTION_NAME):
        self.collection = collection_name
        self.q_client = AsyncQdrantClient(host="localhost", port=6333)
        self.rag_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        

    @classmethod
    async def create(cls, collection_name=COLLECTION_NAME):
        self = cls(collection_name)
        await self.seed_knowledge()
        return self

    async def seed_knowledge(self):
        exists = await self.q_client.collection_exists(self.collection)
        if exists:
            return
        with open("../seed.json") as faq:
            data = json.load(faq)
        faqs = [f["answer"] for f in data]
        await self.add_knowledge(faqs)
        
    async def add_knowledge(self, docs: list[str]):
        await self.q_client.add(
            collection_name=self.collection,
            documents=docs
        )
        self.save_knowledge(docs)

    async def retrieve(self, text: str, limit: int = 5):
        search_texts = await self.q_client.query(
            collection_name=self.collection,
            query_text=text,
            limit=limit
        )
        return search_texts
    
    async def search_knowledge(self, user_query: str):
        docs = await self.retrieve(user_query)

        context = "\n".join(d.document for d in docs)
        return context
    
    def save_knowledge(self, docs: list[str]):
        data = {"Learned Answers": []}
        if os.path.exists(LOCAL_MEMORY_FILE):
            try:
                with open(LOCAL_MEMORY_FILE, "r") as f:
                    data = json.load(f)
            except Exception:
                data = {"Learned Answers": []}

        # Append new docs
        data["Learned Answers"].extend(docs)

        # Save back
        with open(LOCAL_MEMORY_FILE, "w") as f:
            json.dump(data, f, indent=2)