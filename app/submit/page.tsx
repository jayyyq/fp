import Link from "next/link";
import { redirect } from "next/navigation";
import { createMeetup, validateInput } from "@/lib/meetups";

export const dynamic = "force-dynamic";

async function submitAction(formData: FormData) {
  "use server";

  // Honeypot: a hidden field bots fill in but humans don't see.
  if (formData.get("website")) {
    redirect("/submit?status=ok");
  }

  // Time-trap: form must be on screen for at least 2 seconds.
  const renderedAt = Number(formData.get("rendered_at"));
  if (!Number.isFinite(renderedAt) || Date.now() - renderedAt < 2000) {
    redirect("/submit?status=ok");
  }

  const result = validateInput(Object.fromEntries(formData));
  if (!result.ok) {
    const params = new URLSearchParams({ status: "error", message: result.error });
    redirect(`/submit?${params.toString()}`);
  }

  await createMeetup(result.value);
  redirect("/submit?status=ok");
}

export default async function SubmitPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; message?: string }>;
}) {
  const params = await searchParams;
  const status = params.status;

  if (status === "ok") {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <h1 className="font-serif text-3xl text-ink-900">Thanks for the submission!</h1>
        <p className="mt-4 text-ink-700">
          A moderator will review it shortly. Once approved, your group will appear on the homepage.
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <Link
            href="/"
            className="rounded-full bg-ink-900 px-5 py-2 text-paper-50 hover:bg-ink-700"
          >
            Back to listings
          </Link>
          <Link
            href="/submit"
            className="rounded-full border border-ink-200 px-5 py-2 hover:border-ink-400"
          >
            Submit another
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="font-serif text-3xl text-ink-900">Submit a meet-up group</h1>
      <p className="mt-3 text-ink-700">
        Tell us about a fountain pen group, posse, club, or online community. Submissions are
        reviewed before they appear on the site.
      </p>

      {status === "error" && params.message && (
        <div className="mt-6 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {params.message}
        </div>
      )}

      <form action={submitAction} className="mt-8 space-y-5">
        <input type="hidden" name="rendered_at" value={Date.now()} />

        {/* Honeypot — hidden from users, visible to bots */}
        <div aria-hidden="true" style={{ position: "absolute", left: "-9999px" }}>
          <label>
            Website
            <input type="text" name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        <Field
          label="Group name"
          name="name"
          required
          maxLength={120}
          placeholder="e.g. Bay Area Pen Posse"
        />

        <Field
          label="Description"
          name="description"
          required
          maxLength={600}
          textarea
          placeholder="What's the vibe? Who shows up? How often do you meet?"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="City" name="city" required maxLength={80} placeholder="e.g. London" />
          <Field
            label="Region or country"
            name="region"
            required
            maxLength={80}
            placeholder="e.g. United Kingdom"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink-900 mb-1">Format</label>
          <div className="flex gap-3 flex-wrap">
            {[
              { v: "in-person", l: "In person" },
              { v: "online", l: "Online" },
              { v: "hybrid", l: "Hybrid" },
            ].map((opt) => (
              <label
                key={opt.v}
                className="cursor-pointer rounded border border-ink-200 bg-paper-50 px-4 py-2 text-sm has-[:checked]:bg-ink-900 has-[:checked]:text-paper-50 has-[:checked]:border-ink-900"
              >
                <input type="radio" name="format" value={opt.v} required className="sr-only" />
                {opt.l}
              </label>
            ))}
          </div>
        </div>

        <Field
          label="Group URL"
          name="url"
          required
          type="url"
          placeholder="https://www.meetup.com/your-group"
          help="Where can someone learn more or RSVP? Meetup, Discord, Reddit, the group's own site, etc."
        />

        <Field
          label="Contact (optional)"
          name="contact"
          maxLength={200}
          placeholder="Email or handle, in case we need to follow up"
          help="We won't display this publicly."
        />

        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            className="rounded-full bg-ink-900 px-6 py-2.5 text-paper-50 hover:bg-ink-700"
          >
            Submit for review
          </button>
          <Link href="/" className="text-sm text-ink-700 hover:text-ink-900">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  maxLength,
  placeholder,
  textarea,
  help,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  maxLength?: number;
  placeholder?: string;
  textarea?: boolean;
  help?: string;
}) {
  const className =
    "w-full rounded border border-ink-200 bg-white px-3 py-2 text-sm focus:border-ink-500 focus:outline-none";

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-ink-900 mb-1">
        {label} {required && <span className="text-ink-400">*</span>}
      </label>
      {textarea ? (
        <textarea
          id={name}
          name={name}
          required={required}
          maxLength={maxLength}
          placeholder={placeholder}
          rows={4}
          className={className}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          required={required}
          maxLength={maxLength}
          placeholder={placeholder}
          className={className}
        />
      )}
      {help && <p className="text-xs text-ink-500 mt-1">{help}</p>}
    </div>
  );
}
