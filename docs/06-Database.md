
# 06 - Database

---

## Hujjat haqida

**Versiya:** 1.0

**Loyiha:** ToDo-BOT

**Oxirgi yangilangan sana:** 2026-07-14

**Muallif:** Jaloliddin Yusuf

---

# Mundarija

1. Database nima?
2. Nima uchun PostgreSQL tanlandi?
3. Database arxitekturasi
4. SQLAlchemy
5. Alembic
6. Model
7. Relationship
8. Repository Pattern
9. CRUD
10. Migration
11. Backup
12. Restore
13. Troubleshooting
14. Kelajakdagi jadvallar
15. Xulosa

---

# 1. Database nima?

Database — bu ilovaning barcha doimiy ma'lumotlari saqlanadigan joy.

ToDo-BOT loyihasida foydalanuvchilar, vazifalar, guruhlar va boshqa barcha ma'lumotlar PostgreSQL bazasida saqlanadi.

Database loyiha uchun eng muhim qismlardan biri hisoblanadi.

---

# 2. Nima uchun PostgreSQL?

Biz PostgreSQL ni quyidagi sabablar tufayli tanladik.

- Bepul
- Juda ishonchli
- ACID qo'llab-quvvatlaydi
- Katta loyihalar uchun mos
- Docker bilan yaxshi ishlaydi
- SQLAlchemy bilan to'liq mos

Kelajakda millionlab yozuvlar bo'lsa ham ishlay oladi.

---

# 3. Database arxitekturasi

Loyihada Database faqat Backend orqali ishlaydi.

```
Frontend

↓

Backend

↓

SQLAlchemy

↓

PostgreSQL
```

Frontend hech qachon Database bilan to'g'ridan-to'g'ri ishlamaydi.

---

# 4. SQLAlchemy

FastAPI PostgreSQL bilan SQLAlchemy ORM orqali ishlaydi.

ORM bizga SQL yozmasdan Python obyektlari bilan ishlash imkonini beradi.

Misol:

```python
user = User(name="Ali")
```

SQLAlchemy uni avtomatik SQL ga aylantiradi.

---

# 5. Alembic

Alembic Database Migration tizimi hisoblanadi.

Migration yordamida jadval tuzilishi versiyalar bo'yicha boshqariladi.

Misol:

```
Revision 001

↓

Revision 002

↓

Revision 003
```

Production serverda qo'lda CREATE TABLE yozilmaydi.

---

# 6. Model

Har bir jadval Python Model ko'rinishida yoziladi.

Misollar.

```
User

Task

Group

Workspace

Notification
```

Har bir Model bitta jadvalni ifodalaydi.

---

# 7. Relationship

Jadvallar bir-biri bilan bog'langan bo'ladi.

Misol.

```
User

↓

Task

↓

Comment
```

Bir foydalanuvchining bir nechta vazifasi bo'lishi mumkin.

---

# 8. Repository Pattern

Database bilan ishlash to'g'ridan-to'g'ri API ichida yozilmaydi.

Arxitektura quyidagicha.

```
API

↓

Service

↓

Repository

↓

Database
```

Bu kodni boshqarishni ancha osonlashtiradi.

---

# 9. CRUD

Har bir Model quyidagi amallarni bajaradi.

Create

↓

Read

↓

Update

↓

Delete

Masalan User yaratish.

```
POST /users
```

User olish.

```
GET /users/{id}
```

User tahrirlash.

```
PATCH /users/{id}
```

User o'chirish.

```
DELETE /users/{id}
```

---

# 10. Migration

Yangi jadval qo'shilganda Migration yaratiladi.

Misol.

```bash
alembic revision --autogenerate -m "Create task table"
```

Migration bajarish.

```bash
alembic upgrade head
```

Orqaga qaytish.

```bash
alembic downgrade -1
```

---

# 11. Backup

Production serverda quyidagi ma'lumotlar muntazam zaxiralanishi kerak.

- PostgreSQL Database
- Docker Volume
- .env
- Nginx konfiguratsiyasi

Backup avtomatlashtirilishi tavsiya etiladi.

---

# 12. Restore

Database tiklash.

1. PostgreSQL ishga tushiriladi.
2. Backup yuklanadi.
3. Migration tekshiriladi.
4. Ilova qayta ishga tushiriladi.

---

# 13. Troubleshooting

Database ishlamayapti.

Tekshirish.

```bash
docker logs todo-bot-postgres-1
```

Container holati.

```bash
docker ps
```

Database ulanishi.

```bash
docker exec -it todo-bot-postgres-1 psql -U todo_bot
```

Migration holati.

```bash
alembic current
```

---

# 14. Kelajakdagi jadvallar

Loyiha rivojlanishi bilan quyidagi jadvallar qo'shiladi.

```
users

groups

workspaces

tasks

task_comments

attachments

notifications

roles

permissions

audit_logs

settings
```

Barcha jadvallar Alembic orqali boshqariladi.

---

# 15. Production qoidalari

✅ Database internetga ochilmaydi.

✅ Faqat Backend ulanadi.

✅ Migration ishlatiladi.

✅ Qo'lda jadval yaratilmaydi.

✅ Backup muntazam olinadi.

✅ Restore sinovdan o'tkaziladi.

---

# Xulosa

PostgreSQL ToDo-BOT loyihasining asosiy ma'lumotlar ombori hisoblanadi.

SQLAlchemy va Alembic yordamida Database versiyalari boshqariladi.

Repository Pattern kodni toza saqlashga yordam beradi.

Kelajakda barcha yangi modullar aynan shu Database asosida ishlaydi.

---

## Keyingi hujjat

**07 - Telegram.md**

Unda quyidagilar batafsil tushuntiriladi.

- Telegram Bot
- BotFather
- Mini App
- Webhook
- initData
- Authentication
- Telegram Login
- Security
- User Flow