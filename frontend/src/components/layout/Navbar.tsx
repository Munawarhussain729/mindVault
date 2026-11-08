"use client";
import { Menu } from "lucide-react";

interface NavbarProps {
	onMenuClick?: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
	return (
		<header className="flex h-16 items-center justify-between border-b bg-white px-4 sm:px-6">
			<button
				type="button"
				onClick={onMenuClick}
				aria-label="Open menu"
				className="rounded p-2 text-gray-600 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-indigo-600 md:hidden"
			>
				<Menu size={20} />
			</button>

			<div className="ml-auto font-medium text-gray-700">Welcome 👋</div>
		</header>
	);
}
