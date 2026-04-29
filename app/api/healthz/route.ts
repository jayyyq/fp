import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { ensureSchema } from "@/lib/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureSchema();
    const result = await getDb().execute({ sql: "SELECT COUNT(*) as count FROM meetups", args: [] });
    const count = Number(result.rows[0]["count"]);
    return NextResponse.json({ ok: true, meetups: count });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
