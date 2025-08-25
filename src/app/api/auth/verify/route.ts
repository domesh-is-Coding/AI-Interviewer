import { NextResponse } from "next/server";
import { verifyJwt } from "@/lib/jwt";

export async function POST(req: Request) {
	try {
		const token = req.headers.get('cookie')?.split('; ')
			.find(row => row.startsWith('token='))
			?.split('=')[1];

		if (!token) {
			return NextResponse.json({ error: "No token provided" }, { status: 401 });
		}

		const decoded = verifyJwt(token);
		if (!decoded) {
			return NextResponse.json({ error: "Invalid token" }, { status: 401 });
		}

		return NextResponse.json({ 
			authenticated: true, 
			user: { 
				userId: decoded.userId, 
				email: decoded.email 
			} 
		});
	} catch (err: any) {
		return NextResponse.json({ error: "Invalid token" }, { status: 401 });
	}
}
