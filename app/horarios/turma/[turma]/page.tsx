"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { normalizeSchedule } from "@/utils/classNormalizer";
import ScheduleBoard from "@/app/components/ScheduleBoard";
import Error from "next/error";

interface ClassItem {
  subject: string;
  size: number;
  teachers: string[];
  classroom: string;
  students: string[];
  time: string;
  color: string;
  dayName: string;
  group: any | null;
}

interface WeekClass {
  dayName: string;
  dayClasses: Omit<ClassItem, "dayName">[];
}

interface ScheduleNormalized {
  title: string;
  time: { time: string; size: number }[];
  weekClasses: WeekClass[];
}

export default function HorarioTurmaPage() {
  const router = useRouter();

  const params = useParams();
  const className = params.turma;

  const [notFound, setNotFound] = useState(false);
  const [schedule, setSchedule] = useState<ScheduleNormalized | null>(null);
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);

  useEffect(() => {
    fetch("/api/get-schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ className }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.ok) {
          document.title = "IIW24 - " + className;

          const normalized = normalizeSchedule(data.content);

          const mapDay = new Map<string, Omit<ClassItem, "dayName">[]>();

          normalized.classes.forEach((cls) => {
            const day = cls.dayName;
            const { dayName, ...rest } = cls;
            if (!mapDay.has(day)) mapDay.set(day, []);
            mapDay.get(day)!.push(rest);
          });

          // Para garantir que todos os dias da semana estejam no mapa, mesmo que vazios
          const allDays = [
            "Segunda-Feira",
            "Terça-Feira",
            "Quarta-Feira",
            "Quinta-Feira",
            "Sexta-Feira",
          ];
          allDays.forEach((d) => {
            if (!mapDay.has(d)) mapDay.set(d, []);
          });

          const weekClasses: WeekClass[] = [];
          for (const [dayName, dayClasses] of mapDay) {
            weekClasses.push({ dayName, dayClasses });
          }

          setSchedule({
            title: normalized.title,
            time: normalized.timeSlots,
            weekClasses,
          });

          setNotFound(false);
        } else {
          setNotFound(true);
        }
      });
  }, [className]);

  const handleClassClick = (
    cls: Omit<ClassItem, "dayName">,
    dayName: string
  ) => {
    setSelectedClass({ ...cls, dayName });
  };

  const closeModal = () => {
    setSelectedClass(null);
  };

  if (notFound) return <Error statusCode={404} />;

  if (!schedule)
    return (
      <main className="loading-container">
        <div className="loader"></div>
      </main>
    );

  const dayIndices: Record<string, number> = {
    "Segunda-Feira": 2,
    "Terça-Feira": 3,
    "Quarta-Feira": 4,
    "Quinta-Feira": 5,
    "Sexta-Feira": 6,
  };

  const createGridPositions = () => {
    const positions = new Map<string, number>();
    schedule.time.forEach((slot, index) => {
      positions.set(slot.time, index + 2);
    });
    return positions;
  };

  const gridPositions = createGridPositions();

  const getSubjectColor = (subject: string) => {
    const colors = [
      "#3498db",
      "#e74c3c",
      "#27ae60",
      "#9b59b6",
      "#f39c12",
      "#1abc9c",
      "#34495e",
      "#e67e22",
      "#2ecc71",
      "#8e44ad",
      "#16a085",
      "#c0392b",
      "#d35400",
      "#7f8c8d",
      "#2c3e50",
      "#95a5a6",
      "#f1c40f",
      "#e91e63",
      "#00bcd4",
      "#ff5722",
    ];

    let hash = 0;
    for (let i = 0; i < subject.length; i++) {
      const char = subject.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }

    const colorIndex = Math.abs(hash) % colors.length;
    return colors[colorIndex];
  };

  // Função para verificar se tem aula naquele dia e horário
  const getClassesAt = (dayName: string, time: string) => {
    const day = schedule.weekClasses.find((d) => d.dayName === dayName);
    if (!day) return [];
    return day.dayClasses.filter((cls) => cls.time === time);
  };

  return (
    <>
      <main className="horario-page">
        <h1>{schedule.title}</h1>
        <ScheduleBoard schedule={schedule} onSelectClass={setSelectedClass} showStudents={false} />
      </main>

      {/* Modal de detalhes */}
      {selectedClass && (
        <div className="overlay" onClick={closeModal}>
          <div className="edit-panel" onClick={(e) => e.stopPropagation()}>
            <h3>{selectedClass.subject}</h3>

            {Array.isArray(selectedClass.group) ? (
              <div>
                <h4>Detalhes dos grupos:</h4>
                {selectedClass.group.map((g: any, idx: number) => {
                  const grupoRaw = g.students.find((s: string) =>
                    s.includes("Grupo")
                  );
                  const grupo = grupoRaw
                    ? grupoRaw.replace(/.*Grupo\s*/i, "Grupo ")
                    : `Grupo ${idx + 1}`;
                  return (
                    <div
                      key={idx}
                      style={{
                        marginBottom: "15px",
                        padding: "10px",
                        background: "#2c2c2c",
                        borderRadius: "6px",
                      }}
                    >
                      <div>
                        <strong>{grupo}</strong>
                      </div>
                      <div
                      className="room-hover"
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          if(!g.classroom || g.classroom == "") return;
                          router.push(
                            "/horarios/sala/" +
                              g.classroom
                                .normalize("NFD")
                                .replace(/[\u0300-\u036f]/g, "")
                                .replace(/[^a-zA-Z0-9 \/-]/g, "")
                                .toLowerCase()
                                .replace(/[ \/]/g, "_")
                          );
                        }}
                      >
                        <strong>Sala:</strong> {g.classroom}
                      </div>
                      <div>
                        <strong>Professor(es):</strong> {g.teachers.join(", ")}
                      </div>
                      <div>
                        <strong>Períodos:</strong> {g.size}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <>
                {selectedClass.group && (
                  <div style={{ marginBottom: "15px", fontSize: "28px" }}>
                    <strong>{selectedClass.group}</strong>
                  </div>
                )}
                <div style={{ marginBottom: "15px" }}>
                  <strong>Dia:</strong> {selectedClass.dayName}
                </div>
                <div
                      className="room-hover"
                  style={{ marginBottom: "15px", cursor: "pointer" }}
                  onClick={() => {
                    router.push(
                      "/horarios/sala/" +
                        selectedClass.classroom
                          .normalize("NFD")
                          .replace(/[\u0300-\u036f]/g, "")
                          .replace(/[^a-zA-Z0-9 \/-]/g, "")
                          .toLowerCase()
                          .replace(/[ \/]/g, "_")
                    );
                  }}
                >
                  <strong>Sala:</strong> {selectedClass.classroom}
                </div>
                <div style={{ marginBottom: "15px" }}>
                  <strong>Professor(es):</strong>{" "}
                  {selectedClass.teachers.join(", ")}
                </div>
                <div style={{ marginBottom: "15px" }}>
                  <strong>Períodos:</strong> {selectedClass.size}
                </div>
              </>
            )}

            <div className="edit-buttons">
              <button onClick={closeModal}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
