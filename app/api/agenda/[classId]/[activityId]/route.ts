import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getAgendaDataFromGitHub, updateAgendaDataOnGitHub } from "@/lib/github";

export async function PUT(
  req: NextRequest,
  context: { params: { classId: string; activityId: string } }
) {
  const { classId, activityId } = context.params;
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ message: "Não Autorizado" }, { status: 401 });
  }

  const { title, description, date, tag } = await req.json();
  if (!title || !description || !date || !tag) {
    return NextResponse.json(
      { message: "Campos obrigatórios ausentes (título, descrição, data, tag)" },
      { status: 400 }
    );
  }

  try {
    const agendaData = await getAgendaDataFromGitHub();
    if (!agendaData || !agendaData[classId]) {
      return NextResponse.json({ message: "Agenda da turma não encontrada." }, { status: 404 });
    }

    const itemIndex = agendaData[classId].findIndex((item) => item.id === activityId);
    if (itemIndex === -1) {
      return NextResponse.json({ message: "Item da agenda não encontrado." }, { status: 404 });
    }

    agendaData[classId][itemIndex] = {
      ...agendaData[classId][itemIndex],
      title,
      description,
      date,
      tag,
    };

    const success = await updateAgendaDataOnGitHub(
      agendaData,
      `Atualizar item da agenda ${activityId} para ${classId}`
    );
    if (!success) {
      return NextResponse.json({ message: "Falha ao atualizar item da agenda." }, { status: 500 });
    }

    return NextResponse.json(agendaData[classId][itemIndex], { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Erro Interno do Servidor" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: { classId: string; activityId: string } }
) {
  const { classId, activityId } = context.params;
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ message: "Não Autorizado" }, { status: 401 });
  }

  try {
    const agendaData = await getAgendaDataFromGitHub();
    if (!agendaData || !agendaData[classId]) {
      return NextResponse.json({ message: "Agenda da turma não encontrada." }, { status: 404 });
    }

    const initialLength = agendaData[classId].length;
    agendaData[classId] = agendaData[classId].filter((item) => item.id !== activityId);
    if (agendaData[classId].length === initialLength) {
      return NextResponse.json({ message: "Item da agenda não encontrado." }, { status: 404 });
    }

    const success = await updateAgendaDataOnGitHub(
      agendaData,
      `Excluir item da agenda ${activityId} da turma ${classId}`
    );
    if (!success) {
      return NextResponse.json({ message: "Falha ao excluir item da agenda." }, { status: 500 });
    }

    return NextResponse.json({ message: "Item da agenda excluído" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Erro Interno do Servidor" }, { status: 500 });
  }
}
