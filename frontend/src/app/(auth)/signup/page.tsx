// src/app/(auth)/signup/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signup } from "@/app/lib/useAuth";
import AuthField from "@/components/auth/AuthField";
import { apiErrorMessage } from "@/components/auth/errors";

export default function SignupPage() {
	const [form, setForm] = useState({ username: "", email: "", password: "" });
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		try {
			await signup(form.username, form.email, form.password);
			router.push("/login?registered=1");
		} catch (err) {
			setError(
				apiErrorMessage(err, "Couldn't create your account. Check your details and try again."),
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<h1 className="text-3xl font-semibold tracking-tight text-gray-900">Create your account</h1>
			<p className="mt-2 text-gray-600">Free, and your notes stay private.</p>

			{error && (
				<p role="alert" className="mt-6 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-800">
					{error}
				</p>
			)}

			<form onSubmit={handleSubmit} className="mt-8 space-y-5">
				<AuthField
					id="username"
					label="Username"
					type="text"
					autoComplete="username"
					value={form.username}
					onChange={(e) => setForm({ ...form, username: e.target.value })}
				/>
				<AuthField
					id="email"
					label="Email"
					type="email"
					autoComplete="email"
					value={form.email}
					onChange={(e) => setForm({ ...form, email: e.target.value })}
				/>
				<AuthField
					id="password"
					label="Password"
					type="password"
					autoComplete="new-password"
					value={form.password}
					onChange={(e) => setForm({ ...form, password: e.target.value })}
				/>
				<button
					type="submit"
					disabled={loading}
					className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-base font-medium text-white transition-colors hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-60"
				>
					{loading ? "Creating account…" : "Create account"}
				</button>
			</form>

			<p className="mt-8 text-sm text-gray-600">
				Already have an account?{" "}
				<Link href="/login" className="font-medium text-indigo-700 underline underline-offset-2 hover:text-indigo-900">
					Log in
				</Link>
			</p>
		</>
	);
}
