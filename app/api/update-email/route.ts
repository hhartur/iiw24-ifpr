import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const EMAILS_FILE_PATH = path.join(process.cwd(), "app/api/get-emails/data/emails.json");

export async function POST(req: NextRequest) {
  try {
    const { oldEmail, newEmail } = await req.json();
    const cookie = req.cookies.get('auth');
    if(!cookie || cookie?.value !== process.env.ADMIN_KEY){
        return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    if (!oldEmail || !newEmail || typeof oldEmail !== "string" || typeof newEmail !== "string") {
      return NextResponse.json({ error: "Emails inválidos." }, { status: 400 });
    }

    if (oldEmail === newEmail) {
      return NextResponse.json({ error: "Emails são iguais, nada para atualizar." }, { status: 400 });
    }

    const fileContent = await fs.readFile(EMAILS_FILE_PATH, "utf-8");
    const emails = JSON.parse(fileContent);

    if (!Array.isArray(emails)) {
      return NextResponse.json({ error: "Formato de dados inválido." }, { status: 500 });
    }

    if (!emails.includes(oldEmail)) {
      return NextResponse.json({ error: "Email antigo não encontrado." }, { status: 404 });
    }

    if (emails.includes(newEmail)) {
      return NextResponse.json({ error: "Novo email já existe." }, { status: 409 });
    }

    const updatedEmails = emails.map(e => (e === oldEmail ? newEmail : e));

    await fs.writeFile(EMAILS_FILE_PATH, JSON.stringify(updatedEmails, null, 2));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Erro ao atualizar email:", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
