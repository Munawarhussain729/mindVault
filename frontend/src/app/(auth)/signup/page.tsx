// src/app/(auth)/signup/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signup } from "@/app/lib/useAuth";

export default function SignupPage() {
	const [form, setForm] = useState({ username: "", email: "", password: "" });
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		try {
			await signup(form.username, form.email, form.password);
			alert("Signup successful!");
			router.push("/login");
		} catch (err) {
			alert(`Signup failed:  + ${err}`);
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
				<h2 className="text-xl font-semibold text-center">Create Account</h2>
				<input
					type="text"
					placeholder="Username"
					className="border p-2 w-full"
					value={form.username}
					onChange={(e) => setForm({ ...form, username: e.target.value })}
				/>
				<input
					type="email"
					placeholder="Email"
					className="border p-2 w-full"
					value={form.email}
					onChange={(e) => setForm({ ...form, email: e.target.value })}
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
					{loading ? "Creating..." : "Sign Up"}
				</button>
			</form>
		</div>
	);
}
