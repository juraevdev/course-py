"""
Prod/local DB ga CODE topshiriqlar uchun avto-testlar yozadi.
Ishlatish (serverda):
  python3 scripts/seed-autotests.py /var/www/course-py/data/prod.db
"""

from __future__ import annotations

import secrets
import sqlite3
import sys
from pathlib import Path


def nid() -> str:
    return "cmt" + secrets.token_hex(12)


# assignmentId -> list of tests
# Har bir test: (name, stdin, expectedStdout, points, isHidden)
TESTS: dict[str, list[tuple[str, str, str, int, int]]] = {
    # 3.1 Birinchi dastur
    "cmvdt7bmq000rzltmqlgz9ewd": [
        (
            "Asosiy chiqish",
            "",
            "Salom, men Python o'rganyapman!",
            100,
            0,
        ),
    ],
    # 3.4 Xatoni top va tuzat
    "cmvdt7bno000xzltmp7shgeap": [
        (
            "Tuzatilgan kod chiqishi",
            "",
            "Salom\nMen dasturchiman\nPython yoqadi",
            100,
            0,
        ),
    ],
    # 4.1 Kartochka (namuna qiymatlar)
    "cmvdt7bp60013zltmc61pxql5": [
        (
            "Namuna: Ali / 17 / Toshkent",
            "",
            "Ali\n17\nToshkent",
            100,
            0,
        ),
    ],
    # 4.2 f-string (namuna)
    "cmvdt7bqu0015zltml85d06zy": [
        (
            "Namuna gap (Ali, 17, Toshkent)",
            "",
            "Mening ismim Ali, men 17 yoshdaman va Toshkentda yashayman.",
            100,
            0,
        ),
    ],
    # 4.3 sep va end
    "cmvdt7bro0017zltm20jzq6mv": [
        (
            "sep va end",
            "",
            "Python-dasturlash-tili!",
            100,
            0,
        ),
    ],
    # 4.4 Do'kon hisobi
    "cmvdt7bs20019zltmbch1tiud": [
        (
            "Jami 78000",
            "",
            "Jami to'lov: 78000 so'm",
            100,
            0,
        ),
    ],
    # 4.5 Qiymat almashtirish
    "cmvdt7bse001bzltmnjwsogiq": [
        (
            "a va b almashtirilgan",
            "",
            "a = 10\nb = 5",
            100,
            0,
        ),
    ],
    # 4.6 Xatoni top
    "cmvdt7bsr001dzltm1t7w8x3r": [
        (
            "Tuzatilgan chiqish",
            "",
            "Ism: Ali\n17",
            100,
            0,
        ),
    ],
    # 5.1 Turlarni aniqla
    "cmvdt7btm001hzltmtzc764ex": [
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
            100,
            0,
        ),
    ],
    # 5.2 Bashorat qil
    "cmvdt7btw001jzltmwam2h1na": [
        (
            "Barcha print natijalari",
            "",
            "2.5\n2\n2\n104\n101010\n32\n7\nFalse",
            100,
            0,
        ),
    ],
    # 5.3 Talaba ma'lumoti (namuna)
    "cmvdt7bua001lzltmmg3eog1a": [
        (
            "Namuna Ali + typelar",
            "",
            "\n".join(
                [
                    "ism: Ali -> <class 'str'>",
                    "yosh: 17 -> <class 'int'>",
                    "ortacha_ball: 4.5 -> <class 'float'>",
                    "kontrakt_tolangan: True -> <class 'bool'>",
                ]
            ),
            100,
            0,
        ),
    ],
    # 5.4 Turni o'zgartirish
    "cmvdt7bul001nzltm91zmfqtf": [
        (
            "15 + 27 = 42",
            "",
            "15 + 27 = 42",
            100,
            0,
        ),
    ],
    # 5.5 Yosh hisoblagich
    "cmvdt7buw001pzltmu6mgtlgd": [
        (
            "18 yosh / True",
            "",
            "Siz 18 yoshdasiz. Voyaga yetganmi: True",
            100,
            0,
        ),
    ],
    # 5.7 Taqqoslash
    "cmvdt7bvl001tzltmxuyfletw": [
        (
            "4 ta bool natija",
            "",
            "True\nFalse\nTrue\nFalse",
            100,
            0,
        ),
    ],
    # 6.1 Salomlashuv — avto-test: input() promptsiz
    "cmvdt7bwr001xzltmdoghrh0n": [
        (
            "Ali",
            "Ali\n",
            "Salom, Ali! Python kursiga xush kelibsiz!",
            100,
            0,
        ),
    ],
    # 6.2 Kelasi yil
    "cmvdt7bx5001zzltmojh7ahy0": [
        (
            "17 → 18",
            "17\n",
            "Kelasi yili siz 18 yoshda bo'lasiz.",
            100,
            0,
        ),
    ],
    # 6.3 Ikki son
    "cmvdt7bxk0021zltmf2ansaq2": [
        (
            "8 va 3 (promptsiz)",
            "8\n3\n",
            "Yig'indi: 11\nAyirma: 5\nKo'paytma: 24\nButun bo'linma: 2",
            100,
            0,
        ),
    ],
    # 6.4 Do'kon kassasi
    "cmvdt7by20023zltmagu6t9i9": [
        (
            "non 4000 x 5 (promptsiz)",
            "non\n4000\n5\n",
            "Mahsulot: non\nJami to'lov: 20000 so'm",
            100,
            0,
        ),
    ],
    # 6.5 Doira yuzi
    "cmvdt7byd0025zltm3yoi7euj": [
        (
            "r=5 → 78.5 (promptsiz)",
            "5\n",
            "Doira yuzi: 78.5",
            100,
            0,
        ),
    ],
    # 6.6 Harorat
    "cmvdt7byt0027zltmr2klinv4": [
        (
            "25C → 77F (promptsiz)",
            "25\n",
            "25.0°C = 77.0°F",
            100,
            0,
        ),
    ],
    # Umumiy: Yagona dastur
    "cmvdt7c12002hzltma2fpb8gl": [
        (
            "Ali / 17 / 3000000 (promptsiz)",
            "Ali\n17\n3000000\n",
            "Salom, Ali!\nYillik daromad: 36000000 so'm\n5 yildan keyin yoshingiz: 22\nYoshi 18 dan katta: False",
            100,
            0,
        ),
    ],
}


INPUT_NOTE = (
    "\n\n---\nAvto-tekshiruv: `input()` ni promptsiz yozing "
    "(masalan `x = input()` yoki `x = int(input())`). "
    "Faqat `print()` chiqishi tekshiriladi."
)

INPUT_ASSIGNMENTS = {
    "cmvdt7bwr001xzltmdoghrh0n",
    "cmvdt7bx5001zzltmojh7ahy0",
    "cmvdt7bxk0021zltmf2ansaq2",
    "cmvdt7by20023zltmagu6t9i9",
    "cmvdt7byd0025zltm3yoi7euj",
    "cmvdt7byt0027zltmr2klinv4",
    "cmvdt7c12002hzltma2fpb8gl",
}

SAMPLE_NOTE = (
    "\n\n---\nAvto-tekshiruv namuna qiymatlari: "
    "ism=`Ali`, yosh=`17`, shahar=`Toshkent` "
    "(yoki topshiriqdagi kutilgan format)."
)

SAMPLE_ASSIGNMENTS = {
    "cmvdt7bp60013zltmc61pxql5",
    "cmvdt7bqu0015zltml85d06zy",
    "cmvdt7bua001lzltmmg3eog1a",
}


def seed(db_path: Path) -> None:
    con = sqlite3.connect(db_path)
    cur = con.cursor()

    existing = {
        row[0]
        for row in cur.execute("SELECT id FROM Assignment").fetchall()
    }

    inserted = 0
    skipped = 0
    for assignment_id, tests in TESTS.items():
        if assignment_id not in existing:
            print(f"SKIP missing assignment {assignment_id}")
            skipped += 1
            continue

        cur.execute(
            "DELETE FROM AssignmentTest WHERE assignmentId = ?",
            (assignment_id,),
        )

        for i, (name, stdin, expected, points, hidden) in enumerate(tests):
            cur.execute(
                """
                INSERT INTO AssignmentTest
                  (id, assignmentId, name, stdin, expectedStdout, points, sortOrder, isHidden, createdAt)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
                """,
                (
                    nid(),
                    assignment_id,
                    name,
                    stdin,
                    expected,
                    points,
                    i,
                    hidden,
                ),
            )
            inserted += 1
            print(f"+ {assignment_id[:12]}… {name}")

        # Eslatma (bir marta)
        row = cur.execute(
            "SELECT description FROM Assignment WHERE id = ?",
            (assignment_id,),
        ).fetchone()
        if row:
            desc = row[0] or ""
            note = ""
            if assignment_id in INPUT_ASSIGNMENTS and "Avto-tekshiruv:" not in desc:
                note = INPUT_NOTE
            if assignment_id in SAMPLE_ASSIGNMENTS and "Avto-tekshiruv namuna" not in desc:
                note = SAMPLE_NOTE
            if note:
                cur.execute(
                    "UPDATE Assignment SET description = ? WHERE id = ?",
                    (desc + note, assignment_id),
                )

    con.commit()
    con.close()
    print(f"Done. inserted={inserted} skipped_assignments={skipped}")


if __name__ == "__main__":
    path = Path(sys.argv[1] if len(sys.argv) > 1 else "data/prod.db")
    if not path.exists():
        raise SystemExit(f"DB topilmadi: {path}")
    seed(path)
