export type MatchModeName =
  | "EXACT"
  | "FLEXIBLE"
  | "ANY_OF"
  | "PATTERN"
  | "CONTAINS"
  | "UNORDERED_LINES";

/** Apostrof / tire / bo‘shliq / float farqlarini yumshatadi. */
export function normalizeFlexible(value: string): string {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[\u2018\u2019\u201A\u201B`´]/g, "'")
    .replace(/[\u201C\u201D\u00AB\u00BB]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u00A0/g, " ")
    .replace(/\u00B0/g, "°")
    .split("\n")
    .map((line) =>
      line
        .replace(/[ \t]+$/g, "")
        .replace(/[ \t]+/g, " ")
        .replace(/(\d)\s+\./g, "$1.")
        .replace(/(\d)\.(\d+?)0+\b/g, (_, a: string, b: string) => `${a}.${b}`)
        .replace(/(\d)\.0+\b/g, "$1.0"),
    )
    .join("\n")
    .replace(/\n+$/g, "")
    .trimEnd();
}

export function normalizeExact(value: string): string {
  return value.replace(/\r\n/g, "\n").replace(/\r/g, "\n").replace(/\s+$/g, "").trimEnd();
}

function parseAlternatives(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

function flexibleEquals(actual: string, expected: string): boolean {
  return normalizeFlexible(actual) === normalizeFlexible(expected);
}

function containsAll(actual: string, expected: string): boolean {
  const act = normalizeFlexible(actual);
  const needles = normalizeFlexible(expected)
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  let from = 0;
  for (const needle of needles) {
    const idx = act.indexOf(needle, from);
    if (idx === -1) return false;
    from = idx + needle.length;
  }
  return true;
}

function unorderedLinesEqual(actual: string, expected: string): boolean {
  const a = normalizeFlexible(actual)
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .sort();
  const e = normalizeFlexible(expected)
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .sort();
  if (a.length !== e.length) return false;
  return a.every((line, i) => line === e[i]);
}

/** Python `(?is)...` uslubidagi bayroqlarni JS RegExp ga o‘giradi. */
export function compilePattern(pattern: string): RegExp {
  let source = pattern;
  let flags = "u";
  const inline = source.match(/^\(\?([aimsux]+)\)([\s\S]*)$/);
  if (inline) {
    const py = inline[1];
    source = inline[2];
    if (py.includes("i")) flags += "i";
    if (py.includes("m")) flags += "m";
    if (py.includes("s")) flags += "s";
  }
  // JS da nuqta \\n ni qamramasin: agar s yo‘q bo‘lsa ham ko‘p qatorli
  // patternlar uchun . o‘rniga [\s\S] talab qilinishi mumkin — seedda (?s) ishlatiladi.
  return new RegExp(source, flags);
}

function patternMatches(actual: string, pattern: string): boolean {
  const source = normalizeFlexible(actual);
  try {
    return compilePattern(pattern).test(source);
  } catch {
    return false;
  }
}

export function matchStdout(options: {
  actual: string;
  expected: string;
  alternatives?: string | null;
  mode?: MatchModeName | string | null;
}): boolean {
  const mode = (options.mode || "FLEXIBLE").toUpperCase() as MatchModeName;
  const actual = options.actual ?? "";
  const expected = options.expected ?? "";
  const alts = [
    expected,
    ...parseAlternatives(options.alternatives),
  ].filter((s) => s.length > 0);

  switch (mode) {
    case "EXACT":
      return alts.some((e) => normalizeExact(actual) === normalizeExact(e));
    case "ANY_OF":
      return alts.some((e) => flexibleEquals(actual, e));
    case "PATTERN":
      return alts.some((e) => patternMatches(actual, e));
    case "CONTAINS":
      return alts.some((e) => containsAll(actual, e));
    case "UNORDERED_LINES":
      return alts.some((e) => unorderedLinesEqual(actual, e));
    case "FLEXIBLE":
    default:
      return alts.some((e) => flexibleEquals(actual, e));
  }
}

export function matchCodeConstraint(
  code: string,
  pattern: string | null | undefined,
): boolean {
  if (!pattern || !pattern.trim()) return true;
  try {
    return compilePattern(pattern).test(code);
  } catch {
    return false;
  }
}
