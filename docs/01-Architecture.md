# 01 - Arxitektura

---

## Hujjat haqida

**Versiya:** 1.0

**Loyiha:** ToDo-BOT

**Oxirgi yangilangan sana:** 2026-07-14

**Muallif:** Jaloliddin Yusuf

---

# Mundarija

1. Arxitektura nima?
2. Loyiha arxitekturasi
3. Komponentlar
4. Har bir komponent vazifasi
5. Ma'lumot oqimi (Data Flow)
6. So'rov oqimi (Request Flow)
7. Docker arxitekturasi
8. Tarmoq arxitekturasi
9. Backend arxitekturasi
10. Frontend arxitekturasi
11. Xulosa

---

# 1. Arxitektura nima?

Arxitektura — bu loyihaning qanday qismlardan tashkil topgani va ular bir-biri bilan qanday aloqa qilishini tushuntiruvchi hujjat.

Bu hujjatda kod emas, balki tizimning umumiy tuzilishi tasvirlanadi.

---

# 2. ToDo-BOT umumiy arxitekturasi

Loyiha quyidagi asosiy qismlardan tashkil topgan:

- Telegram
- Domen (jalolyusuf.info)
- DNS
- pfSense
- Ubuntu Server
- Nginx
- Docker
- Frontend
- Backend
- PostgreSQL
- Redis

Bularning har biri o'z vazifasiga ega.

---

# 3. Umumiy sxema

```text
                      Internet
                          │
                          │
                  jalolyusuf.info
                          │
                    DNS A Record
                          │
                     Public IP
                          │
                    pfSense Firewall
               Port Forward 80 / 443
                          │
                    Ubuntu 22.04 LTS
                          │
                 Nginx Reverse Proxy
                 ┌────────┴────────┐
                 │                 │
                 │                 │
            Frontend          Backend
            React/Vite         FastAPI
                 │                 │
                 └────────┬────────┘
                          │
                  Docker Bridge Network
                     │             │
                     │             │
                 PostgreSQL      Redis
```

---

# 4. Komponentlar

## Telegram

Foydalanuvchi aynan Telegram orqali tizimdan foydalanadi.

Telegram:

- foydalanuvchini aniqlaydi;
- Mini App'ni ochadi;
- initData yuboradi;
- Webhook orqali bot bilan ishlaydi.

---

## Domen

Loyihaning yagona rasmiy manzili:

```
https://jalolyusuf.info
```

Mini App faqat shu domen orqali ishlashi kerak.

IP manzil orqali ishlashi tavsiya etilmaydi.

---

## DNS

DNS quyidagi vazifani bajaradi.

```
jalolyusuf.info

↓

Server Public IP
```

DNS foydalanuvchini serverning haqiqiy IP manziliga yo'naltiradi.

---

## pfSense

pfSense Internet bilan server orasidagi himoya devori hisoblanadi.

Bizning loyihada:

Internet

↓

80

↓

Ubuntu

va

Internet

↓

443

↓

Ubuntu

yo'naltiriladi.

Boshqa portlar Internet uchun yopiq.

---

## Ubuntu Server

Ubuntu butun loyihaning asosiy operatsion tizimi.

Unda:

- Docker
- Docker Compose
- Git
- Nginx
- Certbot

ishlaydi.

---

## Docker

Loyiha Docker Container'larda ishlaydi.

Har bir xizmat alohida container ichida joylashgan.

Bu tizimni:

- boshqarishni;
- yangilashni;
- ko'chirishni

ancha osonlashtiradi.

---

## Nginx

Nginx tashqi foydalanuvchilar bilan ichki Docker xizmatlari orasidagi Reverse Proxy hisoblanadi.

Nginx quyidagi vazifalarni bajaradi:

- HTTPS
- SSL
- Reverse Proxy
- API yo'naltirish
- Frontend chiqarish

---

## Frontend

Frontend React yordamida yozilgan.

Uning vazifasi:

- foydalanuvchi interfeysi;
- API ga murojaat qilish;
- ma'lumotlarni ko'rsatish.

Frontend foydalanuvchi bilan ishlaydi.

---

## Backend

Backend FastAPI yordamida yozilgan.

Backend:

- API
- Authentication
- Business Logic
- Database bilan ishlash

uchun javob beradi.

---

## PostgreSQL

Asosiy ma'lumotlar bazasi.

Unda:

- Users
- Groups
- Tasks
- Notifications
- Logs

saqlanadi.

---

## Redis

Redis vaqtinchalik ma'lumotlar uchun ishlatiladi.

Masalan:

- Cache
- Queue
- Background Jobs
- Session

---

# 5. So'rov qanday yuradi?

Misol:

Foydalanuvchi Mini App'ni ochdi.

Jarayon:

```
Telegram

↓

Mini App

↓

React

↓

GET /api/v1/auth/me

↓

FastAPI

↓

PostgreSQL

↓

JSON

↓

React

↓

Foydalanuvchi
```

---

# 6. Docker arxitekturasi

Docker ichida quyidagi containerlar ishlaydi.

```text
frontend

backend

postgres

redis
```

Har biri mustaqil.

Har biri kerak bo'lsa alohida yangilanishi mumkin.

---

# 7. Docker Network

Containerlar Internet orqali emas,

Docker Bridge Network orqali muloqot qiladi.

```
frontend

↓

backend

↓

postgres

↓

redis
```

Bu xavfsizlikni oshiradi.

---

# 8. Backend arxitekturasi

Backend bir nechta qatlamlardan iborat.

```
API

↓

Service

↓

Repository

↓

Database
```

Bu kodni keyinchalik rivojlantirishni osonlashtiradi.

---

# 9. Frontend arxitekturasi

Frontend quyidagi qismlardan iborat.

```
Pages

↓

Components

↓

Shared

↓

API Client
```

Har bir qism o'z vazifasiga ega.

---

# 10. Xavfsizlik

Bizning loyihada quyidagi qoidalar amal qiladi.

✅ PostgreSQL Internetga ochilmaydi.

✅ Redis Internetga ochilmaydi.

✅ Backend faqat Nginx orqali ishlaydi.

✅ Frontend faqat Nginx orqali ishlaydi.

✅ HTTPS majburiy.

✅ Docker Containerlar ichki tarmoq orqali ishlaydi.

---

# 11. Kengaytirish

Loyiha quyidagi modullarni qo'shishga tayyor.

- Groups
- Roles
- Permissions
- Calendar
- File Storage
- Notification
- Admin Panel

Arxitektura boshidan shu imkoniyatlarni hisobga olgan holda tanlangan.

---

# 12. Xulosa

ToDo-BOT zamonaviy ko'p qatlamli (Multi Layer Architecture) asosida qurilgan.

Har bir komponent alohida vazifani bajaradi.

Natijada:

- tizimni boshqarish oson;
- yangi funksiyalar qo'shish oson;
- xavfsizlik yuqori;
- containerlarni alohida yangilash mumkin;
- ishlab chiqish va production muhiti bir xil ishlaydi.

---

# Keyingi hujjat

02-Network.md

Unda quyidagilar batafsil yoziladi:

- DNS
- pfSense
- NAT
- Port Forward
- Public IP
- Docker Network
- Nginx
- HTTPS
- Request Flow
- Telegram Mini App Network