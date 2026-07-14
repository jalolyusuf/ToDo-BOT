# 05 - Docker

---

## Hujjat haqida

**Versiya:** 1.0

**Loyiha:** ToDo-BOT

**Oxirgi yangilangan sana:** 2026-07-14

**Muallif:** Jaloliddin Yusuf

---

# Mundarija

1. Docker nima?
2. Nima uchun Docker ishlatilgan?
3. Docker Image
4. Docker Container
5. Docker Network
6. Docker Volume
7. Docker Compose
8. Bizning Docker arxitekturamiz
9. Containerlar
10. Ishga tushish tartibi
11. Yangilash
12. Monitoring
13. Troubleshooting
14. Xulosa

---

# 1. Docker nima?

Docker — bu dasturlarni alohida izolyatsiya qilingan muhitda (Container) ishga tushirish texnologiyasi.

Oddiy qilib aytganda, Docker dastur bilan birga uning ishlashi uchun kerak bo'lgan barcha kutubxonalar va sozlamalarni bitta paketga joylaydi.

Natijada loyiha:

- Windows
- Ubuntu
- Debian
- Server
- Cloud

hamma joyda bir xil ishlaydi.

---

# 2. Nima uchun Docker ishlatildi?

ToDo-BOT loyihasida Docker quyidagi sabablar tufayli tanlandi.

- Serverni tez ishga tushirish.
- Bir xil muhit yaratish.
- Xizmatlarni bir-biridan ajratish.
- Yangilashni soddalashtirish.
- Loyihani boshqa serverga ko'chirishni osonlashtirish.

Docker bo'lmaganida barcha dasturlarni qo'lda o'rnatish kerak bo'lardi.

---

# 3. Docker Image

Image — bu Container yaratish uchun tayyor shablon.

Bizning loyihada quyidagi Image lar ishlatiladi.

| Xizmat | Image |
|---------|---------------------------|
| PostgreSQL | postgres:16-alpine |
| Redis | redis:7-alpine |
| Backend | Dockerfile orqali build |
| Frontend | Dockerfile orqali build |

Backend va Frontend GitHub kodidan build qilinadi.

---

# 4. Docker Container

Container — bu Image ning ishlayotgan nusxasi.

Bizning Production serverda quyidagi Containerlar ishlaydi.

| Container | Vazifasi |
|------------|--------------------------|
| frontend | React Mini App |
| backend | FastAPI REST API |
| postgres | Database |
| redis | Cache va Queue |

Har bir container mustaqil ishlaydi.

---

# 5. Docker Network

Loyiha `todo_internal` nomli Docker Bridge Network ishlatadi.

```
todo_internal
```

Bu tarmoq orqali:

- frontend
- backend
- postgres
- redis

bir-biri bilan muloqot qiladi.

Internet bu tarmoqqa kira olmaydi.

---

# 6. Docker Volume

Docker Volume ma'lumotlarni saqlash uchun ishlatiladi.

Bizning loyihada quyidagi Volumelar mavjud.

| Volume | Vazifasi |
|----------|---------------------|
| postgres_data | PostgreSQL ma'lumotlari |
| redis_data | Redis ma'lumotlari |

Container o'chirilsa ham ma'lumotlar saqlanib qoladi.

---

# 7. Docker Compose

Docker Compose barcha Containerlarni bitta fayl orqali boshqaradi.

Biz quyidagi xizmatlarni ishga tushiramiz.

- frontend
- backend
- postgres
- redis

Hammasi `docker-compose.yml` orqali boshqariladi.

---

# 8. Bizning Docker arxitekturamiz

```
                Docker Host
                     │
        ┌────────────┴────────────┐
        │                         │
   frontend                 backend
        │                         │
        └────────────┬────────────┘
                     │
              todo_internal
               Docker Network
                     │
          ┌──────────┴──────────┐
          │                     │
      postgres              redis
```

Barcha Containerlar bitta Docker Network ichida ishlaydi.

---

# 9. Containerlarning vazifalari

## frontend

- React
- TypeScript
- Vite
- Nginx ichida ishlaydi.

Tashqi foydalanuvchi aynan shu container orqali ilovani ko'radi.

---

## backend

Backend quyidagilar uchun javob beradi.

- Authentication
- API
- Business Logic
- PostgreSQL
- Redis

---

## postgres

Asosiy ma'lumotlar bazasi.

Saqlanadigan ma'lumotlar.

- Users
- Tasks
- Groups
- Notifications
- Settings

---

## redis

Redis quyidagi vazifalar uchun ishlatiladi.

- Cache
- Session
- Queue
- Background Job

---

# 10. Ishga tushish tartibi

Containerlar quyidagi ketma-ketlikda ishga tushadi.

```
postgres

↓

redis

↓

backend

↓

frontend
```

Frontend Backend tayyor bo'lgandan keyin ishga tushadi.

Backend esa PostgreSQL va Redis tayyor bo'lgandan keyin ishga tushadi.

---

# 11. Yangilash

GitHub dan yangi kod olinadi.

```
git pull
```

Keyin Containerlar qayta build qilinadi.

```
docker compose up -d --build
```

Eski Containerlar avtomatik almashtiriladi.

---

# 12. Monitoring

Containerlarni ko'rish.

```bash
docker ps
```

Barcha Containerlar.

```bash
docker compose ps
```

Image lar.

```bash
docker images
```

Volume lar.

```bash
docker volume ls
```

Networklar.

```bash
docker network ls
```

---

# 13. Troubleshooting

Container to'xtagan.

```bash
docker ps -a
```

Backend loglari.

```bash
docker logs todo-bot-backend-1
```

Frontend loglari.

```bash
docker logs todo-bot-frontend-1
```

Docker Compose.

```bash
docker compose logs
```

Network.

```bash
docker network inspect todo_internal
```

Volume.

```bash
docker volume inspect postgres_data
```

---

# 14. Production qoidalari

Bizning serverda quyidagi qoidalar amal qiladi.

✅ Docker Compose yagona boshqaruv vositasi.

✅ Container ichida qo'lda o'zgartirish kiritilmaydi.

✅ O'zgarishlar GitHub orqali amalga oshiriladi.

✅ Har doim `docker compose up -d --build` ishlatiladi.

✅ PostgreSQL va Redis tashqariga ochilmaydi.

---

# 15. Kelajakdagi reja

Kelajakda quyidagilar qo'shilishi mumkin.

- GitHub Actions
- CI/CD
- Multi-stage Build optimallashtirish
- Docker Registry
- Health Monitoring
- Watchtower
- Kubernetes
- Docker Swarm

---

# Xulosa

Docker ToDo-BOT loyihasining asosiy infratuzilma texnologiyasidir.

Barcha xizmatlar alohida Containerlarda ishlaydi va `todo_internal` Docker Network orqali o'zaro bog'langan.

Bu yondashuv:

- xavfsizlikni oshiradi;
- yangilashni soddalashtiradi;
- serverni boshqa joyga ko'chirishni osonlashtiradi;
- Development va Production muhitlarini bir xil qiladi.

---

## Keyingi hujjat

**06 - Database.md**

Unda quyidagilar batafsil tushuntiriladi:

- PostgreSQL
- SQLAlchemy
- Alembic
- Migration
- Model
- Relationship
- Repository Pattern
- CRUD
- Index
- Backup