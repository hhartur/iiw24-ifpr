import { NextRequest, NextResponse } from "next/server";
import { addEmail, emailExists } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const cookie = req.cookies.get('auth');
    if (!cookie || cookie.value !== process.env.ADMIN_KEY) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email inválido." }, { status: 400 });
    }

    if (await emailExists(email)) {
      return NextResponse.json({ error: "Email já existe." }, { status: 409 });
    }

    await addEmail(email);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Erro ao adicionar email:", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
