import type { Row } from "@libsql/client";
import { getDb, type Meetup, type MeetupFormat, type MeetupStatus } from "./db";
import { ensureSchema } from "./schema";

export interface NewMeetupInput {
  name: string;
  description: string;
  city: string;
  region: string;
  format: MeetupFormat;
  url: string;
  contact?: string | null;
}

const VALID_FORMATS: MeetupFormat[] = ["in-person", "online", "hybrid"];
const VALID_STATUSES: MeetupStatus[] = ["pending", "approved", "rejected"];

function toMeetup(row: Row): Meetup {
  return {
    id: row["id"] as number,
    name: row["name"] as string,
    description: row["description"] as string,
    city: row["city"] as string,
    region: row["region"] as string,
    format: row["format"] as MeetupFormat,
    url: row["url"] as string,
    contact: row["contact"] as string | null,
    status: row["status"] as MeetupStatus,
    submitted_at: row["submitted_at"] as string,
    reviewed_at: row["reviewed_at"] as string | null,
    notes: row["notes"] as string | null,
  };
}

export async function listApprovedMeetups(
  filters: { region?: string; format?: MeetupFormat } = {}
): Promise<Meetup[]> {
  await ensureSchema();
  const clauses: string[] = ["status = 'approved'"];
  const args: string[] = [];

  if (filters.region && filters.region !== "all") {
    clauses.push("region = ?");
    args.push(filters.region);
  }
  if (filters.format && VALID_FORMATS.includes(filters.format)) {
    clauses.push("format = ?");
    args.push(filters.format);
  }

  const sql = `SELECT * FROM meetups WHERE ${clauses.join(" AND ")} ORDER BY region ASC, city ASC, name ASC`;
  const result = await getDb().execute({ sql, args });
  return result.rows.map(toMeetup);
}

export async function listAllMeetups(status?: MeetupStatus): Promise<Meetup[]> {
  await ensureSchema();
  if (status && VALID_STATUSES.includes(status)) {
    const result = await getDb().execute({
      sql: "SELECT * FROM meetups WHERE status = ? ORDER BY submitted_at DESC",
      args: [status],
    });
    return result.rows.map(toMeetup);
  }
  const result = await getDb().execute({
    sql: "SELECT * FROM meetups ORDER BY submitted_at DESC",
    args: [],
  });
  return result.rows.map(toMeetup);
}

export async function getRegions(): Promise<string[]> {
  await ensureSchema();
  const result = await getDb().execute({
    sql: "SELECT DISTINCT region FROM meetups WHERE status = 'approved' ORDER BY region ASC",
    args: [],
  });
  return result.rows.map((r) => r["region"] as string);
}

export async function countByStatus(): Promise<Record<MeetupStatus, number>> {
  await ensureSchema();
  const result = await getDb().execute({
    sql: "SELECT status, COUNT(*) as count FROM meetups GROUP BY status",
    args: [],
  });
  const counts: Record<MeetupStatus, number> = { pending: 0, approved: 0, rejected: 0 };
  for (const row of result.rows) {
    const s = row["status"] as MeetupStatus;
    if (VALID_STATUSES.includes(s)) counts[s] = Number(row["count"]);
  }
  return counts;
}

export async function createMeetup(input: NewMeetupInput): Promise<Meetup> {
  await ensureSchema();
  const result = await getDb().execute({
    sql: `INSERT INTO meetups (name, description, city, region, format, url, contact, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
          RETURNING *`,
    args: [input.name, input.description, input.city, input.region, input.format, input.url, input.contact ?? null],
  });
  return toMeetup(result.rows[0]);
}

export async function updateStatus(
  id: number,
  status: MeetupStatus,
  notes?: string | null
): Promise<Meetup | null> {
  if (!VALID_STATUSES.includes(status)) return null;
  await ensureSchema();
  const result = await getDb().execute({
    sql: `UPDATE meetups SET status = ?, reviewed_at = datetime('now'), notes = ? WHERE id = ? RETURNING *`,
    args: [status, notes ?? null, id],
  });
  return result.rows.length > 0 ? toMeetup(result.rows[0]) : null;
}

export async function deleteMeetup(id: number): Promise<boolean> {
  await ensureSchema();
  const result = await getDb().execute({ sql: "DELETE FROM meetups WHERE id = ?", args: [id] });
  return result.rowsAffected > 0;
}

export function validateInput(
  raw: Record<string, unknown>
): { ok: true; value: NewMeetupInput } | { ok: false; error: string } {
  const get = (key: string) => (typeof raw[key] === "string" ? (raw[key] as string).trim() : "");

  const name = get("name");
  const description = get("description");
  const city = get("city");
  const region = get("region");
  const format = get("format") as MeetupFormat;
  const url = get("url");
  const contact = get("contact");

  if (!name || name.length > 120) return { ok: false, error: "Group name is required (max 120 chars)." };
  if (!description || description.length > 600) return { ok: false, error: "Description is required (max 600 chars)." };
  if (!city || city.length > 80) return { ok: false, error: "City is required (max 80 chars)." };
  if (!region || region.length > 80) return { ok: false, error: "Region/country is required (max 80 chars)." };
  if (!VALID_FORMATS.includes(format)) return { ok: false, error: "Format must be in-person, online, or hybrid." };

  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) throw new Error();
  } catch {
    return { ok: false, error: "URL must be a valid http(s) link." };
  }

  if (contact && contact.length > 200) return { ok: false, error: "Contact too long." };

  return {
    ok: true,
    value: { name, description, city, region, format, url, contact: contact || null },
  };
}
