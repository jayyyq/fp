import Link from "next/link";
import { redirect } from "next/navigation";
import { isAuthenticated, createSession, destroySession, verifyPassword } from "@/lib/auth";
import { countByStatus, deleteMeetup, listAllMeetups, updateStatus } from "@/lib/meetups";
import type { MeetupStatus } from "@/lib/db";

export const dynamic = "force-dynamic";

async function loginAction(formData: FormData) {
  "use server";
  const password = String(formData.get("password") ?? "");
  if (!verifyPassword(password)) {
    redirect("/admin?error=1");
  }
  await createSession();
  redirect("/admin");
}

async function logoutAction() {
  "use server";
  await destroySession();
  redirect("/admin");
}

async function moderationAction(formData: FormData) {
  "use server";
  if (!(await isAuthenticated())) redirect("/admin");

  const id = Number(formData.get("id"));
  const action = String(formData.get("action"));
  const notes = formData.get("notes") ? String(formData.get("notes")) : null;
  const filter = String(formData.get("filter") ?? "pending");

  if (!Number.isFinite(id)) redirect(`/admin?filter=${filter}`);

  if (action === "approve") updateStatus(id, "approved", notes);
  else if (action === "reject") updateStatus(id, "rejected", notes);
  else if (action === "pending") updateStatus(id, "pending", notes);
  else if (action === "delete") deleteMeetup(id);

  redirect(`/admin?filter=${filter}`);
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; filter?: string }>;
}) {
  const params = await searchParams;
  const authed = await isAuthenticated();

  if (!authed) {
    return <LoginForm hasError={params.error === "1"} />;
  }

  const filter = (params.filter as MeetupStatus | "all" | undefined) ?? "pending";
  const counts = countByStatus();
  const meetups =
    filter === "all" ? listAllMeetups() : listAllMeetups(filter);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-3xl text-ink-900">Moderation</h1>
        <form action={logoutAction}>
          <button className="text-sm text-ink-700 hover:text-ink-900 underline">Sign out</button>
        </form>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {(
          [
            { v: "pending" as const, l: `Pending (${counts.pending})` },
            { v: "approved" as const, l: `Approved (${counts.approved})` },
            { v: "rejected" as const, l: `Rejected (${counts.rejected})` },
            { v: "all" as const, l: "All" },
          ]
        ).map((tab) => {
          const isActive = filter === tab.v;
          return (
            <Link
              key={tab.v}
              href={`/admin?filter=${tab.v}`}
              className={`text-sm px-3 py-1.5 rounded border ${
                isActive
                  ? "bg-ink-900 text-paper-50 border-ink-900"
                  : "bg-white text-ink-700 border-ink-200 hover:border-ink-400"
              }`}
            >
              {tab.l}
            </Link>
          );
        })}
      </div>

      {meetups.length === 0 ? (
        <p className="text-ink-700 text-center py-12">No entries in this view.</p>
      ) : (
        <ul className="space-y-4">
          {meetups.map((m) => (
            <li key={m.id} className="rounded-lg border border-ink-100 bg-white p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-serif text-xl text-ink-900">{m.name}</h2>
                    <StatusBadge status={m.status} />
                    <span className="text-xs px-2 py-0.5 rounded-full bg-paper-200 text-ink-800">
                      {m.format}
                    </span>
                  </div>
                  <p className="text-sm text-ink-500 mt-1">
                    {m.city}, {m.region} · submitted {new Date(m.submitted_at).toLocaleString()}
                  </p>
                  <p className="mt-3 text-sm text-ink-700 leading-relaxed">{m.description}</p>
                  <p className="mt-2 text-sm">
                    <a
                      href={m.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-ink-600 underline break-all"
                    >
                      {m.url}
                    </a>
                  </p>
                  {m.contact && (
                    <p className="text-xs text-ink-500 mt-1">Contact: {m.contact}</p>
                  )}
                  {m.notes && (
                    <p className="text-xs text-ink-500 mt-2 italic">Notes: {m.notes}</p>
                  )}
                </div>
              </div>

              <form action={moderationAction} className="mt-4 flex flex-wrap items-center gap-2">
                <input type="hidden" name="id" value={m.id} />
                <input type="hidden" name="filter" value={filter} />
                <input
                  name="notes"
                  placeholder="Optional moderator notes"
                  defaultValue={m.notes ?? ""}
                  className="flex-1 min-w-[200px] rounded border border-ink-200 bg-paper-50 px-3 py-1.5 text-sm"
                />
                {m.status !== "approved" && (
                  <button
                    name="action"
                    value="approve"
                    className="rounded bg-emerald-600 text-white px-3 py-1.5 text-sm hover:bg-emerald-700"
                  >
                    Approve
                  </button>
                )}
                {m.status !== "rejected" && (
                  <button
                    name="action"
                    value="reject"
                    className="rounded bg-amber-600 text-white px-3 py-1.5 text-sm hover:bg-amber-700"
                  >
                    Reject
                  </button>
                )}
                {m.status !== "pending" && (
                  <button
                    name="action"
                    value="pending"
                    className="rounded border border-ink-200 px-3 py-1.5 text-sm hover:border-ink-400"
                  >
                    Reset to pending
                  </button>
                )}
                <button
                  name="action"
                  value="delete"
                  formNoValidate
                  className="rounded border border-red-200 text-red-700 px-3 py-1.5 text-sm hover:bg-red-50"
                >
                  Delete
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: MeetupStatus }) {
  const styles: Record<MeetupStatus, string> = {
    pending: "bg-amber-100 text-amber-800",
    approved: "bg-emerald-100 text-emerald-800",
    rejected: "bg-rose-100 text-rose-800",
  };
  return <span className={`text-xs px-2 py-0.5 rounded-full ${styles[status]}`}>{status}</span>;
}

function LoginForm({ hasError }: { hasError: boolean }) {
  return (
    <div className="max-w-sm mx-auto px-6 py-20">
      <h1 className="font-serif text-2xl text-ink-900">Admin sign-in</h1>
      <p className="mt-2 text-sm text-ink-700">
        Enter the admin password to moderate submissions.
      </p>
      {hasError && (
        <div className="mt-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          Wrong password. Try again.
        </div>
      )}
      <form action={loginAction} className="mt-6 space-y-3">
        <input
          name="password"
          type="password"
          required
          autoFocus
          autoComplete="current-password"
          className="w-full rounded border border-ink-200 bg-white px-3 py-2 text-sm"
          placeholder="Password"
        />
        <button
          type="submit"
          className="w-full rounded-full bg-ink-900 px-4 py-2 text-paper-50 hover:bg-ink-700"
        >
          Sign in
        </button>
      </form>
    </div>
  );
}
