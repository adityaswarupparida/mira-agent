import { Card } from "@/components/Card";
import { Dashboard } from "@/components/Dashboard";

export default function Home() {
	return (
		<div className="flex flex-col min-h-screen max-h-screen overflow-hidden items-center justify-center bg-zinc-50 font-sans dark:bg-black">
			<div className="bg-neutral-800 h-16 w-full">
				<img
					src={"LiveBeautyLogo.png"}
					alt="Live Beauty"
					className="h-16"
				/>
			</div>
			<div className="bg-green-200 flex-1 w-full grid grid-cols-2 gap-4 p-8 overflow-y-hidden">
				<Dashboard name="Pending Requests" type="pending"/>
				<Dashboard name="History" type="past"/>
			</div>
		</div>
	);
}
