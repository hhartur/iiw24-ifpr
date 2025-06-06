import React from "react";
import NextTopLoader from "nextjs-toploader";

import "./style.css"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>Emails</title>
      </head>
      <body>
        <NextTopLoader showSpinner={false} speed={500}/>
        {children}
      </body>
    </html>
  );
}
