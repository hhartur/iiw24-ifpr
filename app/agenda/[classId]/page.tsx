// app/agenda/[classId]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { AgendaItem } from "@/lib/types"; // Ajuste o caminho conforme necessário
import AgendaForm from "@/app/components/AgendaForm";
import AgendaItemCard from "@/app/components/AgendaItemCard";

export default function AgendaClassPage() {
  const params = useParams();
  const classId = params.classId as string;

  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AgendaItem | null>(null);
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
      // Ordena por data, depois por tempo de criação
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
            />
          ))
        )}
      </div>

      {isFormOpen && (
        <div className="modal-backdrop" onClick={() => setIsFormOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingItem ? "Editar Atividade" : "Adicionar Nova Atividade"}</h2>
            <AgendaForm initialData={editingItem} onSubmit={handleFormSubmit} onCancel={() => setIsFormOpen(false)} />
          </div>
        </div>
      )}
    </main>
  );
}