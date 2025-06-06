import { NextRequest, NextResponse } from "next/server";
import { emailExists, updateEmail } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const cookie = req.cookies.get('auth');
    if (!cookie || cookie.value !== process.env.ADMIN_KEY) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const { oldEmail, newEmail } = await req.json();

    if (!oldEmail || !newEmail || typeof oldEmail !== "string" || typeof newEmail !== "string") {
      return NextResponse.json({ error: "Emails inválidos." }, { status: 400 });
    }

    if (oldEmail === newEmail) {
      return NextResponse.json({ error: "Emails são iguais, nada para atualizar." }, { status: 400 });
    }

    if (!(await emailExists(oldEmail))) {
      return NextResponse.json({ error: "Email antigo não encontrado." }, { status: 404 });
    }

    if (await emailExists(newEmail)) {
      return NextResponse.json({ error: "Novo email já existe." }, { status: 409 });
    }

    await updateEmail(oldEmail, newEmail);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Erro ao atualizar email:", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
