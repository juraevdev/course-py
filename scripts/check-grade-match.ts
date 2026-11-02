import assert from "node:assert/strict";
import {
  compilePattern,
  matchCodeConstraint,
  matchStdout,
} from "../src/lib/grade-match";

assert.equal(
  matchStdout({
    actual: "Jami to‘lov: 78000 so‘m",
    expected: "Jami to'lov: 78000 so'm",
    mode: "FLEXIBLE",
  }),
  true,
);

assert.equal(
  matchStdout({ actual: "78.50", expected: "78.5", mode: "FLEXIBLE" }),
  true,
);

assert.equal(
  matchStdout({
    actual: "Ali\n17\nToshkent",
    expected: "(?s)^.+\n\\d+\n.+$",
    mode: "PATTERN",
  }),
  true,
);

assert.equal(
  matchStdout({
    actual: "a\nb\nc",
    expected: "c\na\nb",
    mode: "UNORDERED_LINES",
  }),
  true,
);

assert.equal(
  matchStdout({
    actual: "Yig'indi: 11\nAyirma: 5\nextra",
    expected: "Yig'indi: 11\nAyirma: 5",
    mode: "CONTAINS",
  }),
  true,
);

assert.equal(
  matchStdout({
    actual: "Salom, Dilnoza! Python kursiga xush kelibsiz!",
    expected: "Salom, Ali! Python kursiga xush kelibsiz!",
    alternatives: JSON.stringify([
      "Salom, Dilnoza! Python kursiga xush kelibsiz!",
    ]),
    mode: "ANY_OF",
  }),
  true,
);

assert.equal(
  matchCodeConstraint("print(1)\n# a\nx=1\n# b", "(?ms)^\\s*#.*$.*?^\\s*#"),
  true,
);

assert.equal(compilePattern("(?is)^hello$").test("HELLO"), true);

console.log("grade-match checks OK");
