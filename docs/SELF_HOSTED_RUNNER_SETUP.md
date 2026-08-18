# Self-Hosted GitHub Actions Runner Setup

Professional production deploy uchun Self-hosted Runner o'rnatish.

---

## 1. GitHub'da Runner Token olish

1. Repository: https://github.com/jalolyusuf/ToDo-BOT
2. **Settings** → **Actions** → **Runners**
3. **"New self-hosted runner"** tugmasini bosing
4. **Linux** va **x64** tanlang
5. U yerda ko'rsatilgan commandlarni copy qiling (token bor)

---

## 2. Server'da Runner o'rnatish

### a) Server'ga ulaning:
```bash
ssh your_username@your_server_ip
```

### b) Runner papkasi yarating:
```bash
cd ~
mkdir actions-runner && cd actions-runner
```

### c) Runner download qiling (GitHub'dan ko'rsatilgan versiya):
```bash
# GitHub'dan ko'rsatilgan command - masalan:
curl -o actions-runner-linux-x64-2.319.1.tar.gz -L https://github.com/actions/runner/releases/download/v2.319.1/actions-runner-linux-x64-2.319.1.tar.gz

# Extract
tar xzf ./actions-runner-linux-x64-*.tar.gz
```

### d) Runner'ni configure qiling (GitHub token bilan):
```bash
# GitHub'dan ko'rsatilgan command - masalan:
./config.sh --url https://github.com/jalolyusuf/ToDo-BOT --token YOUR_GITHUB_TOKEN_HERE

# Savollarga javoblar:
# - Enter the name of the runner group: [Press Enter for default]
# - Enter the name of runner: [todo-bot-runner]
# - Enter any additional labels: [production]
# - Enter name of work folder: [Press Enter for default: _work]
```

### e) Runner'ni service sifatida o'rnating (avtomatik start):
```bash
# Service o'rnatish
sudo ./svc.sh install

# Service'ni ishga tushirish
sudo ./svc.sh start

# Status tekshirish
sudo ./svc.sh status
```

---

## 3. Runner statusini tekshirish

### GitHub'da:
- Settings → Actions → Runners
- Ro'yxatda yangi runner ko'rinishi kerak
- Status: **🟢 Idle** (tayyor)

### Server'da:
```bash
cd ~/actions-runner
sudo ./svc.sh status
# Natija: active (running)
```

---

## 4. Workflow'ni yangilash

`.github/workflows/deploy.yml` faylini yangilang:

```yaml
name: Deploy to Production

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  deploy:
    name: Deploy to Server
    runs-on: self-hosted  # ← SSH o'rniga self-hosted
    
    steps:
      - name: 📥 Checkout code
        uses: actions/checkout@v4
      
      - name: 🐳 Deploy with Docker
        env:
          TELEGRAM_BOT_TOKEN: ${{ secrets.TELEGRAM_BOT_TOKEN }}
        run: |
          cd /home/$USER/Downloads/ToDo-BOT
          
          echo "📥 Pulling latest code..."
          git pull origin main
          
          echo "🔧 Updating bot token..."
          sed -i "s|TELEGRAM_BOT_TOKEN=.*|TELEGRAM_BOT_TOKEN=$TELEGRAM_BOT_TOKEN|" .env
          
          echo "🐳 Rebuilding containers..."
          docker compose down
          docker compose up -d --build
          
          echo "⏳ Waiting for containers..."
          sleep 15
          
          echo "🗃️  Running migrations..."
          docker compose exec -T backend alembic upgrade head
          
          echo "🏥 Health check..."
          curl -f http://localhost:8000/api/v1/health || exit 1
          
          echo "🤖 Setting webhook..."
          curl -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook" \
            -H "Content-Type: application/json" \
            -d '{"url":"https://jalolyusuf.info/api/v1/telegram/webhook"}'
          
          echo "✅ Deployment completed!"
      
      - name: 📊 Deployment Summary
        if: success()
        run: |
          echo "### ✅ Deployment Successful! 🚀" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "- **Branch:** main" >> $GITHUB_STEP_SUMMARY
          echo "- **Commit:** ${{ github.sha }}" >> $GITHUB_STEP_SUMMARY
          echo "- **Server:** https://jalolyusuf.info" >> $GITHUB_STEP_SUMMARY
          echo "- **Health:** https://jalolyusuf.info/api/v1/health" >> $GITHUB_STEP_SUMMARY

      - name: ❌ Deployment Failed
        if: failure()
        run: |
          echo "### ❌ Deployment Failed" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "Check the logs above for details." >> $GITHUB_STEP_SUMMARY
```

---

## 5. Kerakli GitHub Secret (faqat bitta):

Endi faqat **1 ta secret** kerak:

| Secret Name | Value |
|-------------|-------|
| `TELEGRAM_BOT_TOKEN` | `7823007296:AAGPBMacqYQhFM2vUzd94mXCM4GXh_u86EQ` |

**SSH_PRIVATE_KEY, SSH_HOST, SSH_USERNAME, PROJECT_PATH keraksiz endi!** ✅

---

## 6. Test qilish

### Workflow'ni update qiling va push qiling:
```bash
git add .github/workflows/deploy.yml docs/SELF_HOSTED_RUNNER_SETUP.md
git commit -m "ci: migrate to self-hosted GitHub Actions runner"
git push origin main
```

### GitHub Actions'da kuzating:
- Actions → oxirgi workflow run
- Log'da: "Set up runner" → "self-hosted runner"

---

## Troubleshooting

### Runner offline bo'lsa:
```bash
cd ~/actions-runner
sudo ./svc.sh stop
sudo ./svc.sh start
sudo ./svc.sh status
```

### Runner log'larni ko'rish:
```bash
cd ~/actions-runner
tail -f _diag/Runner_*.log
```

### Runner'ni o'chirish (kerak bo'lsa):
```bash
cd ~/actions-runner
sudo ./svc.sh stop
sudo ./svc.sh uninstall
./config.sh remove --token YOUR_REMOVAL_TOKEN
```

---

## Afzalliklari

✅ **Xavfsiz:** SSH key'lar, server IP GitHub'ga bermaysiz
✅ **Tez:** Server ichida ishlaydi, SSH overhead yo'q
✅ **Professional:** Enterprise standard approach
✅ **Simple:** Kamroq secret'lar kerak
✅ **Private:** Private network'dagi server'da ishlaydi

---

## Keyingi qadamlar

1. ✅ Runner o'rnatildi va running
2. ✅ Workflow updated
3. ✅ Push qiling va test qiling
4. 🎉 Avtomatik deploy ishlaydi!

Endi har safar `git push origin main` qilganingizda, server'dagi runner avtomatik deploy qiladi!
