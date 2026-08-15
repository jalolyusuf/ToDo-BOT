# GitHub Secrets Setup Guide

GitHub Actions uchun SSH va bot token secretlarini sozlash.

---

## 1. SSH Key yaratish (server'da)

Server'ga ulaning:
```bash
ssh ubuntu_admin@10.0.48.3
```

SSH key yarating:
```bash
ssh-keygen -t rsa -b 4096 -C "github-actions-deploy" -f ~/.ssh/github_deploy -N ""
```

Public key'ni authorized_keys'ga qo'shing:
```bash
cat ~/.ssh/github_deploy.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

Private key'ni ko'chirib oling (clipboard'ga):
```bash
cat ~/.ssh/github_deploy
```

**OUTPUT:**
```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAACFw...
(ko'p qator)
-----END OPENSSH PRIVATE KEY-----
```

**Bu keyni copy qiling!** (to'liq, `-----BEGIN` dan `-----END-----` gacha)

Server'dan chiqing:
```bash
exit
```

---

## 2. GitHub Repository Settings

### a) GitHub'ga kiring va repository'ni oching:
https://github.com/jalolyusuf/ToDo-BOT

### b) Settings > Secrets and variables > Actions

### c) "New repository secret" tugmasini bosing

### d) Quyidagi secretlarni qo'shing:

#### Secret 1: SSH_PRIVATE_KEY
- **Name:** `SSH_PRIVATE_KEY`
- **Value:** (yuqorida copy qilgan private key, to'liq)
```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAACFw...
-----END OPENSSH PRIVATE KEY-----
```

#### Secret 2: SSH_HOST
- **Name:** `SSH_HOST`
- **Value:** `10.0.48.3`

#### Secret 3: SSH_USERNAME
- **Name:** `SSH_USERNAME`
- **Value:** `ubuntu_admin`

#### Secret 4: PROJECT_PATH
- **Name:** `PROJECT_PATH`
- **Value:** `/home/ubuntu_admin/Downloads/ToDo-BOT`

#### Secret 5: TELEGRAM_BOT_TOKEN
- **Name:** `TELEGRAM_BOT_TOKEN`
- **Value:** `7823007296:AAGPBMacqYQhFM2vUzd94mXCM4GXh_u86EQ`

---

## 3. Test qilish

### GitHub'ga push qiling:
```bash
git add .
git commit -m "ci: add GitHub Actions auto-deploy workflow"
git push origin main
```

### GitHub Actions log'ini ko'ring:
1. GitHub repository'ni oching
2. **Actions** tabiga o'ting
3. Eng oxirgi workflow run'ni bosing
4. Log'larni ko'ring

---

## 4. Kutilayotgan natija

GitHub Actions muvaffaqiyatli bo'lsa:
- ✅ Code pulled
- ✅ Docker rebuilt
- ✅ Migrations run
- ✅ Health check passed
- ✅ Webhook set

---

## 5. Endi qanday ishlaydi?

**Har safar `git push origin main` qilganingizda:**
1. GitHub Actions avtomatik ishga tushadi
2. Server'ga ulanadi
3. Yangi kodni oladi
4. Docker'ni rebuild qiladi
5. Migration'larni run qiladi
6. Deploy tugadi!

**Siz faqat code yozib, push qilasiz. Qolgani avtomatik! 🚀**

---

## Troubleshooting

### SSH Key ishlamasa:

Server'da:
```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

### GitHub Actions fail bo'lsa:

Actions log'ini diqqat bilan o'qing va qaysi qadamda xato bo'lganini aniqlang.

### Manual deploy kerak bo'lsa:

GitHub'da **Actions** > **Deploy to Production** > **Run workflow** tugmasini bosing.
