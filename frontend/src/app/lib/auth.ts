"use client";
import Cookies from "js-cookie";

const ACCESS = "accessToken";
const REFRESH = "refreshToken";

// Tokens live in cookies so the Next.js middleware can see them. They are readable by
// scripts (not httpOnly); for stricter setups proxy auth through Next route handlers.
const options = (days: number): Cookies.CookieAttributes => ({
	expires: days,
	sameSite: "strict",
	secure: typeof window !== "undefined" && window.location.protocol === "https:",
	path: "/",
});

export const setTokens = (access: string, refresh?: string) => {
	Cookies.set(ACCESS, access, options(1));
	if (refresh) Cookies.set(REFRESH, refresh, options(7));
};

export const clearToken = () => {
	Cookies.remove(ACCESS, { path: "/" });
	Cookies.remove(REFRESH, { path: "/" });
};

export const getAccessToken = () => Cookies.get(ACCESS);
export const getRefreshToken = () => Cookies.get(REFRESH);
export const isAuthenticated = () => !!getAccessToken();
