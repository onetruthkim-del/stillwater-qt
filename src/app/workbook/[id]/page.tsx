"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getEntry, setActiveId, updateProgress } from "@/lib/storage";
import type { Progress, Workbook } from "@/lib/types";

export default function WorkbookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
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
    setActiveId(id);
    setHydrated(true);
  }, [id]);

  function updateReflection(i: number, value: string) {
    const next = { ...progress, reflections: [...progress.reflections] };
    next.reflections[i] = value;
    setProgress(next);
    updateProgress(id, next);
  }

  if (!hydrated) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <p className="text-ink-soft">Loading your workbook…</p>
      </main>
    );
  }

  if (notFound || !workbook) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <h1 className="font-serif text-2xl text-navy-deep mb-3">
          Workbook not found
        </h1>
        <p className="text-ink-soft mb-6">
          That week may have been removed. Head back to your library.
        </p>
        <div className="flex gap-3">
          <Link
            href="/library"
            className="rounded-md bg-navy px-4 py-2 text-cream text-sm"
          >
            Go to library
          </Link>
          <Link
            href="/"
            className="rounded-md border border-rule px-4 py-2 text-ink-soft text-sm"
          >
            Stillwater home
          </Link>
        </div>
      </main>
    );
  }

  const completedDays = Object.values(progress.daily).filter(
    (d) => d.completed,
  ).length;

  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-5xl px-6 py-10 sm:py-14">
        <nav className="mb-8 flex items-center justify-between gap-3 text-sm">
          <Link
            href="/library"
            className="text-ink-soft hover:text-navy transition shrink-0"
          >
            ← Library
          </Link>
          <span className="text-ink-soft font-serif text-right truncate min-w-0">
            Week of{" "}
            {new Date(workbook.generatedAt).toLocaleDateString(undefined, {
              month: "long",
              day: "numeric",
            })}
          </span>
        </nav>

        <header className="mb-14 text-center">
          <p className="eyebrow mb-4">Personalized · This Week</p>
          <h1 className="font-serif text-4xl sm:text-5xl text-navy-deep leading-tight tracking-tight mb-5">
            {workbook.weeklyTitle}
          </h1>
          <svg
            aria-hidden="true"
            viewBox="0 0 80 12"
            className="mx-auto h-3 w-20 text-gold/60 mb-5"
          >
            <path
              d="M2 6 Q 12 1, 22 6 T 42 6 T 62 6 T 78 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
          <p className="text-sm italic text-ink-soft max-w-xl mx-auto leading-relaxed">
            On your concern: &ldquo;{workbook.concern}&rdquo;
          </p>
        </header>

        {workbook.pastoralLetter && (
          <section className="mb-12 mx-auto max-w-2xl">
            <div className="rounded-2xl border border-navy/15 bg-navy/[0.04] px-7 py-8 sm:px-10 sm:py-10">
              <p className="eyebrow text-center mb-6">
                A Letter, Before We Begin
              </p>
              <div className="font-serif text-navy-deep leading-[1.7] text-[1.05rem] whitespace-pre-wrap">
                {workbook.pastoralLetter}
              </div>
              <div className="mt-7 flex items-center gap-3 text-ink-soft/70">
                <span className="h-px flex-1 bg-navy/15" />
                <span className="font-serif italic text-xs">
                  your pastor, for this week
                </span>
              </div>
            </div>
          </section>
        )}

        <div className="ornament" aria-hidden="true">
          <span>◆</span>
        </div>

        <div className="grid gap-12 lg:gap-14 lg:grid-cols-[1fr_20rem]">
          <article className="space-y-12 min-w-0 mx-auto w-full max-w-prose lg:max-w-none">
            <section>
              <p className="eyebrow text-center mb-4">Synopsis</p>
              <p className="prose-lead text-center">{workbook.synopsis}</p>
            </section>

            <div className="ornament" aria-hidden="true">
              <span>◆</span>
            </div>

            <section>
              <p className="eyebrow text-center mb-6">
                This Week&rsquo;s Teaching
              </p>
              <div className="prose-devotional max-w-prose mx-auto">
                {workbook.devotional.split(/\n{2,}/).map((para, i) => (
                  <p key={i}>{para.trim()}</p>
                ))}
              </div>
            </section>
          </article>

          <aside className="space-y-8 lg:sticky lg:top-8 lg:self-start">
            <div className="rounded-2xl border border-rule bg-cream-soft p-6 shadow-sm">
              <p className="eyebrow text-center mb-1">Reading Plan</p>
              <p className="text-center text-[10px] text-ink-soft/60 uppercase tracking-widest mb-5">
                Seven days · One passage at a time
              </p>
              <ol className="space-y-2.5">
                {workbook.readingPlan.map((d) => {
                  const done = progress.daily[d.day]?.completed;
                  return (
                    <li key={d.day}>
                      <Link
                        href={`/workbook/${id}/day/${d.day}`}
                        className="flex items-center gap-3 group rounded-lg px-2 py-1.5 -mx-2 hover:bg-cream transition"
                      >
                        <span
                          className={`shrink-0 inline-flex items-center justify-center h-7 w-7 rounded-full border font-serif text-xs transition ${
                            done
                              ? "bg-navy border-navy text-cream"
                              : "border-rule bg-cream text-ink-soft group-hover:border-navy/40 group-hover:text-navy-deep"
                          }`}
                        >
                          {d.day}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-serif text-sm text-navy-deep leading-tight">
                            {d.passage}
                          </p>
                          <p className="text-[11px] italic text-ink-soft leading-tight mt-0.5">
                            {d.subtitle}
                          </p>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ol>
              <div className="mt-5 pt-4 border-t border-rule">
                <div className="flex items-center justify-between text-xs text-ink-soft">
                  <span>Progress</span>
                  <span className="font-serif text-navy-deep">
                    {completedDays}/7
                  </span>
                </div>
                <div className="mt-2 h-1 rounded-full bg-rule overflow-hidden">
                  <div
                    className="h-full bg-navy transition-all duration-500"
                    style={{ width: `${(completedDays / 7) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-navy p-7 text-cream shadow-sm relative overflow-hidden">
              <svg
                aria-hidden="true"
                viewBox="0 0 80 12"
                className="absolute top-5 left-1/2 -translate-x-1/2 h-3 w-16 text-gold/70"
              >
                <path
                  d="M2 6 Q 12 1, 22 6 T 42 6 T 62 6 T 78 6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
              <p className="eyebrow text-center mt-3 mb-4 text-gold/90">
                Weekly Blessing
              </p>
              <p className="font-serif text-[1.0625rem] leading-[1.7] text-cream/95">
                {workbook.blessing}
              </p>
            </div>
          </aside>
        </div>

        <div className="ornament mt-16" aria-hidden="true">
          <span>◆</span>
        </div>

        <section className="mt-4">
          <p className="eyebrow text-center mb-3">Reflection</p>
          <h2 className="font-serif text-3xl text-navy-deep text-center mb-10">
            Three questions for this week
          </h2>
          <div className="space-y-12 max-w-2xl mx-auto">
            {workbook.reflectionQuestions.map((q, i) => (
              <div key={i}>
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="font-serif text-2xl text-gold/70 leading-none shrink-0">
                    {i + 1}.
                  </span>
                  <p className="font-serif text-[1.0625rem] text-navy-deep leading-relaxed">
                    {q}
                  </p>
                </div>
                <textarea
                  rows={5}
                  value={progress.reflections[i] ?? ""}
                  onChange={(e) => updateReflection(i, e.target.value)}
                  placeholder="Write your reflection here…"
                  className="w-full bg-transparent lined-area pt-1 text-ink leading-[1.85rem] focus:outline-none resize-none border-0 placeholder:text-ink-soft/40"
                />
              </div>
            ))}
          </div>
        </section>

        <div className="mt-16 flex flex-col items-center gap-3">
          <Link
            href={`/workbook/${id}/day/1`}
            className="inline-flex items-center justify-center rounded-xl bg-navy-deep px-10 py-4 text-cream font-medium hover:bg-navy transition shadow-sm"
          >
            Begin Day 1
          </Link>
          <p className="text-xs text-ink-soft/60 italic">
            Take your time. The week will hold.
          </p>
        </div>
      </div>
    </main>
  );
}
