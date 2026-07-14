# 09 - Troubleshooting (Muammolarni aniqlash)

---

## Hujjat haqida

**Versiya:** 1.0

**Loyiha:** ToDo-BOT

**Oxirgi yangilangan sana:** 2026-07-14

**Muallif:** Jaloliddin Yusuf

---

# Mundarija

1. Kirish
2. Diagnostika tartibi
3. Docker muammolari
4. Frontend muammolari
5. Backend muammolari
6. PostgreSQL muammolari
7. Redis muammolari
8. Nginx muammolari
9. HTTPS muammolari
10. Telegram muammolari
11. DNS muammolari
12. pfSense muammolari
13. Git muammolari
14. Foydali buyruqlar
15. Xulosa

---

# 1. Kirish

Production serverda muammo yuz berganda har doim quyidagi tartibda tekshirish tavsiya etiladi.

```
Internet

↓

DNS

↓

pfSense

↓

Ubuntu

↓

Nginx

↓

Docker

↓

Frontend

↓

Backend

↓

Database
```

Hech qachon tekshiruvni Database dan boshlamang.

Har doim tashqaridan ichkariga qarab tekshiring.

---

# 2. Diagnostika tartibi

Har qanday muammo quyidagi ketma-ketlikda tekshiriladi.

1. Domen ishlayaptimi?
2. HTTPS ishlayaptimi?
3. Nginx ishlayaptimi?
4. Docker ishlayaptimi?
5. Backend ishlayaptimi?
6. Database ishlayaptimi?
7. Telegram ishlayaptimi?

---

# 3. Docker muammolari

## Container ishlamayapti

Tekshirish.

```bash
docker ps
```

To'xtagan containerlar.

```bash
docker ps -a
```

Loglar.

```bash
docker compose logs
```

---

## Container qayta ishga tushmoqda

Tekshirish.

```bash
docker logs <container_nomi>
```

---

## Docker Network

Tekshirish.

```bash
docker network ls
```

Inspect.

```bash
docker network inspect todo_internal
```

---

# 4. Frontend muammolari

Frontend javob bermayapti.

Tekshirish.

```bash
curl http://127.0.0.1:8088
```

Log.

```bash
docker logs todo-bot-frontend-1
```

---

# 5. Backend muammolari

Health Check.

```bash
curl http://127.0.0.1:8000/api/v1/health
```

Docker.

```bash
docker logs todo-bot-backend-1
```

Container.

```bash
docker ps
```

---

# 6. PostgreSQL muammolari

Container.

```bash
docker logs todo-bot-postgres-1
```

Ulanish.

```bash
docker exec -it todo-bot-postgres-1 psql -U todo_bot
```

Migration.

```bash
alembic current
```

---

# 7. Redis muammolari

Container.

```bash
docker logs todo-bot-redis-1
```

Ping.

```bash
docker exec -it todo-bot-redis-1 redis-cli ping
```

Natija.

```
PONG
```

---

# 8. Nginx muammolari

Holati.

```bash
sudo systemctl status nginx
```

Syntax.

```bash
sudo nginx -t
```

Reload.

```bash
sudo systemctl reload nginx
```

Loglar.

```bash
sudo journalctl -u nginx
```

---

# 9. HTTPS muammolari

Sertifikatlar.

```bash
sudo certbot certificates
```

Yangilash testi.

```bash
sudo certbot renew --dry-run
```

---

# 10. Telegram muammolari

Webhook.

```bash
curl https://api.telegram.org/bot<TOKEN>/getWebhookInfo
```

Webhook o'rnatish.

```bash
curl -X POST \
https://api.telegram.org/bot<TOKEN>/setWebhook
```

Backend loglari.

```bash
docker logs todo-bot-backend-1
```

---

# 11. DNS muammolari

DNS tekshirish.

```bash
nslookup jalolyusuf.info
```

yoki

```bash
dig jalolyusuf.info
```

Natija Public IP bilan bir xil bo'lishi kerak.

---

# 12. pfSense muammolari

Tekshirish.

- WAN IP
- NAT
- Firewall Rule
- Port Forward
- 80 Port
- 443 Port

Agar 443 ishlamasa HTTPS ishlamaydi.

---

# 13. Git muammolari

Repository holati.

```bash
git status
```

Yangilash.

```bash
git pull
```

SSH.

```bash
ssh -T git@github.com
```

---

# 14. Foydali buyruqlar

Containerlar.

```bash
docker ps
```

Loglar.

```bash
docker compose logs
```

Health.

```bash
curl https://jalolyusuf.info/api/v1/health
```

Nginx.

```bash
sudo nginx -t
```

Reload.

```bash
sudo systemctl reload nginx
```

Docker restart.

```bash
docker compose restart
```

Docker rebuild.

```bash
docker compose up -d --build
```

---

# 15. Muammo qidirish qoidasi

Har doim quyidagi ketma-ketlik bo'yicha tekshiring.

```
DNS

↓

Internet

↓

pfSense

↓

Ubuntu

↓

Nginx

↓

Docker

↓

Frontend

↓

Backend

↓

Database

↓

Telegram
```

Bu usul muammoni tez topishga yordam beradi.

---

# Xulosa

Troubleshooting hujjati Production serverdagi muammolarni tez aniqlash uchun yozilgan.

Har bir xizmat alohida tekshiriladi va muammo bosqichma-bosqich izlanadi.

Hech qachon taxmin bilan emas, balki loglar va diagnostika buyruqlari asosida ishlash tavsiya etiladi.

---

## Keyingi hujjat

**10 - Roadmap.md**

Unda loyihaning kelajakdagi rivojlanish rejasi, bosqichlari va ustuvor vazifalari yoziladi.