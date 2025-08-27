// app/api/agenda/[classId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getAgendaDataFromGitHub, updateAgendaDataOnGitHub, cleanupOldAgendaItems } from "@/lib/github";
import { AgendaData, AgendaItem } from "@/lib/types";
import { v4 as uuidv4 } from 'uuid';

// GET: Buscar todos os itens da agenda para uma turma específica
export async function GET(
  req: NextRequest,
  { params }: { params: { classId: string } }
) {
  const { classId } = await params;

  try {
    let agendaData = await getAgendaDataFromGitHub();
    if (agendaData === null) {
      return NextResponse.json(
        { message: "Falha ao recuperar dados da agenda." },
        { status: 500 }
      );
    }

    agendaData = await cleanupOldAgendaItems(agendaData);

    const classAgenda = agendaData[classId] || [];
    return NextResponse.json(classAgenda, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar itens da agenda:", error);
    return NextResponse.json(
      { message: "Erro Interno do Servidor" },
      { status: 500 }
    );
  }
}

// POST: Adicionar um novo item da agenda para uma turma específica
export async function POST(
  req: NextRequest,
  { params }: { params: { classId: string } }
) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ message: "Não Autorizado" }, { status: 401 });
  }

  const { classId } = await params;
  const { title, description, date, tag } = await req.json(); // Adicionado 'tag'

  if (!title || !description || !date || !tag) { // 'tag' agora é obrigatório
    return NextResponse.json(
      { message: "Campos obrigatórios ausentes (título, descrição, data, tag)" },
      { status: 400 }
    );
  }

  try {
    let agendaData = await getAgendaDataFromGitHub();
    if (agendaData === null) {
      return NextResponse.json(
        { message: "Falha ao recuperar dados da agenda." },
        { status: 500 }
      );
    }

    const newItem: AgendaItem = {
      id: uuidv4(),
      classId,
      title,
      description,
      date,
      tag, // Salva a tag
      createdAt: new Date().toISOString(),
    };

    if (!agendaData[classId]) {
      agendaData[classId] = [];
    }
    agendaData[classId].push(newItem);

    const success = await updateAgendaDataOnGitHub(
      agendaData,
      `Adicionar item da agenda para ${classId}: ${title} (${tag})`
    );

    if (!success) {
      return NextResponse.json(
        { message: "Falha ao salvar item da agenda." },
        { status: 500 }
      );
    }

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error("Erro ao adicionar item da agenda:", error);
    return NextResponse.json(
      { message: "Erro Interno do Servidor" },
      { status: 500 }
    );
  }
}