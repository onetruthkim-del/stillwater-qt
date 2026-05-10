"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  clearIntake,
  listEntries,
  loadIntake,
  saveIntake,
} from "@/lib/storage";
import type { IntakeState, WorkbookEntry } from "@/lib/types";

const SAMPLE_CONCERNS = [
  "I'm anxious about a job decision I have to make this month.",
  "I'm holding onto resentment toward a family member and don't know how to forgive.",
  "I feel spiritually dry. I show up to read my Bible and feel nothing.",
  "I'm afraid of what's coming for our family — health, finances, the kids.",
];

export default function HomePage() {
  const router = useRouter();
  const [concern, setConcern] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [recent, setRecent] = useState<WorkbookEntry | null>(null);
  const [libraryCount, setLibraryCount] = useState(0);
  const [existingIntake, setExistingIntake] = useState<IntakeState | null>(
    null,
  );

  useEffect(() => {
    const all = listEntries();
    setRecent(all[0] ?? null);
    setLibraryCount(all.length);
    setExistingIntake(loadIntake());
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (concern.trim().length < 5) {
      setError("Please share a bit more about your concern.");
      return;
    }
    const initial: IntakeState = {
      messages: [{ role: "user", content: concern.trim() }],
      readyToGenerate: false,
    };
    saveIntake(initial);
    router.push("/intake");
  }

  function discardIntake() {
    if (confirm("Discard the current conversation and start fresh?")) {
      clearIntake();
      setExistingIntake(null);
    }
  }

  return (
    <main className="flex-1 flex flex-col">
      <div className="mx-auto w-full max-w-2xl px-6 py-12 sm:py-20">
        <header className="mb-12 text-center">
          <p className="font-serif text-sm uppercase tracking-[0.3em] text-gold mb-4">
            Stillwater
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl text-navy-deep mb-4">
            A QT Workbook,
            <br />
            Made for This Week
          </h1>
          <p className="text-ink-soft text-base sm:text-lg leading-relaxed max-w-lg mx-auto">
            Share what is weighing on you. Stillwater will draft a one-week
            devotional plan rooted in Scripture — a synopsis, daily readings, a
            blessing, and reflections to walk through.
          </p>
        </header>

        {libraryCount > 0 && (
          <div className="mb-8 flex items-center justify-between rounded-xl border border-rule bg-cream-soft px-5 py-4">
            <div className="min-w-0">
              <p className="font-serif text-xs uppercase tracking-[0.25em] text-gold mb-1">
                Your Library
              </p>
              <p className="text-sm text-ink-soft">
                {libraryCount} {libraryCount === 1 ? "week" : "weeks"} saved
                {recent && (
                  <>
                    {" · most recent: "}
                    <span className="font-serif text-navy-deep italic">
                      {recent.workbook.weeklyTitle}
                    </span>
                  </>
                )}
              </p>
            </div>
            <Link
              href="/library"
              className="ml-4 shrink-0 rounded-md border border-rule px-3 py-1.5 text-xs font-medium text-navy-deep hover:bg-navy hover:text-cream hover:border-navy transition"
            >
              View all
            </Link>
          </div>
        )}

        {recent && (
          <div className="mb-8 rounded-xl border border-rule bg-cream-soft p-5 shadow-sm">
            <p className="font-serif text-sm uppercase tracking-widest text-gold mb-2">
              Continue your most recent week
            </p>
            <h2 className="font-serif text-2xl text-navy-deep mb-2">
              {recent.workbook.weeklyTitle}
            </h2>
            <p className="text-sm text-ink-soft mb-4 line-clamp-2">
              {recent.workbook.synopsis}
            </p>
            <div className="flex gap-3">
              <Link
                href={`/workbook/${recent.workbook.id}`}
                className="inline-flex items-center justify-center rounded-md bg-navy px-4 py-2 text-sm font-medium text-cream hover:bg-navy-deep transition"
              >
                Continue this week
              </Link>
              <Link
                href="/library"
                className="inline-flex items-center justify-center rounded-md border border-rule px-4 py-2 text-sm font-medium text-ink-soft hover:bg-cream-soft transition"
              >
                Browse library
              </Link>
            </div>
          </div>
        )}

        {existingIntake && existingIntake.messages.length > 0 && (
          <div className="mb-8 rounded-xl border border-navy/20 bg-navy/[0.04] p-5 shadow-sm">
            <p className="font-serif text-sm uppercase tracking-widest text-gold mb-2">
              You have a conversation in progress
            </p>
            <p className="text-sm text-ink-soft italic mb-4 line-clamp-2">
              &ldquo;{existingIntake.messages[0].content}&rdquo;
            </p>
            <div className="flex gap-3">
              <Link
                href="/intake"
                className="inline-flex items-center justify-center rounded-md bg-navy px-4 py-2 text-sm font-medium text-cream hover:bg-navy-deep transition"
              >
                Continue conversation
              </Link>
              <button
                type="button"
                onClick={discardIntake}
                className="inline-flex items-center justify-center rounded-md border border-rule px-4 py-2 text-sm font-medium text-ink-soft hover:bg-cream-soft transition"
              >
                Discard
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <label
            htmlFor="concern"
            className="block font-serif text-xl text-navy-deep"
          >
            What is on your heart?
          </label>
          <textarea
            id="concern"
            name="concern"
            rows={6}
            value={concern}
            onChange={(e) => setConcern(e.target.value)}
            placeholder="Write it as you would tell a trusted pastor — a few sentences is enough."
            maxLength={2000}
            className="w-full rounded-xl border border-rule bg-cream-soft p-5 text-base text-ink leading-relaxed focus:outline-none focus:ring-2 focus:ring-navy/40 focus:border-navy transition placeholder:text-ink-soft/60"
          />

          <div className="flex flex-wrap gap-2">
            {SAMPLE_CONCERNS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setConcern(s)}
                className="text-xs px-3 py-1.5 rounded-full border border-rule text-ink-soft hover:bg-cream-soft hover:border-navy/30 transition"
              >
                {s.length > 50 ? s.slice(0, 50) + "…" : s}
              </button>
            ))}
          </div>

          {error && (
            <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-4 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={concern.trim().length < 5}
            className="w-full rounded-xl bg-navy-deep py-4 px-6 text-cream font-medium hover:bg-navy transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Begin a conversation
          </button>
          <p className="text-xs text-ink-soft/70 text-center leading-relaxed">
            A pastor will gently ask 4&ndash;6 follow-up questions to understand
            you, then draft a week tailored to what you share.
          </p>
        </form>
      </div>
    </main>
  );
}
