import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { passKey } = await req.json();

        if (!passKey) {
            return NextResponse.json({ content: "Parameter missing" }, { status: 400 });
        }

        if (!process.env.PASSKEY) {
            return NextResponse.json({ content: "Internal Server Error" }, { status: 500 });
        }

        if (passKey !== process.env.PASSKEY) {
            return NextResponse.json({ content: "Invalid passKey" }, { status: 401 });
        }

        const response = NextResponse.json({ 
            content: "Login successful", 
            success: true 
        }, {status: 200});

        const session = await getIronSession<SessionData>(req, response, sessionOptions);

        session.isLoggedIn = true;
        
        await session.save();

        return response;

    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json({ content: "Internal Server Error" }, { status: 500 });
    }
}