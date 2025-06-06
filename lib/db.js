import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";
import fs from "fs/promises";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "emails.db");

async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

export async function openDB() {
  await ensureDataDir();  // garante que a pasta exista antes de abrir o DB
  return open({
    filename: DB_PATH,
    driver: sqlite3.Database,
  });
}

export async function initDB() {
  const db = await openDB();
  await db.exec(`
    CREATE TABLE IF NOT EXISTS emails (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL
    );
  `);
  return db;
}

export async function getAllEmails() {
  const db = await openDB();
  return db.all("SELECT email FROM emails ORDER BY email");
}

export async function addEmail(email) {
  const db = await openDB();
  await db.run("INSERT INTO emails (email) VALUES (?)", email);
}

export async function deleteEmail(email) {
  const db = await openDB();
  await db.run("DELETE FROM emails WHERE email = ?", email);
}

export async function updateEmail(oldEmail, newEmail) {
  const db = await openDB();
  await db.run("UPDATE emails SET email = ? WHERE email = ?", newEmail, oldEmail);
}

export async function emailExists(email) {
  const db = await openDB();
  const row = await db.get("SELECT 1 FROM emails WHERE email = ?", email);
  return !!row;
}