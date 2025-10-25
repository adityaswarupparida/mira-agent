import { Check, ClockFading, X } from "lucide-react"

export const Badge = ({ status }: { status: string }) => {
    return (
        <div className="flex justify-center items-center gap-2">
            <Icon status={`${status}`} />
            <span>{status}</span>
        </div>
    )
} 

const Icon = ({ status }: { status: string }) => {
    switch (status) {
        case "Pending":
            return <ClockFading />
        case "Resolved":
            return <Check />
        case "Unresolved":
            return <X />
        default: 
            return <span></span>
    }
}