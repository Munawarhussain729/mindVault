"use client";
import Cookies from "js-cookie";

export const setTokens = (access: string, refresh: string) => {
	Cookies.set("accessToken", access);
	Cookies.set("refreshToken", refresh);
};

export const clearToken = () => {
	Cookies.remove("accessToken");
	Cookies.remove("refreshToken");
};

export const getAccessToken = () => {
	return Cookies.get("accessToken");
};

export const isAuthenticated = () => {
	return !!getAccessToken();
};
