import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
      <p className="font-serif text-xs uppercase tracking-[0.3em] text-gold mb-4">
        Lost the way
      </p>
      <h1 className="font-serif text-3xl text-navy-deep mb-3">
        That page isn&rsquo;t here.
      </h1>
      <p className="text-ink-soft max-w-md mb-8 leading-relaxed">
        The link may have changed, or you may have arrived earlier than the
        page is ready. Head back to your library or start a new week.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link
          href="/library"
          className="rounded-md bg-navy px-5 py-2.5 text-cream font-medium hover:bg-navy-deep transition"
        >
          Go to library
        </Link>
        <Link
          href="/"
          className="rounded-md border border-rule px-5 py-2.5 text-ink-soft hover:bg-cream-soft transition"
        >
          Stillwater home
        </Link>
      </div>
    </main>
  );
}
