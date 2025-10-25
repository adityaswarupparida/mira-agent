"use client"
import { answerRequests, HelpRequests } from "@/api";
import { useState } from "react"
import { Badge } from "./Badge";

export const Card = (props: { request: HelpRequests, selected: boolean }) => {
    const [textarea, setTextarea] = useState("");
    const [loading, setLoading] = useState(false);

    const onSubmit = async () => {
        setLoading(true)
        await answerRequests(props.request.id, textarea);
        setTextarea("");
        setLoading(false)
    }
    if (loading) {
        return <div className="w-full bg-amber-100 flex flex-col tracking-tight font-serif items-center text-black">
            Saving response...
        </div>
    }
    return (
        <div className="w-full bg-amber-100 flex flex-col tracking-tight font-serif items-center text-black">
            <div className="flex justify-start items-center w-full pl-4 text-xs">
                Help Request #{props.request.id}
            </div>
            <div className="flex items-center justify-between px-2 mb-2 w-full">
                <div className="flex justify-start items-center pl-2 text-wrap">{props.request.request}</div>
                <div className="flex justify-center items-center px-2">
                    <Badge status={`${props.request.status}`} />
                </div>
            </div>
            
        {props.selected && 
            <div className="w-full">
                { props.request.status == "Pending" &&  
                <div className="w-full h-16 px-4 mb-2 flex items-center justify-start">
                    <textarea className="w-4/5 p-2 h-full border rounded"
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => setTextarea(e.currentTarget.value)}
                    ></textarea>
                </div> }
                { props.request.status == "Resolved" &&  
                <div className="w-full px-4 mb-2 flex items-center justify-start text-wrap">
                     {props.request.response}
                </div> }
                <div className="flex items-center justify-between px-4 mb-2 w-full">
                    { props.request.status == "Pending" &&  
                    <button className="bg-green-500 disabled:bg-green-500/60 disabled:text-black/60 disabled:cursor-not-allowed px-4 py-1 rounded cursor-pointer"
                        onClick={async (e) => {
                            e.stopPropagation()
                            await onSubmit()
                        }}
                        disabled={textarea.trim() === ""}
                    >Respond</button>}
                    { props.request.status != "Pending" &&  
                    <span className="bg-yellow-500/30 px-4 py-1 rounded">
                        { props.request.status == "Resolved" ? "Responded" : "Expired" }
                    </span>}
                    <div className="flex justify-start items-center pr-2 text-sm">Last updated - {props.request.updated_at}</div>
                </div>
            </div>}
        </div>
    )
}