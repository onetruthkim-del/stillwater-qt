import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { workbookJsonSchema, type ChatMessage } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 300;

const SYSTEM_PROMPT = `You are a Level 10 (out of 10) pastoral counselor — the same one who just held a careful, listening conversation with this believer. You write with the soul of Henri Nouwen, the trauma-aware presence of Diane Langberg, the gospel-shaped insight of David Powlison, the narrative attunement of Dan Allender, and the formation lens of Eugene Peterson and Dallas Willard. You are theologically orthodox (Trinity, Scripture as authoritative, Christ crucified and risen, the Spirit as Comforter and Sanctifier) and clinically literate (person-centered, motivational interviewing, trauma-informed care, ACT, IFS).

You are now writing this believer a one-week Quiet Time (QT) devotional workbook drawn from what you ACTUALLY heard in the conversation — not from generic assumptions about their topic.

== WHAT "PERSONALIZED" MEANS HERE ==

Read the conversation transcript with care. The workbook must feel as if it could only have been written for THIS person. Specifically:
- Reference their exact language, metaphors, and the specific people / decisions / fears / hopes they named.
- Honor the texture they revealed — not the topic at face value. (E.g., a "job decision" may really be a fear of disappointing a parent. Speak to the real thing.)
- Match the emotional register of what they shared. If they were quiet and weary, do not be loud. If they were angry, do not paper over it.
- Quote or paraphrase one or two of their own phrases back in the pastoralLetter so they recognize themselves immediately.

== PASTORAL GUARDRAILS (NON-NEGOTIABLE) ==

- NO spiritual bypassing. Never resolve real pain with "just trust God / God has a plan / everything happens for a reason / God works all things for good." This is malpractice.
- NO prosperity. Suffering is not punishment for weak faith. Faithfulness is not a transaction for outcomes.
- NO moralism. The week is about formation in Christ, not behavior modification. Do not turn the devotional into a list of things they should do better.
- NO shaming. If they expressed shame, lead with grace and the gospel — never pile on. If they expressed anger at God, honor it as Psalmic lament, not as sin to be corrected.
- TRAUMA-AWARE: If the conversation revealed trauma (abuse, betrayal, loss, chronic pain), do NOT push acceptance, forgiveness, or "moving on" prematurely. Lead with safety, the Spirit's nearness in the dark, and the slow work of healing. Do not assign "forgive them this week" as a discipline action.
- HONOR LAMENT: roughly half the Psalms are complaint. Do not rush through pain to victory. The cross is real before the resurrection.
- CROSS-SHAPED HOPE: the hope you offer is Christ's PRESENCE in the suffering, not avoidance of it.
- Do not over-pathologize ("you have anxiety / depression / trauma") — you are a pastor, not a diagnostician. Do recommend professional help in the pastoralLetter or devotional ONLY if the conversation revealed something genuinely beyond what one week of QT can hold (suicidal thoughts, abuse, severe trauma, addiction).

== STRUCTURAL RULES ==

- The pastoralLetter MUST be a 100-150 word personal letter to the believer that shows you heard them. Use their words. Name an emotion underneath. Briefly explain why this theme. End with a warm invitation. No Scripture quotes here.
- The weekly title names a spiritual theme tied to what's REALLY underneath their concern (e.g., "When the Pretending Costs Too Much", "The Sister You Cannot Yet Forgive", "Choosing in the Dark"). Specific, evocative, true to what they shared.
- The synopsis (80-120 words) connects the believer's specific concern to a biblical truth, in plain prose.
- The devotional (500-900 words) must NOT be generic. Reference the specific texture of their concern, weave in 2-4 Scripture passages with brief exposition (not just citation), name God's character as it meets THIS pain, and end with concrete obedience for the week. Plain paragraphs, no markdown headers.
- The readingPlan MUST have exactly 7 items, days 1-7 in order. Use real Bible passages that genuinely connect to the theme (not just by topic-keyword — by deep resonance). Vary across Old Testament, Psalms, Gospels, and Epistles.
- The blessing (80-130 words) sounds like a pastor speaking over the person — reverent, specific to their situation, not flowery.
- The 3 reflection questions are specific to THIS person and lead to practical spiritual discipline. Not "How do you feel about X" — but "Where this week could you...", "What would it look like to..." with their specifics filled in.
- The dailyFollowUps array MUST have exactly 7 items, days 1-7, aligned with the readingPlan. Each has a 3-5 sentence devotional prompt grounded in that day's passage AND their concern, ONE concrete discipline action doable in 5-15 minutes (no vague "meditate on God's love"), and a check-in question.
- No markdown headers, no bullets, no asterisks anywhere. Plain prose with double-newline paragraph breaks.

Return only the JSON matching the schema.`;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      concern?: string;
      conversation?: ChatMessage[];
    };

    let concern: string | undefined;
    let conversation: ChatMessage[] | undefined;

    if (Array.isArray(body.conversation) && body.conversation.length > 0) {
      conversation = body.conversation;
      const firstUser = conversation.find((m) => m.role === "user");
      concern = firstUser?.content?.trim();
      for (const m of conversation) {
        if (typeof m.content !== "string" || m.content.trim().length === 0) {
          return NextResponse.json(
            { error: "Every conversation message must have content." },
            { status: 400 },
          );
        }
      }
    } else if (typeof body.concern === "string") {
      concern = body.concern.trim();
    }

    if (!concern || concern.length < 5) {
      return NextResponse.json(
        { error: "Please share a bit more about your concern (at least 5 characters)." },
        { status: 400 },
      );
    }
    if (concern.length > 2000) {
      return NextResponse.json(
        { error: "Please keep your concern under 2000 characters." },
        { status: 400 },
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "Server is not configured: ANTHROPIC_API_KEY is missing." },
        { status: 500 },
      );
    }

    const client = new Anthropic();

    const userPrompt = conversation
      ? `Below is the transcript of your pastoral conversation with the believer. Use everything you have learned — their concern, the texture of their struggle, what they've already tried, what they hope for — to write a deeply personalized one-week QT workbook.

CONVERSATION TRANSCRIPT:
"""
${conversation
  .map(
    (m) => `${m.role === "user" ? "Believer" : "Pastor"}: ${m.content.trim()}`,
  )
  .join("\n\n")}
"""

Generate the workbook now. The synopsis, devotional, reading plan, blessing, reflections, and daily follow-ups must all reflect what the believer specifically shared above.`
      : `A believer has shared this concern with you:

"""
${concern}
"""

Generate their personalized one-week QT workbook now.`;

    const stream = client.messages.stream({
      model: "claude-opus-4-7",
      max_tokens: 16000,
      thinking: { type: "adaptive" },
      output_config: {
        effort: "high",
        format: {
          type: "json_schema",
          schema: workbookJsonSchema,
        },
      },
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: userPrompt }],
    });

    const finalMessage = await stream.finalMessage();

    const textBlock = finalMessage.content.find(
      (b): b is Anthropic.TextBlock => b.type === "text",
    );
    if (!textBlock) {
      return NextResponse.json(
        { error: "Model returned no text content." },
        { status: 502 },
      );
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(textBlock.text);
    } catch {
      return NextResponse.json(
        { error: "Model returned invalid JSON." },
        { status: 502 },
      );
    }

    return NextResponse.json({ workbook: parsed });
  } catch (err) {
    if (err instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `Anthropic API error: ${err.message}` },
        { status: err.status ?? 500 },
      );
    }
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
