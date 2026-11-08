// src/app/(auth)/login/page.tsx
import LoginForm from "@/components/auth/LoginForm";

export default async function LoginPage({
	searchParams,
}: {
	searchParams: Promise<{ registered?: string }>;
}) {
	const { registered } = await searchParams;
	return <LoginForm justRegistered={registered === "1"} />;
}
