# 🔐 GitHub Secrets Setup

GitHub repository'ngizda quyidagi secretlarni qo'shishingiz kerak.

## 📝 Qadamlar:

### 1. GitHub Repository'ni Oching
👉 https://github.com/jalolyusuf/ToDo-BOT

### 2. Settings > Secrets and Variables > Actions
1. **Settings** tab'ga o'ting
2. Chap menuda **Secrets and variables** ni tanlang
3. **Actions** ni bosing
4. **New repository secret** tugmasini bosing

### 3. Quyidagi Secretlarni Qo'shing

Har birini alohida qo'shish kerak:

#### AWS Bedrock Secrets:

**Secret 1:**
- Name: `AWS_ACCESS_KEY_ID`
- Value: `<your-aws-access-key-id>` (sizda bor, .env fayldan oling)

**Secret 2:**
- Name: `AWS_SECRET_ACCESS_KEY`
- Value: `<your-aws-secret-access-key>` (sizda bor, .env fayldan oling)

**Secret 3:**
- Name: `AWS_REGION`
- Value: `eu-north-1` (yoki sizning regioningiz)

#### Telegram Bot Secrets:

**Secret 4:**
- Name: `TELEGRAM_BOT_TOKEN`
- Value: `<your-telegram-bot-token>` (sizda bor, .env fayldan oling)

**Secret 5:**
- Name: `TELEGRAM_WEBHOOK_URL`
- Value: `https://your-server-ip-or-domain.com/api/v1/telegram/webhook`
  - ⚠️ **your-server-ip-or-domain** ni o'zgartiring!

**Secret 6:**
- Name: `TELEGRAM_WEBHOOK_SECRET`
- Value: `<your-webhook-secret>` (sizda bor, .env fayldan oling)

#### Security Secret:

**Secret 7:**
- Name: `SECRET_KEY`
- Value: `<your-secret-key>` (sizda bor, .env fayldan oling)

---

## ✅ Jami 7 ta Secret

Hammasini qo'shgandan keyin:
1. Kodni GitHub'ga push qiling
2. Actions tab'da workflow ishga tushadi
3. Self-hosted runner serveringizda bot deploy bo'ladi!

---

## 🔍 Tekshirish

GitHub'da:
- **Settings** > **Secrets and variables** > **Actions**
- 7 ta secret ko'rinishi kerak ✅

---

## ⚠️ Muhim:

**TELEGRAM_WEBHOOK_URL** ni to'g'rilash kerak:
- Agar serveringizda domain bo'lsa: `https://domain.com/api/v1/telegram/webhook`
- Agar faqat IP bo'lsa: `http://IP_ADDRESS:8000/api/v1/telegram/webhook`

Men keyinroq buni sozlashda yordam beraman!
