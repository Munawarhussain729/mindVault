import axios from "axios";

/**
 * Pulls the first human-readable message out of a Django REST error body,
 * e.g. {"username": ["A user with that username already exists."]}.
 */
export function apiErrorMessage(err: unknown, fallback: string): string {
	if (!axios.isAxiosError(err)) return fallback;
	const data = err.response?.data;
	if (!data || typeof data !== "object") return fallback;
	for (const value of Object.values(data as Record<string, unknown>)) {
		const first = Array.isArray(value) ? value[0] : value;
		if (typeof first === "string" && first.trim()) return first;
	}
	return fallback;
}
