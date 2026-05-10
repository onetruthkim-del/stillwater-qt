"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getEntry, updateProgress } from "@/lib/storage";
import type { Progress, Workbook } from "@/lib/types";

export default function DailyPage({
  params,
}: {
  params: Promise<{ id: string; day: string }>;
}) {
  const { id, day: dayParam } = use(params);
  const dayNum = Number.parseInt(dayParam, 10);
  const [workbook, setWorkbook] = useState<Workbook | null>(null);
  const [progress, setProgress] = useState<Progress>({
    reflections: ["", "", ""],
    daily: {},
  });
  const [hydrated, setHydrated] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const entry = getEntry(id);
    if (!entry) {
      setNotFound(true);
      setHydrated(true);
      return;
    }
    setWorkbook(entry.workbook);
    setProgress(entry.progress);
    setHydrated(true);
  }, [id]);

  const day = useMemo(
    () => workbook?.dailyFollowUps.find((d) => d.day === dayNum),
    [workbook, dayNum],
  );
  const reading = useMemo(
    () => workbook?.readingPlan.find((d) => d.day === dayNum),
    [workbook, dayNum],
  );

  if (!hydrated) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <p className="text-ink-soft">Loading day {dayNum}…</p>
      </main>
    );
  }

  if (notFound || !workbook || !day || !reading || Number.isNaN(dayNum)) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <h1 className="font-serif text-2xl text-navy-deep mb-3">
          Day not found
        </h1>
        <p className="text-ink-soft mb-6">
          That day or workbook isn&rsquo;t available. Head back to your library.
        </p>
        <Link
          href="/library"
          className="rounded-md bg-navy px-4 py-2 text-cream text-sm"
        >
          Go to library
        </Link>
      </main>
    );
  }

  const entry = progress.daily[dayNum] ?? { journal: "", completed: false };

  function update(patch: Partial<typeof entry>) {
    const next: Progress = {
      ...progress,
      daily: {
        ...progress.daily,
        [dayNum]: { ...entry, ...patch },
      },
    };
    setProgress(next);
    updateProgress(id, next);
  }

  const prev = dayNum > 1 ? dayNum - 1 : null;
  const next = dayNum < 7 ? dayNum + 1 : null;

  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-3xl px-6 py-10 sm:py-14">
        <nav className="mb-8 flex items-center justify-between gap-3 text-sm">
          <Link
            href={`/workbook/${id}`}
            className="text-ink-soft hover:text-navy transition truncate min-w-0"
          >
            ← {workbook.weeklyTitle}
          </Link>
          <span className="text-ink-soft font-serif shrink-0">
            Day {dayNum} of 7
          </span>
        </nav>

        <header className="mb-10 border-b border-rule pb-8">
          <p className="font-serif text-xs uppercase tracking-[0.3em] text-gold mb-3">
            Day {dayNum}
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl text-navy-deep mb-2">
            {reading.passage}
          </h1>
          <p className="italic text-ink-soft">{reading.subtitle}</p>
        </header>

        <section className="mb-10">
          <h2 className="font-serif text-xl text-navy-deep mb-3">
            Today&rsquo;s Reading
          </h2>
          <p className="text-ink-soft leading-relaxed">{day.todaysReading}</p>
        </section>

        <section className="mb-10">
          <h2 className="font-serif text-xl text-navy-deep mb-3">
            A Word for Today
          </h2>
          <p className="text-ink leading-relaxed text-base">
            {day.devotionalPrompt}
          </p>
        </section>

        <section className="mb-10 rounded-2xl border border-rule bg-cream-soft p-6">
          <p className="font-serif text-xs uppercase tracking-[0.25em] text-gold mb-3">
            Today&rsquo;s Discipline
          </p>
          <p className="text-ink-soft leading-relaxed">
            {day.disciplineAction}
          </p>
        </section>

        <section className="mb-10">
          <h2 className="font-serif text-xl text-navy-deep mb-3">
            End-of-Day Check-In
          </h2>
          <p className="font-serif text-base text-navy-deep mb-4 italic">
            {day.checkInQuestion}
          </p>
          <textarea
            rows={7}
            value={entry.journal}
            onChange={(e) => update({ journal: e.target.value })}
            placeholder="Write a few sentences…"
            className="w-full bg-transparent lined-area pt-1 text-ink focus:outline-none resize-none border-0"
          />
        </section>

        <section className="mb-12 flex items-center justify-between rounded-xl border border-rule bg-cream-soft p-5">
          <label
            htmlFor="completed"
            className="flex items-center gap-3 text-ink-soft cursor-pointer"
          >
            <input
              id="completed"
              type="checkbox"
              checked={entry.completed}
              onChange={(e) => update({ completed: e.target.checked })}
              className="h-5 w-5 rounded border-rule text-navy-deep focus:ring-navy"
            />
            <span className="font-serif text-base">
              Mark Day {dayNum} as complete
            </span>
          </label>
        </section>

        <nav className="flex items-center justify-between border-t border-rule pt-8">
          {prev ? (
            <Link
              href={`/workbook/${id}/day/${prev}`}
              className="text-sm text-ink-soft hover:text-navy transition"
            >
              ← Day {prev}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={`/workbook/${id}/day/${next}`}
              className="rounded-md bg-navy px-4 py-2 text-sm font-medium text-cream hover:bg-navy-deep transition"
            >
              Day {next} →
            </Link>
          ) : (
            <Link
              href={`/workbook/${id}`}
              className="rounded-md bg-navy-deep px-4 py-2 text-sm font-medium text-cream hover:bg-navy transition"
            >
              Back to workbook
            </Link>
          )}
        </nav>
      </div>
    </main>
  );
}
