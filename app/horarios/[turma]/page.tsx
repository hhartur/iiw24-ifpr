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
      .then(res => res.json())
      .then(data => {
        if (data && data.ok) {
          const normalized = normalizeSchedule(data.content);

          const mapDay = new Map<string, Omit<ClassItem, "dayName">[]>();

          normalized.classes.forEach(cls => {
            const day = cls.dayName;
            const { dayName, ...rest } = cls;
            if (!mapDay.has(day)) mapDay.set(day, []);
            mapDay.get(day)!.push(rest);
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

  // Mapear dias para índice fixo (para grid)
  const dayIndices: Record<string, number> = {
    "Segunda-Feira": 2,
    "Terça-Feira": 3,
    "Quarta-Feira": 4,
    "Quinta-Feira": 5,
    "Sexta-Feira": 6,
  };

  // Criar um mapa de posições para cada aula baseado no horário
  const createGridPositions = () => {
    const positions = new Map<string, number>();
    
    // Mapear cada horário para uma posição no grid
    schedule.time.forEach((slot, index) => {
      positions.set(slot.time, index + 2); // +2 porque a primeira linha é o cabeçalho
    });
    
    return positions;
  };

  const gridPositions = createGridPositions();

  // Função para gerar cores baseadas no nome da matéria
  const getSubjectColor = (subject: string) => {
    const colors = [
      '#3498db', // Azul
      '#e74c3c', // Vermelho
      '#27ae60', // Verde
      '#9b59b6', // Roxo
      '#f39c12', // Laranja
      '#1abc9c', // Turquesa
      '#34495e', // Cinza escuro
      '#e67e22', // Laranja escuro
      '#2ecc71', // Verde claro
      '#8e44ad', // Roxo escuro
      '#16a085', // Verde azulado
      '#c0392b', // Vermelho escuro
      '#d35400', // Laranja queimado
      '#7f8c8d', // Cinza
      '#2c3e50', // Azul escuro
      '#95a5a6', // Cinza claro
      '#f1c40f', // Amarelo
      '#e91e63', // Rosa
      '#00bcd4', // Ciano
      '#ff5722'  // Laranja avermelhado
    ];
    
    // Criar um hash simples do nome da matéria
    let hash = 0;
    for (let i = 0; i < subject.length; i++) {
      const char = subject.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Converter para 32bit integer
    }
    
    // Usar o hash para selecionar uma cor
    const colorIndex = Math.abs(hash) % colors.length;
    return colors[colorIndex];
  };

  return (
    <>
      <main className="horario-page">
        <h1>{schedule.title}</h1>

        <div className="schedule-container">
          {/* Cabeçalho vazio do canto superior esquerdo */}
          <div className="time-header"></div>
          
          {/* Cabeçalhos dos dias */}
          {["Segunda-Feira", "Terça-Feira", "Quarta-Feira", "Quinta-Feira", "Sexta-Feira"].map(day => (
            <div key={day} className="schedule-header">
              {day}
            </div>
          ))}

          {/* Coluna de horários */}
          {schedule.time.map((slot, index) => (
            <div 
              key={slot.time} 
              className="time-slot"
              style={{
                gridColumn: "1",
                gridRow: index + 2
              }}
            >
              {slot.time}
            </div>
          ))}

          {/* Aulas posicionadas no grid */}
          {schedule.weekClasses.map(day => {
  const groupedByTime: Record<string, typeof day.dayClasses> = {};
  
  day.dayClasses.forEach(cls => {
    if (!groupedByTime[cls.time]) groupedByTime[cls.time] = [];
    groupedByTime[cls.time].push(cls);
  });

  return Object.entries(groupedByTime).map(([time, classes]) => {
    const col = dayIndices[day.dayName];
    const startRow = gridPositions.get(time);
    if (!startRow) return null;

    // Pega o maior size (mas sem somar, não cresce além do necessário)
    const spanSize = Math.max(...classes.map(c => c.size));

    // Se só tem 1 aula
    if (classes.length === 1) {
      const cls = classes[0];
      return (
        <div
          key={`${day.dayName}-${time}`}
          className="class-card"
          style={{
            gridColumn: col,
            gridRow: `${startRow} / span ${spanSize}`,
            backgroundColor: cls.color || getSubjectColor(cls.subject),
          }}
          onClick={() => handleClassClick(cls, day.dayName)}
        >
          <div className="class-subject">{cls.subject}</div>
          <small className="class-teachers">{cls.teachers.join(", ")}</small>
          <small className="class-room">{cls.classroom}</small>
        </div>
      );
    }

    // Se tem 2 ou mais no mesmo horário
    return (
      <div
        key={`${day.dayName}-${time}`}
        className="class-split"
        style={{
          gridColumn: col,
          gridRow: `${startRow} / span ${spanSize}`,
        }}
      >
        {classes.map((cls, idx) => {
          // extrai só "Grupo A" / "Grupo B" se houver
          const grupoRaw = cls.students.find(s => s.includes("Grupo"));
          const grupo = grupoRaw ? grupoRaw.replace(/.*Grupo\s*/i, "Grupo ") : null;

          if (grupo != null){
            cls.group = grupo
          }
          return (
            <div
              key={idx}
              className="class-card split"
              style={{
                backgroundColor: cls.color || getSubjectColor(cls.subject),
              }}
              onClick={() => handleClassClick(cls, day.dayName)}
            >
              <div className="class-subject">{cls.subject}</div>
              {grupo && <small className="class-group">{grupo}</small>}
              <small className="class-teachers">{cls.teachers.join(", ")}</small>
              <small className="class-room">{cls.classroom}</small>
            </div>
          );
        })}
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
            
            {selectedClass.group ? (
              <div style={{ marginBottom: '15px', fontSize: '28px' }}>
                <strong>{selectedClass.group}</strong>
              </div>
            ) : null}

            <div style={{ marginBottom: '15px' }}>
              <strong>Dia:</strong> {selectedClass.dayName}
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <strong>Sala:</strong> {selectedClass.classroom}
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <strong>Professor(es):</strong> {selectedClass.teachers.join(", ")}
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <strong>Períodos:</strong> {selectedClass.size}
            </div>
            
            <div className="edit-buttons">
              <button onClick={closeModal}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}