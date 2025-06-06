"use client";

import { useState, useEffect, useRef } from "react";
import Footer from "../components/Footer";

type AlertType = { type: "success" | "error" | "warning"; message: string };

export default function AdminPage() {
  const [isLogged, setIsLogged] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<AlertType | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [newEmail, setNewEmail] = useState("");
  const [adding, setAdding] = useState(false);

  const [emails, setEmails] = useState<string[]>([]);
  const [filter, setFilter] = useState("");
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [editedEmail, setEditedEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/auth/check", { cache: "no-store" })
      .then((res) => {
        console.log("Auth check status:", res.status);
        if (res.ok) setIsLogged(true);
        else setIsLogged(false);
      })
      .catch(() => setIsLogged(false));
  }, []);

  useEffect(() => {
    if (isLogged) fetchEmails();
  }, [isLogged]);

  const fetchEmails = async () => {
    try {
      const res = await fetch("/api/get-emails", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setEmails(data);
      } else {
        setAlert({ type: "error", message: "Erro ao carregar emails" });
      }
    } catch {
      setAlert({ type: "error", message: "Erro ao carregar emails" });
    }
  };

  useEffect(() => {
    if (alert) {
      setShowAlert(true);
      const timer = setTimeout(() => {
        setShowAlert(false);
        setTimeout(() => setAlert(null), 300);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      setIsLogged(true);
      setAlert({ type: "success", message: "Login realizado com sucesso!" });
    } else {
      setAlert({ type: "error", message: "Usuário ou senha inválidos" });
    }

    setLoading(false);
  };

  const filteredEmails = emails.filter((email) =>
    email.toLowerCase().includes(filter.toLowerCase())
  );

  const addEmail = async () => {
    if (!newEmail.trim()) return;
    setAdding(true);
    setAlert(null);

    const res = await fetch("/api/add-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: newEmail.trim() }),
    });

    if (res.ok) {
      setEmails((prev) => [...prev, newEmail.trim()]);
      setAlert({ type: "success", message: "Email adicionado!" });
      setNewEmail("");
    } else {
      const err = await res.json();
      setAlert({
        type: "error",
        message: err?.error || "Erro ao adicionar email",
      });
    }

    setAdding(false);
  };

  const openEditPanel = (email: string) => {
    setSelectedEmail(email);
    setEditedEmail(email);
  };

  const closeEditPanel = () => {
    setSelectedEmail(null);
    setEditedEmail("");
  };

  const saveEmail = async () => {
    if (!selectedEmail) return;
    setSaving(true);
    setAlert(null);

    const res = await fetch("/api/update-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ oldEmail: selectedEmail, newEmail: editedEmail }),
    });

    if (res.ok) {
      setEmails((prev) =>
        prev.map((e) => (e === selectedEmail ? editedEmail : e))
      );
      setAlert({ type: "success", message: "Email atualizado!" });
      closeEditPanel();
    } else {
      setAlert({ type: "error", message: "Erro ao atualizar email" });
    }

    setSaving(false);
  };

  const deleteEmail = async () => {
    if (!selectedEmail) return;
    setDeleting(true);
    setAlert(null);

    const res = await fetch("/api/delete-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: selectedEmail }),
    });

    if (res.ok) {
      setEmails((prev) => prev.filter((e) => e !== selectedEmail));
      setAlert({ type: "success", message: "Email apagado!" });
      closeEditPanel();
    } else {
      setAlert({ type: "error", message: "Erro ao apagar email" });
    }

    setDeleting(false);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        closeEditPanel();
      }
    }
    if (selectedEmail) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedEmail]);

  const disableEditButtons = saving || deleting;

  if (isLogged === null) return <p>Verificando autenticação...</p>;

  if (isLogged)
    return (
      <div className="admin-container">
        <h1>Painel Administrativo</h1>

        <div className="input-ct">
          <input
            type="text"
            placeholder="Buscar email..."
            className="input-search"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>

        <div className="input-ct" style={{marginBottom: 10}}>
          <input
            type="email"
            placeholder="Novo email..."
            className="input-add"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
          <button onClick={addEmail} disabled={adding}>
            {adding ? "Adicionando..." : "Adicionar"}
          </button>
        </div>

        <div className="email-list">
          {filteredEmails.map((email) => (
            <div
              key={email}
              className="email-one"
              onClick={() => openEditPanel(email)}
            >
              {email}
            </div>
          ))}
          {filteredEmails.length === 0 && <p>Nenhum email encontrado.</p>}
        </div>

        {alert && (
          <div
            className={`alert alert-${alert.type} ${
              showAlert ? "alert-show" : ""
            }`}
          >
            {alert.message}
          </div>
        )}

        {selectedEmail && (
          <div className="overlay">
            <div ref={panelRef} className="edit-panel">
              <h2>Editar Email</h2>
              <input
                type="email"
                value={editedEmail}
                onChange={(e) => setEditedEmail(e.target.value)}
                disabled={disableEditButtons}
              />
              <div className="edit-buttons">
                <button onClick={saveEmail} disabled={disableEditButtons}>
                  {saving ? "Salvando..." : "Salvar"}
                </button>
                <button
                  onClick={deleteEmail}
                  disabled={disableEditButtons}
                  className="delete-btn"
                >
                  {deleting ? "Apagando..." : "Apagar"}
                </button>
                <button onClick={closeEditPanel} disabled={disableEditButtons}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
        <Footer />
      </div>
    );

  return (
    <div className="admin-container">
      <h1>Login Admin</h1>

      {alert && (
        <div
          className={`alert alert-${alert.type} ${
            showAlert ? "alert-show" : ""
          }`}
        >
          {alert.message}
        </div>
      )}

      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Usuário"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="submit"
          disabled={loading}
          value={loading ? "Entrando..." : "Entrar"}
        />
      </form>
    </div>
  );
}
