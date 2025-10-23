import { DataPacket_Kind, RoomServiceClient } from 'livekit-server-sdk';

const LIVEKIT_URL = process.env.LIVEKIT_URL!;
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY!;
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET!;

// const svc = new RoomServiceClient(LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET);

// const data = "I am is John"
// const agentId = ""

// router.post("/api/room/notify-agent", async (req, res) => {
//     const { room, agentId, data } = req.body;
//     await svc.sendData("mock_room", new TextEncoder().encode(data), DataPacket_Kind.RELIABLE, {
//         destinationSids: [agentId]
//     })
// })

export class RoomService {
    client: RoomServiceClient

    constructor() {
        this.client = new RoomServiceClient(LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET);
    }

    async notifyAgent(room: string, agentId: string, data: string) {
        await this.client.sendData(room, new TextEncoder().encode(data), DataPacket_Kind.RELIABLE, {
            destinationSids: [agentId]
        })
    }
}

