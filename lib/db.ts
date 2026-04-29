import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const DB_PATH = resolve(process.cwd(), process.env.DATABASE_PATH ?? "./data/meetups.db");

mkdirSync(dirname(DB_PATH), { recursive: true });

declare global {
  // eslint-disable-next-line no-var
  var __meetupDb: Database.Database | undefined;
}

function init(database: Database.Database) {
  database.pragma("journal_mode = WAL");
  database.pragma("foreign_keys = ON");

  database.exec(`
    CREATE TABLE IF NOT EXISTS meetups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      city TEXT NOT NULL,
      region TEXT NOT NULL,
      format TEXT NOT NULL CHECK (format IN ('in-person', 'online', 'hybrid')),
      url TEXT NOT NULL,
      contact TEXT,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
      submitted_at TEXT NOT NULL DEFAULT (datetime('now')),
      reviewed_at TEXT,
      notes TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_meetups_status ON meetups(status);
    CREATE INDEX IF NOT EXISTS idx_meetups_region ON meetups(region);
  `);
}

export const db: Database.Database =
  globalThis.__meetupDb ??
  (() => {
    const database = new Database(DB_PATH);
    init(database);
    if (process.env.NODE_ENV !== "production") globalThis.__meetupDb = database;
    return database;
  })();

export type MeetupStatus = "pending" | "approved" | "rejected";
export type MeetupFormat = "in-person" | "online" | "hybrid";

export interface Meetup {
  id: number;
  name: string;
  description: string;
  city: string;
  region: string;
  format: MeetupFormat;
  url: string;
  contact: string | null;
  status: MeetupStatus;
  submitted_at: string;
  reviewed_at: string | null;
  notes: string | null;
}
