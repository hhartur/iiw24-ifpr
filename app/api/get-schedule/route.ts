import { NextRequest, NextResponse } from "next/server";
import { fetchFolderData } from "@/utils/fetchFolderData";

const urlBaseTurmaRaw =
  "https://raw.githubusercontent.com/vonmecheln/ifpr-horarios/refs/heads/main/docs/turma";
const urlBaseTurma =
  "https://github.com/vonmecheln/ifpr-horarios/tree/main/docs/turma/";

const turmaMap: Record<string, { pasta: string; arquivo?: string }> = {
  eadtma2025: { pasta: "tmaead", arquivo: "eadtma2025.mdx" },
  eadsp2025: { pasta: "tspead", arquivo: "eadsp2025.mdx" },
  eadst2025: { pasta: "tstead", arquivo: "eadst2025.mdx" },
  eadtl2025: { pasta: "tlead", arquivo: "eadtl2025.mdx" },
  tads_esp: { pasta: "tads", arquivo: "tads_especial.mdx" },
};

function getUrlRaw(turma: string): string | null {
  if (!turma) return null;
  const normalizado = turma.trim().toLowerCase();

  if (turmaMap[normalizado]) {
    const { pasta, arquivo } = turmaMap[normalizado];
    return `${urlBaseTurmaRaw}/${pasta}/${arquivo || `${normalizado}.mdx`}`;
  }

  const match = normalizado.match(/^[a-z]+/);
  if (!match) return null;

  const pastaCurso = match[0];
  const arquivo = `${normalizado}.mdx`;

  return `${urlBaseTurmaRaw}/${pastaCurso}/${arquivo}`;
}

async function getRawContent(rawUrl: string) {
  const res = await fetch(rawUrl);
  if (!res.ok) {
    return null;
  }

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
          if (contador === 0) {
            return i;
          }
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
  } catch (err) {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const className = body.className;

  if (className) {
    const rawUrl = getUrlRaw(className);

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
  const files = await fetchFolderData(urlBaseTurma);
  if (!files) return NextResponse.json({ content: [], ok: false }, { status: 500 });

  const promises = files.map(async (file: any) => {
    if (file.contentType === "directory") {
      const subFiles = await fetchFolderData(urlBaseTurma + file.name);
      file.cursos = subFiles;
    }
    return file;
  });

  const results = await Promise.all(promises);
  
  return NextResponse.json({ content: results, ok: true }, { status: 200 });
}
