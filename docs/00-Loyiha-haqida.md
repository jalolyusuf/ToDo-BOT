# 00 - Loyiha haqida

> **Hujjat versiyasi:** 1.0  
> **Loyiha nomi:** ToDo-BOT  
> **Loyiha turi:** Telegram Mini App  
> **Asosiy platforma:** Telegram  
> **Muallif:** Jaloliddin Yusuf

---

# Mundarija

1. Loyiha haqida
2. Loyiha maqsadi
3. Muammoning tavsifi
4. Tanlangan texnologiyalar
5. Nima uchun aynan shu texnologiyalar?
6. Loyiha arxitekturasi
7. Loyiha ishlash prinsipi
8. Foydalanuvchi oqimi (User Flow)
9. Administrator vazifalari
10. Kelajakdagi rivojlanish rejasi

---

# 1. Loyiha haqida

**ToDo-BOT** — bu Telegram ichida ishlaydigan zamonaviy **Task Management** (vazifalarni boshqarish) tizimi.

Loyiha foydalanuvchilarga Telegram ilovasidan chiqmasdan:

- vazifa yaratish;
- vazifalarni boshqarish;
- jamoa bilan ishlash;
- bildirishnomalar olish;
- bajarilish jarayonini kuzatish

imkoniyatini beradi.

Ilova **Telegram Mini App** texnologiyasi asosida ishlaydi.

Barcha biznes logika server tomonida (FastAPI) bajariladi.

Frontend React yordamida yozilgan.

Ma'lumotlar PostgreSQL bazasida saqlanadi.

Redis esa vaqtinchalik ma'lumotlar va tezkor ishlov berish uchun ishlatiladi.

---

# 2. Loyiha maqsadi

Loyihaning asosiy maqsadi:

Telegram foydalanuvchilari uchun xavfsiz, tezkor va zamonaviy vazifalarni boshqarish tizimini yaratish.

Kelajakda ushbu loyiha:

- kompaniyalar;
- ofislar;
- ishlab chiqarish korxonalari;
- ta'lim muassasalari;
- kichik jamoalar

uchun foydalanilishi rejalashtirilgan.

---

# 3. Nima uchun aynan Telegram?

Bugungi kunda Telegram:

- tez ishlaydi;
- deyarli barcha platformalarda mavjud;
- foydalanuvchilarning aksariyat telefonlarida o'rnatilgan.

Shu sababli foydalanuvchi alohida Android yoki iOS ilovasini o'rnatishi shart emas.

Mini App Telegram ichida ochiladi.

Natijada:

- login kerak emas;
- parol kerak emas;
- foydalanuvchi avtomatik aniqlanadi.

---

# 4. Loyihaning asosiy imkoniyatlari

Hozirgi imkoniyatlar

- Telegram Mini App
- FastAPI Backend
- React Frontend
- Docker Compose
- PostgreSQL
- Redis
- HTTPS
- Nginx Reverse Proxy
- Let's Encrypt SSL

Kelajakdagi imkoniyatlar

- Workspace
- Guruhlar
- Rollar
- Task CRUD
- Deadline
- Calendar
- Notification
- File Upload
- Dashboard
- Admin Panel

---

# 5. Tanlangan texnologiyalar

## Backend

- Python 3.12
- FastAPI
- SQLAlchemy
- Alembic
- AsyncPG

### Nima uchun FastAPI?

FastAPI:

- juda tez ishlaydi;
- async qo'llab-quvvatlaydi;
- OpenAPI avtomatik yaratadi;
- type hint asosida ishlaydi.

---

## Frontend

- React
- TypeScript
- Vite

### Nima uchun React?

React komponentlarga asoslangan.

Kodlarni qayta ishlatish oson.

Telegram Mini App uchun juda qulay.

---

## Database

PostgreSQL

### Nima uchun PostgreSQL?

- ishonchli;
- ACID;
- katta loyihalar uchun mos;
- kengaytirish oson.

---

## Cache

Redis

Redis:

- tezkor;
- xotirada ishlaydi;
- queue;
- notification;
- session

uchun ishlatiladi.

---

## Infrastructure

Loyihada quyidagi infratuzilma ishlatiladi.

- Ubuntu Server 22.04
- Docker
- Docker Compose
- Nginx
- Let's Encrypt
- pfSense
- GitHub

---

# 6. Loyiha arxitekturasi

Loyiha ko'p qatlamli (Multi Layer Architecture) asosida qurilgan.

Asosiy qatlamlar:

1. Telegram
2. Nginx
3. Frontend
4. Backend
5. Database
6. Cache

Har bir qatlam o'z vazifasini bajaradi.

Natijada tizimni keyinchalik kengaytirish oson bo'ladi.

---

# 7. Loyiha qanday ishlaydi?

Foydalanuvchi Telegram ichida Mini App tugmasini bosadi.

↓

Telegram Mini App ochiladi.

↓

Frontend yuklanadi.

↓

Frontend Backend API ga murojaat qiladi.

↓

Backend PostgreSQL bazasidan ma'lumot oladi.

↓

Natija Frontend ga qaytariladi.

↓

Foydalanuvchi ma'lumotni ko'radi.

---

# 8. Administrator vazifalari

Administrator quyidagi ishlarni bajaradi:

- serverni boshqarish;
- Docker containerlarni nazorat qilish;
- PostgreSQL backup olish;
- SSL sertifikatlarni tekshirish;
- loglarni kuzatish;
- yangilanishlarni o'rnatish.

---

# 9. Dokumentatsiya

Loyiha quyidagi hujjatlarga bo'lingan.

01-Architecture.md

Loyihaning umumiy arxitekturasi.

02-Network.md

Tarmoq va DNS ishlashi.

03-Deployment.md

Production serverga o'rnatish.

04-Nginx.md

Nginx konfiguratsiyasi.

05-Docker.md

Docker ishlashi.

06-Database.md

PostgreSQL.

07-Telegram.md

Telegram Mini App.

08-Security.md

Xavfsizlik.

09-Troubleshooting.md

Muammolarni aniqlash.

10-Roadmap.md

Kelajakdagi rejalar.

---

# 10. Xulosa

ToDo-BOT — bu Telegram asosida ishlaydigan zamonaviy vazifalarni boshqarish tizimi.

Loyiha boshidan production muhiti uchun mo'ljallangan.

Infratuzilma Docker asosida qurilgan.

Server Ubuntu operatsion tizimida ishlaydi.

Barcha tashqi trafik Nginx orqali boshqariladi.

Ma'lumotlar PostgreSQL bazasida saqlanadi.

Redis esa tezkor xizmatlar uchun ishlatiladi.

Loyiha kelajakda kengaytirish imkoniyati hisobga olingan holda ishlab chiqilgan.