# 🐳 Docker Desktop O'rnatish (Windows)

## 1-Qadam: Yuklab Olish

**Link:** https://www.docker.com/products/docker-desktop/

yoki

**To'g'ridan-to'g'ri:** https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe

## 2-Qadam: O'rnatish

1. Yuklab olingan `Docker Desktop Installer.exe` ni oching
2. "Use WSL 2 instead of Hyper-V" ni belgilang (tavsiya)
3. "Install" bosing
4. O'rnatish tugagach, kompyuterni restart qiling

## 3-Qadam: Ishga Tushirish

1. Docker Desktop ilovasini oching
2. Engine ishga tushguncha kuting (1-2 daqiqa)
3. Pastki chap burchakda yashil rang paydo bo'lsa - tayyor! ✅

## 4-Qadam: Tekshirish

Terminal'da bajaring:

```bash
docker --version
docker compose version
```

Agar versiyalar ko'rinsangiz - Docker tayyor!

---

## Qo'shimcha

**System Requirements:**
- Windows 10/11 (64-bit)
- 4GB RAM (minimum)
- WSL 2 enabled

**Muammo bo'lsa:**
- Docker Desktop Settings → General → "Use WSL 2" ni yoqing
- Windows Features → "Virtual Machine Platform" va "Windows Subsystem for Linux" ni yoqing
