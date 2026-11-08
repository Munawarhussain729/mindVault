import API from "./api";

export const signup = async (
	username: string,
	email: string,
	password: string,
) => {
	const response = await API.post("/auth/register/", { username, password, email });
	return response.data;
};

export const login = async (username: string, password: string) => {
	const response = await API.post("/auth/login/", { username, password });
	const { access, refresh } = response.data;

	localStorage.setItem("accessToken", access);
	localStorage.setItem("refreshToken", refresh);

	return response?.data;
};

export const logout = () => {
	localStorage.removeItem("accessToken");
	localStorage.removeItem("refreshToken");
};
