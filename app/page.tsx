import Link from "next/link";
import { getRegions, listApprovedMeetups } from "@/lib/meetups";
import type { MeetupFormat } from "@/lib/db";

export const dynamic = "force-dynamic";

const FORMAT_LABELS: Record<MeetupFormat, string> = {
  "in-person": "In person",
  online: "Online",
  hybrid: "Hybrid",
};

const FORMAT_STYLES: Record<MeetupFormat, string> = {
  "in-person": "bg-ink-100 text-ink-800",
  online: "bg-paper-200 text-ink-800",
  hybrid: "bg-ink-50 text-ink-700 border border-ink-200",
};

interface SearchParams {
  region?: string;
  format?: string;
}

export default async function HomePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const region = params.region;
  const format = params.format as MeetupFormat | undefined;

  const meetups = listApprovedMeetups({ region, format });
  const regions = getRegions();

  const grouped = meetups.reduce<Record<string, typeof meetups>>((acc, m) => {
    (acc[m.region] ||= []).push(m);
    return acc;
  }, {});

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <section className="mb-12">
        <h1 className="font-serif text-4xl md:text-5xl text-ink-900 leading-tight">
          Fountain pen meet-ups,
          <br />
          <span className="text-ink-500">wherever ink flows.</span>
        </h1>
        <p className="mt-4 max-w-2xl text-ink-700 text-lg">
          A community-curated directory of fountain pen groups, posses, and online forums. Find
          your people, swap inks, compare nibs.{" "}
          <Link href="/submit" className="underline decoration-ink-300 hover:text-ink-900">
            Know a group that's missing? Add it.
          </Link>
        </p>
      </section>

      <FilterBar regions={regions} activeRegion={region} activeFormat={format} />

      {meetups.length === 0 ? (
        <p className="text-ink-700 mt-12 text-center">
          No meetups match those filters yet.{" "}
          <Link href="/submit" className="underline">
            Be the first to add one.
          </Link>
        </p>
      ) : (
        <div className="space-y-12 mt-10">
          {Object.entries(grouped).map(([regionName, items]) => (
            <section key={regionName}>
              <h2 className="font-serif text-2xl text-ink-900 mb-4 border-b border-ink-100 pb-2">
                {regionName}
                <span className="ml-2 text-sm font-sans text-ink-500">({items.length})</span>
              </h2>
              <ul className="grid gap-4 sm:grid-cols-2">
                {items.map((m) => (
                  <li
                    key={m.id}
                    className="rounded-lg border border-ink-100 bg-white p-5 hover:border-ink-300 transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-serif text-lg text-ink-900">
                        <a
                          href={m.url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="hover:underline"
                        >
                          {m.name}
                        </a>
                      </h3>
                      <span
                        className={`shrink-0 text-xs px-2 py-0.5 rounded-full ${FORMAT_STYLES[m.format]}`}
                      >
                        {FORMAT_LABELS[m.format]}
                      </span>
                    </div>
                    <p className="text-sm text-ink-700 mt-2 leading-relaxed">{m.description}</p>
                    <p className="text-xs text-ink-500 mt-3">{m.city}</p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterBar({
  regions,
  activeRegion,
  activeFormat,
}: {
  regions: string[];
  activeRegion?: string;
  activeFormat?: MeetupFormat;
}) {
  const formats: { value: MeetupFormat | "all"; label: string }[] = [
    { value: "all", label: "All" },
    { value: "in-person", label: "In person" },
    { value: "online", label: "Online" },
    { value: "hybrid", label: "Hybrid" },
  ];

  return (
    <form
      method="get"
      action="/"
      className="flex flex-wrap items-end gap-4 bg-white border border-ink-100 rounded-lg p-4"
    >
      <div className="flex flex-col">
        <label htmlFor="region" className="text-xs uppercase tracking-wide text-ink-500 mb-1">
          Region
        </label>
        <select
          id="region"
          name="region"
          defaultValue={activeRegion ?? "all"}
          className="rounded border border-ink-200 bg-paper-50 px-3 py-1.5 text-sm"
        >
          <option value="all">All regions</option>
          {regions.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col">
        <span className="text-xs uppercase tracking-wide text-ink-500 mb-1">Format</span>
        <div className="flex gap-1">
          {formats.map((f) => {
            const isActive = (activeFormat ?? "all") === f.value;
            return (
              <label
                key={f.value}
                className={`cursor-pointer text-sm px-3 py-1.5 rounded border ${
                  isActive
                    ? "bg-ink-900 text-paper-50 border-ink-900"
                    : "bg-paper-50 text-ink-700 border-ink-200 hover:border-ink-400"
                }`}
              >
                <input
                  type="radio"
                  name="format"
                  value={f.value === "all" ? "" : f.value}
                  defaultChecked={isActive}
                  className="sr-only"
                />
                {f.label}
              </label>
            );
          })}
        </div>
      </div>

      <button
        type="submit"
        className="rounded bg-ink-900 text-paper-50 px-4 py-1.5 text-sm hover:bg-ink-700"
      >
        Apply
      </button>
      {(activeRegion || activeFormat) && (
        <Link href="/" className="text-sm text-ink-500 underline">
          Clear
        </Link>
      )}
    </form>
  );
}
