#!/usr/bin/env python3
"""
CODE topshiriqlar uchun avto-testlar (title bo‘yicha).
Moslashuvchan matchMode: FLEXIBLE / ANY_OF / PATTERN / CONTAINS ...

Ishlatish:
  python3 scripts/seed-autotests.py /var/www/course-py/data/prod.db
  python3 scripts/seed-autotests.py path/to/dev.db
"""

from __future__ import annotations

import json
import secrets
import sqlite3
import sys
from pathlib import Path


def nid() -> str:
    return "cmt" + secrets.token_hex(12)


# title -> (answerKind, note_or_None, tests[])
# test: (name, stdin, expected, alts_list, matchMode, codeMustMatch|None, points, isHidden)
TestsSpec = list[tuple[str, str, str, list[str], str, str | None, int, int]]

INPUT_NOTE = (
    "\n\n---\nAvto-tekshiruv: `input()` ni promptsiz yozing "
    "(masalan `x = input()` yoki `x = int(input())`). "
    "Faqat `print()` chiqishi tekshiriladi. Format biroz farq qilsa ham "
    "(apostrof, bo‘shliq, `78.50` vs `78.5`) qabul qilinadi."
)

SAMPLE_NOTE = (
    "\n\n---\nAvto-tekshiruv: o‘z qiymatlaringiz bilan yozishingiz mumkin. "
    "Tekshiruv chiqish tuzilmasini (qatorlar / majburiy qismlar) tekshiradi — "
    "faqat bitta namuna matnga bog‘lanmaydi."
)

SPECS: dict[str, tuple[str, str | None, TestsSpec]] = {
    "Birinchi dastur": (
        "CODE",
        None,
        [
            (
                "Salom + Python chiqishi",
                "",
                r"(?is)salom.*python",
                [
                    "Salom, men Python o'rganyapman!",
                    "Salom, men Python o‘rganyapman!",
                ],
                "PATTERN",
                r"print\s*\(",
                1,
                0,
            ),
        ],
    ),
    "Tanishtiruv": (
        "CODE",
        SAMPLE_NOTE,
        [
            (
                "Ism/yosh/shahar chiqishi",
                "",
                r"(?is).+\d+.+",
                [],
                "PATTERN",
                r"print\s*\(",
                1,
                0,
            ),
        ],
    ),
    "Izoh qo'shish": (
        "CODE",
        SAMPLE_NOTE,
        [
            (
                "Kamida 2 izoh + chiqish",
                "",
                r"(?s)^.+\n.+\n.+$",
                [],
                "PATTERN",
                r"(?ms)^\s*#.*$.*?^\s*#",
                1,
                0,
            ),
        ],
    ),
    "Xatoni top va tuzat": (
        "CODE",
        None,
        [
            (
                "Tuzatilgan kod chiqishi",
                "",
                "Salom\nMen dasturchiman\nPython yoqadi",
                [],
                "FLEXIBLE",
                None,
                1,
                0,
            ),
        ],
    ),
    "Kartochka": (
        "CODE",
        SAMPLE_NOTE,
        [
            (
                "3 qator (ism / yosh / shahar)",
                "",
                r"(?s)^.+\n\d+\n.+$",
                [],
                "PATTERN",
                r"print\s*\(",
                1,
                0,
            ),
        ],
    ),
    "f-string bilan tanishtiruv": (
        "CODE",
        SAMPLE_NOTE,
        [
            (
                "Bitta gap, ism/yosh/shahar",
                "",
                r"(?is)^mening ismim .+, men \d+ yoshdaman va .+da yashayman\.?$",
                [
                    r"(?is)^mening ismim .+, men \d+ yoshdaman va .+ da yashayman\.?$",
                ],
                "PATTERN",
                r"[fF][\"']|[fF]\"\"\"|format\s*\(",
                1,
                0,
            ),
        ],
    ),
    "sep va end": (
        "CODE",
        None,
        [
            (
                "sep va end",
                "",
                "Python-dasturlash-tili!",
                ["Python-dasturlash-tili"],
                "ANY_OF",
                r"sep\s*=",
                1,
                0,
            ),
        ],
    ),
    "Do'kon hisobi": (
        "CODE",
        None,
        [
            (
                "Jami 78000",
                "",
                "Jami to'lov: 78000 so'm",
                [
                    "Jami to‘lov: 78000 so‘m",
                    "Jami tolov: 78000 som",
                    "Jami to'lov: 78000",
                    "78000",
                ],
                "ANY_OF",
                None,
                1,
                0,
            ),
        ],
    ),
    "Qiymat almashtirish": (
        "CODE",
        None,
        [
            (
                "a=10, b=5 chiqishi",
                "",
                "a = 10\nb = 5",
                ["a=10\nb=5", "10\n5", "a = 10\nb = 5"],
                "ANY_OF",
                None,
                1,
                0,
            ),
        ],
    ),
    "Xatoni top": (
        # Bir nechta "Xatoni top" bor — faqat CODE + f-string tuzatishiga test
        "CODE",
        None,
        [
            (
                "Ali va 17 chiqishi",
                "",
                r"(?is)ali[\s\S]*17",
                ["Ism: Ali\n17"],
                "PATTERN",
                r"print\s*\(",
                1,
                0,
            ),
        ],
    ),
    "Turlarni aniqla": (
        "CODE",
        None,
        [
            (
                "8 ta type() chiqishi",
                "",
                "\n".join(
                    [
                        "<class 'int'>",
                        "<class 'str'>",
                        "<class 'float'>",
                        "<class 'bool'>",
                        "<class 'str'>",
                        "<class 'int'>",
                        "<class 'float'>",
                        "<class 'str'>",
                    ]
                ),
                [],
                "UNORDERED_LINES",
                r"type\s*\(",
                1,
                0,
            ),
        ],
    ),
    "Bashorat qil": (
        "CODE",
        None,
        [
            (
                "Barcha print natijalari",
                "",
                "2.5\n2\n2\n104\n101010\n32\n7\nFalse",
                ["2.5\n2\n2\n104\n101010\n32\n7\nfalse"],
                "FLEXIBLE",
                None,
                1,
                0,
            ),
        ],
    ),
    "Talaba ma'lumoti": (
        "CODE",
        SAMPLE_NOTE,
        [
            (
                "4 qator: qiymat + type",
                "",
                r"(?s)^ism: .+ -> <class 'str'>\n"
                r"yosh: \d+ -> <class 'int'>\n"
                r"ortacha_ball: [\d.]+ -> <class 'float'>\n"
                r"kontrakt_tolangan: (True|False) -> <class 'bool'>$",
                [],
                "PATTERN",
                r"type\s*\(",
                1,
                0,
            ),
        ],
    ),
    "Turni o'zgartirish": (
        "CODE",
        None,
        [
            (
                "15 + 27 = 42",
                "",
                "15 + 27 = 42",
                ["15+27=42", "15 + 27 =42"],
                "ANY_OF",
                r"int\s*\(",
                1,
                0,
            ),
        ],
    ),
    "Yosh hisoblagich": (
        "CODE",
        None,
        [
            (
                "18 yosh / True",
                "",
                r"(?is)18.*(?:true|voyaga)",
                [
                    "Siz 18 yoshdasiz. Voyaga yetganmi: True",
                    "Siz 18 yoshdasiz,voyaga yetganmi:True",
                    "Siz 18 yoshdasiz. Voyaga yetganmi:True",
                ],
                "PATTERN",
                None,
                1,
                0,
            ),
        ],
    ),
    "Taqqoslash": (
        "CODE",
        None,
        [
            (
                "4 ta bool natija",
                "",
                "True\nFalse\nTrue\nFalse",
                [],
                "FLEXIBLE",
                None,
                1,
                0,
            ),
        ],
    ),
    "Salomlashuv": (
        "CODE",
        INPUT_NOTE,
        [
            (
                "Ali",
                "Ali\n",
                "Salom, Ali! Python kursiga xush kelibsiz!",
                [
                    "Salom, Ali! Python kursiga xush kelibsiz",
                    "Salom Ali! Python kursiga xush kelibsiz!",
                ],
                "ANY_OF",
                r"input\s*\(",
                1,
                0,
            ),
            (
                "Dilnoza",
                "Dilnoza\n",
                "Salom, Dilnoza! Python kursiga xush kelibsiz!",
                [],
                "FLEXIBLE",
                r"input\s*\(",
                1,
                1,
            ),
        ],
    ),
    "Kelasi yil necha yoshda bo'laman?": (
        "CODE",
        INPUT_NOTE,
        [
            (
                "17 → 18",
                "17\n",
                "Kelasi yili siz 18 yoshda bo'lasiz.",
                [
                    "Kelasi yili siz 18 yoshda bo‘lasiz.",
                    "Kelasi yili siz 18 yoshda bo'lasiz",
                ],
                "ANY_OF",
                r"input\s*\(",
                1,
                0,
            ),
            (
                "20 → 21",
                "20\n",
                "Kelasi yili siz 21 yoshda bo'lasiz.",
                [],
                "FLEXIBLE",
                r"input\s*\(",
                1,
                1,
            ),
        ],
    ),
    "Ikki son yig'indisi": (
        "CODE",
        INPUT_NOTE,
        [
            (
                "8 va 3",
                "8\n3\n",
                "Yig'indi: 11\nAyirma: 5\nKo'paytma: 24\nButun bo'linma: 2",
                [],
                "CONTAINS",
                r"input\s*\(",
                1,
                0,
            ),
            (
                "10 va 2",
                "10\n2\n",
                "Yig'indi: 12\nAyirma: 8\nKo'paytma: 20\nButun bo'linma: 5",
                [],
                "CONTAINS",
                r"input\s*\(",
                1,
                1,
            ),
        ],
    ),
    "Do'kon kassasi": (
        "CODE",
        INPUT_NOTE,
        [
            (
                "non 4000 x 5",
                "non\n4000\n5\n",
                "Mahsulot: non\nJami to'lov: 20000 so'm",
                [
                    "Mahsulot: non\nJami to‘lov: 20000 so‘m",
                    "non\n20000",
                ],
                "CONTAINS",
                r"input\s*\(",
                1,
                0,
            ),
            (
                "sut 12000 x 2",
                "sut\n12000\n2\n",
                "24000",
                [],
                "CONTAINS",
                r"input\s*\(",
                1,
                1,
            ),
        ],
    ),
    "Doira yuzi": (
        "CODE",
        INPUT_NOTE,
        [
            (
                "r=5 → 78.5",
                "5\n",
                "Doira yuzi: 78.5",
                ["Doira yuzi: 78.50", "78.5", "Doira yuzi:78.5"],
                "ANY_OF",
                r"input\s*\(",
                1,
                0,
            ),
            (
                "r=2 → 12.56",
                "2\n",
                "12.56",
                ["Doira yuzi: 12.56", "12.560"],
                "CONTAINS",
                r"input\s*\(",
                1,
                1,
            ),
        ],
    ),
    "Harorat konvertori": (
        "CODE",
        INPUT_NOTE,
        [
            (
                "25C → 77F",
                "25\n",
                "25.0°C = 77.0°F",
                [
                    "25.0 C = 77.0 F",
                    "25°C = 77°F",
                    "25.0°C = 77.0°F",
                    "25.0C = 77.0F",
                ],
                "ANY_OF",
                r"input\s*\(",
                1,
                0,
            ),
            (
                "0C → 32F",
                "0\n",
                "32",
                ["0.0°C = 32.0°F", "32.0"],
                "CONTAINS",
                r"input\s*\(",
                1,
                1,
            ),
        ],
    ),
    'Mini loyiha: "Tanishuv anketasi"': (
        "CODE",
        INPUT_NOTE + SAMPLE_NOTE,
        [
            (
                "Anketa: ism/familiya/yosh/shahar",
                "Ali\nValiyev\n2008\nToshkent\n",
                r"(?is)(ism|familiya|shahar|yosh|anketa).*\d+",
                [],
                "PATTERN",
                r"print\s*\(",
                1,
                0,
            ),
            (
                "input yoki hisoblangan yosh",
                "Sara\nKarimova\n2005\nSamarqand\n",
                r"(?is).*\d{1,3}.*",
                [],
                "PATTERN",
                r"print\s*\(",
                1,
                1,
            ),
        ],
    ),
    "Yagona dastur": (
        "CODE",
        INPUT_NOTE,
        [
            (
                "Ali / 17 / 3000000",
                "Ali\n17\n3000000\n",
                "Salom, Ali!\nYillik daromad: 36000000 so'm\n5 yildan keyin yoshingiz: 22\nYoshi 18 dan katta: False",
                [],
                "CONTAINS",
                r"input\s*\(",
                1,
                0,
            ),
            (
                "Bobur / 20 / 1000000",
                "Bobur\n20\n1000000\n",
                "Salom, Bobur!\n12000000\n25\nTrue",
                [],
                "CONTAINS",
                r"input\s*\(",
                1,
                1,
            ),
        ],
    ),
    # ---- 7-mavzu: if / elif / else ----
    "Voyaga yetganmi?": (
        "CODE",
        INPUT_NOTE,
        [
            (
                "17 → yetmagan",
                "17\n",
                "Voyaga yetmagan",
                [],
                "FLEXIBLE",
                r"if\s+",
                1,
                0,
            ),
            (
                "20 → yetgan",
                "20\n",
                "Voyaga yetgan",
                [],
                "FLEXIBLE",
                r"if\s+",
                1,
                1,
            ),
        ],
    ),
    "Juft yoki toq": (
        "CODE",
        INPUT_NOTE,
        [
            (
                "8 → Juft",
                "8\n",
                "Juft",
                [],
                "FLEXIBLE",
                r"if\s+",
                1,
                0,
            ),
            (
                "7 → Toq",
                "7\n",
                "Toq",
                [],
                "FLEXIBLE",
                r"if\s+",
                1,
                1,
            ),
        ],
    ),
    "Imtihon natijasi": (
        "CODE",
        INPUT_NOTE,
        [
            (
                "72 → O'tdi",
                "72\n",
                "O'tdi",
                ["O‘tdi", "Otdi"],
                "ANY_OF",
                r"if\s+",
                1,
                0,
            ),
            (
                "45 → O'tmadi",
                "45\n",
                "O'tmadi",
                ["O‘tmadi", "Otmadi"],
                "ANY_OF",
                r"if\s+",
                1,
                1,
            ),
        ],
    ),
    "Baholash tizimi": (
        "CODE",
        INPUT_NOTE,
        [
            ("95 → A", "95\n", "A", [], "FLEXIBLE", r"if\s+", 1, 0),
            ("83 → B", "83\n", "B", [], "FLEXIBLE", r"if\s+", 1, 1),
            ("55 → F", "55\n", "F", [], "FLEXIBLE", r"if\s+", 1, 1),
        ],
    ),
    "Login (parol)": (
        "CODE",
        INPUT_NOTE,
        [
            (
                "to'g'ri parol",
                "python123\n",
                "Xush kelibsiz",
                [],
                "FLEXIBLE",
                r"if\s+",
                1,
                0,
            ),
            (
                "xato parol",
                "12345\n",
                "Parol xato",
                [],
                "FLEXIBLE",
                r"if\s+",
                1,
                1,
            ),
        ],
    ),
    "Eng katta son": (
        "CODE",
        INPUT_NOTE,
        [
            ("8 va 3", "8\n3\n", "8", [], "FLEXIBLE", r"if\s+", 1, 0),
            ("4 va 9", "4\n9\n", "9", [], "FLEXIBLE", r"if\s+", 1, 1),
            ("5 va 5", "5\n5\n", "Teng", [], "FLEXIBLE", r"if\s+", 1, 1),
        ],
    ),
    'Mini loyiha: "Chipta narxi"': (
        "CODE",
        INPUT_NOTE,
        [
            ("5 → Bepul", "5\n", "Bepul", [], "FLEXIBLE", r"if\s+", 1, 0),
            (
                "15 → 15000",
                "15\n",
                "15000 so'm",
                ["15000 so‘m", "15000"],
                "ANY_OF",
                r"if\s+",
                1,
                1,
            ),
            (
                "30 → 25000",
                "30\n",
                "25000 so'm",
                ["25000 so‘m", "25000"],
                "ANY_OF",
                r"if\s+",
                1,
                1,
            ),
            (
                "70 → 10000",
                "70\n",
                "10000 so'm",
                ["10000 so‘m", "10000"],
                "ANY_OF",
                r"if\s+",
                1,
                1,
            ),
        ],
    ),
    # ---- 8-mavzu: list (ro'yxat) — for ishlatilmaydi ----
    "Mevalar ro'yxati": (
        "CODE",
        None,
        [
            (
                "ro'yxat + len",
                "",
                "['olma', 'anor', 'banan']\n3",
                [
                    '["olma", "anor", "banan"]\n3',
                    "['olma', 'anor', 'banan']\n3",
                ],
                "ANY_OF",
                r"\[|list\s*\(",
                1,
                0,
            ),
        ],
    ),
    "Birinchi va oxirgi": (
        "CODE",
        None,
        [
            (
                "Ali / Sami",
                "",
                "Ali\nSami",
                [],
                "FLEXIBLE",
                r"\[",
                1,
                0,
            ),
        ],
    ),
    "Savatga qo'sh": (
        "CODE",
        INPUT_NOTE,
        [
            (
                "tuxum qo'shish",
                "tuxum\n",
                "['non', 'sut', 'tuxum']",
                [
                    '["non", "sut", "tuxum"]',
                    "['non', 'sut', 'tuxum']",
                ],
                "ANY_OF",
                r"append\s*\(",
                1,
                0,
            ),
            (
                "choy qo'shish",
                "choy\n",
                "['non', 'sut', 'choy']",
                [
                    '["non", "sut", "choy"]',
                    "['non', 'sut', 'choy']",
                ],
                "ANY_OF",
                r"append\s*\(",
                1,
                1,
            ),
        ],
    ),
    "Elementni almashtir": (
        "CODE",
        None,
        [
            (
                "indeks 1 = sariq",
                "",
                r"(?s).*qizil.*sariq.*ko['\u2018\u2019']?k.*",
                [
                    "['qizil', 'sariq', \"ko'k\"]",
                    '["qizil", "sariq", "ko\'k"]',
                    "['qizil', 'sariq', 'ko‘k']",
                ],
                "PATTERN",
                r"\[\s*1\s*\]\s*=",
                1,
                0,
            ),
        ],
    ),
    "Ro'yxatda bormi?": (
        "CODE",
        INPUT_NOTE,
        [
            (
                "anor → Bor",
                "anor\n",
                "Bor",
                [],
                "FLEXIBLE",
                r"\bin\b",
                1,
                0,
            ),
            (
                "uzum → Yo'q",
                "uzum\n",
                "Yo'q",
                ["Yo‘q", "Yoq"],
                "ANY_OF",
                r"\bin\b",
                1,
                1,
            ),
        ],
    ),
    "Baholar": (
        "CODE",
        None,
        [
            (
                "len / birinchi / oxirgi",
                "",
                "5\n5\n4",
                [],
                "FLEXIBLE",
                r"len\s*\(",
                1,
                0,
            ),
        ],
    ),
    'Mini loyiha: "Do\'kon savati"': (
        "CODE",
        INPUT_NOTE,
        [
            (
                "non/sut/tuxum",
                "non\nsut\ntuxum\n",
                "['non', 'sut', 'tuxum']\n3\nnon\ntuxum\nAsosiy mahsulot: non",
                [
                    '["non", "sut", "tuxum"]\n3\nnon\ntuxum\nAsosiy mahsulot: non',
                ],
                "ANY_OF",
                r"append\s*\(",
                1,
                0,
            ),
            (
                "olma/anor/banan (no asosiy)",
                "olma\nanor\nbanan\n",
                "['olma', 'anor', 'banan']\n3\nolma\nbanan",
                [
                    '["olma", "anor", "banan"]\n3\nolma\nbanan',
                ],
                "ANY_OF",
                r"append\s*\(",
                1,
                1,
            ),
        ],
    ),
    # ---- 10-mavzu: set (to'plam) — chiqish tartibi barqaror emas ----
    "Mevalar to'plami": (
        "CODE",
        None,
        [
            (
                "set + len=3",
                "",
                r"(?s)(?=.*\bolma\b)(?=.*\banor\b)(?=.*\bbanan\b).*\n3\s*\Z",
                [],
                "PATTERN",
                r"\{|set\s*\(",
                1,
                0,
            ),
        ],
    ),
    "Takror yo'q": (
        "CODE",
        None,
        [
            (
                "noyob {1,2,3} + len",
                "",
                r"(?s)(?=.*\b1\b)(?=.*\b2\b)(?=.*\b3\b).*\n3\s*\Z",
                [],
                "PATTERN",
                r"\{|set\s*\(",
                1,
                0,
            ),
        ],
    ),
    "Setda bormi?": (
        "CODE",
        INPUT_NOTE,
        [
            (
                "Samarqand → Bor",
                "Samarqand\n",
                "Bor",
                [],
                "FLEXIBLE",
                r"\bin\b",
                1,
                0,
            ),
            (
                "Farg'ona → Yo'q",
                "Farg'ona\n",
                "Yo'q",
                ["Yo‘q", "Yoq"],
                "ANY_OF",
                r"\bin\b",
                1,
                1,
            ),
        ],
    ),
    "add bilan kengaytirish": (
        "CODE",
        None,
        [
            (
                "python/javascript/go + len=3",
                "",
                r"(?s)(?=.*\bpython\b)(?=.*\bjavascript\b)(?=.*\bgo\b).*\n3\s*\Z",
                [],
                "PATTERN",
                r"\.add\s*\(",
                1,
                0,
            ),
        ],
    ),
    "discard": (
        "CODE",
        None,
        [
            (
                "yashil o'chirildi, len=3",
                "",
                r"(?s)(?=.*\bqizil\b)(?=.*ko['\u2018\u2019']?k)(?=.*\bsariq\b)(?!.*\byashil\b).*\n3\s*\Z",
                [],
                "PATTERN",
                r"\.discard\s*\(",
                1,
                0,
            ),
        ],
    ),
    'Mini loyiha: "Ishtirokchilar ro\'yxati"': (
        "CODE",
        INPUT_NOTE,
        [
            (
                "Ali/Vali/Ali → Ali bor",
                "Ali\nVali\nAli\n",
                r"(?s)(?=.*\bAli\b)(?=.*\bVali\b).*\n2\nAli bor\s*\Z",
                [],
                "PATTERN",
                r"\.add\s*\(",
                1,
                0,
            ),
            (
                "Vali/Sami/Dilnoza → Ali yo'q",
                "Vali\nSami\nDilnoza\n",
                r"(?s)(?=.*\bVali\b)(?=.*\bSami\b)(?=.*\bDilnoza\b).*\n3\nAli yo['\u2018\u2019']?q\s*\Z",
                [],
                "PATTERN",
                r"\.add\s*\(",
                1,
                1,
            ),
        ],
    ),
}

# "Xatoni top" dublikatlari: faqat descriptionda f-string / o'zgaruvchi nomlash
XATO_CODE_HINT = "talaba yoshi"


def ensure_columns(cur: sqlite3.Cursor) -> None:
    cols = {r[1] for r in cur.execute("PRAGMA table_info(Assignment)").fetchall()}
    if "answerKind" not in cols:
        cur.execute(
            "ALTER TABLE Assignment ADD COLUMN answerKind TEXT NOT NULL DEFAULT 'TEXT'"
        )
    tcols = {r[1] for r in cur.execute("PRAGMA table_info(AssignmentTest)").fetchall()}
    if "expectedAlternatives" not in tcols:
        cur.execute(
            "ALTER TABLE AssignmentTest ADD COLUMN expectedAlternatives TEXT NOT NULL DEFAULT '[]'"
        )
    if "matchMode" not in tcols:
        cur.execute(
            "ALTER TABLE AssignmentTest ADD COLUMN matchMode TEXT NOT NULL DEFAULT 'FLEXIBLE'"
        )
    if "codeMustMatch" not in tcols:
        cur.execute("ALTER TABLE AssignmentTest ADD COLUMN codeMustMatch TEXT")


def seed(db_path: Path) -> None:
    con = sqlite3.connect(db_path)
    cur = con.cursor()
    ensure_columns(cur)

    rows = cur.execute(
        "SELECT id, title, description FROM Assignment"
    ).fetchall()
    by_title: dict[str, list[tuple[str, str]]] = {}
    for aid, title, desc in rows:
        by_title.setdefault(title, []).append((aid, desc or ""))

    inserted = 0
    updated_kind = 0
    skipped = 0

    for title, (answer_kind, note, tests) in SPECS.items():
        matches = by_title.get(title, [])
        if not matches:
            print(f"SKIP missing title: {title}")
            skipped += 1
            continue

        # "Xatoni top" — faqat CODE variant (talaba yoshi)
        if title == "Xatoni top":
            matches = [
                m for m in matches if XATO_CODE_HINT in m[1] or "1-ism" in m[1]
            ]
            if not matches:
                print("SKIP Xatoni top (CODE variant topilmadi)")
                skipped += 1
                continue

        for assignment_id, desc in matches:
            cur.execute(
                "UPDATE Assignment SET answerKind = ? WHERE id = ?",
                (answer_kind, assignment_id),
            )
            updated_kind += 1

            cur.execute(
                "DELETE FROM AssignmentTest WHERE assignmentId = ?",
                (assignment_id,),
            )

            for i, (
                name,
                stdin,
                expected,
                alts,
                mode,
                code_re,
                points,
                hidden,
            ) in enumerate(tests):
                cur.execute(
                    """
                    INSERT INTO AssignmentTest
                      (id, assignmentId, name, stdin, expectedStdout,
                       expectedAlternatives, matchMode, codeMustMatch,
                       points, sortOrder, isHidden, createdAt)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
                    """,
                    (
                        nid(),
                        assignment_id,
                        name,
                        stdin,
                        expected,
                        json.dumps(alts, ensure_ascii=False),
                        mode,
                        code_re,
                        points,
                        i,
                        hidden,
                    ),
                )
                inserted += 1
                print(f"+ {title} :: {name} [{mode}]".encode("utf-8", "replace").decode("utf-8"))

            if note and "Avto-tekshiruv" not in desc:
                cur.execute(
                    "UPDATE Assignment SET description = ? WHERE id = ?",
                    (desc + note, assignment_id),
                )

    # TEXT topshiriqlarni aniq belgilash (CODE emas)
    code_titles = set(SPECS.keys())
    for aid, title, desc in rows:
        if title in code_titles:
            continue
        # Izoh / mini tadqiqot yozma
        if "Turi: kod" in (desc or "") or "print(" in (desc or ""):
            # ba'zi kod topshiriqlar SPECS da yo'q — CODE qilib qo'yamiz
            if title not in ("Python haqida mini-tadqiqot",):
                cur.execute(
                    "UPDATE Assignment SET answerKind = 'CODE' WHERE id = ?",
                    (aid,),
                )
                updated_kind += 1
        else:
            cur.execute(
                "UPDATE Assignment SET answerKind = 'TEXT' WHERE id = ?",
                (aid,),
            )

    con.commit()
    con.close()
    print(
        f"Done. tests_inserted={inserted} kinds_touched={updated_kind} skipped={skipped}"
    )


if __name__ == "__main__":
    path = Path(sys.argv[1] if len(sys.argv) > 1 else "data/prod.db")
    if not path.exists():
        raise SystemExit(f"DB topilmadi: {path}")
    seed(path)
