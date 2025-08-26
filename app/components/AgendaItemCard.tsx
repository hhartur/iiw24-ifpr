// app/components/AgendaItemCard.tsx
"use client";

import { AgendaItem } from "@/lib/types"; // Ajuste o caminho conforme necessário
import { getAgendaItemStatus } from "@/lib/utils"; // Ajuste o caminho conforme necessário

interface AgendaItemCardProps {
  item: AgendaItem;
  isLoggedIn: boolean;
  onEdit: (item: AgendaItem) => void;
  onDelete: (id: string) => void;
}

export default function AgendaItemCard({ item, isLoggedIn, onEdit, onDelete }: AgendaItemCardProps) {
  const status = getAgendaItemStatus(item);
  // Normaliza o status para usar como classe CSS
  const statusClass = status.toLowerCase().replace(/\s/g, '-').replace(/em-\d+-dias/, 'em-dias');

  return (
    <div className={`agenda-card ${statusClass}`}>
      <div className="agenda-card-header">
        <h3 className="agenda-card-title">{item.title}</h3>
        <span className={`agenda-status ${statusClass}`}>{status}</span>
      </div>
      <p className="agenda-card-description">{item.description}</p>
      <div className="agenda-card-footer">
        <span className="agenda-card-date">
          <i className="fa-solid fa-calendar-alt"></i> {new Date(item.date + "T00:00:00").toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </span>
        {isLoggedIn && (
          <div className="agenda-actions">
            <button className="btn-edit" onClick={() => onEdit(item)} title="Editar">
              <i className="fa-solid fa-edit"></i>
            </button>
            <button className="btn-delete" onClick={() => onDelete(item.id)} title="Excluir">
              <i className="fa-solid fa-trash-alt"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}