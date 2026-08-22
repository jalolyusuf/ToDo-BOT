# 🔍 Backend Debug Commands

Serverda SSH orqali quyidagi buyruqlarni bajaring:

## 1️⃣ Container Status Tekshirish

```bash
docker ps -a
```

**Qidiramiz:**
- `claude-ai-backend` - STATUS: `Up` yoki `Exited`?
- `claude-ai-db` - STATUS: `Up (healthy)`?

---

## 2️⃣ Backend Logs Ko'rish

```bash
docker logs claude-ai-backend --tail=100
```

**Bu eng muhim!** Xato qayerda ekanini ko'rsatadi.

---

## 3️⃣ Database Logs

```bash
docker logs claude-ai-db --tail=50
```

---

## 4️⃣ Container Qayta Ishga Tushirish

Agar backend crash bo'lgan bo'lsa:

```bash
docker compose restart backend
```

---

## 5️⃣ Barcha Containerlarni Ko'rish

```bash
docker compose ps
```

---

## 6️⃣ Backend Container Ichiga Kirish

```bash
docker exec -it claude-ai-backend bash
```

Ichida:
```bash
# Python test
python -c "import app"

# Environment variables
env | grep -E "AWS|TELEGRAM|DATABASE"
```

---

## 🎯 Men Kutayotgan Natijalar:

Yuqoridagi buyruqlarni bajaring va menga yuboring:

1. **`docker ps -a`** natijasi
2. **`docker logs claude-ai-backend --tail=100`** natijasi

Bu ikkalasidan muammoni topaman va tuzataman! 🔧
