# 04 - Nginx

---

## Hujjat haqida

**Versiya:** 1.0

**Loyiha:** ToDo-BOT

**Oxirgi yangilangan sana:** 2026-07-14

**Muallif:** Jaloliddin Yusuf

---

# Mundarija

1. Nginx nima?
2. Nima uchun Nginx ishlatildi?
3. Reverse Proxy nima?
4. Bizning arxitekturadagi vazifasi
5. Nginx Request Flow
6. HTTPS
7. SSL
8. Server Block
9. server_name
10. location
11. proxy_pass
12. Header lar
13. Bizning konfiguratsiya
14. Xavfsizlik
15. Monitoring
16. Troubleshooting
17. Xulosa

---

# 1. Nginx nima?

Nginx — yuqori unumdorlikka ega Web Server va Reverse Proxy hisoblanadi.

Bizning loyihada u statik saytni saqlamaydi.

Asosiy vazifasi:

- Reverse Proxy
- HTTPS
- SSL
- Request Routing

---

# 2. Nima uchun aynan Nginx?

Biz quyidagi sabablar tufayli Nginx tanladik.

- Juda tez ishlaydi
- Xotira kam ishlatadi
- Reverse Proxy juda kuchli
- SSL boshqaradi
- Docker bilan yaxshi ishlaydi

---

# 3. Reverse Proxy nima?

Reverse Proxy foydalanuvchi bilan Backend orasidagi vositachi hisoblanadi.

Foydalanuvchi hech qachon Backend bilan to'g'ridan-to'g'ri ishlamaydi.

```

Browser

↓

Nginx

↓

Backend

```

Frontend ham xuddi shu orqali ishlaydi.

---

# 4. Bizning loyihadagi vazifasi

Bizning serverda Nginx quyidagi ishlarni bajaradi.

- HTTPS ni boshqaradi.
- SSL sertifikatni ishlatadi.
- Frontend ni chiqaradi.
- API ni Backend ga uzatadi.
- Noto'g'ri Host so'rovlarini rad etadi.
- Docker containerlarni tashqi internetdan yashiradi.

---

# 5. Request Flow

Oddiy sahifa ochilganda.

```

Browser

↓

https://jalolyusuf.info

↓

Nginx

↓

Frontend (127.0.0.1:8088)

↓

HTML

↓

Browser

```

---

API so'rovi.

```

Browser

↓

https://jalolyusuf.info/api/

↓

Nginx

↓

Backend (127.0.0.1:8000)

↓

FastAPI

↓

JSON

↓

Browser

```

---

# 6. HTTPS

HTTPS foydalanuvchi bilan server orasidagi barcha trafikni shifrlaydi.

Biz Let's Encrypt sertifikatidan foydalanamiz.

Brauzer:

```

https://jalolyusuf.info

```

ko'rinishida ulanadi.

---

# 7. SSL

SSL sertifikat quyidagi papkada joylashadi.

```

/etc/letsencrypt/live/jalolyusuf.info/

```

Asosiy fayllar.

```

fullchain.pem

privkey.pem

```

---

# 8. Server Block

Bizning loyihada Server Block quyidagi domenlar uchun ishlaydi.

```

jalolyusuf.info

www.jalolyusuf.info

```

Kelajakdagi qoida.

www

↓

301 Redirect

↓

jalolyusuf.info

---

# 9. server_name

```

server_name jalolyusuf.info;

```

Bu juda muhim.

Nginx faqat shu domen uchun xizmat qiladi.

Boshqa domenlar ishlamasligi kerak.

IP orqali kirish ham tavsiya etilmaydi.

---

# 10. location

Frontend.

```

location /

```

Backend.

```

location /api/

```

Shu orqali request qayerga borishi aniqlanadi.

---

# 11. proxy_pass

Frontend.

```

proxy_pass http://127.0.0.1:8088;

```

Backend.

```

proxy_pass http://127.0.0.1:8000;

```

Nginx requestni Docker containerga uzatadi.

---

# 12. Header lar

Biz quyidagi Header larni uzatamiz.

```

Host

X-Real-IP

X-Forwarded-For

X-Forwarded-Proto

```

Backend foydalanuvchining haqiqiy IP manzilini bilishi uchun ular zarur.

---

# 13. Bizning real konfiguratsiya

Frontend.

```

location / {

proxy_pass http://127.0.0.1:8088;

}

```

Backend.

```

location /api/ {

proxy_pass http://127.0.0.1:8000;

}

```

---

# 14. Xavfsizlik

Biz quyidagi qoidalarga amal qilamiz.

✅ Docker portlari Internetga ochilmaydi.

✅ Faqat Nginx ochiq.

✅ HTTPS majburiy.

✅ SSL sertifikat ishlatiladi.

✅ Backend faqat localhost orqali ishlaydi.

✅ Frontend faqat localhost orqali ishlaydi.

---

# 15. Monitoring

Nginx holatini tekshirish.

```

sudo systemctl status nginx

```

Konfiguratsiyani tekshirish.

```

sudo nginx -t

```

Qayta yuklash.

```

sudo systemctl reload nginx

```

---

# 16. Troubleshooting

### API ishlamayapti

Tekshirish.

```

curl http://127.0.0.1:8000/api/v1/health

```

---

Frontend ishlamayapti.

```

curl http://127.0.0.1:8088

```

---

SSL ishlamayapti.

```

sudo certbot certificates

```

---

Nginx ishlamayapti.

```

sudo journalctl -u nginx

```

---

# 17. Kelajakdagi yaxshilanishlar

Kelajakda quyidagilar qo'shiladi.

- Rate Limiting
- Gzip
- Brotli
- HTTP/2
- HTTP/3
- Security Headers
- CSP
- HSTS
- Cache Control

---

# Xulosa

Nginx ToDo-BOT loyihasining yagona kirish nuqtasi hisoblanadi.

Barcha tashqi trafik aynan Nginx orqali o'tadi.

Nginx HTTPS, Reverse Proxy va request routing vazifalarini bajaradi.

Shu sababli Backend va Frontend internetdan bevosita foydalanmaydi.

Bu esa xavfsizlikni sezilarli darajada oshiradi.

---

## Keyingi hujjat

05 - Docker.md