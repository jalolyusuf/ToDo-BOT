# 03 - Deployment (Production serverga o'rnatish)

---

## Hujjat haqida

**Versiya:** 1.0

**Loyiha:** ToDo-BOT

**Oxirgi yangilangan sana:** 2026-07-14

**Muallif:** Jaloliddin Yusuf

---

# Mundarija

1. Deployment nima?
2. Server talablari
3. Ishlatiladigan dasturlar
4. Server tayyorlash
5. GitHub ulash
6. Loyiha yuklash
7. .env sozlash
8. Docker Build
9. Docker Compose
10. Nginx
11. HTTPS
12. Telegram
13. Ishga tushirish
14. Yangilash
15. Backup
16. Rollback
17. Monitoring
18. Xulosa

---

# 1. Deployment nima?

Deployment — bu loyihani ishlab chiqish (Development) muhitidan Production serverga joylashtirish jarayonidir.

Bizning loyihamiz Docker Compose yordamida Production serverda ishlaydi.

Deploymentning asosiy maqsadi:

- loyihani internetga chiqarish;
- xavfsizlikni ta'minlash;
- yangilashni osonlashtirish;
- serverni boshqarishni soddalashtirish.

---

# 2. Production server

Bizning Production muhiti quyidagicha.

| Parametr | Qiymat |
|----------|---------|
| OS | Ubuntu Server 22.04 LTS |
| Firewall | pfSense |
| Web Server | Nginx |
| SSL | Let's Encrypt |
| Container | Docker |
| Orchestrator | Docker Compose |
| Source Code | GitHub |
| Domain | jalolyusuf.info |

---

# 3. Server talablari

Minimal tavsiya etilgan resurslar.

| Resurs | Tavsiya |
|---------|---------|
| CPU | 2 Core |
| RAM | 4 GB |
| SSD | 40 GB |
| Docker | 28+ |
| Docker Compose | Latest |
| Git | Latest |

---

# 4. Server tayyorlash

Ubuntu yangilanadi.

```bash
sudo apt update
sudo apt upgrade -y
```

Kerakli paketlar o'rnatiladi.

```bash
sudo apt install git curl wget unzip -y
```

---

# 5. Docker o'rnatish

Docker o'rnatiladi.

Tekshirish.

```bash
docker --version
```

Docker Compose tekshirish.

```bash
docker compose version
```

---

# 6. GitHub bilan ulash

Server GitHub bilan SSH orqali ulanadi.

SSH kalit yaratiladi.

```bash
ssh-keygen -t ed25519
```

Public Key GitHub ga qo'shiladi.

Tekshirish.

```bash
ssh -T git@github.com
```

Natija.

```
Hi jalolyusuf!
You've successfully authenticated.
```

---

# 7. Loyihani yuklab olish

Repository clone qilinadi.

```bash
git clone git@github.com:jalolyusuf/ToDo-BOT.git
```

Loyiha papkasiga kiriladi.

```bash
cd ToDo-BOT
```

---

# 8. Environment (.env)

Production uchun `.env` yaratiladi.

Asosiy qiymatlar:

- APP_ENV=production
- DEBUG=false
- DATABASE_URL
- REDIS_URL
- TELEGRAM_BOT_TOKEN
- TELEGRAM_MINI_APP_URL
- BACKEND_CORS_ORIGINS

Barcha maxfiy ma'lumotlar faqat `.env` faylda saqlanadi.

GitHub ga yuklanmaydi.

---

# 9. Docker Build

Image lar yig'iladi.

```bash
docker compose build
```

---

# 10. Containerlarni ishga tushirish

```bash
docker compose up -d
```

Tekshirish.

```bash
docker ps
```

Quyidagi containerlar ishlashi kerak.

- frontend
- backend
- postgres
- redis

---

# 11. Nginx

Nginx Reverse Proxy sifatida ishlaydi.

Tashqi trafik.

```
Internet

↓

Nginx

↓

Frontend
```

API.

```
Frontend

↓

Nginx

↓

Backend
```

---

# 12. HTTPS

SSL Let's Encrypt yordamida olinadi.

```bash
sudo certbot --nginx
```

Tekshirish.

```
https://jalolyusuf.info
```

Brauzerda qulf belgisi chiqishi kerak.

---

# 13. Telegram

BotFather orqali quyidagilar sozlanadi.

Mini App URL.

```
https://jalolyusuf.info
```

Webhook.

```
https://jalolyusuf.info/api/v1/telegram/webhook
```

Webhook tekshirish.

```bash
curl https://api.telegram.org/bot<TOKEN>/getWebhookInfo
```

---

# 14. Yangilash (Update)

Loyiha GitHub dan yangilanadi.

```bash
git pull
```

Keyin.

```bash
docker compose up -d --build
```

Bu Production yangilashning standart usuli hisoblanadi.

---

# 15. Backup

Backup olinadigan xizmatlar.

- PostgreSQL
- .env
- Nginx
- SSL
- Docker Volume

Kod GitHub da saqlanadi.

---

# 16. Rollback

Muammo yuz bersa.

Oldingi commit.

```bash
git checkout <commit>
```

Keyin.

```bash
docker compose up -d --build
```

---

# 17. Monitoring

Asosiy tekshiruvlar.

Containerlar.

```bash
docker ps
```

Backend.

```bash
docker logs todo-bot-backend-1
```

Frontend.

```bash
docker logs todo-bot-frontend-1
```

Nginx.

```bash
sudo systemctl status nginx
```

Health.

```bash
curl https://jalolyusuf.info/api/v1/health
```

---

# 18. Muammolar

Agar loyiha ishlamasa.

Ketma-ket tekshiriladi.

1. DNS
2. pfSense
3. Ubuntu
4. Docker
5. Nginx
6. Backend
7. PostgreSQL
8. Redis
9. Telegram Webhook

Har doim muammo tashqaridan ichkariga qarab aniqlanadi.

---

# 19. Production qoidalari

Production serverda quyidagi qoidalar amal qiladi.

✅ Kod faqat GitHub orqali yangilanadi.

✅ `.env` GitHub ga yuklanmaydi.

✅ PostgreSQL internetga ochilmaydi.

✅ Redis internetga ochilmaydi.

✅ Nginx yagona kirish nuqtasi.

✅ Docker containerlar alohida tarmoqda ishlaydi.

✅ HTTPS majburiy.

---

# Xulosa

ToDo-BOT Docker Compose asosida ishlovchi Production loyihadir.

Deployment jarayoni sodda va takrorlanadigan qilib loyihalashtirilgan.

Yangi serverga o'tishda yoki server qayta tiklanganda aynan shu hujjat bo'yicha harakat qilinadi.

---

## Keyingi hujjat

**04 - Nginx.md**

Bu hujjatda quyidagilar batafsil tushuntiriladi.

- Reverse Proxy
- server_name
- location
- proxy_pass
- SSL
- HTTPS
- Certbot
- Bizning real Nginx konfiguratsiyamiz