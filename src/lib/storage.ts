"use client";

import type {
  IntakeState,
  Library,
  Progress,
  Workbook,
  WorkbookEntry,
} from "./types";

const LIBRARY_KEY = "qt-library";
const INTAKE_KEY = "qt-intake";

const LEGACY_WORKBOOK_KEY = "qt-workbook";
const LEGACY_PROGRESS_KEY = "qt-progress";
const LEGACY_MIGRATED_FLAG = "qt-library-migrated-v1";

const EMPTY_LIBRARY: Library = { entries: {}, activeId: null };
const EMPTY_PROGRESS: Progress = { reflections: ["", "", ""], daily: {} };

function makeId(): string {
  if (
    typeof globalThis.crypto !== "undefined" &&
    typeof globalThis.crypto.randomUUID === "function"
  ) {
    return globalThis.crypto.randomUUID();
  }
  return `wb_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function readJSON<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJSON(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

function normalizeProgress(p: Progress | null | undefined): Progress {
  if (!p) return { ...EMPTY_PROGRESS, reflections: ["", "", ""], daily: {} };
  const reflections =
    Array.isArray(p.reflections) && p.reflections.length === 3
      ? p.reflections
      : ["", "", ""];
  const daily = p.daily && typeof p.daily === "object" ? p.daily : {};
  return { reflections, daily };
}

function migrateLegacyOnce() {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(LEGACY_MIGRATED_FLAG) === "1") return;

  const legacyWb = readJSON<Workbook>(LEGACY_WORKBOOK_KEY);
  if (legacyWb) {
    const legacyProg = readJSON<Progress>(LEGACY_PROGRESS_KEY);
    const id = legacyWb.id ?? makeId();
    const wb: Workbook = { ...legacyWb, id };
    const lib = readJSON<Library>(LIBRARY_KEY) ?? EMPTY_LIBRARY;
    if (!lib.entries[id]) {
      lib.entries[id] = {
        workbook: wb,
        progress: normalizeProgress(legacyProg),
      };
      lib.activeId = id;
      writeJSON(LIBRARY_KEY, lib);
    }
    localStorage.removeItem(LEGACY_WORKBOOK_KEY);
    localStorage.removeItem(LEGACY_PROGRESS_KEY);
  }

  localStorage.setItem(LEGACY_MIGRATED_FLAG, "1");
}

export function loadLibrary(): Library {
  if (typeof window === "undefined") return { ...EMPTY_LIBRARY };
  migrateLegacyOnce();
  const lib = readJSON<Library>(LIBRARY_KEY);
  if (!lib) return { ...EMPTY_LIBRARY, entries: {} };
  if (!lib.entries || typeof lib.entries !== "object") {
    return { ...EMPTY_LIBRARY, entries: {} };
  }
  return lib;
}

function saveLibrary(lib: Library) {
  writeJSON(LIBRARY_KEY, lib);
}

export function listEntries(): WorkbookEntry[] {
  const lib = loadLibrary();
  return Object.values(lib.entries).sort((a, b) =>
    b.workbook.generatedAt.localeCompare(a.workbook.generatedAt),
  );
}

export function getEntry(id: string): WorkbookEntry | null {
  const lib = loadLibrary();
  return lib.entries[id] ?? null;
}

export function getActiveEntry(): WorkbookEntry | null {
  const lib = loadLibrary();
  if (!lib.activeId) return null;
  return lib.entries[lib.activeId] ?? null;
}

export function getMostRecentEntry(): WorkbookEntry | null {
  const all = listEntries();
  return all[0] ?? null;
}

export function addWorkbook(workbook: Workbook): WorkbookEntry {
  const lib = loadLibrary();
  const entry: WorkbookEntry = {
    workbook,
    progress: { reflections: ["", "", ""], daily: {} },
  };
  lib.entries[workbook.id] = entry;
  lib.activeId = workbook.id;
  saveLibrary(lib);
  return entry;
}

export function setActiveId(id: string | null) {
  const lib = loadLibrary();
  if (id !== null && !lib.entries[id]) return;
  lib.activeId = id;
  saveLibrary(lib);
}

export function updateProgress(id: string, progress: Progress) {
  const lib = loadLibrary();
  const entry = lib.entries[id];
  if (!entry) return;
  entry.progress = normalizeProgress(progress);
  saveLibrary(lib);
}

export function deleteWorkbook(id: string) {
  const lib = loadLibrary();
  if (!lib.entries[id]) return;
  delete lib.entries[id];
  if (lib.activeId === id) {
    const remaining = Object.values(lib.entries).sort((a, b) =>
      b.workbook.generatedAt.localeCompare(a.workbook.generatedAt),
    );
    lib.activeId = remaining[0]?.workbook.id ?? null;
  }
  saveLibrary(lib);
}

export function clearLibrary() {
  localStorage.removeItem(LIBRARY_KEY);
}

export function makeWorkbookId(): string {
  return makeId();
}

export function loadIntake(): IntakeState | null {
  if (typeof window === "undefined") return null;
  return readJSON<IntakeState>(INTAKE_KEY);
}

export function saveIntake(state: IntakeState) {
  writeJSON(INTAKE_KEY, state);
}

export function clearIntake() {
  localStorage.removeItem(INTAKE_KEY);
}
