import axios from "axios";
import { clearToken, getAccessToken, getRefreshToken, setTokens } from "./auth";

export const API_URL =
	process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

const API = axios.create({
	baseURL: API_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

API.interceptors.request.use((config) => {
	if (typeof window !== "undefined") {
		const token = getAccessToken();
		if (token) config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

// One refresh at a time: concurrent 401s wait for the same request.
let refreshing: Promise<string> | null = null;

const refreshAccessToken = () => {
	refreshing ??= axios
		.post(`${API_URL}/auth/refresh/`, { refresh: getRefreshToken() })
		.then(({ data }) => {
			setTokens(data.access, data.refresh);
			return data.access as string;
		})
		.finally(() => {
			refreshing = null;
		});
	return refreshing;
};

API.interceptors.response.use(
	(response) => response,
	async (error) => {
		const original = error.config;
		const isAuthCall = original?.url?.startsWith("/auth/");
		if (
			error.response?.status !== 401 ||
			!original ||
			original._retried ||
			isAuthCall ||
			!getRefreshToken()
		) {
			return Promise.reject(error);
		}
		original._retried = true;
		try {
			const access = await refreshAccessToken();
			original.headers.Authorization = `Bearer ${access}`;
			return API(original);
		} catch (refreshError) {
			clearToken();
			if (typeof window !== "undefined") window.location.assign("/login");
			return Promise.reject(refreshError);
		}
	},
);

export default API;
