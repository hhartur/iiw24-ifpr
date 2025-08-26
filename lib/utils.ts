// lib/utils.ts (ou adicione ao seu arquivo de utilitários existente)
import { AgendaItem } from "./types"; // Ajuste o caminho conforme necessário

/**
 * Calcula o status de um item da agenda com base na data.
 * @param item O item da agenda.
 * @returns Uma string indicando o status ("Hoje", "Amanhã", "Em X dias", "Pendente").
 */
export function getAgendaItemStatus(item: AgendaItem): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normaliza para o início do dia

  // Adiciona "T00:00:00" para garantir que a data seja interpretada como UTC e evitar problemas de fuso horário
  const itemDate = new Date(item.date + "T00:00:00"); 
  itemDate.setHours(0, 0, 0, 0); // Normaliza para o início do dia

  const diffTime = itemDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Hoje";
  } else if (diffDays === 1) {
    return "Amanhã";
  } else if (diffDays > 1) {
    return `Em ${diffDays} dias`;
  } else {
    // Data no passado
    return "Pendente";
  }
}