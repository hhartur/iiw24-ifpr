import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const EMAILS_FILE_PATH = path.join(process.cwd(), "app/api/get-emails/data/emails.json");

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    const cookie = req.cookies.get('auth');
    if(!cookie || cookie?.value !== process.env.ADMIN_KEY){
        return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email inválido." }, { status: 400 });
    }

    // Ler o conteúdo atual do arquivo
    const fileContent = await fs.readFile(EMAILS_FILE_PATH, "utf-8");
    const emails = JSON.parse(fileContent);

    if (!Array.isArray(emails)) {
      return NextResponse.json({ error: "Formato de dados inválido." }, { status: 500 });
    }

    // Verifica se o email existe
    if (!emails.includes(email)) {
      return NextResponse.json({ error: "Email não encontrado." }, { status: 404 });
    }

    // Remove o email
    const updatedEmails = emails.filter((e: string) => e !== email);

    // Salva o novo conteúdo
    await fs.writeFile(EMAILS_FILE_PATH, JSON.stringify(updatedEmails, null, 2));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Erro ao deletar email:", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}