# 07 - Telegram

---

## Hujjat haqida

**Versiya:** 1.0

**Loyiha:** ToDo-BOT

**Oxirgi yangilangan sana:** 2026-07-14

**Muallif:** Jaloliddin Yusuf

---

# Mundarija

1. Telegram nima?
2. Telegram Bot nima?
3. BotFather
4. Telegram Mini App
5. Webhook
6. initData
7. Authentication
8. User Flow
9. Security
10. Monitoring
11. Troubleshooting
12. Kelajakdagi imkoniyatlar
13. Xulosa

---

# 1. Telegram nima?

Telegram — bu foydalanuvchilar bilan muloqot qilish va turli xizmatlarni avtomatlashtirish imkonini beruvchi platforma.

Bizning loyihada Telegram quyidagi vazifalarni bajaradi.

- Botni ishga tushirish
- Mini App ni ochish
- Foydalanuvchini aniqlash
- Bildirishnomalar yuborish

---

# 2. Telegram Bot

Telegram Bot foydalanuvchi va server orasidagi aloqa vositasidir.

Bot:

- buyruqlarni qabul qiladi;
- Mini App tugmasini ko'rsatadi;
- Webhook orqali Backend bilan ishlaydi.

Bizning Bot:

```
@<BOT_USERNAME>
```

---

# 3. BotFather

BotFather yordamida quyidagilar sozlanadi.

- Bot yaratish
- Token olish
- Mini App URL
- Bot tavsifi
- Buyruqlar
- Profil rasmi

Bot Token maxfiy ma'lumot hisoblanadi.

U faqat `.env` faylida saqlanadi.

---

# 4. Telegram Mini App

Mini App Telegram ichida ochiladigan Web Application hisoblanadi.

Bizning Mini App manzili.

```
https://jalolyusuf.info
```

Telegram foydalanuvchi shu manzilni hech qachon qo'lda yozmaydi.

Bot tugmasini bosganda Telegram avtomatik ochadi.

---

# 5. Webhook

Webhook — Telegram va Backend orasidagi aloqa usuli.

Bizning Webhook.

```
https://jalolyusuf.info/api/v1/telegram/webhook
```

Telegram har safar yangi hodisa yuz berganda shu URL ga HTTP POST yuboradi.

Masalan.

- /start
- message
- callback_query

hammasi shu orqali keladi.

---

# 6. initData

Mini App ochilganda Telegram maxsus ma'lumot yuboradi.

Bu ma'lumot initData deb ataladi.

Unda quyidagilar bo'ladi.

- telegram_user_id
- username
- first_name
- last_name
- language_code
- hash
- auth_date

Backend ushbu ma'lumotni tekshiradi.

Agar hash noto'g'ri bo'lsa foydalanuvchi tizimga kiritilmaydi.

---

# 7. Authentication

Bizning loyihada login va parol ishlatilmaydi.

Jarayon quyidagicha.

```
Telegram

↓

Mini App

↓

initData

↓

Backend

↓

Hash tekshiriladi

↓

User topiladi yoki yaratiladi

↓

Session yaratiladi

↓

Frontend
```

Shunday qilib foydalanuvchi avtomatik tizimga kiradi.

---

# 8. User Flow

Foydalanuvchi Mini App tugmasini bosadi.

↓

Telegram Mini App ochiladi.

↓

Frontend yuklanadi.

↓

Frontend initData ni Backend ga yuboradi.

↓

Backend hash ni tekshiradi.

↓

Backend Database dan User ni qidiradi.

↓

Agar mavjud bo'lmasa yangi User yaratiladi.

↓

Frontend foydalanuvchi ma'lumotini oladi.

↓

Asosiy sahifa ochiladi.

---

# 9. Security

Telegram bilan ishlashda quyidagi qoidalar amal qiladi.

✅ Bot Token GitHub ga yuklanmaydi.

✅ Token faqat `.env` da saqlanadi.

✅ initData hash tekshiriladi.

✅ HTTPS ishlatiladi.

✅ Webhook faqat Telegram serverlaridan keladi.

✅ Secret Token ishlatiladi.

---

# 10. Monitoring

Webhook holati.

```bash
curl https://api.telegram.org/bot<TOKEN>/getWebhookInfo
```

Bot ishlayaptimi.

Telegram ichida `/start` yuboriladi.

Backend loglari.

```bash
docker logs todo-bot-backend-1
```

---

# 11. Troubleshooting

Mini App ochilmayapti.

Tekshirish.

- HTTPS
- Nginx
- Domen
- BotFather URL

Webhook ishlamayapti.

Tekshirish.

```bash
curl https://api.telegram.org/bot<TOKEN>/getWebhookInfo
```

Backend ishlamayapti.

```bash
curl https://jalolyusuf.info/api/v1/health
```

---

# 12. Kelajakdagi imkoniyatlar

Kelajakda quyidagilar qo'shiladi.

- Telegram Login Widget
- Inline Mode
- Payments
- Telegram Stars
- File Upload
- Voice Message
- Group Management

---

# 13. Production qoidalari

✅ Mini App faqat HTTPS orqali ishlaydi.

✅ Mini App faqat `jalolyusuf.info` domenida ishlaydi.

✅ Webhook har doim HTTPS bo'lishi kerak.

✅ Secret Token ishlatiladi.

✅ initData har doim tekshiriladi.

---

# Xulosa

Telegram ToDo-BOT loyihasining asosiy kirish nuqtasi hisoblanadi.

Foydalanuvchilar Telegram orqali Mini App ni ochadi, Backend esa Webhook va initData yordamida foydalanuvchini xavfsiz aniqlaydi.

Telegram platformasi tufayli alohida login va parol talab qilinmaydi, foydalanuvchi avtomatik autentifikatsiya qilinadi.

---

## Keyingi hujjat

**08 - Security.md**

Unda quyidagilar yoziladi.

- Server xavfsizligi
- Docker xavfsizligi
- Nginx xavfsizligi
- Database xavfsizligi
- Telegram xavfsizligi
- GitHub xavfsizligi
- Backup siyosati
- Disaster Recovery