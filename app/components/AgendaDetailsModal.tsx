// app/components/AgendaDetailsModal.tsx
"use client";

import { AgendaItem } from "@/lib/types";
import { getAgendaItemStatus } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface AgendaDetailsModalProps {
  item: AgendaItem;
  onClose: () => void;
}

function removerAcentos(str: string): string {
  return str
    .normalize("NFD") // separa acentos das letras
    .replace(/[\u0300-\u036f]/g, ""); // remove os acentos
}

export default function AgendaDetailsModal({ item, onClose }: AgendaDetailsModalProps) {
  const status = getAgendaItemStatus(item);
  const statusClass = status.toLowerCase().replace(/\s/g, '-').replace(/em-\d+-dias/, 'em-dias');
  const tagClass = item.tag.toLowerCase().replace(/\s/g, '-');
    const router = useRouter();

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <i className="fa-solid fa-xmark"></i>
        </button>
        <div className="agenda-details-content">
          <h3>{item.title}</h3>

          <div className="detail-row">
            <i className="fa-solid fa-calendar-alt"></i>
            <p><strong>Data:</strong> {new Date(item.date + "T00:00:00").toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}</p>
          </div>

          <div className="detail-row">
            <i className="fa-solid fa-info-circle"></i>
            <p><strong>Status:</strong> <span className={`agenda-status ${removerAcentos(statusClass)}`}>{status}</span></p>
          </div>

          <div className="detail-row">
            <i className="fa-solid fa-tag"></i> {/* Novo ícone para a tag */}
            <p><strong>Tipo:</strong> <span className={`agenda-tag-display ${tagClass}`}>{item.tag}</span></p>
          </div>

          <div className="detail-row">
            <i className="fa-solid fa-users"></i>
            <p><strong>Turma:</strong> <span className="room-hover" style={{cursor: "pointer"}} onClick={()=>{router.push(`/horarios/turma/${item.classId}`)}}>{item.classId.toUpperCase()}</span></p>
          </div>
          
          <p className="detail-description-full"> {/* Usando a nova classe para full description */}
            <strong>Descrição:</strong><br />
            {item.description}
          </p>
        </div>
      </div>
    </div>
  );
}