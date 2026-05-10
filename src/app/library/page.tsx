"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { deleteWorkbook, listEntries } from "@/lib/storage";
import type { WorkbookEntry } from "@/lib/types";

export default function LibraryPage() {
  const [entries, setEntries] = useState<WorkbookEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setEntries(listEntries());
    setHydrated(true);
  }, []);

  function handleDelete(id: string, title: string) {
    if (
      !confirm(
        `Remove “${title}” and its reflections from your library? This can't be undone.`,
      )
    ) {
      return;
    }
    deleteWorkbook(id);
    setEntries(listEntries());
  }

  if (!hydrated) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <p className="text-ink-soft">Opening your library…</p>
      </main>
    );
  }

  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-4xl px-6 py-10 sm:py-14">
        <nav className="mb-10 flex items-center justify-between text-sm">
          <Link href="/" className="text-ink-soft hover:text-navy transition">
            ← Stillwater
          </Link>
          <Link
            href="/"
            className="rounded-md bg-navy px-4 py-2 text-sm font-medium text-cream hover:bg-navy-deep transition"
          >
            Begin a new week
          </Link>
        </nav>

        <header className="mb-12 text-center border-b border-rule pb-10">
          <p className="font-serif text-xs uppercase tracking-[0.3em] text-gold mb-3">
            Your Walk
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl text-navy-deep mb-3">
            Library
          </h1>
          <p className="text-ink-soft text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            Every week you&rsquo;ve walked through is kept here. Open one to
            keep journaling, or begin a new one.
          </p>
        </header>

        {entries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-rule bg-cream-soft px-8 py-16 text-center">
            <p className="font-serif text-xl text-navy-deep mb-3">
              Nothing here yet
            </p>
            <p className="text-ink-soft text-sm mb-8 max-w-sm mx-auto leading-relaxed">
              Your library will fill as you walk through different weeks.
              Begin one whenever you&rsquo;re ready.
            </p>
            <Link
              href="/"
              className="inline-flex rounded-xl bg-navy-deep px-6 py-3 text-cream font-medium hover:bg-navy transition"
            >
              Begin your first week
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {entries.map((entry) => {
              const wb = entry.workbook;
              const completedDays = Object.values(entry.progress.daily).filter(
                (d) => d.completed,
              ).length;
              const writtenReflections = entry.progress.reflections.filter(
                (r) => r.trim().length > 0,
              ).length;
              const writtenJournals = Object.values(entry.progress.daily).filter(
                (d) => (d.journal ?? "").trim().length > 0,
              ).length;
              const date = new Date(wb.generatedAt).toLocaleDateString(
                undefined,
                { month: "long", day: "numeric", year: "numeric" },
              );
              return (
                <article
                  key={wb.id}
                  className="group relative rounded-2xl border border-rule bg-cream-soft p-6 shadow-sm hover:shadow-md hover:border-navy/30 transition flex flex-col"
                >
                  <button
                    type="button"
                    onClick={() => handleDelete(wb.id, wb.weeklyTitle)}
                    aria-label={`Remove ${wb.weeklyTitle}`}
                    className="absolute top-3 right-3 h-7 w-7 rounded-full text-ink-soft/50 hover:text-red-700 hover:bg-red-50 transition flex items-center justify-center text-lg"
                  >
                    &times;
                  </button>

                  <p className="font-serif text-xs uppercase tracking-[0.25em] text-gold mb-3">
                    {date}
                  </p>

                  <h2 className="font-serif text-2xl text-navy-deep leading-snug mb-3">
                    {wb.weeklyTitle}
                  </h2>

                  <p className="text-sm italic text-ink-soft line-clamp-2 mb-5">
                    &ldquo;{wb.concern}&rdquo;
                  </p>

                  <div className="mt-auto pt-5 border-t border-rule">
                    <div className="flex items-center justify-between text-xs text-ink-soft mb-4">
                      <span>
                        <span className="font-semibold text-navy-deep">
                          {completedDays}
                        </span>{" "}
                        / 7 days
                      </span>
                      <span>
                        <span className="font-semibold text-navy-deep">
                          {writtenReflections}
                        </span>{" "}
                        / 3 reflections
                      </span>
                      <span>
                        <span className="font-semibold text-navy-deep">
                          {writtenJournals}
                        </span>{" "}
                        / 7 journals
                      </span>
                    </div>
                    <Link
                      href={`/workbook/${wb.id}`}
                      className="block w-full text-center rounded-md bg-navy py-2 text-sm font-medium text-cream hover:bg-navy-deep transition"
                    >
                      Open
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
