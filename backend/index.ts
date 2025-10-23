import express from "express";
import prisma from "./db";
import { request_status } from "./db/generated/prisma/enums";
import { RoomService } from "./room";

const PORT = 3000;
const app = express();
app.use(express.json());
const svc = new RoomService();

app.get("/api/help-requests", async (req, res) => {
    // Get resolved requests
    const requests = await prisma.help_requests.findMany({
        where: {
            status: request_status.Resolved
        }
    });

    res.json({
        requests
    });
});

app.post("/api/help-requests", async (req, res) => {
    const { query, agent_identity, room } = req.body;
    console.log(query);

    const help_request = await prisma.help_requests.create({
        data: {
            request: query,
            source: room,
            created_by: agent_identity,
            status: request_status.Pending
        }
    });
    console.log(help_request.id);
    res.json({
        id: help_request.id
    })
});

app.patch("/api/help-requests/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const { answer, responded } = req.body;
    
    const data: { answer: string, responded: boolean, status: request_status } = {
        answer: "",
        responded: false,
        status: request_status.Unresolved
    };

    if (responded) {
        data.answer = answer;
        data.responded = true;
        data.status = request_status.Resolved

        const help_request = await prisma.help_requests.findUnique({
            where: {
                id: id
            }
        });

        if (!help_request) return;

        // notify agent
        await svc.notifyAgent(help_request.source, help_request.created_by, answer);
    }

    await prisma.help_requests.update({
        where: {
            id: id
        },
        data: data
    });
});

app.listen(PORT, () => {
    console.log(`Server is listening at Port ${PORT}`);
});