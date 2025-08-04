import React from "react";
import NextTopLoader from "nextjs-toploader";
import { Metadata } from "next";
import Header from "./components/Header";

import "./style.css"

export const metadata: Metadata = {
  title: "IIW24",
  description: "Site da turma IIW24 do câmpus de Assis Chateaubriand",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
      </head>
      <body>
        <Header />
        <NextTopLoader showSpinner={false} speed={500}/>
        {children}
      </body>
    </html>
  );
}
