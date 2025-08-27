// lib/types.ts
export interface AgendaItem {
  id: string;
  classId: string; // Ex: "iiw2024a"
  title: string;
  description: string;
  date: string; // Formato YYYY-MM-DD
  tag: "atividade" | "prova" | "trabalho" | "evento" | "outro"; // Nova propriedade
  createdAt: string; // ISO string, para controle de exclusão automática
}

export interface AgendaData {
  [classId: string]: AgendaItem[];
}