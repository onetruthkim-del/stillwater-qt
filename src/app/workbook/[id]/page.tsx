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
        <nav className="mb-8 flex items-center justify-between text-sm">
          <Link
            href="/library"
            className="text-ink-soft hover:text-navy transition"
          >
            ← Library
          </Link>
          <span className="text-ink-soft font-serif">
            Week of{" "}
            {new Date(workbook.generatedAt).toLocaleDateString(undefined, {
              month: "long",
              day: "numeric",
            })}
          </span>
        </nav>

        <header className="mb-12 text-center border-b border-rule pb-10">
          <p className="font-serif text-xs uppercase tracking-[0.3em] text-gold mb-3">
            Personalized
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl text-navy-deep mb-4">
            {workbook.weeklyTitle}
          </h1>
          <p className="text-sm italic text-ink-soft max-w-xl mx-auto">
            On your concern: &ldquo;{workbook.concern}&rdquo;
          </p>
        </header>

        {workbook.pastoralLetter && (
          <section className="mb-12 rounded-2xl border border-navy/15 bg-navy/[0.04] p-7 sm:p-9">
            <p className="font-serif text-xs uppercase tracking-[0.3em] text-gold mb-4">
              A Letter, Before We Begin
            </p>
            <div className="font-serif text-navy-deep leading-relaxed text-[1.05rem] whitespace-pre-wrap">
              {workbook.pastoralLetter}
            </div>
            <p className="mt-5 pt-4 border-t border-navy/15 text-xs text-ink-soft text-right italic">
              &mdash; your pastor, for this week
            </p>
          </section>
        )}

        <div className="grid gap-10 lg:grid-cols-[1fr_22rem]">
          <article className="space-y-10 min-w-0">
            <section>
              <h2 className="font-serif text-2xl text-navy-deep mb-3">
                Synopsis
              </h2>
              <p className="text-ink-soft leading-relaxed">
                {workbook.synopsis}
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-navy-deep mb-4">
                This Week&rsquo;s Teaching
              </h2>
              <div className="prose-devotional text-base">
                {workbook.devotional.split(/\n{2,}/).map((para, i) => (
                  <p key={i}>{para.trim()}</p>
                ))}
              </div>
            </section>
          </article>

          <aside className="space-y-8 lg:sticky lg:top-8 lg:self-start">
            <div className="rounded-2xl border border-rule bg-cream-soft p-6 shadow-sm">
              <p className="font-serif text-xs uppercase tracking-[0.25em] text-gold mb-4 text-center">
                Reading Plan
              </p>
              <ol className="space-y-3">
                {workbook.readingPlan.map((d) => {
                  const done = progress.daily[d.day]?.completed;
                  return (
                    <li key={d.day}>
                      <Link
                        href={`/workbook/${id}/day/${d.day}`}
                        className="flex gap-3 group"
                      >
                        <span
                          className={`mt-1 inline-block h-4 w-4 rounded-full border ${
                            done
                              ? "bg-navy border-navy"
                              : "border-rule bg-cream"
                          }`}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-serif text-sm text-navy-deep group-hover:text-navy transition">
                            <span className="font-semibold">Day {d.day}</span>
                            <span className="mx-2 text-rule">|</span>
                            {d.passage}
                          </p>
                          <p className="text-xs italic text-ink-soft">
                            {d.subtitle}
                          </p>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ol>
              <p className="mt-5 pt-4 border-t border-rule text-xs text-center text-ink-soft">
                {completedDays} of 7 days complete
              </p>
            </div>

            <div className="rounded-2xl bg-navy p-6 text-cream shadow-sm">
              <p className="font-serif text-xs uppercase tracking-[0.25em] text-gold mb-3 text-center">
                Weekly Blessing
              </p>
              <p className="font-serif text-base leading-relaxed text-cream/95">
                {workbook.blessing}
              </p>
            </div>
          </aside>
        </div>

        <section className="mt-16 border-t border-rule pt-12">
          <h2 className="font-serif text-3xl text-navy-deep text-center mb-10">
            Reflection
          </h2>
          <div className="space-y-10 max-w-3xl mx-auto">
            {workbook.reflectionQuestions.map((q, i) => (
              <div key={i}>
                <p className="font-serif text-base text-navy-deep text-center mb-4 leading-snug">
                  {q}
                </p>
                <textarea
                  rows={5}
                  value={progress.reflections[i] ?? ""}
                  onChange={(e) => updateReflection(i, e.target.value)}
                  placeholder="Write your reflection here…"
                  className="w-full bg-transparent lined-area pt-1 text-ink leading-[1.85rem] focus:outline-none resize-none border-0"
                />
              </div>
            ))}
          </div>
        </section>

        <div className="mt-16 text-center">
          <Link
            href={`/workbook/${id}/day/1`}
            className="inline-flex items-center justify-center rounded-xl bg-navy-deep px-8 py-4 text-cream font-medium hover:bg-navy transition"
          >
            Begin Day 1
          </Link>
        </div>
      </div>
    </main>
  );
}
