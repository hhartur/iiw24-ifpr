"use client";

import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";

interface CursoFile {
  name: string;
  path: string;
  contentType: string;
}

interface Categoria {
  name: string;
  path: string;
  contentType: string;
  cursos: CursoFile[];
}

interface ScheduleData {
  content: Categoria[];
  ok: boolean;
}

interface RoomClass {
  name: string;
  path: string;
  contentType: string;
}

interface RoomBlock {
  name: string;
  path: string;
  contentType: string;
  classes: RoomClass[];
}

interface RoomData {
  content: RoomBlock[];
  ok: boolean;
}

interface HeaderProps {
  schedule: ScheduleData;
  rooms: RoomData;
}

const CursoItem = ({
  categoria,
  expandedCategorias,
  toggleCategoria,
  onNavigate,
  mounted,
  sectionType,
}: {
  categoria: Categoria;
  expandedCategorias: { [key: string]: boolean };
  toggleCategoria: (name: string, sectionType: string) => void;
  onNavigate: (path: string) => void;
  mounted: boolean;
  sectionType: string;
}) => {
  const uniqueKey = `${sectionType}-${categoria.name}`;
  const expanded = !!expandedCategorias[uniqueKey];

  return (
    <div key={categoria.name} className="submenu-item">
      <div
        className={`submenu-header ${mounted && expanded ? "expanded" : ""}`}
        onClick={() => toggleCategoria(categoria.name, sectionType)}
      >
        <span>{categoria.name.toUpperCase()}</span>
        <i
          className={`fa-solid fa-chevron-${mounted && expanded ? "up" : "down"}`}
        ></i>
      </div>
      <div className={`submenu-content ${mounted && expanded ? "expanded" : ""}`}>
        <ul>
          {categoria.cursos
            .filter((curso) => curso.name.endsWith(".mdx"))
            .map((curso) => {
              const nomeTurma = curso.name
                .replace(/\.mdx$/, "")
                .replace(/_/g, " ");
              return (
                <li key={curso.path}>
                  <button
                    className="submenu-btn"
                    onClick={() =>
                      onNavigate(
                        `/horarios/turma/${encodeURIComponent(
                          nomeTurma
                            .normalize("NFD")
                            .replace(/[\u0300-\u036f]/g, "")
                            .replace(/[^a-zA-Z0-9 \/-]/g, "")
                            .toLowerCase()
                            .replace(/[ \/]/g, "_")
                        )}`
                      )
                    }
                  >
                    {nomeTurma}
                  </button>
                </li>
              );
            })}
        </ul>
      </div>
    </div>
  );
};

const BlocoItem = ({
  bloco,
  expanded,
  onToggle,
  onNavigate,
  mounted,
}: {
  bloco: RoomBlock;
  expanded: boolean;
  onToggle: (name: string) => void;
  onNavigate: (path: string) => void;
  mounted: boolean;
}) => (
  <div key={bloco.name} className="submenu-item">
    <div
      className={`submenu-header ${mounted && expanded ? "expanded" : ""}`}
      onClick={() => onToggle(bloco.name)}
    >
      <span>{bloco.name}</span>
      <i
        className={`fa-solid fa-chevron-${mounted && expanded ? "up" : "down"}`}
      ></i>
    </div>
    <div className={`submenu-content ${mounted && expanded ? "expanded" : ""}`}>
      <ul>
        {Array.from(
          new Map(
            bloco.classes
              .filter((cls) => cls.name.endsWith(".mdx"))
              .map((cls) => [cls.path, cls])
          ).values()
        ).map((cls) => {
          const nomeSala = cls.name.replace(/\.mdx$/, "").replace(/_/g, " ");
          return (
            <li key={cls.path}>
              <button
                className="submenu-btn"
                onClick={() =>
                  onNavigate(
                    `/horarios/sala/${encodeURIComponent(
                      nomeSala
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "")
                        .replace(/[^a-zA-Z0-9 \/-]/g, "")
                        .toLowerCase()
                        .replace(/[ \/]/g, "_")
                    )}`
                  )
                }
              >
                {nomeSala}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  </div>
);

export default function Header({ schedule, rooms }: HeaderProps) {
  const route = useRouter();
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [horariosOpen, setHorariosOpen] = useState(false);
  const [turmasOpen, setTurmasOpen] = useState(false);
  const [salasOpen, setSalasOpen] = useState(false);
  const [expandedCategorias, setExpandedCategorias] = useState<{ [key: string]: boolean }>({});
  const [expandedSalas, setExpandedSalas] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNavigate = (path: string) => {
    route.push(path);
    setMenuOpen(false);
  };

  const toggleCategoria = (name: string, sectionType: string) => {
    const uniqueKey = `${sectionType}-${name}`;
    setExpandedCategorias((prev) => ({ 
      ...prev, 
      [uniqueKey]: !prev[uniqueKey] 
    }));
  };

  const toggleSala = (name: string) => {
    setExpandedSalas((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const listaSalas = useMemo(() => {
    if (!rooms?.content) return [];

    const blocoMap = new Map<string, RoomBlock>();

    rooms.content.forEach((bloco) => {
      if (!blocoMap.has(bloco.name)) {
        const classesUnicas = Array.from(
          new Map(
            bloco.classes
              .filter((cls) => cls.name.endsWith(".mdx"))
              .map((cls) => [cls.path, cls])
          ).values()
        );
        blocoMap.set(bloco.name, { ...bloco, classes: classesUnicas });
      } else {
        const blocoExistente = blocoMap.get(bloco.name)!;
        const todasClasses = [...blocoExistente.classes, ...bloco.classes];
        const classesUnicas = Array.from(
          new Map(
            todasClasses
              .filter((cls) => cls.name.endsWith(".mdx"))
              .map((cls) => [cls.path, cls])
          ).values()
        );
        blocoMap.set(bloco.name, { ...blocoExistente, classes: classesUnicas });
      }
    });

    return Array.from(blocoMap.values());
  }, [rooms]);

  const { turmasCampus, turmasToledo } = useMemo(() => {
    if (!schedule?.content) return { turmasCampus: [], turmasToledo: [] };

    const campus: Categoria[] = [];
    const toledo: Categoria[] = [];

    schedule.content.forEach(categoria => {
      const cursosToledoIIW = categoria.cursos.filter(curso => 
        curso.name.endsWith(".mdx") && 
        curso.name.toLowerCase().includes("iiw") && 
        curso.name.toLowerCase().includes("b.mdx")
      );

      const cursosCampus = categoria.cursos.filter(curso => 
        curso.name.endsWith(".mdx") && 
        !curso.name.toLowerCase().includes("b.mdx")
      );

      if (cursosToledoIIW.length > 0) {
        toledo.push({ ...categoria, cursos: cursosToledoIIW });
      }

      if (cursosCampus.length > 0) {
        campus.push({ ...categoria, cursos: cursosCampus });
      }
    });

    return { turmasCampus: campus, turmasToledo: toledo };
  }, [schedule]);

  return (
    <header>
      <div className="header-logo">
        <h1 style={{ cursor: "pointer" }} onClick={() => route.push("/")}>
          IIW24
        </h1>
      </div>

      <div className="header-buttons">
        <i
          className="fa-solid fa-bars"
          style={{ cursor: "pointer" }}
          onClick={() => setMenuOpen(true)}
        ></i>
      </div>

      <div
        className={`menu-overlay ${menuOpen ? "open" : ""}`}
        onClick={() => setMenuOpen(false)}
      ></div>

      <div className={`lateral-menu ${menuOpen ? "open" : ""}`}>
        <button className="menu-btn" onClick={() => handleNavigate("/emails")}>
          <i className="fa-solid fa-envelope"></i> Emails
        </button>

        <div className="menu-item">
          <button
            className="menu-btn"
            onClick={() => setHorariosOpen(!horariosOpen)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span>
              <i
                className="fa-solid fa-calendar-days"
                style={{ marginRight: 6 }}
              ></i>{" "}
              Horários
            </span>
            <i
              className={`fa-solid fa-chevron-${mounted && horariosOpen ? "up" : "down"}`}
            ></i>
          </button>
        </div>

        <div className={`submenu-main ${mounted && horariosOpen ? "expanded" : ""}`}>
          <div className="section-header">
            <h4 
              className={`section-title ${mounted && turmasOpen ? "expanded" : ""}`}
              onClick={() => setTurmasOpen(!turmasOpen)}
            >
              Turmas
              <i className={`fa-solid fa-chevron-${mounted && turmasOpen ? "up" : "down"}`}></i>
            </h4>
          </div>

          <div className={`section-content ${mounted && turmasOpen ? "expanded" : ""}`}>
            {turmasCampus.length > 0 && (
              <div className="campus-section">
                <h5 className="campus-title">Campus</h5>
                {turmasCampus.map((categoria) => (
                  <CursoItem
                    key={`campus-${categoria.name}`}
                    categoria={categoria}
                    expandedCategorias={expandedCategorias}
                    toggleCategoria={toggleCategoria}
                    onNavigate={handleNavigate}
                    mounted={mounted}
                    sectionType="campus"
                  />
                ))}
              </div>
            )}

            {turmasToledo.length > 0 && (
              <div className="toledo-section">
                <h5 className="campus-title">Toledo</h5>
                {turmasToledo.map((categoria) => (
                  <CursoItem
                    key={`toledo-${categoria.name}`}
                    categoria={categoria}
                    expandedCategorias={expandedCategorias}
                    toggleCategoria={toggleCategoria}
                    onNavigate={handleNavigate}
                    mounted={mounted}
                    sectionType="toledo"
                  />
                ))}
              </div>
            )}
          </div>

          <div className="section-header">
            <h4 
              className={`section-title ${mounted && salasOpen ? "expanded" : ""}`}
              onClick={() => setSalasOpen(!salasOpen)}
            >
              Salas
              <i className={`fa-solid fa-chevron-${mounted && salasOpen ? "up" : "down"}`}></i>
            </h4>
          </div>

          <div className={`section-content ${mounted && salasOpen ? "expanded" : ""}`}>
            {listaSalas.length > 0 ? (
              listaSalas.map((bloco) => (
                <BlocoItem
                  key={bloco.name}
                  bloco={bloco}
                  expanded={!!expandedSalas[bloco.name]}
                  onToggle={toggleSala}
                  onNavigate={handleNavigate}
                  mounted={mounted}
                />
              ))
            ) : (
              <div style={{ 
                padding: "20px", 
                textAlign: "center", 
                color: "var(--text-secondary)",
                fontStyle: "italic" 
              }}>
                Carregando salas...
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}