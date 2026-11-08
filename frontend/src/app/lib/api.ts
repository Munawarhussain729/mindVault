import axios from "axios";

export const API_URL =
	process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export const fetcher = async (url: string, options: RequestInit = {}) => {
	const response = await fetch(`${API_URL}${url}`, {
		headers: { "Content-Type": "application/json" },
		...options,
	});
	if (!response.ok) throw new Error(await response.text());
	return response.json;
};
const API = axios.create({
	baseURL: API_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

API.interceptors.request.use((config) => {
	if (typeof window !== "undefined") {
		const token = localStorage.getItem("accessToken");
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
	}
	return config;
});

export default API;
