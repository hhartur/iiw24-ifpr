import { NextRequest, NextResponse } from "next/server";
import { deleteEmail, emailExists } from "@/lib/db";

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

    if (!(await emailExists(email))) {
      return NextResponse.json({ error: "Email não encontrado." }, { status: 404 });
    }

    await deleteEmail(email);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Erro ao deletar email:", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
