import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import ProtectedRoute from "@/components/RouteProtection";

export default function DashboardLayout({
	children,
}: { children: React.ReactNode }) {
	return (
		<ProtectedRoute>
			<div className="flex h-screen w-full bg-gray-50">
				<Sidebar />

				<div className="flex flex-col flex-1">
					<Navbar />
					<main className="flex-1 overflow-y-auto p-6">{children}</main>
				</div>
			</div>
		</ProtectedRoute>
	);
}
