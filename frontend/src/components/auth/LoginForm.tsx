"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login } from "@/app/lib/useAuth";
import AuthField from "@/components/auth/AuthField";
import { apiErrorMessage } from "@/components/auth/errors";

export default function LoginForm({ justRegistered = false }: { justRegistered?: boolean }) {
	const [form, setForm] = useState({ username: "", password: "" });
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		try {
			await login(form.username, form.password);
			router.push("/notes");
		} catch (err) {
			setError(
				apiErrorMessage(err, "Couldn't log you in. Check your connection and try again.")
					.replace(/^No active account found with the given credentials$/, "Username or password is incorrect."),
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<h1 className="text-3xl font-semibold tracking-tight text-gray-900">Log in</h1>
			<p className="mt-2 text-gray-600">Pick up where you left off.</p>

			{justRegistered && !error && (
				<p role="status" className="mt-6 rounded-lg bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-800">
					Account created. Log in to start writing.
				</p>
			)}
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
					id="password"
					label="Password"
					type="password"
					autoComplete="current-password"
					value={form.password}
					onChange={(e) => setForm({ ...form, password: e.target.value })}
				/>
				<button
					type="submit"
					disabled={loading}
					className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-base font-medium text-white transition-colors hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-60"
				>
					{loading ? "Logging in…" : "Log in"}
				</button>
			</form>

			<p className="mt-8 text-sm text-gray-600">
				New to MindVault?{" "}
				<Link href="/signup" className="font-medium text-indigo-700 underline underline-offset-2 hover:text-indigo-900">
					Create an account
				</Link>
			</p>
		</>
	);
}
