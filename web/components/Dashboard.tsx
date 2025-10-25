"use client"
import { useEffect, useState } from "react"
import { getPastRequests, getPendingRequests, HelpRequests } from "@/api"
import { Card } from "./Card";

export const Dashboard = ({ name, type }: { name: string, type: string }) => {
    const [requests, setRequests] = useState<HelpRequests[]>([]);
    const [selected, setSelected] = useState<number | null>(null);

    const getRequests = async () => {
        let reqs: HelpRequests[] = [];

        if (type == "pending")
            reqs = await getPendingRequests();
        else if (type == "past")
            reqs = await getPastRequests();

        setRequests(reqs);
        
    }
    
    useEffect(() => {
        (async () => await getRequests())();
        
        // return () => { 
        //     // requests = [] 
        // }
    }, []);
    return (
        <div className="bg-white rounded shadow-xl p-2 flex flex-col gap-2 h-full justify-center items-center overflow-y-auto">
            <div className="bg-yellow-300 h-16 w-full px-3 flex items-center justify-between">
                <div className="text-xl tracking-tight font-serif text-neutral-700"> {name} </div>
                <button className="text-md tracking-tight font-serif cursor-pointer rounded shadow-2xl bg-amber-200 hover:bg-amber-400 px-4 py-2 text-neutral-700"
                    onClick={getRequests}
                >Refresh</button>
            </div>
            <div className="bg-green-200 flex-1 w-full text-black overflow-y-auto">
                {requests.map((req) => (
                        <div key={req.id}
                            onClick={() => setSelected(selected == req.id ? null : req.id)}
                            className="transition-all duration-200 hover:scale-[1.02] hover:shadow-2xl mb-1">
                                <Card request={req} selected={selected === req.id}/>
                        </div>
                    ) 
                )}
            </div>
        </div>
    )
}