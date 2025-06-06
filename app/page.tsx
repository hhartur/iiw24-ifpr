"use client";
import { useEffect, useState, useRef } from "react";
import Footer from "./components/Footer";

export default function Home() {
  const [emails, setEmails] = useState<string[]>([]);
  const [filteredEmails, setFilteredEmails] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const searchRef = useRef<HTMLInputElement>(null);

  // Buscar os e-mails com POST
  useEffect(() => {
    async function fetchEmails() {
      setLoading(true);
      const res = await fetch("/api/get-emails", {
        method: "GET",
      });
      const data: string[] = await res.json();
      const sorted = data.slice().sort((a, b) => a.localeCompare(b));
      setEmails(sorted);
      setFilteredEmails(sorted);
      setLoading(false);
    }

    fetchEmails();
  }, []);

  // Atualizar filtragem
  function handleSearch() {
    const value = searchRef.current?.value.toLowerCase() || "";
    const filtered = emails.filter((email) =>
      email.toLowerCase().includes(value)
    );
    setFilteredEmails(filtered);
  }

  // Adiciona listener ao campo de busca
  useEffect(() => {
    const input = searchRef.current;
    input?.addEventListener("input", handleSearch);

    return () => input?.removeEventListener("input", handleSearch);
  }, [emails]);

  return (
    <div>
      <h1>Emails</h1>

      <div className="emails-main">
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
            <div className="sep"></div>
            <div className="email-container">
              {filteredEmails.map((email, i) => (
                <div
                  className="email-one"
                  key={i}
                  onClick={() => {
                    window.location.href = `mailto:${email}`;
                  }}
                  style={{ cursor: "pointer" }}
                >
                  {email}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      {!loading && (
        <Footer/>
      )}
    </div>
  );
}
