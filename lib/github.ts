// lib/github.ts
import { AgendaData } from "./types";
import { Buffer } from 'buffer'; // Importar Buffer para Node.js

const GITHUB_REPO_OWNER = process.env.GITHUB_REPO_OWNER;
const GITHUB_REPO_NAME = process.env.GITHUB_REPO_NAME;
const GITHUB_AGENDA_FILE_PATH = process.env.GITHUB_AGENDA_FILE_PATH || "data/agenda.json";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || "main"; // Branch padrão do seu repositório

if (!GITHUB_REPO_OWNER || !GITHUB_REPO_NAME || !GITHUB_TOKEN) {
  console.warn("Variáveis de ambiente do GitHub não estão totalmente configuradas. As funcionalidades da agenda podem não funcionar.");
}

const githubApiBaseUrl = `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${GITHUB_AGENDA_FILE_PATH}`;

interface GitHubFileContent {
  sha: string;
  content: string; // base64 encoded
}

/**
 * Busca os dados da agenda do GitHub.
 * @returns Os dados da agenda ou null em caso de erro.
 */
export async function getAgendaDataFromGitHub(): Promise<AgendaData | null> {
  if (!GITHUB_TOKEN || !GITHUB_REPO_OWNER || !GITHUB_REPO_NAME) {
    console.error("Credenciais da API do GitHub ausentes para getAgendaDataFromGitHub.");
    return null;
  }

  try {
    const response = await fetch(githubApiBaseUrl, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3.raw", // Solicita o conteúdo bruto diretamente
        "Cache-Control": "no-store", // Garante dados frescos
      },
      cache: "no-store", // Controle de cache específico do Next.js
    });

    if (response.status === 404) {
      // O arquivo não existe, retorna dados vazios
      return {};
    }

    if (!response.ok) {
      console.error(`Falha ao buscar dados da agenda do GitHub: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json(); // Será o conteúdo JSON bruto devido ao cabeçalho Accept
    return data as AgendaData;
  } catch (error) {
    console.error("Erro ao buscar dados da agenda do GitHub:", error);
    return null;
  }
}

/**
 * Atualiza os dados da agenda no GitHub.
 * @param newContent O novo conteúdo da agenda.
 * @param commitMessage A mensagem do commit.
 * @returns True se a atualização for bem-sucedida, false caso contrário.
 */
export async function updateAgendaDataOnGitHub(
  newContent: AgendaData,
  commitMessage: string
): Promise<boolean> {
  if (!GITHUB_TOKEN || !GITHUB_REPO_OWNER || !GITHUB_REPO_NAME) {
    console.error("Credenciais da API do GitHub ausentes para updateAgendaDataOnGitHub.");
    return false;
  }

  try {
    // Primeiro, obtenha o SHA do arquivo atual
    const getFileResponse = await fetch(githubApiBaseUrl + `?ref=${GITHUB_BRANCH}`, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
        "Cache-Control": "no-store",
      },
      cache: "no-store",
    });

    if (!getFileResponse.ok && getFileResponse.status !== 404) {
      console.error(`Falha ao obter o SHA do arquivo do GitHub: ${getFileResponse.status} ${getFileResponse.statusText}`);
      return false;
    }

    let sha: string | undefined;
    if (getFileResponse.status !== 404) {
      const fileInfo = await getFileResponse.json();
      sha = fileInfo.sha;
    }

    const encodedContent = Buffer.from(JSON.stringify(newContent, null, 2)).toString("base64");

    const updateResponse = await fetch(githubApiBaseUrl, {
      method: "PUT",
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
        Accept: "application/vnd.github.v3+json",
      },
      body: JSON.stringify({
        message: commitMessage,
        content: encodedContent,
        sha: sha, // Necessário para atualizar arquivos existentes
        branch: GITHUB_BRANCH,
      }),
    });

    if (!updateResponse.ok) {
      const errorBody = await updateResponse.json();
      console.error(`Falha ao atualizar dados da agenda no GitHub: ${updateResponse.status} ${updateResponse.statusText}`, errorBody);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Erro ao atualizar dados da agenda no GitHub:", error);
    return false;
  }
}

/**
 * Limpa itens da agenda antigos e pendentes.
 * @param data Os dados da agenda atuais.
 * @returns Os dados da agenda com os itens antigos removidos.
 */
export async function cleanupOldAgendaItems(data: AgendaData): Promise<AgendaData> {
  const cleanupDays = parseInt(process.env.AGENDA_CLEANUP_DAYS || "30", 10);
  const now = new Date();
  const thirtyDaysAgo = new Date(now.setDate(now.getDate() - cleanupDays));

  let changed = false;
  const newData: AgendaData = {};

  for (const classId in data) {
    newData[classId] = data[classId].filter(item => {
      const itemCreatedAt = new Date(item.createdAt);
      // Remove itens criados há mais de `cleanupDays` dias
      if (itemCreatedAt < thirtyDaysAgo) {
        changed = true;
        return false; // Remove o item
      }
      return true; // Mantém o item
    });
  }
  
  if (changed) {
    console.log("Limpando itens da agenda antigos...");
    await updateAgendaDataOnGitHub(newData, "Limpeza automática de itens da agenda antigos");
  }

  return newData;
}