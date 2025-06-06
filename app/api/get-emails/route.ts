// src/app/api/emails/route.ts

import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET(req: NextRequest) {
  const filePath = path.join(process.cwd(), "app", "api", "get-emails", "data", "emails.json");
  const fileData = await fs.readFile(filePath, "utf-8");
  const emails = JSON.parse(fileData);

  return NextResponse.json(emails);
}