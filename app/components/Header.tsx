"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import schedulesData from "@/data/schedules.json";

interface Curso {
  nome_completo: string;
  turmas: string[];
}

interface CursosPorModalidade {
  [modalidade: string]: {
    [cursoKey: string]: Curso;
  };
}

interface Schedules {
  instituicao: string;
  versao: string;
  data_extracao: string;
  cursos: CursosPorModalidade;
  resumo: {
    total_cursos: number;
    total_turmas: number;
    distribuicao_por_modalidade: { [modalidade: string]: number };
  };
}

const schedules: Schedules = schedulesData;

export default function Header() {
  const route = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [horariosOpen, setHorariosOpen] = useState(false);
  const [expandedCursos, setExpandedCursos] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    function checkMobile() {
      setIsMobile(window.innerWidth <= 700);
    }
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleNavigate = (path: string) => {
    route.push(path);
    setMenuOpen(false);
  };

  const toggleCurso = (cursoKey: string) => {
    setExpandedCursos((prev) => ({
      ...prev,
      [cursoKey]: !prev[cursoKey],
    }));
  };

  const getSiglaFromCurso = (cursoKey: string, turmas: string[]) => {
  if (!turmas || turmas.length === 0) return "???";
  const baseSigla = turmas[0].split(/[0-9_-]/)[0].toUpperCase();

  if (cursoKey.includes("toledo")) return `${baseSigla} (Toledo)`;
  if (cursoKey.includes("campus")) return `${baseSigla} (Campus)`;

  return baseSigla;
};

  return (
    <header>
      <div className="header-logo">
        <h1 onClick={() => route.push("/")}>IIW24</h1>
      </div>

      <div className="header-buttons">
        <i
          className="fa-solid fa-bars"
          onClick={() => setMenuOpen(true)}
        ></i>
      </div>

      {/* Overlay */}
      <div
        className={`menu-overlay ${menuOpen ? "open" : ""}`}
        onClick={() => setMenuOpen(false)}
      ></div>

      {/* Lateral Menu */}
      <div className={`lateral-menu ${menuOpen ? "open" : ""}`}>
        <button className="menu-btn" onClick={() => handleNavigate("/emails")}>
          <i className="fa-solid fa-envelope"></i> Emails
        </button>

        <div className="menu-item">
          <button className="menu-btn" onClick={() => handleNavigate("/horarios")}>
            <i className="fa-solid fa-calendar-days"></i> Horários
          </button>
          <i
            className={`fa-solid fa-chevron-${horariosOpen ? "up" : "down"}`}
            onClick={() => setHorariosOpen(!horariosOpen)}
          ></i>
        </div>

        {horariosOpen && (
          <div className="submenu">
            {Object.entries(schedules.cursos).map(([_, cursos]) =>
              Object.entries(cursos).map(([cursoKey, curso]) => {
                const turmasUnicas = Array.from(new Set(curso.turmas));
                const sigla = getSiglaFromCurso(cursoKey, turmasUnicas);

                return (
                  <div key={cursoKey} className="submenu-item">
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <span>{sigla}</span>
                      <i
                        className={`fa-solid fa-chevron-${
                          expandedCursos[cursoKey] ? "up" : "down"
                        }`}
                        onClick={() => toggleCurso(cursoKey)}
                        style={{
                          marginLeft: "6px",
                          cursor: "pointer",
                          fontSize: "0.9rem",
                        }}
                      ></i>
                    </div>

                    {expandedCursos[cursoKey] && (
                      <ul>
                        {turmasUnicas.map((turma) => (
                          <li key={turma}>
                            <button
                              className="submenu-btn"
                              onClick={() =>
                                handleNavigate(`/horarios/${encodeURIComponent(turma)}`)
                              }
                            >
                              {turma}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </header>
  );
}
