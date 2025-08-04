import nodemailer from "nodemailer";

type RateEntry = {
  count: number;
  lastReset: number;
};

const requests = new Map<string, RateEntry>();
const LIMIT = 3;
const WINDOW = 60 * 60 * 1000;

export async function POST(req: Request) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      "unknown";
    const now = Date.now();

    const entry = requests.get(ip);
    if (entry) {
      if (now - entry.lastReset > WINDOW) {
        // reinicia contagem após janela expirar
        requests.set(ip, { count: 1, lastReset: now });
      } else if (entry.count >= LIMIT) {
        return new Response(
          JSON.stringify({ error: "Limite de sugestões atingido. Tente mais tarde." }),
          { status: 429, headers: { "Content-Type": "application/json" } }
        );
      } else {
        entry.count++;
        requests.set(ip, entry);
      }
    } else {
      requests.set(ip, { count: 1, lastReset: now });
    }

    const { newEmails, description } = (await req.json()) as {
      newEmails: string[];
      description?: string;
    };

    if (!newEmails || newEmails.length === 0) {
      return new Response(
        JSON.stringify({ error: "Nenhum e-mail válido informado." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // validação de formato
    const invalid = newEmails.some((email) => !/\S+@\S+\.\S+/.test(email));
    if (invalid) {
      return new Response(
        JSON.stringify({ error: "Um ou mais e-mails inválidos." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_DESTINO,
      subject: "[IIW24] Sugestão de novo(s) e-mail(s) de professor",
      text: `E-mails sugeridos: ${newEmails.join(
        ", "
      )}\n\nDescrição: ${description || "Não informado"}`,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);
    return new Response(
      JSON.stringify({ error: "Erro ao enviar a sugestão." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
