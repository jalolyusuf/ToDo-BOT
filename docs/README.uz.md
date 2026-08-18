# 📝 Vazifa Boshqaruv Boti

> Telegram integratsiyasi va zamonaviy veb interfeys bilan professional vazifa boshqaruv tizimi

[🇺🇿 O'zbekcha](./README.uz.md) | [🇬🇧 English](./README.en.md) | [🇷🇺 Русский](./README.ru.md)

![Task Manager](../assets/Logo.png)

## ✨ Imkoniyatlar

### 🤖 Telegram Integratsiyasi
- Native Telegram Mini App
- WebApp SDK integratsiyasi
- Bot buyruqlari va bildirishnomalar
- Telegram orqali xavfsiz autentifikatsiya

### 📋 Vazifa Boshqaruv
- Vazifalarni yaratish, tahrirlash, o'chirish
- Vazifa muhimligi (Past, O'rta, Yuqori, Shoshilinch)
- Vazifa holatlari (Yaratilgan, Tayinlangan, Jarayonda, Ko'rib chiqilmoqda, Bajarilgan)
- Muddatlar va eslatmalar
- Vazifalarni foydalanuvchilarga tayinlash
- Ommaviy harakatlar (ko'plab tanlash, ommaviy o'chirish, ommaviy holatni o'zgartirish)

### 🎯 Kanban Doska
- Drag-and-drop interfeysi
- 5 ustunli ish jarayoni
- Real vaqtda holat yangilanishi
- Yumshoq animatsiyalar
- Mobil qurilmalarga moslashtirilgan

### 👥 Guruh Hamkorligi
- Guruh yaratish va boshqarish
- Guruh a'zolarini boshqarish
- Rol asosidagi kirish (Egasi, A'zo)
- Guruh vazifalari
- A'zolar statistikasi

### 📊 Analitika va Hisobotlar
- Vazifalarni bajarish ko'rsatkichlari
- Vaqt grafiklari
- Holat bo'yicha taqsimot (doira diagramma)
- Muhimlik bo'yicha taqsimot (ustunli diagramma)
- Guruhlar samaradorligi reytingi
- Vaqt oralig'ini filtrlash (7/30/90 kun)

### 🌐 Ko'p Tillilik
- 🇺🇿 O'zbekcha
- 🇬🇧 English
- 🇷🇺 Русский
- UI'da til tanlash
- Tanlangan tilni saqlash

### 🎨 Zamonaviy UI/UX
- Qorong'u mavzu dizayni
- Moslashuvchan tartib (mobil, planshet, desktop)
- Yumshoq o'tishlar va animatsiyalar
- Professional admin panel interfeysi
- Sidebar navigatsiya
- Qidiruv va kengaytirilgan filterlar

## 🛠 Texnologiyalar

### Backend
- **Python 3.12** - Asosiy til
- **FastAPI** - Zamonaviy web framework
- **SQLAlchemy** - ORM
- **PostgreSQL** - Ma'lumotlar bazasi
- **Redis** - Keshlash va sessiyalar
- **Alembic** - Ma'lumotlar bazasi migratsiyalari
- **python-telegram-bot** - Telegram API

### Frontend
- **React 18** - UI kutubxona
- **TypeScript** - Tip xavfsizligi
- **Vite** - Build vosita
- **React Router** - Navigatsiya
- **Zustand** - State boshqaruv
- **TailwindCSS** - Stillar
- **Recharts** - Ma'lumotlar vizualizatsiyasi
- **@dnd-kit** - Drag va drop
- **i18next** - Xalqarolashtirish
- **React Hot Toast** - Bildirishnomalar
- **Headless UI** - Accessible komponentlar

### DevOps
- **Docker & Docker Compose** - Konteynerizatsiya
- **GitHub Actions** - CI/CD
- **Self-hosted Runner** - Avtomatik deploy
- **Nginx** - Reverse proxy va statik fayllar

## 🚀 Tezkor Boshlash

### Talablar
- Docker & Docker Compose
- Node.js 22+ (lokal ishlab chiqish uchun)
- Python 3.12+ (lokal ishlab chiqish uchun)
- Telegram Bot Token ([@BotFather](https://t.me/BotFather) dan)

### 1. Repositoriyani Klonlash
```bash
git clone https://github.com/jalolyusuf/ToDo-BOT.git
cd ToDo-BOT
```

### 2. Muhit Sozlash
Loyiha ildizida `.env` fayl yarating:

```env
# Telegram
TELEGRAM_BOT_TOKEN=sizning_bot_tokeningiz

# Ma'lumotlar bazasi
DATABASE_URL=postgresql://postgres:postgres@db:5432/todobot

# Redis
REDIS_URL=redis://redis:6379/0

# Backend
SECRET_KEY=sizning-maxfiy-kalitingiz
BACKEND_CORS_ORIGINS=["http://localhost:5173","https://sizning-domeningiz.com"]

# Frontend
VITE_API_BASE_URL=
```

### 3. Docker bilan Ishga Tushirish
```bash
# Barcha servislarni build qilish va ishga tushirish
docker compose up -d --build

# Loglarni ko'rish
docker compose logs -f

# Migratsiyalarni bajarish
docker compose exec backend alembic upgrade head
```

### 4. Ilovaga Kirish
- **Veb Interfeys**: http://localhost
- **Backend API**: http://localhost:8000
- **API Hujjatlari**: http://localhost:8000/docs
- **Telegram Bot**: https://t.me/sizning_bot_username

## 📱 Telegram Bot Sozlash

1. [@BotFather](https://t.me/BotFather) bilan bot yarating
2. Bot tokenini oling
3. Webhook o'rnating:
   ```bash
   curl -X POST "https://api.telegram.org/bot<SIZNING_TOKENINGIZ>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url":"https://sizning-domeningiz.com/api/v1/telegram/webhook"}'
   ```
4. BotFather'da Mini App sozlang:
   - `/setmenubutton` yuboring
   - Botingizni tanlang
   - URL o'rnating: `https://sizning-domeningiz.com`

## 🔧 Ishlab Chiqish

### Backend Ishlab Chiqish
```bash
cd backend

# Virtual muhit yaratish
python -m venv venv
source venv/bin/activate  # yoki Windows'da `venv\Scripts\activate`

# Bog'liqliklarni o'rnatish
pip install -r requirements.txt

# Development serverni ishga tushirish
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Ishlab Chiqish
```bash
cd frontend

# Bog'liqliklarni o'rnatish
npm install

# Development serverni ishga tushirish
npm run dev

# Production uchun build
npm run build

# Tip tekshirish
npm run typecheck
```

### Ma'lumotlar Bazasi Migratsiyalari
```bash
# Yangi migratsiya yaratish
docker compose exec backend alembic revision --autogenerate -m "tavsif"

# Migratsiyalarni qo'llash
docker compose exec backend alembic upgrade head

# Migratsiyani bekor qilish
docker compose exec backend alembic downgrade -1
```

## 🚢 Deploy Qilish

### GitHub Actions (Self-hosted Runner)

1. **Serverda Runner Sozlash:**
   ```bash
   # Ubuntu serveringizda
   mkdir ~/actions-runner && cd ~/actions-runner
   
   # Runner yuklab olish
   curl -o actions-runner-linux-x64-2.311.0.tar.gz -L \
     https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-linux-x64-2.311.0.tar.gz
   
   tar xzf ./actions-runner-linux-x64-2.311.0.tar.gz
   
   # Sozlash
   ./config.sh --url https://github.com/FOYDALANUVCHI_NOMI/ToDo-BOT --token SIZNING_TOKENINGIZ
   
   # Servis sifatida o'rnatish
   sudo ./svc.sh install
   sudo ./svc.sh start
   ```

2. **GitHub Secrets Qo'shish:**
   - `TELEGRAM_BOT_TOKEN` - Telegram bot tokeningiz

3. **Main Branchga Push Qilish:**
   - Har bir `main` branchga push qilganda avtomatik deploy bo'ladi
   - Konteynerlar qayta quriladi
   - Migratsiyalar bajariladi
   - Servislar qayta ishga tushadi

### Qo'lda Deploy

```bash
# Serveringizda
cd ~/ToDo-BOT

# Oxirgi o'zgarishlarni tortib olish
git pull origin main

# Muhit o'zgaruvchilarini yangilash
nano .env

# Qayta build va restart
docker compose down
docker compose up -d --build

# Migratsiyalarni bajarish
docker compose exec -T backend alembic upgrade head

# Webhook o'rnatish
curl -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://sizning-domeningiz.com/api/v1/telegram/webhook"}'
```

## 📖 API Hujjatlari

Interaktiv API hujjatlari quyida mavjud:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Asosiy Endpointlar

#### Autentifikatsiya
- `GET /api/v1/auth/me` - Joriy foydalanuvchini olish

#### Vazifalar
- `GET /api/v1/tasks` - Vazifalar ro'yxati (filterlar bilan)
- `POST /api/v1/tasks` - Vazifa yaratish
- `GET /api/v1/tasks/{id}` - Vazifa tafsilotlari
- `PATCH /api/v1/tasks/{id}` - Vazifani yangilash
- `DELETE /api/v1/tasks/{id}` - Vazifani o'chirish
- `PATCH /api/v1/tasks/{id}/status` - Vazifa holatini yangilash

#### Guruhlar
- `GET /api/v1/groups` - Guruhlar ro'yxati
- `POST /api/v1/groups` - Guruh yaratish
- `GET /api/v1/groups/{id}` - Guruh tafsilotlari
- `DELETE /api/v1/groups/{id}` - Guruhni o'chirish
- `GET /api/v1/groups/{id}/members` - A'zolar ro'yxati
- `DELETE /api/v1/groups/{id}/members/{user_id}` - A'zoni o'chirish

## 🤝 Hissa Qo'shish

Hissa qo'shishni qutlaymiz! Quyidagi qadamlarni bajaring:

1. Repositoriyani fork qiling
2. Feature branch yarating (`git checkout -b feature/ajoyib-feature`)
3. O'zgarishlaringizni commit qiling (`git commit -m 'feat: ajoyib feature qo'shildi'`)
4. Branchga push qiling (`git push origin feature/ajoyib-feature`)
5. Pull Request oching

### Commit Konventsiyasi
[Conventional Commits](https://www.conventionalcommits.org/) qoidalariga amal qiling:
- `feat:` - Yangi funksiya
- `fix:` - Xatolikni tuzatish
- `docs:` - Hujjatlar o'zgarishi
- `style:` - Kod stili o'zgarishi
- `refactor:` - Kod refaktoring
- `test:` - Test qo'shish/o'zgartirish
- `chore:` - Build jarayoni yoki yordamchi vositalar

## 📄 Litsenziya

Ushbu loyiha MIT Litsenziyasi ostida - tafsilotlar uchun [LICENSE](../LICENSE) faylga qarang.

## 👨‍💻 Muallif

**Jalol Yusuf**
- GitHub: [@jalolyusuf](https://github.com/jalolyusuf)
- Telegram: [@jalolyusuf](https://t.me/jalolyusuf)
- Veb-sayt: [jalolyusuf.info](https://jalolyusuf.info)

## 🙏 Minnatdorchilik

- Zamonaviy veb texnologiyalardan foydalanib ❤️ bilan qurilgan
- Muammosiz integratsiya uchun Telegram Bot API
- Ajoyib vositalar uchun ochiq kodli jamiyat
- Ishlab chiqishda yordam uchun Claude Code AI

---

**⭐ Agar bu loyiha foydali bo'lsa, yulduzcha bering!**

❤️ bilan Jalol Yusuf tomonidan yaratilgan
