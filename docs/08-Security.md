# 08 - Security (Xavfsizlik siyosati)

---

## Hujjat haqida

**Versiya:** 1.0

**Loyiha:** ToDo-BOT

**Oxirgi yangilangan sana:** 2026-07-14

**Muallif:** Jaloliddin Yusuf

---

# Mundarija

1. Xavfsizlik haqida
2. Security maqsadi
3. Server xavfsizligi
4. Docker xavfsizligi
5. Nginx xavfsizligi
6. Telegram xavfsizligi
7. Database xavfsizligi
8. GitHub xavfsizligi
9. SSH xavfsizligi
10. .env fayli
11. HTTPS
12. Backup
13. Disaster Recovery
14. Incident Response
15. Xulosa

---

# 1. Xavfsizlik haqida

ToDo-BOT internet orqali ishlaydigan Production tizim hisoblanadi.

Shuning uchun xavfsizlik barcha komponentlarda hisobga olingan.

Bizning maqsad:

- foydalanuvchi ma'lumotlarini himoya qilish;
- serverni himoya qilish;
- bot tokenlarini himoya qilish;
- ma'lumotlar bazasini himoya qilish;
- xizmat uzluksiz ishlashini ta'minlash.

---

# 2. Security tamoyillari

Loyihada quyidagi tamoyillarga amal qilinadi.

- Least Privilege (minimal huquqlar)
- Defense in Depth (ko'p qatlamli himoya)
- Secure by Default
- HTTPS Everywhere
- Secret Management
- Backup First

---

# 3. Server xavfsizligi

Production server Ubuntu Server 22.04 LTS da ishlaydi.

Serverga kirish faqat SSH orqali amalga oshiriladi.

Serverga:

✅ SSH Key orqali kiriladi.

❌ Parol orqali kirish tavsiya etilmaydi.

Server muntazam yangilanadi.

```bash
sudo apt update
sudo apt upgrade
```

---

# 4. Docker xavfsizligi

Docker Containerlar alohida ishlaydi.

Har bir xizmat:

- frontend
- backend
- postgres
- redis

mustaqil Container ichida ishlaydi.

Internet quyidagi xizmatlarga kira olmaydi.

❌ PostgreSQL

❌ Redis

❌ Backend

Faqat Nginx tashqi trafikni qabul qiladi.

---

# 5. Nginx xavfsizligi

Nginx yagona kirish nuqtasi.

Barcha tashqi so'rovlar.

```
Internet

↓

Nginx

↓

Docker
```

orqali ishlaydi.

Backend va Frontend localhost orqali bog'langan.

```
127.0.0.1:8088

127.0.0.1:8000
```

---

# 6. Telegram xavfsizligi

Bot Token maxfiy ma'lumot hisoblanadi.

Hech qachon:

- GitHub ga
- Screenshot ga
- Dokumentatsiyaga

yozilmaydi.

Webhook.

```
https://jalolyusuf.info/api/v1/telegram/webhook
```

Secret Token ishlatiladi.

initData hash tekshiriladi.

---

# 7. Database xavfsizligi

PostgreSQL.

```
5432
```

Internet uchun yopiq.

Faqat Backend ulanadi.

Database foydalanuvchisi minimal huquqlarga ega bo'lishi kerak.

Backup muntazam olinadi.

---

# 8. GitHub xavfsizligi

Repository Private yoki Public bo'lishidan qat'i nazar.

GitHub ga quyidagilar yuklanmaydi.

- .env

- SSL

- SSH Key

- Database Backup

- Telegram Token

- Password

.gitignore doimo tekshiriladi.

---

# 9. SSH xavfsizligi

Server GitHub bilan SSH orqali ishlaydi.

SSH kalit.

```
id_ed25519
```

Private Key serverdan tashqariga chiqarilmaydi.

Public Key GitHub ga qo'shiladi.

---

# 10. .env fayli

Barcha maxfiy ma'lumotlar.

```
.env
```

ichida saqlanadi.

Masalan.

- TELEGRAM_BOT_TOKEN

- DATABASE_URL

- POSTGRES_PASSWORD

- SECRET_KEY

- WEBHOOK_SECRET

GitHub ga yuklanmaydi.

---

# 11. HTTPS

Production server faqat HTTPS ishlatadi.

Let's Encrypt sertifikati.

```
certbot
```

orqali olinadi.

Sertifikat avtomatik yangilanadi.

---

# 12. Backup

Backup olinadigan obyektlar.

- PostgreSQL
- Docker Volume
- .env
- SSL
- Nginx
- Git Repository

Backup boshqa disk yoki boshqa serverda saqlanishi tavsiya etiladi.

---

# 13. Disaster Recovery

Agar server ishdan chiqsa.

Tiklash tartibi.

1. Ubuntu o'rnatish.

2. Docker o'rnatish.

3. Git Clone.

4. .env tiklash.

5. SSL tiklash.

6. Database Restore.

7. Docker Compose ishga tushirish.

---

# 14. Incident Response

Agar Bot Token sizib chiqsa.

1. BotFather ga kirish.

2. Tokenni bekor qilish.

3. Yangi Token yaratish.

4. .env yangilash.

5. Containerlarni qayta ishga tushirish.

---

Agar SSH Key sizib chiqsa.

1. GitHub dan eski Key o'chiriladi.

2. Yangi SSH Key yaratiladi.

3. GitHub ga qo'shiladi.

---

Agar Database buzilsa.

1. Backup tiklanadi.

2. Migration tekshiriladi.

3. Backend qayta ishga tushiriladi.

---

# 15. Production qoidalari

✅ HTTPS majburiy.

✅ Docker ishlatiladi.

✅ .env GitHub ga yuklanmaydi.

✅ SSH Key ishlatiladi.

✅ Database internetga ochilmaydi.

✅ Redis internetga ochilmaydi.

✅ Backend localhost da ishlaydi.

✅ Frontend localhost da ishlaydi.

✅ Nginx yagona Reverse Proxy.

---

# Xulosa

ToDo-BOT xavfsizlik tamoyillari asosida ishlab chiqilgan.

Server, Docker, Database va Telegram alohida qatlamlarda himoyalangan.

Maxfiy ma'lumotlar faqat .env faylida saqlanadi.

Barcha tashqi trafik HTTPS orqali uzatiladi.

Xavfsizlik siyosatiga rioya qilish tizimning barqaror va ishonchli ishlashini ta'minlaydi.

---

## Keyingi hujjat

09 - Troubleshooting.md

Unda:

- Docker ishlamayapti
- Nginx ishlamayapti
- PostgreSQL ishlamayapti
- Telegram ishlamayapti
- Mini App ochilmayapti
- SSL ishlamayapti
- GitHub ishlamayapti

kabi muammolarni aniqlash va bartaraf etish usullari yoziladi.