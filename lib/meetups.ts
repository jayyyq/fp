import { db, type Meetup, type MeetupFormat, type MeetupStatus } from "./db";

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

export function listApprovedMeetups(filters: { region?: string; format?: MeetupFormat } = {}): Meetup[] {
  const clauses: string[] = ["status = 'approved'"];
  const params: Record<string, string> = {};

  if (filters.region && filters.region !== "all") {
    clauses.push("region = @region");
    params.region = filters.region;
  }
  if (filters.format && VALID_FORMATS.includes(filters.format)) {
    clauses.push("format = @format");
    params.format = filters.format;
  }

  const sql = `SELECT * FROM meetups WHERE ${clauses.join(" AND ")} ORDER BY region ASC, city ASC, name ASC`;
  return db.prepare(sql).all(params) as Meetup[];
}

export function listAllMeetups(status?: MeetupStatus): Meetup[] {
  if (status && VALID_STATUSES.includes(status)) {
    return db
      .prepare("SELECT * FROM meetups WHERE status = ? ORDER BY submitted_at DESC")
      .all(status) as Meetup[];
  }
  return db.prepare("SELECT * FROM meetups ORDER BY submitted_at DESC").all() as Meetup[];
}

export function getRegions(): string[] {
  const rows = db
    .prepare("SELECT DISTINCT region FROM meetups WHERE status = 'approved' ORDER BY region ASC")
    .all() as { region: string }[];
  return rows.map((r) => r.region);
}

export function countByStatus(): Record<MeetupStatus, number> {
  const rows = db
    .prepare("SELECT status, COUNT(*) as count FROM meetups GROUP BY status")
    .all() as { status: MeetupStatus; count: number }[];
  const result: Record<MeetupStatus, number> = { pending: 0, approved: 0, rejected: 0 };
  for (const row of rows) result[row.status] = row.count;
  return result;
}

export function createMeetup(input: NewMeetupInput): Meetup {
  const stmt = db.prepare(`
    INSERT INTO meetups (name, description, city, region, format, url, contact, status)
    VALUES (@name, @description, @city, @region, @format, @url, @contact, 'pending')
    RETURNING *
  `);
  return stmt.get({
    name: input.name,
    description: input.description,
    city: input.city,
    region: input.region,
    format: input.format,
    url: input.url,
    contact: input.contact ?? null,
  }) as Meetup;
}

export function updateStatus(id: number, status: MeetupStatus, notes?: string | null): Meetup | null {
  if (!VALID_STATUSES.includes(status)) return null;
  const stmt = db.prepare(`
    UPDATE meetups
    SET status = @status, reviewed_at = datetime('now'), notes = @notes
    WHERE id = @id
    RETURNING *
  `);
  return (stmt.get({ id, status, notes: notes ?? null }) as Meetup) ?? null;
}

export function deleteMeetup(id: number): boolean {
  const result = db.prepare("DELETE FROM meetups WHERE id = ?").run(id);
  return result.changes > 0;
}

export function validateInput(raw: Record<string, unknown>): { ok: true; value: NewMeetupInput } | { ok: false; error: string } {
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
