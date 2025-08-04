"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { normalizeSchedule } from "@/utils/classNormalizer";
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

export default function HorarioPage() {
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

  const handleClassClick = (cls: Omit<ClassItem, "dayName">, dayName: string) => {
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

        <div className="schedule-container">
          <div className="time-header"></div>

          {[
            "Segunda-Feira",
            "Terça-Feira",
            "Quarta-Feira",
            "Quinta-Feira",
            "Sexta-Feira",
          ].map((day) => (
            <div key={day} className="schedule-header">
              {day}
            </div>
          ))}

          {schedule.time.map((slot, index) => (
            <div
              key={slot.time}
              className="time-slot"
              style={{
                gridColumn: "1",
                gridRow: index + 2,
              }}
            >
              {slot.time}
            </div>
          ))}

          {/* Agora renderizar as aulas e preenchimentos "sem aula" */}
          {["Segunda-Feira", "Terça-Feira", "Quarta-Feira", "Quinta-Feira", "Sexta-Feira"].map((dayName) => {
            return schedule.time.map((slot) => {
              const classes = getClassesAt(dayName, slot.time);
              const col = dayIndices[dayName];
              const startRow = gridPositions.get(slot.time);
              if (!startRow) return null;

              if (classes.length === 0) {
                // Sem aula, renderiza card cinza claro
                return (
                  <div
                    key={`${dayName}-${slot.time}-empty`}
                    className="class-card empty"
                    style={{
                      gridColumn: col,
                      gridRow: startRow,
                      backgroundColor: "#2f2f2f",
                      color: "#888",
                      fontStyle: "italic",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      cursor: "default",
                      border: "1px solid #444",
                    }}
                  >
                    Sem aula
                  </div>
                );
              }

              const spanSize = Math.max(...classes.map((c) => c.size));

              if (classes.length === 1) {
                const cls = classes[0];
                return (
                  <div
                    key={`${dayName}-${slot.time}`}
                    className="class-card"
                    style={{
                      gridColumn: col,
                      gridRow: `${startRow} / span ${spanSize}`,
                      backgroundColor: cls.color || getSubjectColor(cls.subject),
                      cursor: "pointer",
                    }}
                    onClick={() => handleClassClick(cls, dayName)}
                  >
                    <div className="class-subject">{cls.subject}</div>
                    <small className="class-teachers">{cls.teachers.join(", ")}</small>
                    <small className="class-room">{cls.classroom}</small>
                  </div>
                );
              }

              // Vários grupos no mesmo horário - mostrar card único "Aula dividida"
              return (
                <div
                  key={`${dayName}-${slot.time}`}
                  className="class-card divided"
                  style={{
                    gridColumn: col,
                    gridRow: `${startRow} / span ${spanSize}`,
                    backgroundColor: "#444",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "#ddd",
                    fontWeight: "bold",
                    fontSize: "1.1rem",
                    textAlign: "center",
                    padding: "8px",
                  }}
                  onClick={() =>
                    handleClassClick(
                      {
                        subject: "Aula dividida",
                        teachers: [],
                        classroom: "",
                        students: [],
                        time: slot.time,
                        size: spanSize,
                        color: "#444",
                        group: classes,
                        
                      },
                      dayName
                    )
                  }
                  title={`${classes.length} grupos`}
                >
                  <div>Aula dividida</div>
                  <small>{classes.length} grupos</small>
                </div>
              );
            });
          })}
        </div>
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
                      <div>
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
                  <div
                    style={{ marginBottom: "15px", fontSize: "28px" }}
                  >
                    <strong>{selectedClass.group}</strong>
                  </div>
                )}
                <div style={{ marginBottom: "15px" }}>
                  <strong>Dia:</strong> {selectedClass.dayName}
                </div>
                <div style={{ marginBottom: "15px" }}>
                  <strong>Sala:</strong> {selectedClass.classroom}
                </div>
                <div style={{ marginBottom: "15px" }}>
                  <strong>Professor(es):</strong> {selectedClass.teachers.join(", ")}
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
