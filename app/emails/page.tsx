"use client";
import { useEffect, useState, useRef } from "react";
import Footer from "../components/Footer";

export default function Home() {
  const [emails, setEmails] = useState<string[]>([]);
  const [filteredEmails, setFilteredEmails] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newEmails, setNewEmails] = useState("");
  const [description, setDescription] = useState("");
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.title = "IIW24 - Emails";
  }, []);

  useEffect(() => {
    async function fetchEmails() {
      setLoading(true);
      const res = await fetch("/api/get-emails");
      const data: string[] = await res.json();
      const sorted = data.slice().sort((a, b) => a.localeCompare(b));
      setEmails(sorted);
      setFilteredEmails(sorted);
      setLoading(false);
    }
    fetchEmails();
  }, []);

  function handleSearch() {
    const value = searchRef.current?.value.toLowerCase() || "";
    const filtered = emails.filter((email) =>
      email.toLowerCase().includes(value)
    );
    setFilteredEmails(filtered);
  }

  useEffect(() => {
    const input = searchRef.current;
    input?.addEventListener("input", handleSearch);
    return () => input?.removeEventListener("input", handleSearch);
  }, [emails]);

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsedEmails = newEmails
      .split(",")
      .map((e) => e.trim())
      .filter((e) => e.length > 0);

    if (parsedEmails.length === 0) {
      showToast("Insira ao menos um e-mail válido.", "error");
      return;
    }

    setSending(true);

    try {
      const res = await fetch("/api/send-suggestion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmails: parsedEmails, description }),
      });

      if (res.ok) {
        showToast("Sugestão enviada com sucesso!", "success");
        setNewEmails("");
        setDescription("");
        setShowForm(false);
      } else if (res.status === 429) {
        showToast("Limite de sugestões atingido. Tente mais tarde.", "error");
      } else {
        showToast("Erro ao enviar sugestão.", "error");
      }
    } catch {
      showToast("Erro de conexão.", "error");
    } finally {
      setSending(false);
    }
  }

  function showToast(message: string, type: "success" | "error") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  return (
    <div>
      <div className="emails-main" style={{ marginTop: "20px", textAlign: "center" }}>
        {loading ? (
          <div className="loader"></div>
        ) : (
          <>
            <input
              type="search"
              className="searchInput"
              ref={searchRef}
              placeholder="Buscar e-mail..."
            />
            <div className="email-container">
              {filteredEmails.map((email, i) => (
                <div
                  className="email-one"
                  key={i}
                  onClick={() => (window.location.href = `mailto:${email}`)}
                >
                  {email}
                </div>
              ))}
            </div>
            <div style={{ marginTop: "25px" }}>
              {!showForm && (
                <button className="btn-primary" onClick={() => setShowForm(true)}>
                  Não encontrou o e-mail? Clique para sugerir
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {showForm && (
        <>
          <div
            className="modal-backdrop"
            onClick={() => setShowForm(false)}
          ></div>
          <form onSubmit={handleFormSubmit} className="modal-content">
            <input
              type="text"
              placeholder="Digite um ou mais e-mails separados por vírgula"
              value={newEmails}
              onChange={(e) => setNewEmails(e.target.value)}
              disabled={sending}
            />
            <textarea
              placeholder="Descrição ou observação (opcional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={sending}
              rows={3}
            />
            <button type="submit" disabled={sending} className="btn-primary">
              {sending ? "Enviando..." : "Enviar Sugestão"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              disabled={sending}
              className="btn-cancel"
            >
              Cancelar
            </button>
          </form>
        </>
      )}

      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.message}
        </div>
      )}

      {!loading && <Footer />}
    </div>
  );
}
