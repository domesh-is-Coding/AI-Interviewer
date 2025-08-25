import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword } from "@/lib/hash";
import { signJwt } from "@/lib/jwt";

export async function POST(req: Request) {
	try {
		const { email, password } = await req.json();
		if (!email || !password) {
			return NextResponse.json({ error: "Missing email or password" }, { status: 400 });
		}

		const user = await prisma.user.findUnique({
			where: { email },
		});

		if (!user) {
			return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
		}

		const isValidPassword = await comparePassword(password, user.password);
		if (!isValidPassword) {
			return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
		}

		// Create JWT token
		const token = signJwt({
			userId: user.id,
			email: user.email,
		});

		// Create response with user data
		const response = NextResponse.json({
			id: user.id,
			email: user.email,
			name: user.name,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
		});

		// Set JWT token as httpOnly cookie
		response.cookies.set('token', token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 60 * 60, // 1 hour
		});

		return response;
	} catch (err: any) {
		return NextResponse.json({ error: err.message }, { status: 500 });
	}
}