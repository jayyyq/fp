# InkMeet

A community directory of fountain pen meet-up groups. Inspired by [nifty.day](https://nifty.day/),
adapted for the global fountain pen community.

- **Browse** approved groups by region and format (in person / online / hybrid)
- **Submit** a group via a public form (held for review)
- **Moderate** pending submissions in a password-protected `/admin` page

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS
- SQLite via `better-sqlite3` (single file at `data/meetups.db`)

## Quick start

```bash
cp .env.example .env          # set ADMIN_PASSWORD and SESSION_SECRET
npm install
npm run seed                  # one-time: load a few starter groups
npm run dev                   # http://localhost:3000
```

The site has three routes:

| Route      | Purpose                                                    |
| ---------- | ---------------------------------------------------------- |
| `/`        | Public listings, with region + format filters              |
| `/submit`  | Public submission form (honeypot + time-trap spam defence) |
| `/admin`   | Password-protected moderation queue                        |

## Production

1. Pick a host that gives you a writable disk (Railway, Fly, a VPS). Vercel's
   serverless filesystem isn't persistent — for that, swap `better-sqlite3` for
   `@libsql/client` pointing at Turso (drop-in for SQLite).
2. Set `ADMIN_PASSWORD` and `SESSION_SECRET` (32+ random bytes) in env.
3. `npm run build && npm start`.

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

## Suggested next steps

These were intentionally left for after the first launch:

- **Email notifications** when a new submission arrives (Resend / SMTP)
- **iCal feed** of upcoming meetup dates per region
- **Map view** using a static tile provider
- **Tags** (beginner-friendly, calligraphy, vintage, Japanese pens)
- **Edit / suggest-correction** flow so listings stay current
- **RSS feed** of newly approved groups
- **Featured** flag for pinned groups
- **Real captcha** (hCaptcha) if the honeypot stops being enough
