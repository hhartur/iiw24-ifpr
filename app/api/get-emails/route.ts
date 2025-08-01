import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "data", "emails.json");
    const fileContent = await readFile(filePath, "utf-8");
    const emails = JSON.parse(fileContent);

    const emailList = emails.filter((e: any) => typeof e === "string");

    return NextResponse.json(emailList);
  } catch (error) {
    console.error("Erro ao ler o arquivo de emails:", error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
