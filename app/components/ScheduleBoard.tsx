"use client";

import { useState } from "react";

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

interface Props {
  schedule: ScheduleNormalized;
  onSelectClass: (cls: ClassItem) => void;
  showStudents: boolean | null
}

export default function ScheduleBoard({ schedule, onSelectClass, showStudents }: Props) {
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
      "#3498db", "#e74c3c", "#27ae60", "#9b59b6", "#f39c12",
      "#1abc9c", "#34495e", "#e67e22", "#2ecc71", "#8e44ad",
      "#16a085", "#c0392b", "#d35400", "#7f8c8d", "#2c3e50",
      "#95a5a6", "#f1c40f", "#e91e63", "#00bcd4", "#ff5722",
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

  const getClassesAt = (dayName: string, time: string) => {
    const day = schedule.weekClasses.find((d) => d.dayName === dayName);
    if (!day) return [];
    return day.dayClasses.filter((cls) => cls.time === time);
  };

  return (
    <div className="schedule-container">
      <div className="time-header"></div>

      {["Segunda-Feira", "Terça-Feira", "Quarta-Feira", "Quinta-Feira", "Sexta-Feira"].map((day) => (
        <div key={day} className="schedule-header">
          {day}
        </div>
      ))}

      {schedule.time.map((slot, index) => (
        <div
          key={slot.time}
          className="time-slot"
          style={{ gridColumn: "1", gridRow: index + 2 }}
        >
          {slot.time}
        </div>
      ))}

      {["Segunda-Feira", "Terça-Feira", "Quarta-Feira", "Quinta-Feira", "Sexta-Feira"].map((dayName) =>
        schedule.time.map((slot) => {
          const classes = getClassesAt(dayName, slot.time);
          const col = dayIndices[dayName];
          const startRow = gridPositions.get(slot.time);
          if (!startRow) return null;

          if (classes.length === 0) {
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
                onClick={() => onSelectClass({ ...cls, dayName })}
              >
                <div className="class-subject">{cls.subject}</div>
                <small className="class-teachers">{cls.teachers.join(", ")}</small>
                <small className="class-room">{cls.classroom}</small>
                {showStudents && (
                  <small className="class-students">{cls.students}</small>
                )}
              </div>
            );
          }

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
                onSelectClass({
                  subject: "Aula dividida",
                  teachers: [],
                  classroom: "",
                  students: [],
                  time: slot.time,
                  size: spanSize,
                  color: "#444",
                  group: classes,
                  dayName,
                })
              }
              title={`${classes.length} grupos`}
            >
              <div>Aula dividida</div>
              <small>{classes.length} grupos</small>
            </div>
          );
        })
      )}
    </div>
  );
}
