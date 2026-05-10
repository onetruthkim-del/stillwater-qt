"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  addWorkbook,
  clearIntake,
  loadIntake,
  makeWorkbookId,
  saveIntake,
} from "@/lib/storage";
import type { ChatMessage, IntakeState, Workbook } from "@/lib/types";

export default function IntakePage() {
  const router = useRouter();
  const [state, setState] = useState<IntakeState | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [reply, setReply] = useState("");
  const [loadingReply, setLoadingReply] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchedFirstRef = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const existing = loadIntake();
    if (!existing || existing.messages.length === 0) {
      router.replace("/");
      return;
    }
    setState(existing);
    setHydrated(true);
  }, [router]);

  useEffect(() => {
    if (!hydrated || !state) return;
    if (fetchedFirstRef.current) return;
    const lastRole = state.messages[state.messages.length - 1]?.role;
    if (lastRole === "user" && !state.readyToGenerate) {
      fetchedFirstRef.current = true;
      void requestAssistantTurn(state.messages);
    }
  }, [hydrated, state]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [state, loadingReply]);

  async function requestAssistantTurn(messages: ChatMessage[]) {
    setLoadingReply(true);
    setError(null);
    try {
      const res = await fetch("/api/converse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      const next: IntakeState = {
        messages: [
          ...messages,
          { role: "assistant", content: data.message as string },
        ],
        readyToGenerate: Boolean(data.readyToGenerate),
      };
      setState(next);
      saveIntake(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoadingReply(false);
    }
  }

  async function sendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!state || reply.trim().length === 0 || loadingReply) return;
    const updatedMessages: ChatMessage[] = [
      ...state.messages,
      { role: "user", content: reply.trim() },
    ];
    const next: IntakeState = {
      messages: updatedMessages,
      readyToGenerate: false,
    };
    setState(next);
    saveIntake(next);
    setReply("");
    await requestAssistantTurn(updatedMessages);
  }

  async function generateWorkbook() {
    if (!state) return;
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversation: state.messages }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong generating your workbook.");
        return;
      }
      const concern = state.messages[0]?.content ?? "";
      const id = makeWorkbookId();
      const workbook: Workbook = {
        ...data.workbook,
        id,
        concern,
        generatedAt: new Date().toISOString(),
        conversation: state.messages,
      };
      addWorkbook(workbook);
      clearIntake();
      router.push(`/workbook/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setGenerating(false);
    }
  }

  if (!hydrated || !state) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <p className="text-ink-soft">Opening the conversation…</p>
      </main>
    );
  }

  const userTurns = state.messages.filter((m) => m.role === "user").length;
  const canGenerate = state.readyToGenerate || userTurns >= 2;

  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-2xl px-6 py-10 sm:py-14">
        <nav className="mb-8 flex items-center justify-between text-sm">
          <Link href="/" className="text-ink-soft hover:text-navy transition">
            ← Stillwater
          </Link>
          <span className="text-ink-soft font-serif">
            Listening &middot; Turn {userTurns}
          </span>
        </nav>

        <header className="mb-8 text-center">
          <p className="font-serif text-xs uppercase tracking-[0.3em] text-gold mb-3">
            Before we begin
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl text-navy-deep mb-3">
            A few questions
          </h1>
          <p className="text-sm text-ink-soft max-w-md mx-auto leading-relaxed">
            A pastor will ask a couple of gentle questions to understand what
            you&rsquo;re carrying. Then your week will be drafted.
          </p>
        </header>

        <div className="space-y-7 mb-10">
          {state.messages.map((m, i) => (
            <div key={i} className="flex flex-col">
              <p
                className={`font-serif text-xs uppercase tracking-[0.25em] mb-2 ${
                  m.role === "user" ? "text-ink-soft" : "text-gold"
                }`}
              >
                {m.role === "user" ? "You" : "Pastor"}
              </p>
              <div
                className={
                  m.role === "user"
                    ? "rounded-xl border border-rule bg-cream-soft px-5 py-4 text-ink leading-relaxed whitespace-pre-wrap"
                    : "rounded-xl bg-navy/[0.04] border border-navy/10 px-5 py-4 font-serif text-navy-deep leading-relaxed text-[1.05rem] whitespace-pre-wrap"
                }
              >
                {m.content}
              </div>
            </div>
          ))}

          {loadingReply && (
            <div className="flex flex-col">
              <p className="font-serif text-xs uppercase tracking-[0.25em] text-gold mb-2">
                Pastor
              </p>
              <div className="rounded-xl bg-navy/[0.04] border border-navy/10 px-5 py-4 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-navy/40 animate-pulse" />
                <span className="h-2 w-2 rounded-full bg-navy/40 animate-pulse [animation-delay:150ms]" />
                <span className="h-2 w-2 rounded-full bg-navy/40 animate-pulse [animation-delay:300ms]" />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {error && (
          <p className="mb-5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-4 py-2">
            {error}
          </p>
        )}

        {!state.readyToGenerate && !generating && (
          <form onSubmit={sendReply} className="space-y-3">
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder={
                loadingReply
                  ? "The pastor is still listening…"
                  : "Reply in a sentence or two…"
              }
              rows={4}
              disabled={loadingReply}
              maxLength={4000}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  void sendReply(e as unknown as React.FormEvent);
                }
              }}
              className="w-full rounded-xl border border-rule bg-cream-soft p-4 text-base text-ink leading-relaxed focus:outline-none focus:ring-2 focus:ring-navy/40 focus:border-navy transition placeholder:text-ink-soft/60 disabled:opacity-50"
            />
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
              <button
                type="submit"
                disabled={loadingReply || reply.trim().length === 0}
                className="rounded-md bg-navy-deep px-5 py-2.5 text-cream font-medium hover:bg-navy transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send reply
              </button>
              {canGenerate && (
                <button
                  type="button"
                  onClick={generateWorkbook}
                  className="text-sm text-ink-soft hover:text-navy underline underline-offset-4 transition"
                >
                  I&rsquo;m ready &mdash; draft my week now
                </button>
              )}
            </div>
            <p className="text-xs text-ink-soft/70">
              Tip: press &#8984;/Ctrl + Enter to send.
            </p>
          </form>
        )}

        {state.readyToGenerate && !generating && (
          <div className="rounded-xl border border-rule bg-cream-soft p-6 text-center">
            <p className="font-serif text-base text-navy-deep mb-4 leading-relaxed">
              Ready when you are. The week will take about a minute to draft.
            </p>
            <button
              type="button"
              onClick={generateWorkbook}
              className="w-full rounded-xl bg-navy-deep py-4 px-6 text-cream font-medium hover:bg-navy transition"
            >
              Generate this week&rsquo;s workbook
            </button>
          </div>
        )}

        {generating && (
          <div className="rounded-xl bg-navy py-6 px-6 text-center text-cream">
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="h-2 w-2 rounded-full bg-cream animate-pulse" />
              <span className="font-serif text-base">
                Drafting your week&hellip;
              </span>
            </div>
            <p className="text-xs text-cream/70">
              This usually takes 30&ndash;60 seconds.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
