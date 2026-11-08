import { NextResponse, type NextRequest } from "next/server";

export function middleware(req: NextRequest) {
	const token = req.cookies.get("accessToken")?.value;

	if (req.nextUrl.pathname.startsWith("/notes")) {
		if (!token) {
			const loginUrl = new URL("/login", req.url);
			return NextResponse.redirect(loginUrl);
		}
	}

	if (
		token &&
		(req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/signup")
	) {
		return NextResponse.redirect(new URL("/notes", req.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/notes/:path*", "/login", "/signup"],
};
