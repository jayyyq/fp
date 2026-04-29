import { createClient, type Client } from "@libsql/client";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

function buildClient(): Client {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  if (tursoUrl) {
    return createClient({ url: tursoUrl, authToken: process.env.TURSO_AUTH_TOKEN });
  }
  const dbPath = resolve(process.cwd(), process.env.DATABASE_PATH ?? "./data/meetups.db");
  mkdirSync(dirname(dbPath), { recursive: true });
  return createClient({ url: `file:${dbPath}` });
}

declare global {
  // eslint-disable-next-line no-var
  var __meetupDb: Client | undefined;
}

export const db: Client =
  globalThis.__meetupDb ??
  (() => {
    const client = buildClient();
    if (process.env.NODE_ENV !== "production") globalThis.__meetupDb = client;
    return client;
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
