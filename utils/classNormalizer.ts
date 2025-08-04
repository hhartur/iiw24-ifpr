interface ClassItem {
  id: string;
  subject: string;
  size: number;
  teachers: string[];
  classroom: string;
  students: string[];
  time: string;
  color: string;
  dayName: string;
}

interface WeekClass {
  dayName: string;
  dayClasses: Omit<ClassItem, "id" | "dayName">[];
}

interface Data {
  title: string;
  base: string;
  weekClasses: WeekClass[];
  time: { time: string; size: number }[];
}

export function normalizeSchedule(data: any) {
  if (!data || !data.weekClasses) {
    throw new Error("Objeto inválido ou não contém weekClasses");
  }

  const classes: ClassItem[] = [];

  data.weekClasses.forEach((day: any) => {
    if (!day.dayClasses) return;

    day.dayClasses.forEach((cls: any, index: number) => {
      classes.push({
        id: `${day.dayName}-${index}`,
        subject: cls.subject,
        size: cls.size,
        teachers: cls.teachers,
        classroom: cls.classroom,
        students: cls.students,
        time: cls.time,
        color: cls.color,
        dayName: day.dayName,
      });
    });
  });

  return {
    title: data.title,
    base: data.base,
    classes,
    timeSlots: data.time,
  };
}