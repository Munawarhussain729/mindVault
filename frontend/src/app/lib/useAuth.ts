import API from "./api";
import { clearToken, setTokens } from "./auth";

export const signup = async (
	username: string,
	email: string,
	password: string,
) => {
	const response = await API.post("/auth/register/", { username, password, email });
	return response.data;
};

/** Signs in and stores the tokens. Throws if the credentials are rejected. */
export const login = async (username: string, password: string) => {
	const response = await API.post("/auth/login/", { username, password });
	const { access, refresh } = response.data;
	setTokens(access, refresh);
	return response.data;
};

export const logout = () => {
	clearToken();
};
