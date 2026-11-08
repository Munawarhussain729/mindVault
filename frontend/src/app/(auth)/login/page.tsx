// src/app/(auth)/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/app/lib/useAuth";

export default function LoginPage() {
	const [form, setForm] = useState({ username: "", password: "" });
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		try {
			await login(form.username, form.password);
			router.push("/notes");
		} catch {
			alert("Invalid credentials");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex items-center justify-center h-screen">
			<form
				onSubmit={handleSubmit}
				className="bg-white shadow p-6 rounded w-80 space-y-4"
			>
				<h2 className="text-xl font-semibold text-center">Login</h2>
				<input
					type="text"
					placeholder="Username"
					className="border p-2 w-full"
					value={form.username}
					onChange={(e) => setForm({ ...form, username: e.target.value })}
				/>
				<input
					type="password"
					placeholder="Password"
					className="border p-2 w-full"
					value={form.password}
					onChange={(e) => setForm({ ...form, password: e.target.value })}
				/>
				<button
					type="submit"
					className="bg-blue-500 text-white p-2 w-full rounded"
					disabled={loading}
				>
					{loading ? "Logging in..." : "Login"}
				</button>
			</form>
		</div>
	);
}
