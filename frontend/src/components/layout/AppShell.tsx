"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import ProtectedRoute from "@/components/RouteProtection";

/** Shared app chrome: sidebar + navbar, with the sidebar collapsing to a
 * slide-over on small screens. */
export default function AppShell({ children }: { children: React.ReactNode }) {
	const [sidebarOpen, setSidebarOpen] = useState(false);

	return (
		<ProtectedRoute>
			<div className="flex h-screen w-full bg-gray-50">
				<Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
				<div className="flex min-w-0 flex-1 flex-col">
					<Navbar onMenuClick={() => setSidebarOpen(true)} />
					<main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
				</div>
			</div>
		</ProtectedRoute>
	);
}
