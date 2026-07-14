# 02 - Network (Tarmoq arxitekturasi)

---

## Hujjat haqida

**Versiya:** 1.0

**Loyiha:** ToDo-BOT

**Oxirgi yangilangan sana:** 2026-07-14

**Muallif:** Jaloliddin Yusuf

---

# Mundarija

1. Network haqida
2. Bizning tarmoq
3. Public IP
4. Domain
5. DNS
6. pfSense
7. NAT
8. Ubuntu Server
9. Docker Network
10. Nginx
11. HTTPS
12. Request Flow
13. Security
14. Xulosa

---

# 1. Network haqida

Har qanday web ilova foydalanuvchidan servergacha bir nechta bosqich orqali ishlaydi.

Bizning loyihamiz ham bundan mustasno emas.

Foydalanuvchi Telegram Mini App ni ochganida ma'lumot quyidagi yo'l bo'ylab harakat qiladi.

```

Telegram

↓

Internet

↓

DNS

↓

Public IP

↓

pfSense

↓

Ubuntu

↓

Nginx

↓

Docker

↓

Backend

↓

Database

```

Shu hujjat aynan mana shu jarayonni tushuntiradi.

---

# 2. Bizning tarmoq

Bizning loyiha quyidagi tarmoq arxitekturasida ishlaydi.

```

                    Telegram
                        │
                        │
                 jalolyusuf.info
                        │
                    DNS Server
                        │
                  Public IP Address
                        │
                 pfSense Firewall
                WAN Port 80 / 443
                        │
                  Ubuntu Server
                        │
                    Nginx
             Reverse Proxy Server
                        │
        ┌───────────────┴──────────────┐
        │                              │
        │                              │
 Frontend Container             Backend Container
       8088                          8000
        │                              │
        └───────────────┬──────────────┘
                        │
              Docker Bridge Network
                  │              │
             PostgreSQL       Redis

```

Bu bizning production muhitimizning haqiqiy sxemasi.

---

# 3. Public IP

Internet foydalanuvchilari serverni IP manzil orqali topadi.

Masalan

```

87.xxx.xxx.xxx

```

Bu IP internet provayderi tomonidan beriladi.

Ammo foydalanuvchi hech qachon IP ni ishlatmaydi.

U doimo domen orqali murojaat qiladi.

---

# 4. Domain

Bizning loyihamizning rasmiy domeni:

```

https://jalolyusuf.info

```

Loyihaning barcha tashqi xizmatlari aynan shu domen orqali ishlaydi.

Mini App ham aynan shu domen orqali ochiladi.

---

# 5. DNS

DNS domenni IP manzilga aylantiradi.

```

jalolyusuf.info

↓

87.xxx.xxx.xxx

```

Telegram ham foydalanuvchi ham aynan DNS orqali serverni topadi.

---

# 6. pfSense

pfSense bizning Firewall hisoblanadi.

U internet bilan server orasidagi yagona kirish nuqtasi.

Vazifalari:

- Firewall
- NAT
- Port Forward
- Trafikni boshqarish

---

# 7. NAT (Port Forward)

Internetdan faqat ikkita port ochilgan.

| Port | Maqsad |
|------|---------|
| 80 | HTTP |
| 443 | HTTPS |

pfSense quyidagi yo'naltirishni amalga oshiradi.

```

Internet

↓

87.xxx.xxx.xxx:80

↓

Ubuntu Server:80

```

va

```

Internet

↓

87.xxx.xxx.xxx:443

↓

Ubuntu Server:443

```

Boshqa portlar tashqaridan ochilmagan.

---

# 8. Ubuntu Server

Ubuntu Server production muhiti hisoblanadi.

Unda quyidagilar ishlaydi.

- Docker
- Docker Compose
- Git
- Nginx
- Certbot

Ubuntu barcha containerlarni boshqaradi.

---

# 9. Docker Network

Docker ichida alohida Bridge Network mavjud.

```

todo_internal

```

Shu tarmoq orqali

- frontend
- backend
- postgres
- redis

bir-biri bilan aloqa qiladi.

Internet bu tarmoqqa kira olmaydi.

---

# 10. Frontend

Frontend Docker ichida ishlaydi.

Ichki port

```

80

```

Ubuntu tomondan

```

127.0.0.1:8088

```

ga bog'langan.

Bu port internet uchun ochiq emas.

Faqat Nginx foydalanadi.

---

# 11. Backend

Backend Docker ichida ishlaydi.

Ichki port

```

8000

```

Ubuntu tomondan

```

127.0.0.1:8000

```

ga bog'langan.

Bu port ham internet uchun yopiq.

---

# 12. PostgreSQL

PostgreSQL faqat Docker Bridge Network ichida ishlaydi.

```

5432

```

port internet uchun ochilmagan.

Backend undan Docker tarmog'i orqali foydalanadi.

---

# 13. Redis

Redis ham Docker ichida ishlaydi.

```

6379

```

port faqat ichki tarmoq uchun mavjud.

---

# 14. Nginx

Nginx tashqi va ichki tarmoq orasidagi Reverse Proxy.

Foydalanuvchi

↓

Nginx

↓

Frontend

va

Frontend

↓

Nginx

↓

Backend

ko'rinishida ishlaydi.

---

# 15. HTTPS

HTTPS Let's Encrypt yordamida ishlaydi.

SSL sertifikat Certbot orqali olinadi.

Shu sababli

```

https://jalolyusuf.info

```

xavfsiz ulanish hisoblanadi.

---

# 16. Request Flow

Mini App ochilganda quyidagi jarayon sodir bo'ladi.

```

Telegram

↓

HTTPS

↓

jalolyusuf.info

↓

DNS

↓

Public IP

↓

pfSense

↓

Ubuntu

↓

Nginx

↓

Frontend

↓

API

↓

Backend

↓

PostgreSQL

↓

JSON

↓

Frontend

↓

Telegram

↓

Foydalanuvchi

```

---

# 17. Security

Bizning tarmoq quyidagi xavfsizlik qoidalariga amal qiladi.

✅ Internet uchun faqat 80 va 443 ochiq.

✅ Docker containerlar alohida tarmoqda ishlaydi.

✅ PostgreSQL internetga ochilmagan.

✅ Redis internetga ochilmagan.

✅ Backend faqat localhost orqali ishlaydi.

✅ Frontend faqat localhost orqali ishlaydi.

✅ Reverse Proxy sifatida faqat Nginx ishlatiladi.

✅ Mini App faqat `jalolyusuf.info` domenida ishlaydi.

---

# 18. Kelajakdagi kengaytirish

Kelajakda quyidagilar qo'shilishi mumkin.

- Cloudflare
- Load Balancer
- Docker Swarm
- Kubernetes
- Monitoring
- Prometheus
- Grafana

Mavjud arxitektura ushbu imkoniyatlarni qo'llab-quvvatlash uchun mos tanlangan.

---

# Xulosa

ToDo-BOT loyihasi xavfsizlik va kengaytirish imkoniyatlari hisobga olingan holda qurilgan.

Tashqi trafik faqat Nginx orqali qabul qilinadi.

Ichki xizmatlar Docker Bridge Network orqali ishlaydi.

Bunday arxitektura serverni boshqarishni soddalashtiradi, xavfsizlikni oshiradi va kelajakda yangi xizmatlarni qo'shishni osonlashtiradi.

---

## Keyingi hujjat

**03 - Deployment.md**

Unda serverni **0 dan production holatigacha** o'rnatish, GitHub bilan ulash, Docker, Nginx, Certbot, pfSense va Telegram Webhook sozlamalari ketma-ket yoziladi.