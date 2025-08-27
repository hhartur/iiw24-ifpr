// app/components/AgendaForm.tsx
"use client";

import { useState, FormEvent, useEffect } from "react";
import { AgendaItem } from "@/lib/types";

interface AgendaFormProps {
  initialData?: AgendaItem | null;
  onSubmit: (formData: Omit<AgendaItem, "id" | "classId" | "createdAt">) => void;
  onCancel: () => void;
}

export default function AgendaForm({ initialData, onSubmit, onCancel }: AgendaFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [date, setDate] = useState(initialData?.date || "");
  const [tag, setTag] = useState<AgendaItem['tag']>(initialData?.tag || "atividade"); // Novo estado para a tag
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description);
      setDate(initialData.date);
      setTag(initialData.tag);
    }
  }, [initialData]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSubmit({ title, description, date, tag }); // Inclui a tag no submit
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

      <label htmlFor="tag">Tipo de Atividade:</label>
      <select
        id="tag"
        value={tag}
        onChange={(e) => setTag(e.target.value as AgendaItem['tag'])}
        required
        disabled={isLoading}
      >
        <option value="atividade">Atividade</option>
        <option value="prova">Prova</option>
        <option value="trabalho">Trabalho</option>
        <option value="evento">Evento</option>
        <option value="outro">Outro</option>
      </select>

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