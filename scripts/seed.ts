import { db } from "../lib/db";

// Run migrations first so this script is safe to run against a blank database.
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

// Check if already seeded.
const { rows } = await db.execute({ sql: "SELECT COUNT(*) as count FROM meetups", args: [] });
const count = Number(rows[0]["count"]);
if (count > 0) {
  console.log(`Database already has ${count} entries — skipping seed.`);
  process.exit(0);
}

// Seed entries are placed in 'approved' status so the homepage isn't empty
// on first run. Verify and edit URLs/details before launching publicly.
const SEED = [
  {
    name: "r/fountainpens",
    description:
      "The largest online community for fountain pen enthusiasts. Daily discussion, photos, ink reviews, repair tips, and beginner Q&A.",
    city: "Online",
    region: "Online",
    format: "online",
    url: "https://www.reddit.com/r/fountainpens/",
  },
  {
    name: "Fountain Pen Network",
    description:
      "A long-running international forum for collectors and writers. Deep archives on vintage pens, restoration, and ink chemistry.",
    city: "Online",
    region: "Online",
    format: "online",
    url: "https://www.fountainpennetwork.com/",
  },
  {
    name: "Pelikan Hubs",
    description:
      "Annual worldwide fountain pen meetups hosted by Pelikan in dozens of cities each autumn. Locals organise local hubs; newcomers welcome.",
    city: "Worldwide",
    region: "Global",
    format: "in-person",
    url: "https://www.pelikan.com/",
  },
  {
    name: "London Pen Club",
    description:
      "Casual monthly meetups in central London for fountain pen users of all experience levels. Bring a pen, try someone else's, talk ink.",
    city: "London",
    region: "United Kingdom",
    format: "in-person",
    url: "https://www.meetup.com/",
  },
  {
    name: "Bay Area Pen Posse",
    description:
      "Bay Area gathering of fountain pen and stationery enthusiasts. Meets at cafés around San Francisco and the East Bay.",
    city: "San Francisco",
    region: "United States",
    format: "in-person",
    url: "https://www.meetup.com/",
  },
  {
    name: "DC Pen Crew",
    description:
      "Washington DC-area fountain pen meetup group. Casual writing sessions, pen swaps, ink sample trades.",
    city: "Washington DC",
    region: "United States",
    format: "in-person",
    url: "https://www.meetup.com/",
  },
  {
    name: "Tokyo Pen Friends",
    description:
      "Friendly Tokyo group for collectors of Japanese and Western fountain pens. Visits to specialty stationers and pen shops.",
    city: "Tokyo",
    region: "Japan",
    format: "in-person",
    url: "https://www.meetup.com/",
  },
  {
    name: "Sydney Pen Posse",
    description:
      "Sydney-based pen and ink lovers. Quarterly meetups, pen show coordination, and a welcoming attitude toward beginners.",
    city: "Sydney",
    region: "Australia",
    format: "in-person",
    url: "https://www.meetup.com/",
  },
];

for (const row of SEED) {
  await db.execute({
    sql: `INSERT INTO meetups (name, description, city, region, format, url, status, submitted_at, reviewed_at)
          VALUES (?, ?, ?, ?, ?, ?, 'approved', datetime('now'), datetime('now'))`,
    args: [row.name, row.description, row.city, row.region, row.format, row.url],
  });
}

console.log(`Seeded ${SEED.length} meetup groups.`);
