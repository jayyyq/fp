import { db } from "../lib/db";

await db.executeMultiple(`
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

console.log("Migrations applied.");
