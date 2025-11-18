import axios from "axios";

const BACKEND_URL = "http://localhost:3000";

export type HelpRequests = {
    id: number;
    request: string;
    response: string | null;
    created_at: string;
    updated_at: string;
    responded: boolean;
    status: "Pending" | "Resolved" | "Unresolved";
    source: string;
    created_by: string;
}

type Requests = {
    requests: HelpRequests[]
}

export const getPendingRequests = async (): Promise<HelpRequests[]> => {
    const response = await axios.get<Requests>(`${BACKEND_URL}/api/help-requests/pending`);
    return response.data.requests.sort((a, b) => b.id - a.id);
}

export const getPastRequests = async (): Promise<HelpRequests[]> => {
    const response = await axios.get<Requests>(`${BACKEND_URL}/api/help-requests`);
    return response.data.requests.sort((a, b) => b.updated_at.localeCompare(a.updated_at));
}

export const answerRequests = async (id: number, answer: string) => {
    await axios.patch(`${BACKEND_URL}/api/help-requests/${id}`, {
        answer: answer,
        responded: true
    })
}