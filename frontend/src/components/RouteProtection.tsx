"use client";

import { getAccessToken } from "@/app/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({
	children,
}: { children: React.ReactNode }) {
	const router = useRouter();

	useEffect(() => {
		const token = getAccessToken();
		if (!token) {
			router.replace("/login");
		}
	}, [router]);

	return <>{children}</>;
}
