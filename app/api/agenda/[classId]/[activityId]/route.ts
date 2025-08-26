// app/api/agenda/[classId]/[activityId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session"; // Ajuste o caminho conforme necessário
import { getAgendaDataFromGitHub, updateAgendaDataOnGitHub } from "@/lib/github"; // Ajuste o caminho conforme necessário
import { AgendaData, AgendaItem } from "@/lib/types"; // Ajuste o caminho conforme necessário

// PUT: Editar um item da agenda existente
export async function PUT(
  req: NextRequest,
  { params }: { params: { classId: string; activityId: string } }
) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ message: "Não Autorizado" }, { status: 401 });
  }

  const { classId, activityId } = params;
  const { title, description, date } = await req.json();

  if (!title || !description || !date) {
    return NextResponse.json(
      { message: "Campos obrigatórios ausentes (título, descrição, data)" },
      { status: 400 }
    );
  }

  try {
    const agendaData = await getAgendaDataFromGitHub();
    if (agendaData === null) {
      return NextResponse.json(
        { message: "Falha ao recuperar dados da agenda." },
        { status: 500 }
      );
    }

    if (!agendaData[classId]) {
      return NextResponse.json(
        { message: "Agenda da turma não encontrada." },
        { status: 404 }
      );
    }

    const itemIndex = agendaData[classId].findIndex(
      (item) => item.id === activityId
    );

    if (itemIndex === -1) {
      return NextResponse.json(
        { message: "Item da agenda não encontrado." },
        { status: 404 }
      );
    }

    agendaData[classId][itemIndex] = {
      ...agendaData[classId][itemIndex],
      title,
      description,
      date,
    };

    const success = await updateAgendaDataOnGitHub(
      agendaData,
      `Atualizar item da agenda ${activityId} para ${classId}`
    );

    if (!success) {
      return NextResponse.json(
        { message: "Falha ao atualizar item da agenda." },
        { status: 500 }
      );
    }

    return NextResponse.json(agendaData[classId][itemIndex], { status: 200 });
  } catch (error) {
    console.error("Erro ao atualizar item da agenda:", error);
    return NextResponse.json(
      { message: "Erro Interno do Servidor" },
      { status: 500 }
    );
  }
}

// DELETE: Excluir um item da agenda existente
export async function DELETE(
  req: NextRequest,
  { params }: { params: { classId: string; activityId: string } }
) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ message: "Não Autorizado" }, { status: 401 });
  }

  const { classId, activityId } = params;

  try {
    const agendaData = await getAgendaDataFromGitHub();
    if (agendaData === null) {
      return NextResponse.json(
        { message: "Falha ao recuperar dados da agenda." },
        { status: 500 }
      );
    }

    if (!agendaData[classId]) {
      return NextResponse.json(
        { message: "Agenda da turma não encontrada." },
        { status: 404 }
      );
    }

    const initialLength = agendaData[classId].length;
    agendaData[classId] = agendaData[classId].filter(
      (item) => item.id !== activityId
    );

    if (agendaData[classId].length === initialLength) {
      return NextResponse.json(
        { message: "Item da agenda não encontrado." },
        { status: 404 }
      );
    }

    const success = await updateAgendaDataOnGitHub(
      agendaData,
      `Excluir item da agenda ${activityId} da turma ${classId}`
    );

    if (!success) {
      return NextResponse.json(
        { message: "Falha ao excluir item da agenda." },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Item da agenda excluído" }, { status: 200 });
  } catch (error) {
    console.error("Erro ao excluir item da agenda:", error);
    return NextResponse.json(
      { message: "Erro Interno do Servidor" },
      { status: 500 }
    );
  }
}