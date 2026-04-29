import { db } from "../lib/db";

// Seed entries are placed in 'approved' status so the homepage isn't empty
// on first run. Verify and edit URLs/details before launching publicly.
const SEED = [
  {
    name: "r/fountainpens",
    description:
      "The largest online community for fountain pen enthusiasts. Daily discussion, photos, ink reviews, repair tips, and beginner Q&A.",
    city: "Online",
    region: "Online",
    format: "online" as const,
    url: "https://www.reddit.com/r/fountainpens/",
  },
  {
    name: "Fountain Pen Network",
    description:
      "A long-running international forum for collectors and writers. Deep archives on vintage pens, restoration, and ink chemistry.",
    city: "Online",
    region: "Online",
    format: "online" as const,
    url: "https://www.fountainpennetwork.com/",
  },
  {
    name: "Pelikan Hubs",
    description:
      "Annual worldwide fountain pen meetups hosted by Pelikan in dozens of cities each autumn. Locals organise local hubs; newcomers welcome.",
    city: "Worldwide",
    region: "Global",
    format: "in-person" as const,
    url: "https://www.pelikan.com/",
  },
  {
    name: "London Pen Club",
    description:
      "Casual monthly meetups in central London for fountain pen users of all experience levels. Bring a pen, try someone else's, talk ink.",
    city: "London",
    region: "United Kingdom",
    format: "in-person" as const,
    url: "https://www.meetup.com/",
  },
  {
    name: "Bay Area Pen Posse",
    description:
      "Bay Area gathering of fountain pen and stationery enthusiasts. Meets at cafés around San Francisco and the East Bay.",
    city: "San Francisco",
    region: "United States",
    format: "in-person" as const,
    url: "https://www.meetup.com/",
  },
  {
    name: "DC Pen Crew",
    description:
      "Washington DC-area fountain pen meetup group. Casual writing sessions, pen swaps, ink sample trades.",
    city: "Washington DC",
    region: "United States",
    format: "in-person" as const,
    url: "https://www.meetup.com/",
  },
  {
    name: "Tokyo Pen Friends",
    description:
      "Friendly Tokyo group for collectors of Japanese and Western fountain pens. Visits to specialty stationers and pen shops.",
    city: "Tokyo",
    region: "Japan",
    format: "in-person" as const,
    url: "https://www.meetup.com/",
  },
  {
    name: "Sydney Pen Posse",
    description:
      "Sydney-based pen and ink lovers. Quarterly meetups, pen show coordination, and a welcoming attitude toward beginners.",
    city: "Sydney",
    region: "Australia",
    format: "in-person" as const,
    url: "https://www.meetup.com/",
  },
];

const insert = db.prepare(`
  INSERT INTO meetups (name, description, city, region, format, url, status, submitted_at, reviewed_at)
  VALUES (@name, @description, @city, @region, @format, @url, 'approved', datetime('now'), datetime('now'))
`);

const existing = db.prepare("SELECT COUNT(*) as count FROM meetups").get() as { count: number };
if (existing.count > 0) {
  console.log(`Database already has ${existing.count} entries — skipping seed.`);
  process.exit(0);
}

const tx = db.transaction((rows: typeof SEED) => {
  for (const row of rows) insert.run(row);
});

tx(SEED);
console.log(`Seeded ${SEED.length} meetup groups.`);
