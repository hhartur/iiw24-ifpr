import schedulesData from "@/data/schedules.json";
import Link from "next/link";

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

export default function HorariosPage() {
  const { cursos } = schedules;

  return (
    <main style={{ padding: 20 }} className="horarios">
      <h1>Horários - {schedules.instituicao}</h1>

      {Object.entries(cursos).map(([modalidadeKey, cursos]) => (
        <section key={modalidadeKey} style={{ marginBottom: 40 }}>
          <h2 style={{ textTransform: "capitalize" }}>
            {modalidadeKey.replace(/_/g, " ")}
          </h2>

          {Object.entries(cursos).map(([cursoKey, curso]) => (
            <div key={cursoKey} style={{ marginLeft: 20, marginBottom: 20 }}>
              <h3>{curso.nome_completo}</h3>
              <ul>
                {curso.turmas.map((turma) => (
                  <li key={turma}>
                    <Link href={`/horarios/${encodeURIComponent(turma)}`}>
                      {turma}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      ))}
    </main>
  );
}
