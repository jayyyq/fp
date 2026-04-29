# InkMeet

A community directory of fountain pen meet-up groups. Inspired by [nifty.day](https://nifty.day/),
adapted for the global fountain pen community.

- **Browse** approved groups by region and format (in person / online / hybrid)
- **Submit** a group via a public form (held for moderation)
- **Moderate** pending submissions in a password-protected `/admin` page

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS
- SQLite via `@libsql/client` — local file for dev, Turso for production

---

## Local development

```bash
cp .env.example .env       # leave TURSO_* blank; fill in ADMIN_PASSWORD + SESSION_SECRET
npm install
npm run seed               # creates data/meetups.db and loads 8 starter groups
npm run dev                # http://localhost:3000
```

---

## Deploy to Vercel + Turso

### 1. Create a Turso database (free tier)

Install the Turso CLI and log in:
```bash
brew install tursodatabase/tap/turso   # macOS; see turso.tech for other platforms
turso auth login
```

Create a database and grab the credentials:
```bash
turso db create inkmeet
turso db show inkmeet --url            # → TURSO_DATABASE_URL
turso db tokens create inkmeet         # → TURSO_AUTH_TOKEN
```

### 2. Apply the schema and seed starter data

```bash
TURSO_DATABASE_URL=libsql://... TURSO_AUTH_TOKEN=... npm run migrate
TURSO_DATABASE_URL=libsql://... TURSO_AUTH_TOKEN=... npm run seed   # optional
```

### 3. Deploy to Vercel

Push the branch to GitHub, then:

1. Go to [vercel.com](https://vercel.com) → **New Project** → import the repo
2. In **Environment Variables**, add:
   - `TURSO_DATABASE_URL` — your Turso URL
   - `TURSO_AUTH_TOKEN` — your Turso token
   - `ADMIN_PASSWORD` — a strong password for `/admin`
   - `SESSION_SECRET` — 32+ random characters (e.g. `openssl rand -hex 32`)
3. Click **Deploy**. Vercel auto-detects Next.js; no `vercel.json` needed.

---

## Routes

| Route     | Purpose                                                    |
| --------- | ---------------------------------------------------------- |
| `/`       | Public listings, with region + format filters              |
| `/submit` | Public submission form (honeypot + time-trap spam defence) |
| `/admin`  | Password-protected moderation queue                        |

## Schema

```sql
meetups(
  id, name, description, city, region,
  format        ('in-person' | 'online' | 'hybrid'),
  url, contact,
  status        ('pending' | 'approved' | 'rejected'),
  submitted_at, reviewed_at, notes
)
```

---

## Suggested next steps

- **Email notifications** when a new submission arrives (Resend / SMTP)
- **iCal / RSS feed** of upcoming meetup dates per region
- **Map view** using a static tile provider
- **Tags** (beginner-friendly, calligraphy, vintage, Japanese pens)
- **Edit / suggest-correction** flow so listings stay current
- **Featured** flag for pinned groups
- **hCaptcha** if the honeypot stops being enough
