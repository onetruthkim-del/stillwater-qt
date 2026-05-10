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

        <ol
          aria-label="Week progress"
          className="mb-10 flex items-center justify-center gap-2"
        >
          {workbook.readingPlan.map((d) => {
            const done = progress.daily[d.day]?.completed;
            const isCurrent = d.day === dayNum;
            return (
              <li key={d.day}>
                <Link
                  href={`/workbook/${id}/day/${d.day}`}
                  aria-label={`Day ${d.day}${done ? " (complete)" : ""}${isCurrent ? " (current)" : ""}`}
                  className="block py-2 px-1"
                >
                  <span
                    className={`block h-2.5 rounded-full transition-all ${
                      isCurrent
                        ? "w-8 bg-navy-deep"
                        : done
                          ? "w-2.5 bg-navy"
                          : "w-2.5 bg-rule hover:bg-ink-soft/40"
                    }`}
                  />
                </Link>
              </li>
            );
          })}
        </ol>

        <header className="mb-12 text-center">
          <p className="eyebrow mb-3">
            Day {dayNum} of 7
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl text-navy-deep mb-2 leading-tight">
            {reading.passage}
          </h1>
          <p className="italic text-ink-soft text-sm sm:text-base">
            {reading.subtitle}
          </p>
        </header>

        <section className="mb-12 mx-auto max-w-prose">
          <p className="eyebrow mb-3">Today&rsquo;s Reading</p>
          <p className="font-serif text-[1.0625rem] leading-[1.75] text-ink-soft">
            {day.todaysReading}
          </p>
        </section>

        <div className="ornament" aria-hidden="true">
          <span>◆</span>
        </div>

        <section className="mb-12 mx-auto max-w-prose">
          <p className="eyebrow mb-3">A Word for Today</p>
          <p className="font-serif text-[1.125rem] leading-[1.78] text-ink">
            {day.devotionalPrompt}
          </p>
        </section>

        <section className="mb-12 rounded-2xl border border-rule bg-cream-soft p-7 sm:p-8 mx-auto max-w-prose">
          <div className="flex items-baseline gap-3 mb-3">
            <span className="font-serif text-2xl text-gold/70 leading-none">
              ✦
            </span>
            <p className="eyebrow">Today&rsquo;s Discipline</p>
          </div>
          <p className="font-serif text-[1.0625rem] leading-[1.75] text-ink-soft">
            {day.disciplineAction}
          </p>
        </section>

        <div className="ornament" aria-hidden="true">
          <span>◆</span>
        </div>

        <section className="mb-12 mx-auto max-w-prose">
          <p className="eyebrow mb-3">End-of-Day Check-In</p>
          <p className="font-serif text-[1.125rem] text-navy-deep mb-5 italic leading-relaxed">
            {day.checkInQuestion}
          </p>
          <textarea
            rows={7}
            value={entry.journal}
            onChange={(e) => update({ journal: e.target.value })}
            placeholder="Write a few sentences…"
            className="w-full bg-transparent lined-area pt-1 text-ink focus:outline-none resize-none border-0 placeholder:text-ink-soft/40"
          />
        </section>

        <section className="mb-14 mx-auto max-w-prose">
          <label
            htmlFor="completed"
            className={`flex items-center justify-between gap-4 rounded-xl border p-5 cursor-pointer transition ${
              entry.completed
                ? "border-navy/40 bg-navy/[0.04]"
                : "border-rule bg-cream-soft hover:border-navy/20"
            }`}
          >
            <div className="flex items-center gap-3">
              <input
                id="completed"
                type="checkbox"
                checked={entry.completed}
                onChange={(e) => update({ completed: e.target.checked })}
                className="h-5 w-5 rounded border-rule text-navy-deep focus:ring-navy"
              />
              <span
                className={`font-serif text-base transition ${
                  entry.completed ? "text-navy-deep" : "text-ink-soft"
                }`}
              >
                {entry.completed
                  ? `Day ${dayNum} complete`
                  : `Mark Day ${dayNum} as complete`}
              </span>
            </div>
            {entry.completed && (
              <span className="font-serif text-xl text-gold/80">✓</span>
            )}
          </label>
        </section>

        <nav className="flex items-center justify-between border-t border-rule pt-8 mx-auto max-w-prose">
          {prev ? (
            <Link
              href={`/workbook/${id}/day/${prev}`}
              className="group flex items-center gap-2 text-sm text-ink-soft hover:text-navy transition"
            >
              <span aria-hidden="true">←</span>
              <span>Day {prev}</span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={`/workbook/${id}/day/${next}`}
              className="rounded-md bg-navy px-5 py-2.5 text-sm font-medium text-cream hover:bg-navy-deep transition shadow-sm"
            >
              Day {next} →
            </Link>
          ) : (
            <Link
              href={`/workbook/${id}`}
              className="rounded-md bg-navy-deep px-5 py-2.5 text-sm font-medium text-cream hover:bg-navy transition shadow-sm"
            >
              Back to workbook
            </Link>
          )}
        </nav>
      </div>
    </main>
  );
}
