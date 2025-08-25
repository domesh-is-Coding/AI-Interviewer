
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/hash";

export async function POST(req: Request) {
	try {
		const { email, name, password } = await req.json();
		console.log({email, name, password})
		if (!email || !name || !password) {
			return NextResponse.json({ error: "Missing email, name, or password" }, { status: 400 });
		}
		await prisma.$connect()
		const existing = await prisma.user.findUnique({ where: { email } });
		if (existing) {
			return NextResponse.json({ error: "User already exists" }, { status: 409 });
		}

		const hashedPassword = await hashPassword(password);
		const user = await prisma.user.create({
			data: { email, name, password: hashedPassword },
		});

		return NextResponse.json({
			id: user.id,
			email: user.email,
			name: user.name,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
		});
	} catch (err: any) {
		return NextResponse.json({ error: err.message }, { status: 500 });
	}
}
