import React from "react";
import NextTopLoader from "nextjs-toploader";
import { Analytics } from "@vercel/analytics/next"
import { Metadata } from "next";
import Header from "./components/Header";

import "./style.css"

export const metadata: Metadata = {
  title: "IIW24",
  description: "Site da turma IIW24 do câmpus de Assis Chateaubriand",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const scheduleRes = await fetch(new URL("/api/get-schedule", process.env.NEXTAUTH_URL || "http://localhost:3000"), {
    cache: "no-store",
  });

  const roomsRes = await fetch(new URL("/api/get-room", process.env.NEXTAUTH_URL || "http://localhost:3000"), {
    cache: "no-store",
  });

  const schedule = await scheduleRes.json();
  schedule.cursos = schedule.content
  const rooms = await roomsRes.json();

  return (
    <html lang="pt-br">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
      </head>
      <body>
        <Header schedule={schedule} rooms={rooms} />
        <NextTopLoader showSpinner={false} speed={500}/>
        {children}
        <Analytics/>
      </body>
    </html>
  );
}
