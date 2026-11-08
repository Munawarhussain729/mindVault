"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, StickyNote, Tag, User } from "lucide-react";

const navLinks = [
	{ href: "/dashboard", label: "Notes", icon: StickyNote },
	{ href: "/dashboard/tags", label: "Tags", icon: Tag },
	{ href: "/dashboard/profile", label: "Profile", icon: User },
];

export default function Sidebar() {
	const pathname = usePathname();
	const router = useRouter();

	const logout = () => {
		// localStorage.removeItem("accessToken");
		// router.push("/login");
	};

	return (
		<div className="w-64 bg-white shadow-md flex flex-col">
			<div className="px-6 py-4 text-2xl font-semibold border-b">
				🧠 MindVault
			</div>
			<nav className="flex-1 p-4 space-y-2">
				{navLinks.map(({ href, label, icon: Icon }) => (
					<Link
						key={href}
						href={href}
						className={`flex items-center gap-3 px-4 py-2 rounded-lg ${
							pathname === href
								? "bg-indigo-100 text-indigo-600"
								: "hover:bg-gray-100"
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
				className="flex items-center gap-3 px-4 py-3 border-t hover:bg-gray-100 text-red-600"
			>
				<LogOut size={18} /> Logout
			</button>
		</div>
	);
}
