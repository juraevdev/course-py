# Python kursi: 1–6-mavzular uchun qo'shimcha materiallar

## Cursor uchun ko'rsatma

Quyida o'quvchilar uchun 6 ta mavzuning qo'shimcha materiallari bor. Har bir mavzu bir xil tuzilishga ega:

1. **Qisqacha mazmun**: mavzu kartasi uchun 1–2 gap
2. **Qo'shimcha tushuntirish**: asosiy matn
3. **Asosiy tushunchalar**: lug'at (atama va izoh)
4. **Kod namunalari**: faqat kod mavzularida
5. **Tez-tez uchraydigan xatolar**
6. **Resurslar**: havolalar va tavsiflar
7. **Topshiriqlar**: har biri alohida topshiriq sifatida saqlanadi (raqami, turi, qiyinlik darajasi, sharti, maslahati, kutilgan natija)

Saytga joylashda:
- Har bir mavzu alohida sahifa bo'lsin, `slug` maydoni URL uchun ishlatilsin.
- Har bir topshiriq mavzuga bog'langan alohida yozuv bo'lsin. O'quvchi o'z hisobidan bajarilgan/bajarilmagan holatini belgilay olsin.
- Kod bloklari sintaksis ranglanishi bilan ko'rsatilsin va yonida "Nusxalash" tugmasi bo'lsin.
- "Maslahat" va "Kutilgan natija" bloklari boshida yopiq turib, tugma bosilganda ochilsin.
- Matnni o'zgartirmasdan, faqat tuzilishga joylashtiring.

---

# 1-mavzu: Dasturlash tushunchasi

`slug: dasturlash-tushunchasi`

## Qisqacha mazmun
Dasturlash nima ekanini, kompyuter qanday ishlashini va dastur yozish nimani anglatishini tushunamiz.

## Qo'shimcha tushuntirish

**Dastur nima?**
Dastur kompyuterga nima qilishni bosqichma-bosqich tushuntiradigan ko'rsatmalar to'plami. Telefondagi kalkulyator, Telegram, o'yinlar, bank ilovasi, bularning hammasi dasturlar.

**Kompyuter nima uchun ko'rsatma kutadi?**
Kompyuter o'zi o'ylamaydi. U juda tez, lekin juda "ishonuvchan": aytilganini aynan bajaradi, ortiq ham, kam ham emas. Shuning uchun ko'rsatmalar aniq va tartibli bo'lishi kerak.

**Oddiy misol: choy damlash algoritmi**
1. Choynakka suv quy.
2. Suvni qaynat.
3. Choynakka choy sol.
4. 5 daqiqa kut.
5. Piyolaga quy.

Bu **algoritm**: muayyan natijaga olib boradigan aniq qadamlar ketma-ketligi. Agar 2-qadamni tashlab ketsak, natija boshqacha bo'ladi. Dasturlashda ham qadamlar tartibi muhim.

**Dasturlash tili nima uchun kerak?**
Kompyuter faqat 0 va 1 dan iborat "mashina tilini" tushunadi. Odam uni yoza olmaydi, shuning uchun Python, JavaScript, Java kabi odam o'qiy oladigan tillar yaratilgan. Maxsus dastur (interpretator yoki kompilyator) bizning kodimizni kompyuter tushunadigan tilga o'giradi.

**Dasturchi nima qiladi?**
- Muammoni tushunadi
- Yechim rejasini (algoritm) o'ylaydi
- Uni kodga aylantiradi
- Sinab ko'radi va xatolarni tuzatadi

Ko'p vaqt kod yozishga emas, **o'ylashga va xatolarni topishga** ketadi. Bu normal.

**Dasturlar qayerlarda ishlatiladi?**
Veb-saytlar, mobil ilovalar, o'yinlar, banklar, tibbiyot, transport, sun'iy intellekt. Deyarli har soha.

## Asosiy tushunchalar
- **Dastur**: kompyuterga berilgan ko'rsatmalar to'plami
- **Algoritm**: masalani yechish uchun aniq qadamlar ketma-ketligi
- **Kod**: dasturlash tilida yozilgan ko'rsatmalar
- **Dasturlash tili**: odam kompyuter bilan gaplashadigan til
- **Xato (bug)**: dasturdagi noto'g'ri ish. Uni topib tuzatish jarayoni **debugging** deyiladi
- **Interpretator / kompilyator**: koddi kompyuter tushunadigan holatga o'giruvchi dastur

## Tez-tez uchraydigan xato tushunchalar
- "Dasturchi hamma narsani yoddan biladi": yo'q, hatto tajribali dasturchilar ham doim qidiradi va hujjatlarga qaraydi.
- "Dasturlash faqat matematikani yaxshi bilganlar uchun": asosan mantiqiy fikrlash va sabr kerak.
- "Bir marta xato qilsam, buzaman": kod yozishda xato qilish o'rganishning bir qismi.

## Resurslar
- [roadmap.sh: Backend yo'l xaritasi](https://roadmap.sh/backend): dasturlashga kirgach nimalarni o'rganish mumkinligini ko'rsatadigan xarita
- [Python.org: Python haqida](https://www.python.org/about/): Python nima va nima uchun mashhur
- [CS50 (Harvard) kursi](https://cs50.harvard.edu/x/): dasturlash asoslarini tushuntiradigan mashhur bepul kurs (ingliz tilida, subtitrlar bor)
- [Code.org: Hour of Code](https://hourofcode.com/): o'yin shaklida dasturlashga kirish

## Topshiriqlar

### Topshiriq 1.1: O'z algoritmingni yoz
- **Turi:** yozma
- **Qiyinlik:** oson
- **Shart:** Kundalik hayotdan biror ishni tanlab (masalan, non sotib olish, telefonni zaryadlash, osh pishirish), uni kamida 6 qadamli algoritm qilib yozing. Har bir qadam aniq va bitta ish haqida bo'lsin.
- **Maslahat:** Har bir qadamni shunday yozingki, hech narsani bilmaydigan odam ham bajara olsin.
- **Kutilgan natija:** 6 va undan ko'p qadamdan iborat tartibli ro'yxat.

### Topshiriq 1.2: To'g'ri tartibni top
- **Turi:** mantiqiy
- **Qiyinlik:** oson
- **Shart:** Quyidagi qadamlar aralashib ketgan. Ularni to'g'ri tartibga soling: "Eshikni och", "Uyga kel", "Oyoq kiyimni yech", "Kalitni eshikka sol", "Ichkariga kir".
- **Maslahat:** Avval nima birinchi bo'lishi kerakligini o'ylab ko'ring.
- **Kutilgan natija:** Uyga kel → Kalitni eshikka sol → Eshikni och → Ichkariga kir → Oyoq kiyimni yech.

### Topshiriq 1.3: Xatoni top
- **Turi:** mantiqiy
- **Qiyinlik:** o'rta
- **Shart:** Quyidagi "choy damlash" algoritmida xato bor. Uni toping va tuzating: 1) Choy sol. 2) Suvni qaynat. 3) Choynakka suv quy. 4) Piyolaga quy.
- **Maslahat:** Choy solishdan oldin choynakda nima bo'lishi kerak?
- **Kutilgan natija:** To'g'ri tartib: suv quy → qaynat → choy sol → (kut) → piyolaga quy. Qadamlar tartibi o'zgarganda natija ham o'zgarishini tushuntiring.

### Topshiriq 1.4: Dasturlar atrofimizda
- **Turi:** kuzatish
- **Qiyinlik:** oson
- **Shart:** Bugun kun davomida ishlatgan kamida 5 ta dastur yoki ilovani yozing (masalan, Telegram, Click, kalkulyator). Har biri uchun bitta gapda "u nima qiladi?" deb javob bering.
- **Maslahat:** Telefoningizdagi ilovalar ro'yxatiga qarang.
- **Kutilgan natija:** 5 ta ilova va ularning vazifasi.

### Topshiriq 1.5: Savol-javob
- **Turi:** nazariy
- **Qiyinlik:** oson
- **Shart:** O'z so'zlaringiz bilan javob bering: (a) algoritm nima? (b) kompyuter nima uchun dasturlash tilini to'g'ridan-to'g'ri tushunmaydi? (c) "bug" nima?
- **Maslahat:** Darsdagi misollarni eslang.
- **Kutilgan natija:** Har bir savolga 1–2 gaplik tushunarli javob.

---

# 2-mavzu: Backend tushunchasi

`slug: backend-tushunchasi`

## Qisqacha mazmun
Veb-sayt yoki ilova ichida nima sodir bo'lishini, frontend va backend farqini va ma'lumotlar qanday harakatlanishini o'rganamiz.

## Qo'shimcha tushuntirish

**Restoran o'xshatishi**
Restoranni tasavvur qiling:
- **Zal (frontend):** mijoz ko'radigan joy. Menyu, stollar, ofitsiant. Foydalanuvchi ko'radigan va bosadigan hamma narsa.
- **Oshxona (backend):** mijoz ko'rmaydigan joy. Buyurtma shu yerda tayyorlanadi.
- **Ombor (ma'lumotlar bazasi):** masalliqlar saqlanadigan joy.
- **Ofitsiant (API):** zal va oshxona o'rtasida buyurtma va javobni olib yuradi.

**Frontend nima?**
Brauzerda yoki telefon ekranida ko'rinadigan qism: tugmalar, rasmlar, matnlar, formalar. U HTML, CSS, JavaScript (yoki mobil uchun Flutter kabi texnologiyalar) bilan yoziladi.

**Backend nima?**
Serverda ishlaydigan, foydalanuvchi to'g'ridan-to'g'ri ko'rmaydigan qism. Vazifalari:
- Foydalanuvchini tekshirish (login va parol)
- Ma'lumotlarni saqlash va o'qish
- Hisob-kitoblar (masalan, buyurtma narxi)
- Xavfsizlik (kim nimani ko'ra olishi)
- Boshqa xizmatlar bilan bog'lanish (to'lov tizimi, SMS)

**So'rov va javob (request / response)**
Hamma narsa shu sxema bo'yicha ishlaydi:
1. Foydalanuvchi tugma bosadi (masalan, "Kirish").
2. Brauzer serverga **so'rov** yuboradi.
3. Backend so'rovni qayta ishlaydi, kerak bo'lsa bazaga murojaat qiladi.
4. Backend **javob** qaytaradi.
5. Frontend javobni ekranda ko'rsatadi.

**Server nima?**
Server bu har doim yoqiq turadigan va so'rovlarga javob beradigan kompyuter (yoki bulutdagi virtual kompyuter). Uning vazifasi foydalanuvchilarga xizmat ko'rsatish.

**Ma'lumotlar bazasi nima?**
Ma'lumotlar tartibli saqlanadigan ombor. Masalan, o'quvchilar ro'yxati, ularning topshiriqlari, baholari. Bu saytdagi ma'lumotlar ham bazada saqlanadi.

**Backend uchun qaysi tillar bor?**
Python, JavaScript (Node.js), Java, Go, PHP, C# va boshqalar. Biz Python bilan boshlaymiz, chunki u o'qishga oson va backendda keng ishlatiladi (masalan, Django, FastAPI kutubxonalari).

## Asosiy tushunchalar
- **Frontend:** foydalanuvchi ko'radigan qism
- **Backend:** serverda ishlaydigan, ko'rinmas qism
- **Server:** so'rovlarga javob beruvchi kompyuter
- **So'rov (request):** mijozdan serverga yuboriladigan murojaat
- **Javob (response):** serverning qaytargan natijasi
- **API:** dasturlar bir-biri bilan gaplashadigan "ko'prik"
- **Ma'lumotlar bazasi:** ma'lumotlar saqlanadigan tartibli ombor

## Tez-tez uchraydigan xato tushunchalar
- "Backend bu faqat baza": yo'q, baza backendning bir qismi, xolos.
- "Frontend oson, backend qiyin (yoki aksincha)": ikkalasi ham o'z murakkabligiga ega, ular bir-birini to'ldiradi.
- "Parolni frontendda tekshirsa bo'ladi": xavfsiz tekshiruv doim backendda bo'lishi kerak.

## Resurslar
- [MDN: Client-server overview](https://developer.mozilla.org/en-US/docs/Learn/Server-side/First_steps/Client-Server_overview): mijoz-server aloqasi haqida (ingliz tilida)
- [MDN: Server-side nima?](https://developer.mozilla.org/en-US/docs/Learn/Server-side/First_steps/Introduction): backend haqida kirish
- [roadmap.sh: Backend](https://roadmap.sh/backend): backend dasturchi bo'lish uchun yo'l xaritasi
- [Django rasmiy sayti](https://www.djangoproject.com/): Python bilan backend yozish uchun mashhur freymvork (keyinchalik o'rganamiz)

## Topshiriqlar

### Topshiriq 2.1: Frontend yoki backend?
- **Turi:** tasniflash
- **Qiyinlik:** oson
- **Shart:** Har bir vazifa frontendga yoki backendga tegishli ekanini aniqlang: (a) tugma rangini o'zgartirish, (b) parolni tekshirish, (c) foydalanuvchi ma'lumotini bazaga saqlash, (d) menyuni ekranda chiroyli joylashtirish, (e) buyurtma narxini hisoblash, (f) rasmni ekranda ko'rsatish.
- **Maslahat:** Foydalanuvchi ko'radimi yoki serverda yashirin bajariladimi, shuni o'ylang.
- **Kutilgan natija:** Frontend: a, d, f. Backend: b, c, e.

### Topshiriq 2.2: Telegramga kirish jarayoni
- **Turi:** tahlil
- **Qiyinlik:** o'rta
- **Shart:** Bankning mobil ilovasida "Balansni ko'rish" tugmasi bosilganda nima sodir bo'lishini so'rov-javob sxemasi bo'yicha bosqichma-bosqich yozing (kamida 5 qadam). Qaysi qadam frontendda, qaysi biri backendda bajarilishini belgilang.
- **Maslahat:** Tugma bosiladi → so'rov ketadi → server tekshiradi → bazadan o'qiydi → javob qaytadi → ekranda ko'rinadi.
- **Kutilgan natija:** 5+ qadamli tartibli tavsif va har bir qadam uchun "frontend/backend" belgisi.

### Topshiriq 2.3: Restoran o'xshatishini davom ettir
- **Turi:** ijodiy
- **Qiyinlik:** o'rta
- **Shart:** Restoran o'xshatishini boshqa narsaga qo'llang (masalan, kutubxona, dorixona yoki taksi xizmati). "Frontend", "backend", "baza" va "API" nimaga to'g'ri kelishini yozing.
- **Maslahat:** Mijoz ko'radigan va ko'rmaydigan qismlarni ajrating.
- **Kutilgan natija:** 4 ta tushunchaning tanlangan misoldagi o'rni va qisqa izohi.

### Topshiriq 2.4: Saytni kuzat
- **Turi:** kuzatish
- **Qiyinlik:** oson
- **Shart:** Biror saytga (masalan, onlayn do'kon) kiring va 3 ta harakatni tanlang (qidirish, savatga qo'shish, kirish). Har biri uchun "backend nima qilgan bo'lishi mumkin?" degan savolga o'z taxminingizni yozing.
- **Maslahat:** Ma'lumot kerakmi? Demak, baza ishtirok etgan. Tekshiruv kerakmi? Demak, backend ishlagan.
- **Kutilgan natija:** 3 ta harakat va ularga mos backend ishlari haqida taxmin.

### Topshiriq 2.5: Savol-javob
- **Turi:** nazariy
- **Qiyinlik:** oson
- **Shart:** O'z so'zlaringiz bilan javob bering: (a) frontend va backend farqi nima? (b) server nima? (c) API nima uchun kerak? (d) parolni nega backendda tekshirish kerak?
- **Maslahat:** Restoran o'xshatishini eslang.
- **Kutilgan natija:** Har bir savolga 1–2 gaplik javob.

---

# 3-mavzu: Python tushunchasi

`slug: python-tushunchasi`

## Qisqacha mazmun
Python nima, nima uchun uni tanlaymiz, qayerlarda ishlatiladi va birinchi dasturimizni qanday ishga tushiramiz.

## Qo'shimcha tushuntirish

**Python nima?**
Python bu yuqori darajadagi, o'qishga oson dasturlash tili. 1991-yilda Gvido van Rossum tomonidan yaratilgan. Nomi ilon haqida emas, "Monty Python" komediya guruhi sharafiga qo'yilgan.

**Nega Python?**
- **Oddiy sintaksis:** kod ingliz tiliga yaqin va o'qishga oson
- **Ko'p yo'nalish:** veb-backend, ma'lumotlar tahlili, sun'iy intellekt, avtomatlashtirish, o'yinlar, Telegram botlar
- **Katta jamoa:** savol bersangiz, javob topish oson
- **Tayyor kutubxonalar:** ko'p ishni qaytadan yozish shart emas

**Python qayerlarda ishlatiladi?**
- Veb-saytlar (Django, FastAPI)
- Telegram botlar
- Ma'lumotlar tahlili va sun'iy intellekt
- Avtomatlashtirish (masalan, Excel hisobotlarini avtomatik tayyorlash)

**Python kodi qanday ishlaydi?**
Biz `.py` kengaytmali fayl yaratib, unga kod yozamiz. Python **interpretatori** kodni yuqoridan pastga, qatorma-qator o'qib bajaradi. Xato bo'lsa, bajarishni to'xtatib, xato haqida xabar beradi.

**Birinchi dastur**
```python
print("Salom, dunyo!")
```
Bu dastur ekranga matn chiqaradi. Dasturlashni o'rganishda deyarli hamma shu dasturdan boshlaydi.

**Python da bo'sh joy (indent) muhim**
Boshqa tillarda `{ }` qavslar ishlatiladi, Python da esa kod bloklari **chekinish (4 ta probel)** bilan belgilanadi. Hozircha bu keraksiz, lekin keyingi mavzularda juda muhim bo'ladi.

**Izohlar (comment)**
`#` belgisidan keyingi matn Python tomonidan e'tiborsiz qoldiriladi. Bu o'zingizga va boshqalarga tushuntirish uchun:
```python
# Bu izoh, Python buni bajarmaydi
print("Salom")  # Bu ham izoh
```

**Kodni qayerda yozamiz?**
- Kompyuteringizga Python o'rnatib, VS Code yoki PyCharm kabi muharrirda
- Brauzerda (o'rnatmasdan): onlayn muharrirlar

## Asosiy tushunchalar
- **Python:** oddiy va keng qo'llaniladigan dasturlash tili
- **Interpretator:** kodni qator-qator bajaruvchi dastur
- **`.py` fayl:** Python kodi saqlanadigan fayl
- **Sintaksis:** tilning yozuv qoidalari
- **Izoh (`#`):** Python bajarmaydigan tushuntirish matni
- **Chekinish (indent):** kod bloklarini ajratuvchi bo'sh joy

## Kod namunalari
```python
# 1. Oddiy chiqarish
print("Salom, Python!")

# 2. Bir nechta qator
print("Mening ismim Ali")
print("Men Python o'rganyapman")

# 3. Oddiy hisob-kitob
print(5 + 3)
print(10 * 2)
```

## Tez-tez uchraydigan xatolar
- **Qo'shtirnoqni yopmaslik:** `print("Salom)` xato beradi.
- **Katta-kichik harf:** `Print("Salom")` ishlamaydi, to'g'risi `print`.
- **Qavsni unutish:** `print "Salom"` Python 3 da xato.
- **Matnni qo'shtirnoqsiz yozish:** `print(Salom)` Python uchun "Salom" nomli o'zgaruvchini qidiradi va topa olmaydi.

## Resurslar
- [Python.org: rasmiy sayt](https://www.python.org/): yuklab olish va yangiliklar
- [Python rasmiy qo'llanmasi (tutorial)](https://docs.python.org/3/tutorial/index.html): ingliz tilida, eng ishonchli manba
- [W3Schools: Python kirish](https://www.w3schools.com/python/python_intro.asp): qisqa va misolli tushuntirishlar
- [W3Schools: Python Try it](https://www.w3schools.com/python/trypython.asp?filename=demo_default): brauzerning o'zida kod sinab ko'rish
- [Real Python](https://realpython.com/): chuqurroq maqolalar (keyinroq foydali)

## Topshiriqlar

### Topshiriq 3.1: Birinchi dastur
- **Turi:** kod
- **Qiyinlik:** oson
- **Shart:** `print()` yordamida ekranga "Salom, men Python o'rganyapman!" matnini chiqaring.
- **Maslahat:** Matn qo'shtirnoq ichida bo'lishi kerak.
- **Kutilgan natija:**
```
Salom, men Python o'rganyapman!
```

### Topshiriq 3.2: Tanishtiruv
- **Turi:** kod
- **Qiyinlik:** oson
- **Shart:** Ekranga 3 qator chiqaring: ismingiz, yoshingiz va yashash shahringiz. Har biri alohida `print()` bilan bo'lsin.
- **Maslahat:** Uchta alohida `print()` yozing.
- **Kutilgan natija:** (qiymatlar sizniki bo'ladi)
```
Ismim: Ali
Yoshim: 17
Shahrim: Toshkent
```

### Topshiriq 3.3: Izoh qo'shish
- **Turi:** kod
- **Qiyinlik:** oson
- **Shart:** 3.2-topshiriq kodiga `#` yordamida kamida 2 ta izoh qo'shing. Izoh kod nima qilayotganini tushuntirsin. Dasturni ishga tushirib, izohlar natijaga ta'sir qilmasligini tekshiring.
- **Maslahat:** `# Bu yerda ismim chiqariladi`
- **Kutilgan natija:** Chiqish 3.2 bilan bir xil, kodda esa izohlar bor.

### Topshiriq 3.4: Xatoni top va tuzat
- **Turi:** xato qidirish
- **Qiyinlik:** o'rta
- **Shart:** Quyidagi kodda 3 ta xato bor. Toping va tuzating:
```python
Print("Salom)
print(Men dasturchiman)
print("Python yoqadi"
```
- **Maslahat:** Birinchi qatorda katta harf va qo'shtirnoq, ikkinchisida qo'shtirnoq, uchinchisida qavs.
- **Kutilgan natija:**
```python
print("Salom")
print("Men dasturchiman")
print("Python yoqadi")
```

### Topshiriq 3.5: Python haqida mini-tadqiqot
- **Turi:** yozma
- **Qiyinlik:** o'rta
- **Shart:** Python qo'llaniladigan 3 ta sohani toping va har biri uchun bitta real misol (kompaniya yoki mahsulot) yozing. Eng qiziq ko'ringan sohani va nima uchun qiziqligini yozing.
- **Maslahat:** Internetda "what is Python used for" deb qidirib ko'ring.
- **Kutilgan natija:** 3 ta soha, misollar va 2–3 gaplik fikr.

---

# 4-mavzu: print() va o'zgaruvchilar

`slug: print-va-ozgaruvchilar`

## Qisqacha mazmun
`print()` funksiyasining imkoniyatlarini va ma'lumotni nomlab saqlash uchun o'zgaruvchilarni o'rganamiz.

## Qo'shimcha tushuntirish

**print() chuqurroq**

`print()` ekranga ma'lumot chiqaradi. Uning bir nechta foydali imkoniyati bor:

```python
# Bir nechta qiymat (vergul bilan), orasiga probel qo'yiladi
print("Ali", "Vali", "Sardor")      # Ali Vali Sardor

# sep: qiymatlar orasidagi ajratgich
print("Ali", "Vali", "Sardor", sep=", ")   # Ali, Vali, Sardor

# end: qator oxirida nima chiqishi (odatda yangi qator)
print("Salom", end=" ")
print("dunyo")                        # Salom dunyo (bir qatorda)

# \n: yangi qator belgisi
print("Birinchi qator\nIkkinchi qator")
```

**O'zgaruvchi nima?**
O'zgaruvchi bu ma'lumot saqlanadigan **nomlangan quti**. Quti ustiga yorliq yopishtiramiz (nom), ichiga narsa solamiz (qiymat).

```python
ism = "Ali"
yosh = 17
print(ism)
print(yosh)
```

Bu yerda `=` belgisi "teng" degani emas, "**qiymat berish**" degani: o'ng tomondagi qiymatni chap tomondagi nomga saqlaydi.

**Qiymatni o'zgartirish**
O'zgaruvchi nomi "o'zgaruvchi" deyilishining sababi shu:
```python
ball = 50
print(ball)    # 50
ball = 75
print(ball)    # 75
```

**O'zgaruvchi nomlash qoidalari**
- Harf yoki `_` bilan boshlanishi kerak (raqam bilan emas)
- Faqat harf, raqam va `_` bo'lishi mumkin (probel va `-` bo'lmaydi)
- Katta-kichik harf farq qiladi: `yosh` va `Yosh` boshqa-boshqa o'zgaruvchi
- Python ning maxsus so'zlari (`print`, `if`, `for` va h.k.) nom bo'la olmaydi

**Yaxshi nomlash**
Kod boshqalar (va kelajakdagi o'zingiz) o'qiydigan matn. Ma'noli nom tanlang:
```python
# Yomon
a = 17
b = "Ali"

# Yaxshi
yosh = 17
ism = "Ali"
```
Python da odatda `kichik_harf_bilan_va_pastki_chiziq` (snake_case) uslubi ishlatiladi: `talaba_ismi`, `umumiy_ball`.

**O'zgaruvchilarni matn ichida chiqarish: f-string**
```python
ism = "Ali"
yosh = 17
print(f"Mening ismim {ism}, men {yosh} yoshdaman.")
```
`f` harfi va `{ }` qavslar o'zgaruvchi qiymatini matn ichiga joylaydi. Bu eng qulay usul.

**Bir nechta o'zgaruvchiga bir vaqtda qiymat berish**
```python
x, y, z = 1, 2, 3
a = b = 0
```

**O'zgaruvchilar bilan amallar**
```python
narx = 12000
soni = 3
jami = narx * soni
print(jami)    # 36000
```

## Asosiy tushunchalar
- **`print()`:** ekranga chiqaruvchi funksiya
- **`sep`:** `print()` da qiymatlar orasidagi ajratgich
- **`end`:** `print()` oxirida chiqadigan belgi
- **O'zgaruvchi:** nomlangan ma'lumot saqlash joyi
- **Qiymat berish (`=`):** o'ng tomondagini chapdagi nomga saqlash
- **f-string:** matn ichiga o'zgaruvchi joylash usuli
- **snake_case:** nomlarni `kichik_harf_bilan` yozish uslubi

## Tez-tez uchraydigan xatolar
- **O'zgaruvchini e'lon qilmasdan ishlatish:** `print(ism)` oldin `ism = ...` bo'lmasa, `NameError` beradi.
- **Raqam bilan boshlash:** `1ism = "Ali"` xato.
- **Probel bilan nom:** `talaba ismi = "Ali"` xato, to'g'risi `talaba_ismi`.
- **Matnni qo'shtirnoqsiz yozish:** `ism = Ali` Python uchun `Ali` nomli o'zgaruvchi topilmaydi.
- **`=` ni tenglik deb o'ylash:** `=` qiymat beradi, tenglikni tekshirish boshqa belgi bilan (keyinroq o'tamiz).
- **f-string da `f` ni unutish:** `print("Ismim {ism}")` o'zgaruvchi qiymatini emas, `{ism}` matnining o'zini chiqaradi.

## Resurslar
- [Python docs: print() funksiyasi](https://docs.python.org/3/library/functions.html#print): rasmiy hujjat
- [W3Schools: Python o'zgaruvchilar](https://www.w3schools.com/python/python_variables.asp): misollar bilan
- [W3Schools: o'zgaruvchi nomlari](https://www.w3schools.com/python/python_variables_names.asp): nomlash qoidalari
- [W3Schools: f-string](https://www.w3schools.com/python/python_string_formatting.asp): matn formatlash
- [Real Python: Python Variables](https://realpython.com/python-variables/): chuqurroq tushuntirish

## Topshiriqlar

### Topshiriq 4.1: Kartochka
- **Turi:** kod
- **Qiyinlik:** oson
- **Shart:** `ism`, `yosh`, `shahar` o'zgaruvchilarini yarating va ularni `print()` bilan 3 qatorda chiqaring.
- **Maslahat:** `ism = "Ali"` kabi, matnlar qo'shtirnoqda, raqam qo'shtirnoqsiz.
- **Kutilgan natija:** 3 qator, har birida o'zgaruvchi qiymati.

### Topshiriq 4.2: f-string bilan tanishtiruv
- **Turi:** kod
- **Qiyinlik:** oson
- **Shart:** 4.1 dagi o'zgaruvchilardan foydalanib, bitta f-string bilan quyidagicha gap chiqaring: `Mening ismim Ali, men 17 yoshdaman va Toshkentda yashayman.` (qiymatlar sizniki).
- **Maslahat:** `print(f"... {ism} ... {yosh} ...")`
- **Kutilgan natija:** Bitta qatorda to'liq gap.

### Topshiriq 4.3: sep va end
- **Turi:** kod
- **Qiyinlik:** o'rta
- **Shart:** Faqat `print()` ning `sep` va `end` parametrlaridan foydalanib quyidagi natijani oling:
```
Python-dasturlash-tili!
```
Ya'ni `"Python"`, `"dasturlash"`, `"tili"` so'zlarini bitta `print()` bilan "-" ajratgichi bilan, oxirida "!" belgisi bilan chiqaring.
- **Maslahat:** `sep="-"` va `end="!"`. Oxirida yangi qator bo'lmasligi uchun nima qilish kerakligini o'ylab ko'ring.
- **Kutilgan natija:** `Python-dasturlash-tili!`

### Topshiriq 4.4: Do'kon hisobi
- **Turi:** kod
- **Qiyinlik:** o'rta
- **Shart:** Do'konda 1 kg olma narxi 14000 so'm. Siz 3 kg olma va 2 kg nok (1 kg nok 18000 so'm) olmoqchisiz. O'zgaruvchilar yordamida (`olma_narxi`, `olma_kg`, `nok_narxi`, `nok_kg`) umumiy summani hisoblab, f-string bilan chiqaring.
- **Maslahat:** `jami = olma_narxi * olma_kg + nok_narxi * nok_kg`
- **Kutilgan natija:**
```
Jami to'lov: 78000 so'm
```

### Topshiriq 4.5: Qiymat almashtirish
- **Turi:** mantiqiy
- **Qiyinlik:** qiyin
- **Shart:** `a = 5` va `b = 10` berilgan. Ularning qiymatlarini almashtiring (a = 10, b = 5 bo'lsin). Avval uchinchi o'zgaruvchi yordamida, keyin Python ning qisqa usulida bajaring.
- **Maslahat:** Ikki stakan suyuqlikni almashtirish uchun uchinchi bo'sh stakan kerak bo'ladi. Python da esa `a, b = b, a` ishlaydi.
- **Kutilgan natija:**
```
a = 10
b = 5
```

### Topshiriq 4.6: Xatoni top
- **Turi:** xato qidirish
- **Qiyinlik:** o'rta
- **Shart:** Quyidagi koddagi xatolarni toping va tuzating:
```python
1-ism = "Ali"
talaba yoshi = 17
print("Ism: {ism}")
print(talaba_yoshi)
```
- **Maslahat:** Nomlash qoidalari va f-stringdagi `f` ni eslang.
- **Kutilgan natija:**
```python
ism = "Ali"
talaba_yoshi = 17
print(f"Ism: {ism}")
print(talaba_yoshi)
```

---

# 5-mavzu: Ma'lumot turlari: int, str, float, bool

`slug: malumot-turlari`

## Qisqacha mazmun
Python dagi asosiy ma'lumot turlarini (butun son, matn, kasr son, mantiqiy qiymat) va ular o'rtasidagi farqlarni o'rganamiz.

## Qo'shimcha tushuntirish

**Nima uchun turlar kerak?**
Kompyuter uchun `5` (son) va `"5"` (matn) bir xil emas. Sonlar bilan hisob-kitob qilinadi, matn bilan esa yozuv ustida ishlanadi. Ma'lumot turi Python ga "bu qiymat bilan nima qilish mumkin" degan savolga javob beradi.

**4 ta asosiy tur**

| Tur | Nomi | Misol | Nima uchun |
|---|---|---|---|
| `int` | butun son | `17`, `-5`, `0` | yosh, soni, tartib raqami |
| `float` | kasr son | `3.14`, `-0.5`, `12000.0` | narx, vazn, o'rtacha ball |
| `str` | matn | `"Ali"`, `"Toshkent"`, `"5"` | ism, manzil, xabar |
| `bool` | mantiqiy qiymat | `True`, `False` | ha/yo'q, to'g'ri/noto'g'ri |

**Turni aniqlash: `type()`**
```python
print(type(17))        # <class 'int'>
print(type(3.14))      # <class 'float'>
print(type("Ali"))     # <class 'str'>
print(type(True))      # <class 'bool'>
```

**int: butun sonlar**
```python
yosh = 17
print(yosh + 3)    # 20
print(yosh * 2)    # 34
print(7 // 2)      # 3  (butun bo'lish)
print(7 % 2)       # 1  (qoldiq)
print(2 ** 3)      # 8  (daraja)
print(7 / 2)       # 3.5 (oddiy bo'lish har doim float beradi)
```

**float: kasr sonlar**
Kasr qismi nuqta bilan yoziladi (vergul bilan emas): `3.14`.
```python
narx = 12500.50
print(narx * 2)    # 25001.0
```
Diqqat: kasr sonlar kompyuterda taxminiy saqlanadi:
```python
print(0.1 + 0.2)   # 0.30000000000000004
```
Bu xato emas, kompyuterlar kasrlarni shunday saqlaydi. Pul bilan ishlaganda buni eslab qoling (keyinroq maxsus yechimlarni o'rganamiz).

**str: matn**
Matn qo'shtirnoq (`"..."` yoki `'...'`) ichida yoziladi.
```python
ism = "Ali"
familiya = 'Valiyev'
print(ism + " " + familiya)   # Ali Valiyev (birlashtirish)
print(ism * 3)                # AliAliAli (takrorlash)
print(len(ism))               # 3 (uzunligi)
```
Eng muhim farq:
```python
print("5" + "3")   # 53  (matnlar yopishadi)
print(5 + 3)       # 8   (sonlar qo'shiladi)
```

**bool: mantiqiy qiymat**
Faqat ikki qiymat: `True` (rost) va `False` (yolg'on). Birinchi harf katta bo'lishi shart.
```python
print(5 > 3)       # True
print(5 == 3)      # False  (tenglikni tekshirish: ikkita =)
print(10 != 7)     # True   (teng emas)
```
bool qiymatlari shartli dasturlashda (keyingi mavzular) asosiy rol o'ynaydi.

**Turlarni o'zgartirish (type casting)**
```python
print(int("25"))        # 25   (matn -> butun son)
print(float("3.5"))     # 3.5  (matn -> kasr)
print(str(100))         # "100" (son -> matn)
print(int(3.9))         # 3    (kasr -> butun, qismi kesib tashlanadi, yaxlitlanmaydi)
print(bool(0))          # False
print(bool(5))          # True
print(bool(""))         # False (bo'sh matn)
print(bool("salom"))    # True
```
Qoida: bo'sh yoki nol qiymatlar `False`, qolganlari `True` hisoblanadi.

**Turlarni aralashtirish xatosi**
```python
yosh = 17
print("Yoshim: " + yosh)      # TypeError!
print("Yoshim: " + str(yosh)) # to'g'ri
print(f"Yoshim: {yosh}")      # eng qulay yo'l
```

## Asosiy tushunchalar
- **int:** butun sonlar
- **float:** kasr sonlar (nuqta bilan)
- **str:** matn (qo'shtirnoq ichida)
- **bool:** `True` yoki `False`
- **`type()`:** qiymat turini ko'rsatadi
- **Type casting:** turni o'zgartirish (`int()`, `float()`, `str()`, `bool()`)
- **`len()`:** matn uzunligini beradi
- **Taqqoslash amallari:** `==`, `!=`, `>`, `<`, `>=`, `<=`

## Tez-tez uchraydigan xatolar
- **"5" + 3:** matn va sonni qo'shib bo'lmaydi (`TypeError`).
- **`true` yoki `false` (kichik harf):** to'g'risi `True`, `False`.
- **`=` va `==` ni aralashtirish:** `=` qiymat beradi, `==` tenglikni tekshiradi.
- **Kasrda vergul ishlatish:** `3,14` emas, `3.14`.
- **`int("3.5")`:** bu xato beradi. Avval `float("3.5")`, keyin `int(...)` kerak.
- **`int(3.9)` yaxlitlaydi deb o'ylash:** u qismini kesib tashlaydi (natija 3).

## Resurslar
- [Python docs: ichki turlar (built-in types)](https://docs.python.org/3/library/stdtypes.html): rasmiy hujjat
- [W3Schools: Python Data Types](https://www.w3schools.com/python/python_datatypes.asp): umumiy tur ro'yxati
- [W3Schools: Python Numbers](https://www.w3schools.com/python/python_numbers.asp): sonlar haqida
- [W3Schools: Python Casting](https://www.w3schools.com/python/python_casting.asp): turni o'zgartirish
- [W3Schools: Python Booleans](https://www.w3schools.com/python/python_booleans.asp): bool haqida
- [Real Python: Basic Data Types](https://realpython.com/python-data-types/): chuqurroq tushuntirish

## Topshiriqlar

### Topshiriq 5.1: Turlarni aniqla
- **Turi:** nazariy + kod
- **Qiyinlik:** oson
- **Shart:** Har bir qiymatning turini avval o'zingiz taxmin qiling, keyin `type()` bilan tekshiring: `42`, `"42"`, `4.2`, `True`, `"True"`, `-7`, `0.0`, `""`.
- **Maslahat:** Qo'shtirnoq ichidagi hamma narsa `str`.
- **Kutilgan natija:** `int`, `str`, `float`, `bool`, `str`, `int`, `float`, `str`.

### Topshiriq 5.2: Bashorat qil
- **Turi:** nazariy
- **Qiyinlik:** o'rta
- **Shart:** Quyidagi qatorlar nima chiqarishini avval yozing, keyin kompyuterda tekshiring:
```python
print(10 / 4)
print(10 // 4)
print(10 % 4)
print("10" + "4")
print("10" * 3)
print(2 ** 5)
print(int(7.9))
print(bool(""))
```
- **Maslahat:** `/`, `//`, `%` amallarini darsdagi misollar bilan solishtiring.
- **Kutilgan natija:** `2.5`, `2`, `2`, `104`, `101010`, `32`, `7`, `False`.

### Topshiriq 5.3: Talaba ma'lumoti
- **Turi:** kod
- **Qiyinlik:** o'rta
- **Shart:** Bitta talaba haqida 4 ta o'zgaruvchi yarating, har biri turli turda: `ism` (str), `yosh` (int), `ortacha_ball` (float), `kontrakt_tolangan` (bool). Har birini turi bilan birga chiqaring:
```
ism: Ali -> <class 'str'>
```
va hokazo.
- **Maslahat:** `print(f"ism: {ism} -> {type(ism)}")`
- **Kutilgan natija:** 4 ta qator, har birida qiymat va uning turi.

### Topshiriq 5.4: Turni o'zgartirish
- **Turi:** kod
- **Qiyinlik:** o'rta
- **Shart:** `a = "15"` va `b = "27"` matnlari berilgan. Ularni sonlarga aylantirib, yig'indisini toping va `"15 + 27 = 42"` ko'rinishida chiqaring.
- **Maslahat:** `int(a) + int(b)` va f-string.
- **Kutilgan natija:** `15 + 27 = 42`

### Topshiriq 5.5: Yosh hisoblagich
- **Turi:** kod
- **Qiyinlik:** o'rta
- **Shart:** `tugilgan_yil = 2008` va `hozirgi_yil = 2026` o'zgaruvchilari berilgan. Yoshni hisoblang va quyidagicha chiqaring: `Siz 18 yoshdasiz. Voyaga yetganmi: True` (`yosh >= 18` natijasini bool sifatida chiqaring).
- **Maslahat:** `yosh = hozirgi_yil - tugilgan_yil`, `voyaga_yetgan = yosh >= 18`.
- **Kutilgan natija:** `Siz 18 yoshdasiz. Voyaga yetganmi: True`

### Topshiriq 5.6: Xatoni top
- **Turi:** xato qidirish
- **Qiyinlik:** o'rta
- **Shart:** Quyidagi kod xato beradi. Sababini tushuntiring va 2 xil usulda tuzating:
```python
yosh = 17
print("Mening yoshim " + yosh)
```
- **Maslahat:** `str()` yoki f-string.
- **Kutilgan natija:** Sabab: matn bilan sonni `+` bilan qo'shib bo'lmaydi (`TypeError`). Tuzatish: `"..." + str(yosh)` yoki `f"Mening yoshim {yosh}"`.

### Topshiriq 5.7: Taqqoslash
- **Turi:** kod
- **Qiyinlik:** o'rta
- **Shart:** `ball = 72` o'zgaruvchisi berilgan. Quyidagi savollarning natijasini (`True` yoki `False`) chiqaring: ball 60 dan kattami? ball 100 ga tengmi? ball 50 ga teng emasmi? ball 70 dan kichik yoki tengmi?
- **Maslahat:** `>`, `==`, `!=`, `<=` operatorlarini ishlating.
- **Kutilgan natija:** `True`, `False`, `True`, `False`.

---

# 6-mavzu: input()

`slug: input-funksiyasi`

## Qisqacha mazmun
Foydalanuvchidan ma'lumot qabul qilishni va uni kerakli turga aylantirib ishlatishni o'rganamiz.

## Qo'shimcha tushuntirish

**input() nima qiladi?**
Shu paytgacha dasturlarimiz faqat ma'lumot **chiqarar** edi. `input()` yordamida dastur foydalanuvchidan ma'lumot **so'raydi** va kutadi. Foydalanuvchi yozib, Enter bosgach, dastur davom etadi.

```python
ism = input("Ismingiz nima? ")
print(f"Salom, {ism}!")
```
Qavs ichidagi matn foydalanuvchiga ko'rsatiladigan **savol (prompt)**.

**Eng muhim qoida: input() har doim str qaytaradi**
Foydalanuvchi `17` deb yozsa ham, Python uni son emas, `"17"` matni sifatida oladi:
```python
yosh = input("Yoshingiz: ")
print(type(yosh))      # <class 'str'>
```
Shuning uchun hisob-kitob qilishdan oldin turni o'zgartirish kerak:
```python
yosh = int(input("Yoshingiz: "))
print(yosh + 1)
```

**Nima uchun bu muhim?**
```python
a = input("Birinchi son: ")    # 5 kiritildi
b = input("Ikkinchi son: ")    # 3 kiritildi
print(a + b)                    # 53 (matnlar yopishdi!)

a = int(input("Birinchi son: "))
b = int(input("Ikkinchi son: "))
print(a + b)                    # 8
```

**Qaysi turga aylantirish kerak?**
- Butun son kerak bo'lsa (yosh, soni): `int(input(...))`
- Kasr son kerak bo'lsa (narx, vazn): `float(input(...))`
- Matn kerak bo'lsa (ism, manzil): shunchaki `input(...)`

**Dastur namunasi: oddiy kalkulyator**
```python
son1 = float(input("Birinchi son: "))
son2 = float(input("Ikkinchi son: "))

print(f"Yig'indi: {son1 + son2}")
print(f"Ayirma: {son1 - son2}")
print(f"Ko'paytma: {son1 * son2}")
print(f"Bo'linma: {son1 / son2}")
```

**Yaxshi so'rov yozish**
Foydalanuvchi nima kiritishni tushunishi uchun savol aniq bo'lsin:
```python
# Yomon
x = input()

# Yaxshi
yosh = int(input("Yoshingizni kiriting: "))
```

**Xatolarga ehtiyot bo'lish**
Agar foydalanuvchi son o'rniga matn kiritsa:
```python
yosh = int(input("Yoshingiz: "))   # "abc" kiritilsa -> ValueError
```
Bu xatoni qanday boshqarishni keyingi mavzularda (xatoliklarni ushlash) o'rganamiz. Hozircha dasturimizni to'g'ri kiritiladi deb yozamiz va sinab ko'rayotganda to'g'ri qiymat kiritamiz.

**Ma'lumot qabul qilib, qayta ishlab, chiqarish**
Deyarli har bir dastur shu uch bosqichdan iborat:
1. **Kirish:** `input()`
2. **Qayta ishlash:** hisob-kitoblar
3. **Chiqish:** `print()`

## Asosiy tushunchalar
- **`input()`:** foydalanuvchidan ma'lumot oluvchi funksiya
- **Prompt:** `input()` qavsidagi savol matni
- **Qaytish turi:** `input()` har doim `str` beradi
- **`int(input())`:** kiritilgan matnni butun songa aylantirish
- **`float(input())`:** kiritilgan matnni kasr songa aylantirish
- **`ValueError`:** noto'g'ri formatda kiritilganda chiqadigan xato

## Tez-tez uchraydigan xatolar
- **Turni o'zgartirmaslik:** `input()` natijasi bilan hisoblab, `"5" + "3" = "53"` kabi natija olish.
- **`int()` ni unutish:** `yosh = input(...)` keyin `yosh + 1` bu `TypeError` beradi.
- **Kasr kiritishda `int()` ishlatish:** `int(input())` ga `3.5` kiritilsa xato bo'ladi; `float()` ishlating.
- **Kasrda vergul kiritish:** `3,5` emas, `3.5` kiritilishi kerak.
- **Prompt'ni bo'sh qoldirish:** foydalanuvchi nima kiritishni bilmay qoladi.
- **Prompt oxirida probel qoldirmaslik:** `input("Ism:")` javob yozuvga yopishib qoladi. `input("Ism: ")` qulayroq.

## Resurslar
- [Python docs: input()](https://docs.python.org/3/library/functions.html#input): rasmiy hujjat
- [W3Schools: Python User Input](https://www.w3schools.com/python/python_user_input.asp): qisqa misollar
- [Real Python: Basic Input and Output](https://realpython.com/python-input-output/): chuqurroq tushuntirish
- [Programiz: Python input()](https://www.programiz.com/python-programming/methods/built-in/input): qo'shimcha misollar

## Topshiriqlar

### Topshiriq 6.1: Salomlashuv
- **Turi:** kod
- **Qiyinlik:** oson
- **Shart:** Foydalanuvchidan ismini so'rang va `Salom, [ism]! Python kursiga xush kelibsiz!` deb javob bering.
- **Maslahat:** `ism = input("Ismingiz: ")` va f-string.
- **Kutilgan natija:** (Ali kiritilsa)
```
Salom, Ali! Python kursiga xush kelibsiz!
```

### Topshiriq 6.2: Kelasi yil necha yoshda bo'laman?
- **Turi:** kod
- **Qiyinlik:** oson
- **Shart:** Foydalanuvchidan yoshini so'rang va kelasi yili necha yoshda bo'lishini chiqaring.
- **Maslahat:** `yosh = int(input(...))`, keyin `yosh + 1`.
- **Kutilgan natija:** (17 kiritilsa)
```
Kelasi yili siz 18 yoshda bo'lasiz.
```

### Topshiriq 6.3: Ikki son yig'indisi
- **Turi:** kod
- **Qiyinlik:** oson
- **Shart:** Foydalanuvchidan ikkita butun son so'rang va ularning yig'indisi, ayirmasi, ko'paytmasi va butun bo'linmasini chiqaring.
- **Maslahat:** Ikkala sonni ham `int(input())` bilan oling.
- **Kutilgan natija:** (8 va 3 kiritilsa)
```
Yig'indi: 11
Ayirma: 5
Ko'paytma: 24
Butun bo'linma: 2
```

### Topshiriq 6.4: Do'kon kassasi
- **Turi:** kod
- **Qiyinlik:** o'rta
- **Shart:** Foydalanuvchidan mahsulot nomini, bir dona narxini (so'mda) va nechta olmoqchi ekanini so'rang. Umumiy summani hisoblab chiqaring.
- **Maslahat:** Narx va sonni `int()` ga aylantiring, nomi esa matn bo'lib qoladi.
- **Kutilgan natija:** (non, 4000, 5 kiritilsa)
```
Mahsulot: non
Jami to'lov: 20000 so'm
```

### Topshiriq 6.5: Doira yuzi
- **Turi:** kod
- **Qiyinlik:** o'rta
- **Shart:** Foydalanuvchidan doira radiusini (kasr son bo'lishi mumkin) so'rang va yuzini hisoblang (π ≈ 3.14, formula: `3.14 * r * r`).
- **Maslahat:** Radiusni `float(input())` bilan oling.
- **Kutilgan natija:** (radius 5 kiritilsa)
```
Doira yuzi: 78.5
```

### Topshiriq 6.6: Harorat konvertori
- **Turi:** kod
- **Qiyinlik:** o'rta
- **Shart:** Foydalanuvchidan Selsiy bo'yicha haroratni so'rang va Farengeytga aylantiring. Formula: `F = C * 9 / 5 + 32`.
- **Maslahat:** Harorat kasr bo'lishi mumkin, shuning uchun `float()` ishlating.
- **Kutilgan natija:** (25 kiritilsa)
```
25.0°C = 77.0°F
```

### Topshiriq 6.7: Xatoni top
- **Turi:** xato qidirish
- **Qiyinlik:** o'rta
- **Shart:** Quyidagi dastur noto'g'ri natija beradi. Nima uchun va qanday tuzatish mumkinligini tushuntiring:
```python
a = input("Birinchi son: ")
b = input("Ikkinchi son: ")
print("Yig'indi:", a + b)
```
(4 va 6 kiritilganda `46` chiqadi.)
- **Maslahat:** `input()` qaysi turni qaytaradi?
- **Kutilgan natija:** Sabab: `input()` matn qaytaradi, matnlar `+` bilan yopishadi. Tuzatish: `int(input(...))` ishlatish.

### Topshiriq 6.8: Mini loyiha: "Tanishuv anketasi"
- **Turi:** loyiha
- **Qiyinlik:** qiyin
- **Shart:** Foydalanuvchidan ism, familiya, tug'ilgan yil va shahrini so'rang. Hozirgi yilni o'zingiz o'zgaruvchiga yozing (2026). Quyidagi ko'rinishda chiroyli anketa chiqaring:
```
===== ANKETA =====
Ism: Ali
Familiya: Valiyev
Yosh: 18
Shahar: Toshkent
==================
```
Yoshni tug'ilgan yildan hisoblang.
- **Maslahat:** `yosh = hozirgi_yil - tugilgan_yil`; chiziqlar uchun `print("=" * 18)` kabi ishlatish mumkin.
- **Kutilgan natija:** Yuqoridagi shaklda chiqish.

---

# Qo'shimcha: umumiy takrorlash topshiriqlari (1–6-mavzular)

`slug: umumiy-takrorlash`

Bu bo'lim alohida sahifa bo'lib, barcha mavzular bo'yicha bilimni mustahkamlaydi.

### Takrorlash 1: Mavzularni bog'la
- **Turi:** nazariy
- **Qiyinlik:** o'rta
- **Shart:** Quyidagi tushunchalarni mos mavzuga joylang: algoritm, API, interpretator, f-string, bool, request/response, `type()`, `input()`, snake_case, ma'lumotlar bazasi.
- **Kutilgan natija:** Har bir tushuncha tegishli mavzu (1–6) ostida.

### Takrorlash 2: Yagona dastur
- **Turi:** loyiha
- **Qiyinlik:** qiyin
- **Shart:** Foydalanuvchidan ismini, yoshini va oylik maoshini (so'mda, butun son) so'rang. Dastur quyidagilarni chiqarsin: ism bilan salomlashuv, yilda necha so'm ishlashi (12 oy), 5 yildan keyingi yoshi, va "Yoshi 18 dan katta: True/False" ko'rinishida bool natija.
- **Maslahat:** Kirish → qayta ishlash → chiqish tartibida yozing. Har bir `input()` ni mos turga aylantiring.
- **Kutilgan natija:** (Ali, 17, 3000000 kiritilsa)
```
Salom, Ali!
Yillik daromad: 36000000 so'm
5 yildan keyin yoshingiz: 22
Yoshi 18 dan katta: False
```
