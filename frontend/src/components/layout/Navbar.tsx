"use client";
import { Search } from "lucide-react";

export default function Navbar() {
	return (
		<header className="h-16 flex items-center justify-between px-6 border-b bg-white">
			<div className="flex items-center gap-3">
				<Search size={18} className="text-gray-500" />
				<input
					type="text"
					placeholder="Search notes..."
					className="outline-none bg-transparent"
				/>
			</div>

			<div className="font-medium text-gray-700">Welcome 👋</div>
		</header>
	);
}
