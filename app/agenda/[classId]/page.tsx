// app/agenda/[classId]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { AgendaItem } from "@/lib/types";
import AgendaForm from "@/app/components/AgendaForm";
import AgendaItemCard from "@/app/components/AgendaItemCard";
import AgendaDetailsModal from "@/app/components/AgendaDetailsModal";

export default function AgendaClassPage() {
  const params = useParams();
  const classId = params.classId as string;

  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false); // Para adicionar/editar
  const [editingItem, setEditingItem] = useState<AgendaItem | null>(null);
  const [selectedItemForDetails, setSelectedItemForDetails] = useState<AgendaItem | null>(null); // Novo estado para detalhes
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const fetchAgendaItems = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/agenda/${classId}`, { cache: "no-store" });
      if (!res.ok) {
        throw new Error(`Falha ao buscar agenda: ${res.statusText}`);
      }
      const data: AgendaItem[] = await res.json();
      data.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        if (dateA !== dateB) {
          return dateA - dateB;
        }
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
      setAgendaItems(data);
    } catch (err: any) {
      setError(err.message);
      toast.error("Erro ao carregar agenda: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const checkLoginStatus = async () => {
    try {
      const res = await fetch('/api/auth/status');
      if (res.ok) {
        const { isLoggedIn } = await res.json();
        setIsLoggedIn(isLoggedIn);
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error("Falha ao verificar status de login:", error);
      setIsLoggedIn(false);
    }
  };

  useEffect(() => {
    document.title = `IIW24 - Agenda ${classId.toUpperCase()}`;
    fetchAgendaItems();
    checkLoginStatus();
  }, [classId]);

  const handleAddActivity = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleEditActivity = (item: AgendaItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleShowDetails = (item: AgendaItem) => { // Nova função para mostrar detalhes
    setSelectedItemForDetails(item);
  };

  const closeModal = () => {
    setSelectedItemForDetails(null); // Fecha o modal de detalhes
  };

  const handleFormSubmit = async (formData: Omit<AgendaItem, "id" | "classId" | "createdAt">) => {
    try {
      let res;
      if (editingItem) {
        res = await fetch(`/api/agenda/${classId}/${editingItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      } else {
        res = await fetch(`/api/agenda/${classId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Falha ao salvar atividade: ${res.statusText}`);
      }

      toast.success(`Atividade ${editingItem ? "atualizada" : "adicionada"} com sucesso!`);
      setIsFormOpen(false);
      fetchAgendaItems();
    } catch (err: any) {
      toast.error("Erro ao salvar atividade: " + err.message);
    }
  };

  const handleDeleteActivity = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta atividade?")) return;

    try {
      const res = await fetch(`/api/agenda/${classId}/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error(`Falha ao excluir atividade: ${res.statusText}`);
      }

      toast.success("Atividade excluída com sucesso!");
      fetchAgendaItems();
    } catch (err: any) {
      toast.error("Erro ao excluir atividade: " + err.message);
    }
  };

  if (isLoading) {
    return (
      <main className="loading-container">
        <div className="loader"></div>
      </main>
    );
  }

  if (error) {
    return <main className="agenda-page error-message">Erro: {error}</main>;
  }

  return (
    <main className="agenda-page">
      <h1>Agenda da Turma {classId.toUpperCase()}</h1>

      {isLoggedIn && (
        <button className="btn-primary add-agenda-btn" onClick={handleAddActivity}>
          <i className="fa-solid fa-plus"></i> Adicionar Atividade
        </button>
      )}

      <div className="agenda-list">
        {agendaItems.length === 0 ? (
          <p className="no-activities-message">Nenhuma atividade agendada para esta turma.</p>
        ) : (
          agendaItems.map((item) => (
            <AgendaItemCard
              key={item.id}
              item={item}
              isLoggedIn={isLoggedIn}
              onEdit={handleEditActivity}
              onDelete={handleDeleteActivity}
              onShowDetails={handleShowDetails} // Passa a nova função
            />
          ))
        )}
      </div>

      {/* Modal para Adicionar/Editar Atividade */}
      {isFormOpen && (
        <div className="modal-backdrop" onClick={() => setIsFormOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setIsFormOpen(false)}>
              <i className="fa-solid fa-xmark"></i>
            </button>
            <h2>{editingItem ? "Editar Atividade" : "Adicionar Nova Atividade"}</h2>
            <AgendaForm initialData={editingItem} onSubmit={handleFormSubmit} onCancel={() => setIsFormOpen(false)} />
          </div>
        </div>
      )}

      {/* Modal para Exibir Detalhes da Atividade */}
      {selectedItemForDetails && (
        <AgendaDetailsModal item={selectedItemForDetails} onClose={closeModal} />
      )}
    </main>
  );
}