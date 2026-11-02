import assert from "node:assert/strict";

// Lightweight mirror of grade-match for quick sanity (TS compiled separately in app).
function normalizeFlexible(value) {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[\u2018\u2019\u201A\u201B`´]/g, "'")
    .replace(/[\u201C\u201D\u00AB\u00BB]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u00A0/g, " ")
    .split("\n")
    .map((line) =>
      line
        .replace(/[ \t]+$/g, "")
        .replace(/[ \t]+/g, " ")
        .replace(/(\d)\.(\d+?)0+\b/g, (_, a, b) => `${a}.${b}`)
        .replace(/(\d)\.0+\b/g, "$1.0"),
    )
    .join("\n")
    .replace(/\n+$/g, "")
    .trimEnd();
}

assert.equal(
  normalizeFlexible("Jami to‘lov: 78000 so‘m"),
  normalizeFlexible("Jami to'lov: 78000 so'm"),
);
assert.equal(normalizeFlexible("78.50"), normalizeFlexible("78.5"));
assert.match("Ali\n17\nToshkent", /(?s)^.+\n\d+\n.+$/);
console.log("grade-match sanity OK");
