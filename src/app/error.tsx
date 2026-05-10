"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
      <p className="font-serif text-xs uppercase tracking-[0.3em] text-gold mb-4">
        Something stumbled
      </p>
      <h1 className="font-serif text-3xl text-navy-deep mb-3">
        We hit an unexpected error.
      </h1>
      <p className="text-ink-soft max-w-md mb-8 leading-relaxed">
        Your saved workbooks and reflections are safe. Try again, or head back
        home to start fresh.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          type="button"
          onClick={reset}
          className="rounded-md bg-navy-deep px-5 py-2.5 text-cream font-medium hover:bg-navy transition"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-md border border-rule px-5 py-2.5 text-ink-soft hover:bg-cream-soft transition"
        >
          Stillwater home
        </Link>
      </div>
      {error.digest && (
        <p className="mt-6 text-xs text-ink-soft/50 font-mono">
          ref: {error.digest}
        </p>
      )}
    </main>
  );
}
