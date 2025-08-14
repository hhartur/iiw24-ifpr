import { NextRequest, NextResponse } from "next/server";
import { fetchFolderData } from "@/utils/fetchFolderData";
import fs from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), "data");
const dataPath = path.join(dataDir, "salas.json");

const urlBaseSalaRaw =
  "https://raw.githubusercontent.com/vonmecheln/ifpr-horarios/refs/heads/main/docs/sala";
const urlBaseSala =
  "https://github.com/vonmecheln/ifpr-horarios/tree/main/docs/sala/";

async function getUrlRaw(sala: string): Promise<string | null> {
  if (!sala) return null;
  const normalizado = sala.trim().toLowerCase();

  const files: any[] = await fetchFolderData(urlBaseSala);
  if (!files) return null;

  const arquivo = `${normalizado}.mdx`;

  let block = null;
  for (const file of files) {
    if (file.contentType === "directory") {
      const subFiles: any[] = await fetchFolderData(urlBaseSala + file.name);
      for (const subFile of subFiles) {
        if (subFile.name === arquivo) {
          block = file.name;
          break;
        }
      }
    }
  }
  if (!block) return null;

  return `${urlBaseSalaRaw}/${block}/${arquivo}`;
}

async function getRawContent(rawUrl: string) {
  const res = await fetch(rawUrl);
  if (!res.ok) return null;

  const data = await res.text();

  const startIndex = data.indexOf("export const data =");
  if (startIndex === -1) return null;

  const afterEqualsIndex = data.indexOf("=", startIndex) + 1;
  const trecho = data.slice(afterEqualsIndex).trim();

  function acharFechamentoObjeto(str: string): number {
    let contador = 0;
    let inString = false;
    let stringChar = "";
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      if (inString) {
        if (char === stringChar && str[i - 1] !== "\\") {
          inString = false;
          stringChar = "";
        }
      } else {
        if (char === '"' || char === "'") {
          inString = true;
          stringChar = char;
        } else if (char === "{") {
          contador++;
        } else if (char === "}") {
          contador--;
          if (contador === 0) return i;
        }
      }
    }
    return -1;
  }

  const endIndex = acharFechamentoObjeto(trecho);
  if (endIndex === -1) return null;

  const objetoStr = trecho.slice(0, endIndex + 1);

  try {
    return eval("(" + objetoStr + ")");
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const roomName = body.roomName;

  if (roomName) {
    const rawUrl = await getUrlRaw(roomName);
    if (rawUrl) {
      const rawContent = await getRawContent(rawUrl);
      if (rawContent) {
        return NextResponse.json(
          { content: rawContent, ok: true },
          { status: 200 }
        );
      }
    }
  }
  return NextResponse.json({ content: "Error", ok: false }, { status: 400 });
}

export async function GET() {
  if (fs.existsSync(dataPath)) {
    try {
      const jsonData = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
      return NextResponse.json({ content: jsonData, ok: true }, { status: 200 });
    } catch {
      fs.unlinkSync(dataPath);
    }
  }

  const files = await fetchFolderData(urlBaseSala);
  if (!files) return NextResponse.json({ content: [], ok: false }, { status: 500 });

  const promises = files.map(async (file: any) => {
    if (file.contentType === "directory") {
      const subFiles = await fetchFolderData(urlBaseSala + file.name);
      file.classes = subFiles;
    }
    return file;
  });

  const results = await Promise.all(promises);

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  fs.writeFileSync(dataPath, JSON.stringify(results, null, 2), "utf-8");

  return NextResponse.json({ content: results, ok: true }, { status: 200 });
}