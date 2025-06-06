import { NextResponse } from "next/server";
import { initDB, getAllEmails } from "../../../lib/db"; // ajuste o caminho

export async function GET() {
  try {
    await initDB(); // garante que a tabela exista
    const emails = await getAllEmails();
    const emailList = emails.map((e) => e.email);
    return NextResponse.json(emailList);
  } catch (error) {
    console.error("Erro ao buscar emails:", error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
