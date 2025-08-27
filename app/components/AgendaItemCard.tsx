// app/components/AgendaItemCard.tsx
"use client";

import { AgendaItem } from "@/lib/types";
import { getAgendaItemStatus } from "@/lib/utils";

interface AgendaItemCardProps {
  item: AgendaItem;
  isLoggedIn: boolean;
  onEdit: (item: AgendaItem) => void;
  onDelete: (id: string) => void;
  onShowDetails: (item: AgendaItem) => void;
}

function removerAcentos(str: string): string {
  return str
    .normalize("NFD") // separa acentos das letras
    .replace(/[\u0300-\u036f]/g, ""); // remove os acentos
}

export default function AgendaItemCard({ item, isLoggedIn, onEdit, onDelete, onShowDetails }: AgendaItemCardProps) {
  const status = getAgendaItemStatus(item);
  const statusClass = status.toLowerCase().replace(/\s/g, '-').replace(/em-\d+-dias/, 'em-dias');
  const tagClass = item.tag.toLowerCase().replace(/\s/g, '-'); // Classe para a tag

  return (
    <div className={`agenda-card ${statusClass}`} onClick={() => onShowDetails(item)}>
      <div className="agenda-card-header">
        <h3 className="agenda-card-title">{item.title}</h3>
        <span className={`agenda-status ${removerAcentos(statusClass)}`}>{status}</span>
      </div>
      <p className="agenda-card-description">{item.description}</p>
      <div className="agenda-card-footer">
        <span className="agenda-card-date">
          <i className="fa-solid fa-calendar-alt"></i> {new Date(item.date + "T00:00:00").toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
          <span className={`agenda-tag-display ${tagClass}`}>{item.tag}</span> {/* Exibe a tag */}
        </span>
        {isLoggedIn && (
          <div className="agenda-actions" onClick={(e) => e.stopPropagation()}>
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