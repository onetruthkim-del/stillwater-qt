export type ReadingPlanDay = {
  day: number;
  passage: string;
  subtitle: string;
};

export type DailyFollowUp = {
  day: number;
  todaysReading: string;
  devotionalPrompt: string;
  disciplineAction: string;
  checkInQuestion: string;
};

export type Workbook = {
  id: string;
  concern: string;
  weeklyTitle: string;
  pastoralLetter: string;
  synopsis: string;
  devotional: string;
  readingPlan: ReadingPlanDay[];
  blessing: string;
  reflectionQuestions: string[];
  dailyFollowUps: DailyFollowUp[];
  generatedAt: string;
  conversation?: ChatMessage[];
};

export type WorkbookEntry = {
  workbook: Workbook;
  progress: Progress;
};

export type Library = {
  entries: Record<string, WorkbookEntry>;
  activeId: string | null;
};

export type DailyEntry = {
  journal: string;
  completed: boolean;
};

export type Progress = {
  reflections: string[];
  daily: Record<number, DailyEntry>;
};

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export type IntakeState = {
  messages: ChatMessage[];
  readyToGenerate: boolean;
};

export const converseTurnSchema = {
  type: "object",
  properties: {
    message: {
      type: "string",
      description:
        "The pastor's next message. 2-5 sentences. Reflect or affirm something specific they said BEFORE asking. ONE question per turn (or one reflection without a question — sometimes more pastoral). Use their exact language and metaphors. NEVER quote Scripture. NEVER give advice. NEVER use the banned phrases ('thank you for sharing', 'that must be hard', 'I'm so sorry to hear', 'I hear you'). When readyToGenerate is true, this is a brief warm summary of what was heard, in their language, ending with an offer to draft the week (no question).",
    },
    readyToGenerate: {
      type: "boolean",
      description:
        "True only after 4-6 exchanges when you have: (a) the texture of the struggle (not just topic), (b) at least one piece of history/context, (c) specific people/decisions/fears named, (d) a sense of what they hope for or fear about God. After 6 user replies, set true regardless. False otherwise.",
    },
  },
  required: ["message", "readyToGenerate"],
  additionalProperties: false,
} as const;

export const workbookJsonSchema = {
  type: "object",
  properties: {
    weeklyTitle: {
      type: "string",
      description:
        "A 2-5 word evocative title that names the spiritual theme tied to the user's concern. Examples: 'Peace in Uncertainty', 'Forgiveness When It Hurts', 'Trusting God with the Future'.",
    },
    pastoralLetter: {
      type: "string",
      description:
        "A 100-150 word letter from you (the pastor) to the believer, opening the workbook. Written in second person ('what I heard you say...', 'you named...'). Reflect back the SPECIFIC things they shared in the conversation — their words, the people they mentioned, the texture of their fear or hope. Do NOT generalize. Do NOT moralize. Name one or two emotions you sensed underneath. Briefly explain why you chose this week's theme based on what they said. End with a single warm sentence inviting them in. No Scripture quotes here — that comes later. This letter is the first thing they read; it must feel like only they could have received it.",
    },
    synopsis: {
      type: "string",
      description:
        "An 80-120 word overview of the week's theme that connects the user's specific concern to a biblical truth.",
    },
    devotional: {
      type: "string",
      description:
        "A 500-900 word pastoral devotional teaching written in the voice of a thoughtful pastor. Must be biblical, practical, and personally connect to the user's concern. Use plain paragraphs separated by double newlines. May use the implicit sections: what this struggle reveals, what Scripture says, how God forms us through this, what obedience looks like this week. Do not use markdown headers.",
    },
    readingPlan: {
      type: "array",
      description:
        "A 7-day Bible reading plan. MUST contain exactly 7 items, one per day, numbered 1 through 7. Each day includes a real Bible passage reference relevant to the theme.",
      items: {
        type: "object",
        properties: {
          day: { type: "integer" },
          passage: {
            type: "string",
            description:
              "A real Bible passage reference, e.g., 'Philippians 4:6-7' or 'Psalm 23'.",
          },
          subtitle: {
            type: "string",
            description:
              "A short 4-8 word subtitle describing the focus of this passage in relation to the theme.",
          },
        },
        required: ["day", "passage", "subtitle"],
        additionalProperties: false,
      },
    },
    blessing: {
      type: "string",
      description:
        "An 80-130 word closing prayer/blessing in a reverent but natural tone. Should feel like the closing blessing in a devotional book.",
    },
    reflectionQuestions: {
      type: "array",
      description:
        "Reflection questions tailored to the user's concern that lead to practical spiritual discipline. MUST contain exactly 3 questions. Avoid vague feelings questions.",
      items: { type: "string" },
    },
    dailyFollowUps: {
      type: "array",
      description:
        "Daily follow-up content. MUST contain exactly 7 items, one per day, numbered 1 through 7, aligned with the reading plan.",
      items: {
        type: "object",
        properties: {
          day: { type: "integer" },
          todaysReading: {
            type: "string",
            description: "Bible passage to read today (matches the reading plan).",
          },
          devotionalPrompt: {
            type: "string",
            description:
              "A 3-5 sentence devotional reflection prompt that meditates on today's passage in light of the user's concern.",
          },
          disciplineAction: {
            type: "string",
            description:
              "One concrete spiritual discipline action for today (e.g., 'Spend 5 minutes in silent prayer naming what you are afraid of'). Be specific.",
          },
          checkInQuestion: {
            type: "string",
            description:
              "One short check-in question for the user to journal on at the end of the day.",
          },
        },
        required: [
          "day",
          "todaysReading",
          "devotionalPrompt",
          "disciplineAction",
          "checkInQuestion",
        ],
        additionalProperties: false,
      },
    },
  },
  required: [
    "weeklyTitle",
    "pastoralLetter",
    "synopsis",
    "devotional",
    "readingPlan",
    "blessing",
    "reflectionQuestions",
    "dailyFollowUps",
  ],
  additionalProperties: false,
} as const;
