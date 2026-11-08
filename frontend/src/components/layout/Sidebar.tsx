"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, StickyNote, X } from "lucide-react";
import { logout as clearSession } from "@/app/lib/useAuth";

const navLinks = [
	{ href: "/notes", label: "Notes", icon: StickyNote },
];

interface SidebarProps {
	open?: boolean;
	onClose?: () => void;
}

export default function Sidebar({ open = false, onClose }: SidebarProps) {
	const pathname = usePathname();
	const router = useRouter();

	const logout = () => {
		clearSession();
		router.push("/login");
	};

	return (
		<>
			<div
				aria-hidden="true"
				onClick={onClose}
				className={`fixed inset-0 z-30 bg-black/40 md:hidden ${
					open ? "block" : "hidden"
				}`}
			/>
			<aside
				className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-white shadow-md transition-transform md:static md:translate-x-0 md:visible ${
					open ? "translate-x-0 visible" : "-translate-x-full invisible"
				}`}
			>
				<div className="flex items-center justify-between border-b px-6 py-4">
					<span className="text-2xl font-semibold">🧠 MindVault</span>
					<button
						type="button"
						onClick={onClose}
						aria-label="Close menu"
						className="rounded p-1 text-gray-500 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-indigo-600 md:hidden"
					>
						<X size={20} />
					</button>
				</div>
				<nav aria-label="Main navigation" className="flex-1 space-y-2 p-4">
					{navLinks.map(({ href, label, icon: Icon }) => (
						<Link
							key={href}
							href={href}
							onClick={onClose}
							className={`flex items-center gap-3 rounded-lg px-4 py-2 focus-visible:outline-2 focus-visible:outline-indigo-600 ${
								pathname === href
									? "bg-indigo-100 text-indigo-600"
									: "text-gray-700 hover:bg-gray-100"
							}`}
						>
							<Icon size={18} />
							{label}
						</Link>
					))}
				</nav>

				<button
					type="button"
					onClick={logout}
					className="flex items-center gap-3 border-t px-4 py-3 text-red-600 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-indigo-600"
				>
					<LogOut size={18} /> Logout
				</button>
			</aside>
		</>
	);
}
