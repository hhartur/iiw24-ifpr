// app/components/AgendaForm.tsx
"use client";

import { useState, FormEvent, useEffect } from "react";
import { AgendaItem } from "@/lib/types"; // Ajuste o caminho conforme necessário

interface AgendaFormProps {
  initialData?: AgendaItem | null;
  onSubmit: (formData: Omit<AgendaItem, "id" | "classId" | "createdAt">) => void;
  onCancel: () => void;
}

export default function AgendaForm({ initialData, onSubmit, onCancel }: AgendaFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [date, setDate] = useState(initialData?.date || "");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description);
      setDate(initialData.date);
    }
  }, [initialData]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSubmit({ title, description, date });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="agenda-form">
      <label htmlFor="title">Título:</label>
      <input
        type="text"
        id="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        disabled={isLoading}
      />

      <label htmlFor="description">Descrição:</label>
      <textarea
        id="description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
        disabled={isLoading}
      ></textarea>

      <label htmlFor="date">Data:</label>
      <input
        type="date"
        id="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
        disabled={isLoading}
      />

      <div className="form-actions">
        <button type="submit" className="btn-primary" disabled={isLoading}>
          {isLoading ? "Salvando..." : (initialData ? "Salvar Alterações" : "Adicionar Atividade")}
        </button>
        <button type="button" className="btn-cancel" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </button>
      </div>
    </form>
  );
}