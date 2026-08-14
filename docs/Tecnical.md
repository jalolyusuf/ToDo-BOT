# ToDo-BOT

## Telegram Task Management Platform

### TEXNIK TOPSHIRIQ — TZ / MASTER SPECIFICATION

**Versiya:** 1.0
**Sana:** 2026-08-14
**Loyiha turi:** Telegram Bot + Telegram Mini App
**Asosiy domen:** `jalolyusuf.info`

---

# 1. HUJJAT MAQSADI

Ushbu hujjat ToDo-BOT loyihasining to'liq texnik, funksional va arxitektura talablarini belgilaydi.

Mazkur hujjat loyiha uchun **asosiy Master Specification** hisoblanadi. Keyingi development bosqichlarida implementatsiya ushbu hujjatda belgilangan biznes qoidalari va texnik cheklovlarga mos bo'lishi kerak.

Agar keyingi development topshirig'i ushbu hujjatdagi mavjud biznes qoidasiga zid bo'lsa, yangi qoida alohida tasdiqlanmaguncha ushbu hujjatdagi qoida ustuvor hisoblanadi.

---

# 2. LOYIHANING MAQSADI

ToDo-BOT — Telegram ekotizimida ishlaydigan task-management platforma.

Platforma foydalanuvchilarga:

* Telegram orqali ro'yxatdan o'tish;
* guruhlar yaratish;
* guruhga foydalanuvchilarni qo'shish;
* task yaratish;
* taskni bajaruvchiga biriktirish;
* task holatini boshqarish;
* taskga izoh yozish;
* taskga fayl, rasm, video, voice va boshqa media biriktirish;
* deadline va reminderlardan foydalanish;
* tasklarni filterlash;
* guruhlar bo'yicha ishlash;
* Telegram orqali notification olish;
* private storage orqali fayllarni saqlash;
* pullik group yaratish mexanizmidan foydalanish

imkonini beruvchi yagona tizim bo'lishi kerak.

Platformaning asosiy interfeysi Telegram Mini App hisoblanadi.

Telegram bot esa:

* foydalanuvchini tizimga kiritish;
* Mini App'ni ochish;
* notification yuborish;
* webhook orqali Telegram update'larini qabul qilish;
* tizim bilan Telegram o'rtasidagi integratsiyani ta'minlash

uchun ishlatiladi.

---

# 3. ASOSIY ARXITEKTURA

Loyiha monorepo arxitekturasida quriladi.

Asosiy logical architecture:

```text
                    INTERNET
                       |
                       v
                  DNS
              jalolyusuf.info
                       |
                       v
                    pfSense
                       |
                       v
                 Ubuntu Server
                       |
                       v
                     Nginx
                    /     \
                   /       \
                  v         v
             Frontend     Backend
              React       FastAPI
                |           |
                |           +------ PostgreSQL
                |           |
                |           +------ Redis
                |
                v
          Telegram Mini App
                |
                v
           Telegram Bot
```

Loyihaning umumiy network arxitekturasi:

```text
Internet
   |
DNS (jalolyusuf.info)
   |
pfSense
   |
Ubuntu
   |
Nginx
   |
+-----------------------+
|                       |
Frontend             Backend
127.0.0.1:8088      127.0.0.1:8000
                         |
                  +------+------+
                  |             |
              PostgreSQL      Redis
```

Ushbu architecture loyiha materiallaridagi belgilangan arxitekturaga mos: Internet → DNS → pfSense → Ubuntu → Nginx → Frontend/Backend → PostgreSQL/Redis.

---

# 4. DEPLOYMENT TALABI

Production deployment Ubuntu serverda Docker Compose orqali amalga oshiriladi.

Asosiy servislar:

```text
postgres
redis
backend
frontend
```

Nginx Docker Compose ichidagi servis emas, host Ubuntu serverida reverse proxy sifatida ishlaydi.

Production trafik:

```text
HTTPS :443
    |
    v
Nginx
    |
    +----> 127.0.0.1:8088
    |       Frontend
    |
    +----> 127.0.0.1:8000
            Backend
```

Database va Redis internetga ochilmasligi kerak.

Loyiha network hujjatida ham:

| Service    |   Port | Public |
| ---------- | -----: | :----: |
| Nginx      | 80/443 |   Yes  |
| Frontend   |   8088 |   No   |
| Backend    |   8000 |   No   |
| PostgreSQL |   5432 |   No   |
| Redis      |   6379 |   No   |

deb belgilangan.

---

# 5. PUBLIC ACCESS TALABI

Web Application internet orqali faqat:

```text
https://jalolyusuf.info
```

manzilidan foydalanilishi kerak.

Production Mini App boshqa domain orqali ochilmasligi kerak.

Quyidagilar application uchun valid public entry point hisoblanmaydi:

```text
http://SERVER_IP
https://SERVER_IP

http://OTHER-DOMAIN
https://OTHER-DOMAIN

http://SERVER_IP:8088
https://SERVER_IP:8088

http://SERVER_IP:8000
https://SERVER_IP:8000
```

Frontend va backend host serverning public network interface'iga bind qilinmasligi kerak.

Docker portlari localhost bilan cheklanishi kerak:

```yaml
127.0.0.1:8088:80
127.0.0.1:8000:8000
```

Bu bilan frontend va backendga Nginx orqali kirish ta'minlanadi.

Nginx esa application uchun public reverse proxy hisoblanadi.

---

# 6. DNS VA HTTPS

Production domain:

```text
jalolyusuf.info
```

HTTPS majburiy.

TLS certificate Let's Encrypt / Certbot orqali boshqariladi.

HTTP trafik HTTPS ga yo'naltirilishi yoki application siyosatiga muvofiq rad etilishi kerak.

Telegram Mini App URL HTTPS bo'lishi shart.

Expected Mini App URL:

```text
https://jalolyusuf.info
```

Telegram konfiguratsiyasidagi Mini App URL va backend konfiguratsiyasidagi:

```text
TELEGRAM_MINI_APP_URL
```

bir xil canonical URLga mos kelishi kerak.

---

# 7. QAT'IY TEXNOLOGIK STACK

Stack almashtirilmaydi.

## 7.1 Backend

```text
Python 3.12+
FastAPI
Pydantic v2
pydantic-settings
SQLAlchemy 2.x Async
asyncpg
Alembic
PostgreSQL
```

## 7.2 Telegram Bot

```text
aiogram 3.x
```

## 7.3 Cache / Queue / Background Jobs

```text
Redis
ARQ
```

## 7.4 Frontend

```text
React
TypeScript
Vite
Tailwind CSS
```

## 7.5 Infrastructure

```text
Docker
Docker Compose
Nginx
Let's Encrypt
```

## 7.6 Architecture

```text
Monorepo
```

Ushbu stack loyiha foundation talablarida qat'iy belgilangan.

---

# 8. ASOSIY TIZIM KOMPONENTLARI

Tizim quyidagi asosiy komponentlardan iborat:

### 8.1 Telegram Bot

Mas'uliyatlari:

* `/start`;
* foydalanuvchini ro'yxatdan o'tkazish;
* Mini App tugmasini ko'rsatish;
* Telegram webhook;
* Telegram update processing;
* notification;
* reminder;
* system messages.

### 8.2 Telegram Mini App

Asosiy user interface.

Mas'uliyatlari:

* authentication;
* user profile;
* groups;
* tasks;
* comments;
* files/media;
* filters;
* storage;
* payment UI;
* notification-related UI;
* application settings.

### 8.3 Backend API

Barcha business logicning asosiy manbasi.

Backend:

* authentication;
* authorization;
* user management;
* group management;
* task management;
* comments;
* storage;
* payments;
* reminders;
* notifications;
* blacklist;
* Telegram integration

uchun javobgar.

### 8.4 PostgreSQL

Persistent relational data storage.

### 8.5 Redis

Quyidagilar uchun ishlatiladi:

* cache;
* vaqtinchalik state;
* background jobs;
* queue;
* reminder scheduling uchun yordamchi mexanizmlar.

### 8.6 ARQ

Background job processing uchun ishlatiladi.

### 8.7 Nginx

Mas'uliyatlari:

* HTTPS termination;
* reverse proxy;
* domain routing;
* frontend proxy;
* API proxy;
* public access control.

---

# 9. FOYDALANUVCHI TIZIMI

Foydalanuvchi Telegram orqali tizimga kiradi.

Telegram user asosiy identity source hisoblanadi.

Foydalanuvchi uchun quyidagi ma'lumotlar saqlanishi mumkin:

```text
telegram_user_id
username
first_name
last_name
language_code
is_active
created_at
updated_at
```

Telegram user ID tizimdagi asosiy external identity hisoblanadi.

Foydalanuvchi alohida username/password authentication tizimidan foydalanmaydi.

---

# 10. TELEGRAM AUTHENTICATION

Telegram Mini App authentication Telegram tomonidan beriladigan `initData` asosida amalga oshiriladi.

Frontend raw Telegram `initData` qiymatini backendga yuboradi.

Backend:

1. `initData`ni qabul qiladi;
2. Telegram formatini tekshiradi;
3. signature/hashni tekshiradi;
4. HMAC derivation orqali Telegram token bilan validatsiya qiladi;
5. `auth_date`ni tekshiradi;
6. eskirgan authentication ma'lumotlarini rad etadi;
7. Telegram user ma'lumotlarini ajratib oladi;
8. userni database orqali topadi yoki yaratadi;
9. authenticated current user context yaratadi.

Raw `initData` loglarga chiqarilmasligi kerak.

Bot token loglarda ko'rinmasligi kerak.

Telegram authentication validation uchun constant-time comparison ishlatilishi kerak.

Loyiha foundationida Telegram `initData` HMAC validation, `auth_date` freshness, malformed payload handling va current-user dependency implement qilinganligi qayd etilgan.

---

# 11. FOYDALANUVCHI ROLLARI

Tizimda asosiy permission rollari:

```text
Creator
Assignee
Group Owner
Master Admin
```

## 11.1 Creator

Taskni yaratgan foydalanuvchi.

Creator:

* taskni yaratadi;
* task detailni ko'radi;
* taskga izoh yozishi mumkin;
* taskga media biriktirishi mumkin;
* o'z taskini o'chirishi mumkin.

Creator boshqa foydalanuvchilarga berilgan permissionlarni avtomatik ravishda olmaydi.

---

# 12. ASSIGNEE

Assignee — task bajarilishi uchun biriktirilgan foydalanuvchi.

Assignee:

* o'ziga biriktirilgan tasklarni ko'radi;
* task detailni ko'radi;
* task bilan ishlaydi;
* izoh qoldirishi mumkin;
* task lifecycle bo'yicha ruxsat berilgan amallarni bajaradi.

---

# 13. GROUP OWNER

Group Owner guruhning asosiy boshqaruvchisi.

Group Owner:

* group settingsni boshqaradi;
* group members bilan ishlaydi;
* group permissionlarini boshqaradi;
* group tasklarining guruhga tegishli boshqaruvini amalga oshiradi.

Group Owner huquqlari task Creator huquqlaridan alohida hisoblanadi.

---

# 14. MASTER ADMIN

Master Admin — tizim darajasidagi administrator.

Master Admin:

* tizim bo'yicha administrator funksiyalariga ega;
* foydalanuvchilarni boshqarishi mumkin;
* guruhlarni boshqarishi mumkin;
* system-level moderation va management funksiyalarini bajarishi mumkin.

**Muhim biznes qoida:**

> Master Admin taskni o'chira olmaydi.

Taskni o'chirish huquqi Creatorga tegishli.

Bu qoida authorization qatlamida backend tomonidan majburiy tekshirilishi kerak.

Frontenddagi tugmani yashirishning o'zi yetarli emas.

---

# 15. TASK VISIBILITY

Tasklar public emas.

Task faqat quyidagi tomonlarga ko'rinadi:

```text
Task Creator
Task Assignee
Authorized Group Owner
Authorized Master Admin
```

Boshqa foydalanuvchi task IDni bilgan taqdirda ham taskni ko'ra olmasligi kerak.

Backend har bir task requestida authorization tekshirishi kerak.

Quyidagi modelga yo'l qo'yilmaydi:

```text
GET /tasks/{id}
```

va faqat `id` mavjudligi asosida taskni qaytarish.

Backend foydalanuvchi bilan task o'rtasidagi permission relationni tekshirishi shart.

---

# 16. TASK ASOSIY TUSHUNCHASI

Task tizimning asosiy business entitylaridan biridir.

Task kamida quyidagi tushunchalarni o'z ichiga oladi:

```text
Creator
Assignee
Group
Title
Description
Status
Priority
Deadline
Created At
Updated At
Comments
Attachments
Reminders
```

Aniq database fieldlari implementatsiya vaqtida alohida data model specification bilan belgilanadi.

---

# 17. TASK LIFECYCLE

Task lifecycle state-machine tamoyili asosida quriladi.

Minimal holatlar:

```text
Created
Assigned
In Progress
Completed
```

Kelajakda qo'shimcha state'lar kiritilishi mumkin, lekin ular backend business rules orqali boshqariladi.

Frontend task statusni o'zicha o'zgartirib databasega yozmasligi kerak.

Barcha lifecycle transitionlar backend orqali amalga oshiriladi.

---

# 18. TASK YARATISH

User task yaratishda kamida:

* task nomi;
* task description;
* assignee;
* kerak bo'lsa group;
* deadline;
* priority

kabi parametrlarni belgilashi mumkin.

Task yaratilganda:

1. creator aniqlanadi;
2. group permission tekshiriladi;
3. assignee validligi tekshiriladi;
4. task databasega yoziladi;
5. attachmentlar mavjud bo'lsa ular bog'lanadi;
6. deadline bo'lsa reminder schedule qilinadi;
7. kerak bo'lsa assignee notification oladi.

---

# 19. TASK O'CHIRISH

Taskni o'chirish huquqi:

```text
Creator = YES
Master Admin = NO
Unauthorized User = NO
```

Group Owner uchun alohida delete permission faqat keyingi biznes qoida bilan aniq tasdiqlansa qo'shiladi.

Backend authorization:

```text
if current_user.id != task.creator_id:
    reject
```

tamoyiliga asoslangan bo'lishi kerak.

Frontendda delete tugmasini yashirish xavfsizlik mexanizmi hisoblanmaydi.

---

# 20. COMMENTS

Har bir taskga comment biriktirilishi mumkin.

Comment:

```text
author
task
content
created_at
updated_at
```

kabi ma'lumotlarni o'z ichiga oladi.

Comment faqat taskni ko'rish huquqiga ega foydalanuvchilarga ko'rinadi.

Comment yaratishda:

```text
User -> Task access?
        |
        +-- YES -> Comment allowed
        |
        +-- NO -> 403
```

tamoyili qo'llanadi.

---

# 21. MEDIA VA ATTACHMENTS

Task va commentlarga media biriktirish qo'llab-quvvatlanadi.

Qo'llab-quvvatlanadigan media turlariga quyidagilar kiradi:

```text
Files
Images
Videos
Voice
```

Media faylning o'zi va metadata tushunchalari alohida boshqariladi.

Database katta binary fayllarni asosiy storage sifatida saqlashga majbur emas.

Storage layer alohida abstraction orqali ishlashi kerak.

---

# 22. PRIVATE STORAGE

Loyihada private storage konsepsiyasi mavjud.

Default storage channel foydalanuvchi tomonidan yaratiladi.

Media/fayllar private storage mexanizmi orqali saqlanishi mumkin.

Agar administrator tomonidan ishlatilayotgan storage channel o'chirib yuborilsa, tizim oldindan belgilangan default storage channelga kontentni forward qilish mexanizmini qo'llashi kerak.

Storage channel:

```text
User/Group
      |
      v
Storage Settings
      |
      v
Telegram Storage Channel
      |
      v
Media/File
```

ko'rinishida ishlaydi.

---

# 23. GROUP CONCEPT

Group — bir nechta userni umumiy task management kontekstiga birlashtiruvchi entity.

Group ichida:

* members;
* owner;
* tasks;
* permissions;
* settings;
* storage configuration

mavjud bo'lishi mumkin.

Group yaratish pullik business flow bilan bog'langan.

---

# 24. GROUP YARATISH VA PAYMENT

User group yaratishdan oldin payment talab qilinishi mumkin.

Business flow:

```text
User
  |
  v
Create Group
  |
  v
Payment Required
  |
  v
Payment Success
  |
  v
Group Created
```

Payment muvaffaqiyatsiz bo'lsa group yaratish yakunlanmasligi kerak.

Payment status backend tomonidan tekshiriladi.

Frontenddagi `payment successful` flagning o'zi group yaratish uchun yetarli emas.

---

# 25. INVITE LINKS

Group foydalanuvchilarni invite link orqali qo'shish imkoniyatiga ega bo'lishi kerak.

Invite link:

* qaysi groupga tegishli ekanini;
* kim yaratganini;
* amal qilish muddatini;
* ishlatilish limitini;
* aktiv/inactive holatini

boshqarishi mumkin.

Invite link orqali kirayotgan user backend tomonidan validatsiya qilinadi.

---

# 26. BLACKLIST

Tizimda blacklist mexanizmi mavjud.

Blacklistga tushirilgan user:

* tizimga kirishi;
* groupga qo'shilishi;
* task bilan ishlashi;
* boshqa business actionlarni bajarishi

bo'yicha belgilangan restrictionlarga ega bo'ladi.

Blacklist tekshiruvi backend authorization qatlamida bajariladi.

Frontend blacklistni bypass qila olmasligi kerak.

---

# 27. REMINDERS

Task deadline bilan bog'langan reminderlar mavjud.

Reminder:

```text
Task
Deadline
Reminder Time
Recipient
Status
```

kabi ma'lumotlarga ega bo'lishi mumkin.

Reminderlar background job mexanizmi orqali ishlaydi.

Redis + ARQ background processing uchun ishlatiladi.

Reminder userga Telegram orqali notification yuborishi mumkin.

---

# 28. NOTIFICATIONS

Notification tizimi quyidagi hodisalar uchun ishlatilishi mumkin:

* yangi task biriktirilishi;
* task deadline yaqinlashishi;
* taskga comment yozilishi;
* task statusi o'zgarishi;
* groupga qo'shilish;
* invite;
* payment holati;
* system eventlar.

Notification duplicate yuborilishining oldini olish uchun idempotency mexanizmi ko'zda tutilishi kerak.

---

# 29. FRONTEND TALABLARI

Frontend:

```text
React
TypeScript
Vite
Tailwind CSS
```

asosida quriladi.

Frontend business logicning authoritative source'i emas.

Frontend:

* UI;
* state management;
* API integration;
* Telegram WebApp integration;
* navigation;
* form validation;
* loading/error states

uchun javobgar.

Security-critical validation backendda qayta bajarilishi shart.

---

# 30. BACKEND API TALABLARI

API versioning ishlatiladi.

Asosiy prefix:

```text
/api/v1/
```

Health endpoint:

```text
GET /api/v1/health
```

Production health endpoint application, database va Redis holatini tekshiradi.

Hozirgi deploymentda health endpoint muvaffaqiyatli:

```json
{
  "status": "ok",
  "app": {
    "status": "ok",
    "detail": null
  },
  "database": {
    "status": "ok",
    "detail": null
  },
  "redis": {
    "status": "ok",
    "detail": null
  }
}
```

---

# 31. DATABASE

Database:

```text
PostgreSQL
```

ORM:

```text
SQLAlchemy 2.x Async
```

Driver:

```text
asyncpg
```

Migration:

```text
Alembic
```

Database schema development davomida Alembic migrationlar orqali boshqariladi.

Production databasega qo'lda schema o'zgartirish tavsiya etilmaydi.

---

# 32. DATABASE SECURITY

PostgreSQL public internetga ochilmaydi.

Database Docker internal networkda ishlaydi.

Backend PostgreSQLga internal Docker network orqali ulanadi.

Production architecture:

```text
Internet
   X
   |
PostgreSQL:5432
```

bo'lishi kerak.

To'g'ri:

```text
Backend
   |
Docker internal network
   |
PostgreSQL
```

---

# 33. REDIS SECURITY

Redis ham public internetga ochilmaydi.

Redis:

```text
Backend
   |
Docker internal network
   |
Redis
```

ko'rinishida ishlaydi.

Redis porti public firewall orqali ochilmasligi kerak.

---

# 34. DOCKER TALABLARI

Docker Compose quyidagi service'larni boshqaradi:

```yaml
postgres
redis
backend
frontend
```

Named volumes:

```text
postgres_data
redis_data
```

uchun ishlatiladi.

Service'larda healthcheck bo'lishi kerak.

Backend PostgreSQL va Redis healthy bo'lmaguncha ishga tushish dependency'siga ega.

Frontend backend healthy bo'lishini kutadi.

---

# 35. FOUNDATION VA DEVELOPMENT BOSQICHLARI

Loyiha development bosqichlarga bo'linadi.

## PHASE 1 — Foundation

Foundation bosqichida:

* monorepo;
* FastAPI;
* React;
* TypeScript;
* PostgreSQL;
* Redis;
* SQLAlchemy;
* Alembic;
* Docker;
* health endpoint;
* basic configuration;
* logging;
* basic API client

yaratiladi.

Bu bosqichda hali:

* Telegram `/start`;
* Mini App authentication;
* payment;
* group;
* task;
* comments;
* reminders;
* blacklist;
* notification;
* private storage;
* media upload;
* Master Admin commands

implement qilinmasligi kerak edi. Bu constraint loyiha Phase 1 specificationida aniq ko'rsatilgan.

## PHASE 2 — Identity & Telegram Integration

Bu bosqichda:

* User model;
* users migration;
* Telegram user persistence;
* `/start`;
* bot factory;
* Mini App button;
* Telegram webhook;
* `initData` authentication;
* current-user dependency;
* `/api/v1/auth/me`;
* frontend Telegram bootstrap

implement qilinadi.

Phase 2 bo'yicha mavjud development materialida user model, migration, Telegram persistence, `/start`, Mini App button va authentication komponentlari implement qilingani qayd etilgan.

---

# 36. DEVELOPMENT PRINCIPLES

Quyidagi prinsiplar majburiy:

### Backend authoritative

Business rule backendda amalga oshiriladi.

### Frontend is untrusted

Frontend yuborgan permission yoki role qiymatiga ishonilmaydi.

### Telegram identity authoritative

Telegram user identity Telegram authentication orqali aniqlanadi.

### Database consistency

Business-critical state PostgreSQLda saqlanadi.

### Background work asynchronous

Reminder, notification va boshqa uzoq davom etuvchi ishlar background worker orqali bajariladi.

### Security by default

Default holatda permission berilmaydi.

### Least privilege

User faqat o'ziga tegishli resource va ruxsat berilgan resource bilan ishlaydi.

---

# 37. MUHIM SECURITY QOIDASI

Quyidagi xato yondashuvlar taqiqlanadi:

```text
Frontendda delete buttonni yashirish = authorization
```

emas.

```text
User task IDni biladi = taskga access
```

emas.

```text
Telegram user IDni frontend yubordi = authentication
```

emas.

```text
Payment frontendda successful = payment confirmed
```

emas.

Har bir critical action backend tomonidan tekshirilishi shart.

---

# 38. HOZIRGI PRODUCTION HOLATI

Loyiha foundation va asosiy Telegram authentication bosqichlaridan o'tgan.

Current production infrastructure:

```text
pfSense
   |
Ubuntu 22.04
   |
Nginx
   |
jalolyusuf.info
   |
+-----------------------+
|                       |
Frontend             Backend
127.0.0.1:8088      127.0.0.1:8000
                         |
                  +------+------+
                  |             |
              PostgreSQL      Redis
```

Current health verification:

```text
GET https://jalolyusuf.info/api/v1/health
```

muvaffaqiyatli ishlaydi.

---

# 39. KEYINGI TZ QISMI

Keyingi qismda quyidagilar to'liq spetsifikatsiya qilinadi:

1. **Group management**
2. **Group membership**
3. **Invite system**
4. **Task creation/edit/delete**
5. **Task status state machine**
6. **Task filters**
7. **Task detail**
8. **Comments**
9. **Media upload**
10. **Telegram private storage**
11. **Storage fallback**
12. **Payment flow**
13. **Reminders**
14. **Notifications**
15. **Blacklist**
16. **Master Admin**
17. **User permissions matrix**
18. **Frontend screens**
19. **Navigation structure**
20. **Telegram Bot commands**


# 40. GROUP MANAGEMENT

## 40.1 Group tushunchasi

Group — foydalanuvchilarni umumiy task-management muhitiga birlashtiruvchi asosiy business entity.

Group quyidagilarga ega:

* unique ID;
* group name;
* creator/owner;
* members;
* tasks;
* settings;
* storage configuration;
* payment state.

Group ma'lumotlari PostgreSQL'da saqlanadi.

---

## 40.2 Group yaratish

Group yaratish quyidagi umumiy flow orqali amalga oshiriladi:

```text
User
 |
 v
Create Group
 |
 v
Group information
 |
 v
Payment verification
 |
 +---- failed ----> Group NOT created
 |
 +---- success ---> Group created
```

Group yaratish requesti kelganda backend:

1. authenticated userni aniqlaydi;
2. userning group yaratish huquqini tekshiradi;
3. payment talab qilinsa payment statusini tekshiradi;
4. group ma'lumotlarini validatsiya qiladi;
5. transaction ichida group yaratadi;
6. creator/owner membershipini yaratadi;
7. kerakli default settingsni yaratadi.

---

# 41. GROUP OWNER

Group Owner group darajasidagi asosiy boshqaruvchi hisoblanadi.

Owner:

* group ma'lumotlarini boshqarishi;
* group membersni boshqarishi;
* group settingsni boshqarishi;
* group tasklariga tegishli ruxsatlar doirasida ishlashi

mumkin.

Ownerning huquqlari **Master Admin** huquqlariga teng emas.

---

# 42. GROUP MEMBERS

Group member — group tarkibiga kiruvchi user.

Membership alohida entity sifatida saqlanishi kerak.

Tavsiya qilinadigan model:

```text
User
 |
 +---- GroupMembership ---- Group
```

Membership quyidagi ma'lumotlarga ega bo'lishi mumkin:

```text
id
user_id
group_id
role
status
created_at
updated_at
```

Role va status qiymatlarining yakuniy ro'yxati keyingi permission specificationda qat'iy belgilanadi.

---

# 43. GROUP MEMBERSHIP SECURITY

User group member bo'lmagan holda group resource'larini ko'ra olmasligi kerak.

Masalan:

```text
GET /api/v1/groups/{group_id}
```

requestida backend:

```text
authenticated user
        |
        v
group membership?
        |
   +----+----+
   |         |
  YES        NO
   |         |
 allow      403
```

tamoyilida ishlaydi.

Group IDni bilish membershipni chetlab o'tish uchun yetarli emas.

---

# 44. INVITE SYSTEM

Groupga yangi user qo'shish uchun invite mexanizmi mavjud bo'ladi.

Invite:

* ma'lum groupga bog'lanadi;
* invite yaratuvchisini saqlaydi;
* unique token/linkga ega bo'ladi;
* aktiv yoki inactive holatda bo'ladi.

Invite ishlatilganda backend:

1. tokenni tekshiradi;
2. invite mavjudligini tekshiradi;
3. expiry/usage qoidalarini tekshiradi;
4. userning blacklist holatini tekshiradi;
5. membership mavjudligini tekshiradi;
6. membership yaratadi.

Invite tokenning o'zi authentication o'rnini bosmaydi.

---

# 45. TASK MANAGEMENT

Task — tizimning markaziy business entitysi.

Task quyidagi asosiy obyektlarga bog'lanadi:

```text
Task
 |
 +---- Creator
 |
 +---- Assignee
 |
 +---- Group (optional/required according to final business rule)
 |
 +---- Comments
 |
 +---- Attachments
 |
 +---- Reminders
```

---

# 46. TASK CREATION

Task yaratish flow:

```text
User
 |
 v
Create Task
 |
 +--> title
 +--> description
 +--> assignee
 +--> group
 +--> priority
 +--> deadline
 +--> attachments
 |
 v
Backend validation
 |
 v
Authorization
 |
 v
Database transaction
 |
 v
Task created
```

Backend quyidagilarni tekshiradi:

* user authenticatedmi;
* user task yaratishga haqlimi;
* group validmi;
* assignee validmi;
* title validmi;
* deadline validmi;
* attachmentlar ruxsat etilganmi.

---

# 47. TASK CREATOR

Task Creator — taskni yaratgan user.

Creator task bo'yicha asosiy ownership huquqiga ega.

Creator:

* taskni ko'radi;
* taskni o'zgartiradi;
* taskga comment qo'shadi;
* attachment qo'shadi;
* taskni o'chirishi mumkin.

**Task delete huquqi Creatorga tegishli.**

---

# 48. TASK ASSIGNEE

Assignee — task bajarilishi uchun biriktirilgan user.

Assignee:

* taskni ko'rishi;
* task ustida ishlashi;
* statusni o'zgartirishi mumkin bo'lishi;
* comment yozishi;
* attachment qo'shishi

mumkin.

Aniq edit/delete permissionlari role matrix orqali belgilanadi.

---

# 49. TASK VISIBILITY

Task public resource emas.

Task faqat ruxsat berilgan tomonlarga ko'rinadi.

Asosiy visibility qoidasi:

```text
Creator
Assignee
Authorized Group Owner
Master Admin
```

Taskni ko'rishi mumkin.

Boshqa user:

```text
403 Forbidden
```

olishi kerak.

Bu tekshiruv:

* list endpoint;
* detail endpoint;
* comment endpoint;
* attachment endpoint;
* status endpoint;
* delete endpoint

uchun ham bajariladi.

---

# 50. TASK LIST

Mini App task list ekranida userga ruxsat berilgan tasklargina qaytariladi.

Backend tasklarni database query darajasida filterlashi kerak.

Noto'g'ri yondashuv:

```text
DB'dan barcha tasklarni olish
        |
        v
Frontendda yashirish
```

Taqiqlanadi.

To'g'ri:

```text
DB query
   |
   +--> authorization constraints
   |
   v
only permitted tasks
```

---

# 51. TASK FILTERS

Task list uchun filter mexanizmi mavjud bo'ladi.

Filterlar kamida quyidagi kategoriyalarni qo'llab-quvvatlashi mumkin:

* status;
* assignee;
* creator;
* group;
* deadline;
* priority.

Aniq filterlar UI specification bosqichida yakuniy tasdiqlanadi.

Filter permissionni o'zgartirmaydi.

Misol:

```text
User asks:
status=completed
```

Backend avval:

```text
"Bu user qaysi tasklarni ko'rishi mumkin?"
```

ni aniqlaydi.

Keyin:

```text
"Shu tasklardan qaysilari completed?"
```

ni filterlaydi.

---

# 52. TASK DETAIL

Task detail sahifasi taskning to'liq ma'lumotlarini ko'rsatadi.

Minimal ma'lumotlar:

```text
Title
Description
Creator
Assignee
Group
Status
Priority
Deadline
Created At
Updated At
Comments
Attachments
```

Task detail ochilishidan oldin authorization tekshiriladi.

---

# 53. TASK STATUS

Task status backend tomonidan boshqariladigan state hisoblanadi.

Status transitionlar frontend tomonidan o'zicha belgilanishi mumkin emas.

Umumiy state-machine:

```text
Created
   |
   v
Assigned
   |
   v
In Progress
   |
   v
Completed
```

Yakuniy statuslar va transitionlar alohida business specification bilan tasdiqlanadi.

Invalid transition:

```text
400 Bad Request
```

yoki mos business error bilan qaytariladi.

---

# 54. TASK PRIORITY

Task priority taskning bajarilish muhimligini bildiradi.

Priority qiymatlari:

```text
TBD
```

sifatida qoldiriladi, chunki loyiha talablarida yakuniy enum qiymatlari hali aniq belgilanmagan.

Frontend arbitrary string yuborib priority yaratmasligi kerak.

Backend enum/validation ishlatadi.

---

# 55. DEADLINE

Task deadline:

* optional yoki requiredligi task business rulega bog'liq;
* timezone-aware bo'lishi kerak;
* PostgreSQL'da timezone bilan ishlash tavsiya qilinadi;
* reminder scheduling uchun source sifatida ishlatiladi.

Server va database orasida vaqt formatlari bir xil standartda ishlatiladi.

---

# 56. TASK DELETE

Task delete qoidasi:

| Actor             | Delete                        |
| ----------------- | ----------------------------- |
| Creator           | YES                           |
| Assignee          | NO, unless separately granted |
| Group Owner       | NO, unless separately granted |
| Master Admin      | **NO**                        |
| Unauthorized user | NO                            |

**Muhim:** Master Admin ham taskni o'chira olmaydi.

Delete endpoint backend authorization orqali himoyalanadi.

Frontend delete tugmasini yashirishi qo'shimcha UX layer hisoblanadi, security layer emas.

---

# 57. COMMENTS

Comment task bilan bog'langan child entity.

```text
Task
 |
 +---- Comment
          |
          +---- Author
```

Comment:

```text
id
task_id
author_id
content
created_at
updated_at
```

ma'lumotlarini o'z ichiga oladi.

---

# 58. COMMENT VISIBILITY

Comment task visibility qoidalariga bo'ysunadi.

Agar user taskni ko'ra olmasa:

```text
GET /tasks/{id}/comments
```

orqali commentlarni ham ko'ra olmaydi.

---

# 59. COMMENT CREATION

Comment yaratish:

1. authentication;
2. task access;
3. content validation;
4. database insert

ketma-ketligida amalga oshiriladi.

Comment content bo'sh bo'lmasligi kerak.

Maksimal uzunlik backend tomonidan belgilanadi.

---

# 60. COMMENT EDIT / DELETE

Comment edit/delete huquqlari alohida authorization qoidasi bilan belgilanadi.

Default principle:

```text
User can modify only resources they own
```

Lekin Master Adminning comment moderation huquqi kerak yoki kerak emasligi keyingi admin specificationda aniqlanadi.

---

# 61. ATTACHMENTS

Task va commentlarga media biriktirish mumkin.

Qo'llab-quvvatlanadigan turlar:

```text
File
Image
Video
Voice
```

Attachment metadata alohida entity sifatida saqlanadi.

Tavsiya qilinadigan metadata:

```text
id
owner/task/comment
telegram_file_id
telegram_unique_file_id
file_name
mime_type
file_size
media_type
storage_reference
created_at
```

---

# 62. MEDIA SECURITY

Media faylga ega bo'lish userga avtomatik access bermaydi.

Misol:

```text
GET /attachment/123
```

requestida backend:

```text
attachment -> task
task -> user access
```

zanjirini tekshiradi.

Shuning uchun attachment IDni bilishning o'zi yetarli emas.

---

# 63. TELEGRAM STORAGE

Loyihada Telegram channel storage konsepsiyasi mavjud.

Storage channel application uchun fayllarni saqlash vositasi sifatida ishlatiladi.

```text
Mini App
   |
   v
Backend
   |
   v
Telegram Storage Channel
   |
   v
Media
```

Telegram file ID/reference database'da saqlanishi mumkin.

Binary faylni PostgreSQL ichiga majburiy ravishda joylashtirish talab qilinmaydi.

---

# 64. DEFAULT STORAGE CHANNEL

User uchun default storage channel tushunchasi mavjud.

Default channel:

* storage uchun asosiy channel;
* application tomonidan tanlangan channel;
* media upload jarayonida target sifatida ishlatiladi.

Storage configuration database'da saqlanadi.

---

# 65. STORAGE CHANNEL O'CHIRILISHI

Agar administrator yoki boshqa tashqi sabab bilan storage channel o'chirilsa, application buni aniqlashi kerak.

Talab:

> Storage channel yo'qolgan holatda kontentni default storage channelga forward qilish mexanizmi mavjud bo'lishi kerak.

Flow:

```text
Upload
  |
  v
Configured Storage Channel
  |
  +---- exists ----> save
  |
  +---- deleted ---> Default Storage Channel
                         |
                         v
                       save
```

Bu mexanizm applicationning storage reference'larini yo'qotib qo'ymasligini ta'minlashi kerak.

---

# 66. PAYMENT

Group yaratish payment bilan bog'langan.

Payment entity:

```text
id
user_id
purpose
amount
currency
status
provider_reference
created_at
updated_at
```

kabi ma'lumotlarga ega bo'lishi mumkin.

Payment provider:

```text
TBD
```

Hozircha TZda konkret provider nomi hard-code qilinmaydi.

---

# 67. PAYMENT STATES

Minimal payment state modeli:

```text
Pending
Succeeded
Failed
Cancelled
```

bo'lishi mumkin.

Final enum payment provider tanlangandan keyin tasdiqlanadi.

---

# 68. PAYMENT SECURITY

Payment muvaffaqiyatini frontend belgilamaydi.

Noto'g'ri:

```text
Frontend:
payment_success = true
```

To'g'ri:

```text
Payment Provider
       |
       v
Backend verification
       |
       v
Payment = succeeded
       |
       v
Business action allowed
```

Group yaratish faqat backend verified payment asosida amalga oshiriladi.

---

# 69. PAYMENT IDEMPOTENCY

Bir payment event ikki marta kelganda ikki marta group yaratish yoki boshqa duplicate business action bajarilmasligi kerak.

Payment reference unique bo'lishi kerak.

Webhook/event processing idempotent bo'lishi kerak.

---

# 70. REMINDER SYSTEM

Reminder task deadline bilan bog'lanadi.

```text
Task
 |
 +---- Deadline
 |
 +---- Reminder
```

Reminder background worker orqali qayta ishlanadi.

ARQ + Redis background processing uchun ishlatiladi.

---

# 71. REMINDER FLOW

```text
Task created
     |
     v
Deadline exists?
     |
   YES
     |
     v
Reminder scheduled
     |
     v
ARQ worker
     |
     v
Reminder due
     |
     v
Telegram notification
```

Deadline o'zgartirilsa mavjud reminder schedule qayta hisoblanishi kerak.

Task o'chirilsa tegishli reminderlar ham invalid qilinishi kerak.

---

# 72. NOTIFICATION SYSTEM

Notificationlar user activity haqida Telegram orqali xabar berish uchun ishlatiladi.

Potential eventlar:

```text
New Task
Task Assignment
Task Comment
Deadline Reminder
Task Status Change
Group Invite
Payment Result
System Event
```

Har bir notification event uchun duplicate yuborilishining oldini olish mexanizmi bo'lishi kerak.

---

# 73. TELEGRAM BOT

Bot Mini App bilan birgalikda ishlaydi.

Botning asosiy vazifalari:

* `/start`;
* Mini App launch;
* Telegram webhook;
* notifications;
* reminders;
* system messages.

Bot business logicni backenddan ajratib qo'ymasligi kerak.

Backend authoritative business layer hisoblanadi.

---

# 74. BLACKLIST

Blacklist system-level restriction mexanizmi.

Blacklist entry:

```text
user_id
reason
created_at
created_by
status
```

kabi ma'lumotlarni o'z ichiga olishi mumkin.

Blacklist userning applicationdagi harakatlarini cheklashi mumkin.

---

# 75. BLACKLIST CHECK

Blacklist critical authentication/authorization flowda tekshiriladi.

Umumiy:

```text
Telegram User
      |
      v
Authentication
      |
      v
Blacklist check
      |
   +--+--+
   |     |
  NO    YES
   |     |
 allow  deny
```

Blacklistni frontend orqali bypass qilib bo'lmasligi kerak.

---

# 76. MASTER ADMIN

Master Admin application-level administrator.

Master Admin:

* usersni boshqarish;
* groupsni boshqarish;
* blacklist;
* system moderation;
* system configuration

kabi vakolatlarga ega bo'lishi mumkin.

Ammo:

> **Master Admin taskni o'chira olmaydi.**

Bu alohida qat'iy biznes qoida.

---

# 77. PERMISSION MODEL

Permission ikki qatlamdan iborat:

```text
Authentication
        +
Authorization
```

Authentication:

> "Bu kim?"

Authorization:

> "Bu user nimani qila oladi?"

Har bir protected endpoint ikkala qatlamni hisobga oladi.

---

# 78. RESOURCE AUTHORIZATION

Resource authorization quyidagi relationlar asosida ishlaydi:

```text
User
 |
 +---- Creator
 |
 +---- Assignee
 |
 +---- Group Owner
 |
 +---- Master Admin
 |
 +---- Member
```

Har bir resource uchun tegishli permission policy qo'llanadi.

---

# 79. ASOSIY PERMISSION MATRIX

| Action            | Creator | Assignee | Group Owner | Master Admin |
| ----------------- | :-----: | :------: | :---------: | :----------: |
| Task view         |   YES   |    YES   |     YES*    |      YES     |
| Task create       |   YES   |   YES*   |     YES     |      YES     |
| Task edit         |   YES   |    TBD   |     TBD     |      TBD     |
| Task comment      |   YES   |    YES   |     YES*    |     YES*     |
| Task attachment   |   YES   |    YES   |     YES*    |     YES*     |
| Task delete       | **YES** |    NO    |      NO     |    **NO**    |
| Group management  |    NO   |    NO    |     YES     |      YES     |
| User management   |    NO   |    NO    | Group scope |      YES     |
| Blacklist         |    NO   |    NO    |      NO     |      YES     |
| System management |    NO   |    NO    |      NO     |      YES     |

`*` — permission scope/final business rule bilan aniqlanadi.

`TBD` — loyiha talablarida yakuniy qoida hali ko'rsatilmagan.

---

# 80. FRONTEND NAVIGATION

Mini App navigation taxminan quyidagi logical structurega ega bo'ladi:

```text
Mini App
 |
 +-- Home / Dashboard
 |
 +-- Tasks
 |     |
 |     +-- Task List
 |     +-- Filters
 |     +-- Task Detail
 |     +-- Create Task
 |
 +-- Groups
 |     |
 |     +-- Group List
 |     +-- Group Detail
 |     +-- Members
 |     +-- Settings
 |
 +-- Storage
 |
 +-- Profile
 |
 +-- Payment
 |
 +-- Admin (authorized users only)
```

Final UI/UX wireframe alohida specification sifatida ishlab chiqiladi.

---

# 81. ERROR HANDLING

Backend predictable error response formatiga ega bo'lishi kerak.

Misollar:

```text
401 Unauthorized
```

Authentication yo'q yoki invalid.

```text
403 Forbidden
```

Authentication mavjud, lekin permission yo'q.

```text
404 Not Found
```

Resource mavjud emas yoki security policy bo'yicha mavjudligi oshkor qilinmasligi mumkin.

```text
422 Unprocessable Entity
```

Validation xatosi.

```text
409 Conflict
```

Business state conflict.

```text
500 Internal Server Error
```

Kutilmagan server xatosi.

---

# 82. DATA VALIDATION

Pydantic v2 request/response validation uchun ishlatiladi.

Backend:

* string length;
* enum;
* UUID/ID;
* datetime;
* optional/required fields;
* nested object

validatsiyasini bajaradi.

Frontend validation UX uchun qo'shimcha qatlam hisoblanadi.

---

# 83. LOGGING

Production loglarda:

* Telegram bot token;
* database password;
* Redis credentials;
* raw Telegram initData;
* authentication secret;
* payment secret;
* private user data

chiqarilmasligi kerak.

Loglar structured formatda bo'lishi maqsadga muvofiq.

---

# 84. DATABASE TRANSACTIONS

Bir nechta database operation bitta business actionni tashkil qilsa, transaction ishlatiladi.

Masalan:

```text
Create Group
 |
 +-- payment verified
 +-- group create
 +-- owner membership create
 +-- settings create
```

Ushbu operationlar atomic bo'lishi kerak.

Agar oxirgi operation muvaffaqiyatsiz bo'lsa, oldingi database o'zgarishlari rollback qilinadi.

---

# 85. CONCURRENCY

Bir user bir vaqtning o'zida ikkita bir xil request yuborsa duplicate resource yaratilmasligi kerak.

Critical operationlarda:

* unique constraints;
* database transaction;
* idempotency;
* locking

kerak bo'lgan joylarda qo'llanadi.

---

# 86. BACKGROUND JOBS

ARQ quyidagi ishlar uchun ishlatilishi mumkin:

```text
Reminder
Notification
Telegram message delivery
Storage processing
Payment-related async processing
Cleanup jobs
```

Background job request lifecycleni bloklamasligi kerak.

---

# 87. API DESIGN PRINCIPLE

API resource-oriented bo'ladi.

Misol:

```text
/api/v1/auth/me

/api/v1/groups
/api/v1/groups/{group_id}

/api/v1/tasks
/api/v1/tasks/{task_id}

/api/v1/tasks/{task_id}/comments

/api/v1/tasks/{task_id}/attachments
```

Aniq endpointlar 3-qismdagi API specificationda to'liq jadval ko'rinishida beriladi.

---

# 88. ACCEPTANCE CRITERIA — BUSINESS LOGIC

Quyidagi shartlar bajarilmasa feature qabul qilinmaydi:

### Authentication

* Telegram user validatsiyasiz authenticated bo'la olmaydi.
* Expired `initData` qabul qilinmaydi.
* Fake Telegram user ID bilan login qilib bo'lmaydi.

### Task

* Unauthorized user taskni ko'ra olmaydi.
* Creator taskni o'chira oladi.
* Master Admin taskni o'chira olmaydi.
* Assignee o'ziga tegishli taskni ko'ra oladi.

### Group

* Membershipsiz user private groupni ko'ra olmaydi.
* Group owner group management qila oladi.

### Payment

* Frontend payment success flagiga ishonilmaydi.
* Verified payment bo'lmasa pullik group yaratish amalga oshmaydi.
* Duplicate payment event duplicate business action yaratmaydi.

### Storage

* Attachment access task permissionga bo'ysunadi.
* Storage channel yo'qolgan holat uchun fallback mavjud.

### Infrastructure

* Application public entry point faqat `jalolyusuf.info`.
* Frontend/backend direct public accessga ega emas.
* PostgreSQL/Redis public emas.

---

# 89. IMPLEMENTATION PRIORITY

Business development quyidagi tartibda bajariladi:

```text
PHASE 1
Foundation
   |
   v
PHASE 2
Telegram Identity
   |
   v
PHASE 3
Groups
   |
   v
PHASE 4
Tasks
   |
   v
PHASE 5
Comments + Attachments
   |
   v
PHASE 6
Storage
   |
   v
PHASE 7
Payment
   |
   v
PHASE 8
Reminders + Notifications
   |
   v
PHASE 9
Blacklist + Master Admin
   |
   v
PHASE 10
Security + Production Hardening
```

Har bir phase mustaqil test qilinadi.

---

# 90. KEYINGI QISM

3-qismda quyidagilar batafsil belgilanadi:

* PostgreSQL entity/model specification;
* relationshiplar;
* indexlar;
* Alembic migration talablari;
* to'liq REST API endpointlar;
* request/response modeli;
* HTTP status codes;
* Telegram webhook;
* Telegram Bot API integration;
* Mini App authentication protocol;
* Nginx routing;
* DNS;
* pfSense NAT;
* Ubuntu;
* Docker Compose production topology;
* `.env` specification;
* CORS;
* security headers;
* domain-only access;
* IP/unknown Host rejection;
* backup;
* healthcheck;
* monitoring;
* testing;
* CI/CD;
* production acceptance criteria.


# 91. DATABASE ARCHITECTURE

Database:

```text
PostgreSQL
```

Backend PostgreSQL bilan:

```text
SQLAlchemy 2.x Async
asyncpg
```

orqali ishlaydi.

Migration:

```text
Alembic
```

orqali boshqariladi.

Database production internetdan to'g'ridan-to'g'ri ochilmasligi kerak.

Network specification bo'yicha PostgreSQL `5432` public emas.

---

# 92. ASOSIY DATABASE ENTITYLAR

Loyiha business logiciga ko'ra asosiy entitylar:

```text
User
Group
GroupMembership
Invite
Task
Comment
Attachment
Storage
Payment
Reminder
Notification
Blacklist
```

Qo'shimcha system entitylar implementatsiya ehtiyojiga qarab qo'shilishi mumkin.

---

# 93. USER MODEL

User Telegram identity bilan bog'lanadi.

Minimal konseptual ma'lumot:

```text
User
├── id
├── telegram_user_id
├── username
├── first_name
├── last_name
├── language_code
├── is_active
├── created_at
└── updated_at
```

`telegram_user_id` unique bo'lishi kerak.

User password orqali authentication qilinmaydi.

Telegram identity asosiy authentication manbasi hisoblanadi.

---

# 94. GROUP MODEL

Group:

```text
Group
├── id
├── name
├── owner_id
├── created_at
└── updated_at
```

Yakuniy fieldlar implementation vaqtida aniqlanadi.

Group owner User bilan relation orqali bog'lanadi.

---

# 95. GROUP MEMBERSHIP MODEL

Membership alohida jadval bo'lishi kerak.

Konseptual:

```text
GroupMembership
├── id
├── group_id
├── user_id
├── role
├── status
├── created_at
└── updated_at
```

Quyidagi constraintlar ko'rib chiqiladi:

```text
UNIQUE(group_id, user_id)
```

Bu bitta userning bitta groupga duplicate membership olishini oldini oladi.

---

# 96. INVITE MODEL

Invite:

```text
Invite
├── id
├── group_id
├── created_by
├── token/reference
├── expires_at
├── max_uses
├── used_count
├── is_active
└── created_at
```

Aniq invite lifecycle — TBD.

---

# 97. TASK MODEL

Task konseptual modeli:

```text
Task
├── id
├── group_id
├── creator_id
├── assignee_id
├── title
├── description
├── status
├── priority
├── deadline
├── created_at
└── updated_at
```

`group_id` optional yoki required ekanligi yakuniy business rule bilan belgilanadi.

---

# 98. TASK INDEXLARI

Tasklar katta hajmga yetishi mumkinligi sababli quyidagi ustunlar uchun indexlar ko'rib chiqilishi kerak:

```text
creator_id
assignee_id
group_id
status
deadline
created_at
```

Filterlarda tez-tez ishlatiladigan kombinatsiyalar uchun composite indexlar ham qo'llanilishi mumkin.

Indexlar actual query pattern asosida yaratiladi.

---

# 99. COMMENT MODEL

```text
Comment
├── id
├── task_id
├── author_id
├── content
├── created_at
└── updated_at
```

`task_id` indexlanishi kerak.

Bu task detail ochilganda commentlarni tez olishga yordam beradi.

---

# 100. ATTACHMENT MODEL

Attachment:

```text
Attachment
├── id
├── task_id
├── comment_id
├── owner_id
├── media_type
├── file_name
├── mime_type
├── file_size
├── telegram_file_id
├── telegram_unique_file_id
├── storage_reference
└── created_at
```

`task_id` yoki `comment_id`dan qaysi biri ishlatilishi attachment architecturega bog'liq.

Bitta attachment ikkala parentga bir vaqtning o'zida bog'lanishi kerak emas, agar business model bunga alohida ruxsat bermasa.

---

# 101. STORAGE MODEL

Storage configuration uchun alohida entity ishlatilishi mumkin:

```text
Storage
├── id
├── owner/group reference
├── telegram_chat_id
├── telegram_message_id/reference
├── is_default
├── is_active
└── created_at
```

Aniq schema — TBD.

---

# 102. PAYMENT MODEL

Payment:

```text
Payment
├── id
├── user_id
├── purpose
├── amount
├── currency
├── status
├── provider
├── provider_reference
├── created_at
└── updated_at
```

Payment provider loyiha materiallarida aniq ko'rsatilmagan.

Shuning uchun provider nomi:

```text
TBD
```

sifatida qoladi.

---

# 103. REMINDER MODEL

```text
Reminder
├── id
├── task_id
├── user_id
├── remind_at
├── status
├── delivered_at
└── created_at
```

Reminder worker tomonidan qayta ishlanadi.

---

# 104. NOTIFICATION MODEL

Agar notification history saqlanishi talab qilinsa:

```text
Notification
├── id
├── user_id
├── type
├── payload/reference
├── status
├── delivered_at
└── created_at
```

Aniq notification persistence talabi — TBD.

Telegram message yuborilishi background worker orqali bajarilishi mumkin.

---

# 105. BLACKLIST MODEL

```text
Blacklist
├── id
├── user_id
├── reason
├── created_by
├── is_active
└── created_at
```

`user_id` bo'yicha index kerak.

---

# 106. DATABASE RELATIONSHIP

Asosiy relation:

```text
User
 |
 +---- GroupMembership ---- Group
 |                            |
 |                            +---- Task
 |                                  |
 |                                  +---- Comment
 |                                  |
 |                                  +---- Attachment
 |                                  |
 |                                  +---- Reminder
 |
 +---- Payment
 |
 +---- Notification
 |
 +---- Blacklist
```

Task:

```text
Task.creator_id  -> User
Task.assignee_id -> User
Task.group_id    -> Group
```

Comment:

```text
Comment.task_id   -> Task
Comment.author_id -> User
```

---

# 107. FOREIGN KEY INTEGRITY

Database foreign key constraints ishlatilishi kerak.

Masalan:

```text
Task.creator_id
    -> User.id
```

va:

```text
Comment.task_id
    -> Task.id
```

Resource o'chirishdagi cascade/restrict siyosati har bir relation uchun alohida belgilanadi.

Task delete qilinganida comment va attachmentlar bilan nima bo'lishi kerakligi — implementation qarori sifatida alohida belgilanadi.

---

# 108. ALEMBIC

Database schema o'zgarishlari:

```text
Alembic migration
```

orqali amalga oshiriladi.

Migrationlar:

* versioned;
* reproducible;
* ordered

bo'lishi kerak.

Production'da migration:

```bash
alembic upgrade head
```

orqali boshqariladi.

Database schema'ni production'da qo'lda o'zgartirish tavsiya etilmaydi.

---

# 109. API VERSIONING

API asosiy prefix:

```text
/api/v1/
```

Health endpoint mavjud:

```text
GET /api/v1/health
```

Production health endpoint application, database va Redis holatini tekshiradi.

---

# 110. AUTH API

Konseptual endpoint:

```http
GET /api/v1/auth/me
```

Response authenticated Telegram user haqidagi application user ma'lumotlarini qaytaradi.

Authentication Telegram Mini App `initData` orqali amalga oshiriladi.

Aniq request header nomi va auth transport formati implementation specificationda yakuniy belgilanadi.

---

# 111. GROUP API

Tavsiya etiladigan resource structure:

```http
GET    /api/v1/groups
POST   /api/v1/groups

GET    /api/v1/groups/{group_id}
PATCH  /api/v1/groups/{group_id}

GET    /api/v1/groups/{group_id}/members
POST   /api/v1/groups/{group_id}/members

GET    /api/v1/groups/{group_id}/invites
POST   /api/v1/groups/{group_id}/invites
```

Yakuniy endpointlar implementation vaqtida tasdiqlanadi.

---

# 112. TASK API

Tavsiya etiladigan structure:

```http
GET    /api/v1/tasks
POST   /api/v1/tasks

GET    /api/v1/tasks/{task_id}
PATCH  /api/v1/tasks/{task_id}
DELETE /api/v1/tasks/{task_id}
```

Task list filterlari query parameters orqali berilishi mumkin:

```text
status
assignee_id
creator_id
group_id
priority
deadline_from
deadline_to
```

---

# 113. COMMENT API

```http
GET  /api/v1/tasks/{task_id}/comments
POST /api/v1/tasks/{task_id}/comments
```

Comment update/delete endpointlari:

```text
TBD
```

---

# 114. ATTACHMENT API

Konseptual:

```http
POST /api/v1/tasks/{task_id}/attachments
GET  /api/v1/tasks/{task_id}/attachments
```

Comment attachmentlari uchun:

```http
POST /api/v1/tasks/{task_id}/comments/{comment_id}/attachments
```

kabi nested structure ishlatilishi mumkin.

Yakuniy endpoint architecture — TBD.

---

# 115. STORAGE API

Konseptual:

```http
GET   /api/v1/storage
POST  /api/v1/storage
PATCH /api/v1/storage/{storage_id}
```

Storage channel configuration backend tomonidan tekshiriladi.

---

# 116. PAYMENT API

Payment flow:

```http
POST /api/v1/payments
GET  /api/v1/payments/{payment_id}
```

Payment provider callback/webhook:

```text
TBD
```

Payment provider tanlanmaguncha aniq callback endpoint belgilanmaydi.

---

# 117. ADMIN API

Master Admin uchun alohida protected namespace ishlatilishi mumkin:

```http
/api/v1/admin/
```

Potential resources:

```text
users
groups
blacklist
system
```

Admin API oddiy user API'dan authorization jihatidan alohida himoyalanadi.

---

# 118. HTTP STATUS CODES

API quyidagi status kodlardan foydalanadi:

| Code | Meaning                         |
| ---: | ------------------------------- |
|  200 | Successful read/update          |
|  201 | Resource created                |
|  204 | Successful delete/no content    |
|  400 | Invalid request/business input  |
|  401 | Authentication required/invalid |
|  403 | Permission denied               |
|  404 | Resource not found              |
|  409 | Business conflict               |
|  422 | Validation error                |
|  500 | Unexpected server error         |

---

# 119. ERROR RESPONSE

API predictable error structurega ega bo'lishi kerak.

Masalan:

```json
{
  "detail": "Permission denied"
}
```

Yakuniy error schema barcha endpointlar uchun bir xil bo'lishi kerak.

Internal exception details production response'da ochib berilmasligi kerak.

---

# 120. TELEGRAM WEBHOOK

Telegram bot webhook orqali update qabul qiladi.

Webhook public endpoint:

```text
https://jalolyusuf.info/api/v1/telegram/webhook
```

Webhook:

* HTTPS;
* secret validation;
* Telegram update validation;
* async processing

talablariga javob berishi kerak.

Webhook secret public loglarga chiqarilmaydi.

---

# 121. TELEGRAM BOT CONFIGURATION

Environment variables:

```text
TELEGRAM_BOT_TOKEN
TELEGRAM_BOT_USERNAME
TELEGRAM_MINI_APP_URL
TELEGRAM_WEBHOOK_SECRET
TELEGRAM_INIT_DATA_MAX_AGE_SECONDS
```

kabi configurationlar ishlatiladi.

Secret qiymatlar repository'ga commit qilinmaydi.

---

# 122. MINI APP URL

Canonical Mini App URL:

```text
https://jalolyusuf.info
```

Frontend Telegram Mini App sifatida aynan shu origin'da ishlaydi.

Loyiha architecture talabiga ko'ra applicationni boshqa domain serve qilmasligi kerak.

---

# 123. CORS

Backend CORS faqat kerakli frontend originlariga ruxsat berishi kerak.

Production uchun asosiy origin:

```text
https://jalolyusuf.info
```

bo'ladi.

Wildcard:

```text
*
```

production'da ishlatilmasligi kerak.

---

# 124. NGINX REVERSE PROXY

Nginx public reverse proxy sifatida ishlaydi.

Architecture:

```text
Internet
   |
   v
Nginx :443
   |
   +---- /api/ ----> 127.0.0.1:8000
   |
   +---- / -------> 127.0.0.1:8088
```

Bu hozirgi deployment konfiguratsiyasiga mos.

---

# 125. DOMAIN-ONLY ACCESS

Applicationning asosiy public access talabi:

```text
ONLY:

https://jalolyusuf.info
```

Application IP orqali ochilmasligi kerak.

Noma'lum Host orqali ham application server block'iga tushmasligi kerak.

Nginx'da catch-all/default server unknown Host requestlarni reject qilishi kerak.

Misol:

```nginx
server {
    listen 80 default_server;
    server_name _;

    return 444;
}
```

HTTPS uchun ham default server noma'lum Hostlarni reject qiladi.

Bu talab **faqat ToDo-BOT public web applicationga** tegishli.

---

# 126. OTHER NGINX SERVICES

Serverda boshqa Nginx konfiguratsiyalari mavjud bo'lishi mumkin.

Masalan:

```text
qr_generate
tvreport
todo-bot
```

ToDo-BOT domain-only routing boshqa local servicesga xalaqit bermasligi kerak.

Local-only applicationlar public DNS/domain orqali Todo-BOT server blockiga tushmasligi kerak.

---

# 127. FRONTEND PORT SECURITY

Frontend container host portga bind qilinsa, bind:

```text
127.0.0.1
```

bilan cheklanishi kerak.

Misol:

```yaml
ports:
  - "127.0.0.1:8088:80"
```

Frontend `0.0.0.0:8088` orqali public expose qilinmasligi kerak.

Network specification frontend `8088` portini public emas deb belgilaydi.

---

# 128. BACKEND PORT SECURITY

Backend:

```text
127.0.0.1:8000
```

orqali Nginx tomonidan accessible bo'lishi mumkin.

Public internetdan:

```text
SERVER_IP:8000
```

orqali backendga kirish bo'lmasligi kerak.

---

# 129. POSTGRESQL SECURITY

PostgreSQL:

```text
5432
```

public internetga ochilmaydi.

Security model:

```text
Internet
   X
   |
PostgreSQL
   ^
   |
Backend only
```

---

# 130. REDIS SECURITY

Redis:

```text
6379
```

public internetga ochilmaydi.

Redis faqat application internal network orqali ishlatiladi.

---

# 131. DOCKER NETWORK

Internal service communication uchun Docker network ishlatiladi.

Konseptual:

```text
todo_internal
```

Network:

```text
Backend
   |
   +---- PostgreSQL
   |
   +---- Redis

Frontend
   |
   +---- Backend
```

External clients database va Redisga kira olmaydi.

---

# 132. DOCKER COMPOSE SERVICES

Production Compose quyidagi service'larni o'z ichiga oladi:

```text
postgres
redis
backend
frontend
```

Deployment hujjatida ham repository clone qilish, `.env` sozlash, `docker compose up -d --build`, Nginx, Certbot va Telegram webhook konfiguratsiyasi ketma-ketligi belgilangan.

---

# 133. HEALTHCHECK

Har bir critical service healthcheckga ega bo'lishi kerak.

Backend health:

```text
/api/v1/health
```

PostgreSQL:

```text
pg_isready
```

Redis:

```text
redis-cli ping
```

Frontend:

```text
HTTP GET /
```

Healthcheck failure container dependency/startup behaviorga ta'sir qiladi.

---

# 134. ENVIRONMENT CONFIGURATION

Secret va environment-specific configuration `.env` orqali beriladi.

Misol:

```text
APP_ENV
APP_NAME
DEBUG
API_V1_PREFIX
LOG_LEVEL
LOG_FORMAT

POSTGRES_DB
POSTGRES_USER
POSTGRES_PASSWORD
DATABASE_URL

REDIS_URL

TELEGRAM_BOT_TOKEN
TELEGRAM_BOT_USERNAME
TELEGRAM_MINI_APP_URL
TELEGRAM_WEBHOOK_SECRET
TELEGRAM_INIT_DATA_MAX_AGE_SECONDS
```

Secretlar Git repository'ga joylashtirilmaydi.

---

# 135. PRODUCTION DEBUG

Production:

```text
DEBUG=false
```

bo'lishi kerak.

Stack trace foydalanuvchiga qaytarilmaydi.

Detailed exception faqat server logida saqlanadi.

---

# 136. HTTPS

Production traffic HTTPS orqali o'tadi.

Expected:

```text
https://jalolyusuf.info
```

HTTP:

```text
http://jalolyusuf.info
```

uchun HTTPS policy qo'llanadi.

Let's Encrypt certificate Certbot orqali boshqariladi.

---

# 137. PFSENSE

Public network path:

```text
Internet
   |
   v
pfSense
   |
   v
Ubuntu
```

pfSense WAN orqali keladigan application trafficni Ubuntu serverga forward qiladi.

Asosiy public application portlari:

```text
80
443
```

Backend:

```text
8000
```

va frontend:

```text
8088
```

WAN'dan to'g'ridan-to'g'ri expose qilinmaydi.

---

# 138. PFSENSE NAT SECURITY

Port forwarding faqat kerakli public ports uchun bo'lishi kerak.

Application architecture:

```text
WAN
 |
 +---- 80  ----> Ubuntu/Nginx
 |
 +---- 443 ----> Ubuntu/Nginx
 |
 X---- 8000
 X---- 8088
 X---- 5432
 X---- 6379
```

---

# 139. DNS

Public DNS:

```text
jalolyusuf.info
```

Ubuntu/pfSense public endpointga resolve qilishi kerak.

DNS boshqa domainni ToDo-BOT serveriga ko'rsatishi applicationni ochish uchun yetarli bo'lmasligi kerak.

Nginx Host filtering bunday requestlarni reject qiladi.

---

# 140. BACKUP

Production backup policy kamida:

```text
PostgreSQL
Environment/configuration
Important Telegram storage references
```

uchun ishlab chiqilishi kerak.

Backup interval:

```text
TBD
```

Retention:

```text
TBD
```

Backup destination:

```text
TBD
```

---

# 141. DISASTER RECOVERY

Server yo'qolgan holatda:

1. Ubuntu server qayta tayyorlanadi;
2. Docker o'rnatiladi;
3. repository clone qilinadi;
4. `.env` restore qilinadi;
5. PostgreSQL backup restore qilinadi;
6. Docker Compose ishga tushiriladi;
7. Nginx konfiguratsiyasi restore qilinadi;
8. TLS certificate tiklanadi;
9. Telegram webhook tekshiriladi;
10. healthcheck bajariladi.

---

# 142. TESTING

Backend uchun:

```text
pytest
```

ishlatiladi.

Static/lint checks:

```text
ruff
mypy
```

ishlatiladi.

Frontend uchun TypeScript/build checks ishlatiladi.

---

# 143. TEST CATEGORIES

Kamida:

```text
Unit Tests
Integration Tests
API Tests
Authentication Tests
Authorization Tests
Database Tests
Telegram Integration Tests
Frontend Build Tests
Production Smoke Tests
```

bo'lishi kerak.

---

# 144. AUTHENTICATION TESTS

Quyidagi holatlar test qilinadi:

### Valid initData

```text
Expected: authenticated
```

### Invalid signature

```text
Expected: 401
```

### Expired auth_date

```text
Expected: 401
```

### Malformed initData

```text
Expected: 401/422
```

### Unknown Telegram user

```text
Expected: user creation or controlled rejection
```

---

# 145. AUTHORIZATION TESTS

Test matrix:

```text
Creator -> own task
Creator -> foreign task

Assignee -> assigned task
Assignee -> foreign task

Group Owner -> group task
Non-member -> private group

Master Admin -> task
Master Admin -> task delete
```

Muhim test:

```text
Master Admin DELETE task
Expected: 403
```

---

# 146. SECURITY TESTS

Production deploymentda quyidagilar tekshiriladi:

```text
https://jalolyusuf.info
```

→ application ochiladi.

```text
https://SERVER_IP
```

→ application ochilmaydi.

```text
https://OTHER-DOMAIN
```

→ application ochilmaydi.

```text
SERVER_IP:8088
```

→ frontend ochilmaydi.

```text
SERVER_IP:8000
```

→ backend ochilmaydi.

```text
SERVER_IP:5432
```

→ PostgreSQL public emas.

```text
SERVER_IP:6379
```

→ Redis public emas.

---

# 147. PRODUCTION SMOKE TEST

Deploymentdan keyin:

```bash
curl https://jalolyusuf.info/api/v1/health
```

tekshiriladi.

Expected:

```json
{
  "status": "ok",
  "app": {
    "status": "ok"
  },
  "database": {
    "status": "ok"
  },
  "redis": {
    "status": "ok"
  }
}
```

---

# 148. NGINX VALIDATION

Har bir configuration change'dan keyin:

```bash
sudo nginx -t
```

bajariladi.

Success bo'lsa:

```bash
sudo systemctl reload nginx
```

bajariladi.

`restart` o'rniga imkon qadar `reload` ishlatiladi.

---

# 149. DOCKER VALIDATION

Deploymentdan keyin:

```bash
docker compose ps
```

orqali service status tekshiriladi.

Log:

```bash
docker compose logs --tail=100
```

orqali tekshiriladi.

Critical services:

```text
postgres
redis
backend
frontend
```

healthy/running holatda bo'lishi kerak.

---

# 150. CI QUALITY GATE

Production deploydan oldin:

```text
ruff
mypy
pytest
frontend build
```

success bo'lishi kerak.

Biror critical check fail bo'lsa production deployment davom ettirilmaydi.

---

# 151. CODE QUALITY

Backend:

* typed Python;
* async I/O;
* clear service boundaries;
* Pydantic schemas;
* SQLAlchemy models;
* repository/service pattern kerak bo'lgan joylarda;
* testable business logic

tamoyillariga amal qiladi.

Frontend:

* TypeScript;
* reusable components;
* API abstraction;
* typed responses;
* clear state management

tamoyillariga amal qiladi.

---

# 152. API DOCUMENTATION

FastAPI OpenAPI documentation development uchun ishlatilishi mumkin.

Production'da Swagger/ReDoc public access policy alohida belgilanadi.

Agar public qilish shart bo'lmasa, production'da documentation endpointlari cheklanishi mumkin.

---

# 153. SECURITY HEADERS

Nginx orqali kerakli security headers qo'llanishi kerak.

Ko'rib chiqiladigan headers:

```text
X-Content-Type-Options
X-Frame-Options
Referrer-Policy
Content-Security-Policy
```

Aniq CSP Telegram Mini App va frontend asset architecture tekshirilgandan keyin ishlab chiqiladi.

CSP'ni tekshirmasdan qat'iy policy qo'yish frontendni buzishi mumkin.

---

# 154. CLICKJACKING

Mini App boshqa sayt iframe'ida ishlatilishining oldini olish kerak.

Buning uchun:

```text
X-Frame-Options
```

va/yoki CSP:

```text
frame-ancestors
```

ishlatilishi mumkin.

---

# 155. RATE LIMITING

Authentication, webhook va public API endpointlar uchun rate limiting ko'rib chiqiladi.

Ayniqsa:

```text
/login/authentication
/webhook
payment endpoints
file upload
```

uchun abuse protection kerak.

Aniq limitlar:

```text
TBD
```

---

# 156. FILE UPLOAD SECURITY

Media upload uchun:

* maksimal file size;
* allowed MIME types;
* allowed media types;
* Telegram metadata validation;
* authorization;
* abuse/rate limiting

ishlatilishi kerak.

User yuborgan filename server filesystem path sifatida to'g'ridan-to'g'ri ishlatilmasligi kerak.

---

# 157. SECRET MANAGEMENT

Quyidagilar repository'da bo'lmasligi kerak:

```text
Telegram bot token
PostgreSQL password
Redis password
Webhook secret
Payment secret
TLS private key
```

`.env` `.gitignore` orqali himoyalanadi.

---

# 158. OBSERVABILITY

Production monitoring uchun kamida:

```text
Nginx logs
Backend logs
Docker service status
PostgreSQL health
Redis health
Telegram webhook status
```

kuzatilishi kerak.

Application critical errors loglarda aniqlanishi kerak.

---

# 159. TELEGRAM WEBHOOK MONITORING

Telegram webhook holati muntazam tekshirilishi mumkin.

Tekshiriladigan ma'lumotlar:

```text
webhook URL
pending update count
last error
last error date
```

Webhook error yuz berganda backend loglari bilan solishtiriladi.

---

# 160. FINAL PRODUCTION ARCHITECTURE

Yakuniy production architecture:

```text
                         INTERNET
                            |
                            v
                    DNS: jalolyusuf.info
                            |
                            v
                         pfSense
                            |
                       WAN :80/443
                            |
                            v
                     Ubuntu Server
                            |
                            v
                         Nginx
                            |
                +-----------+-----------+
                |                       |
             /api/                       /
                |                       |
                v                       v
        Backend :8000             Frontend :8088
                |                       |
                +-----------+-----------+
                            |
                    Docker Internal Network
                            |
                 +----------+----------+
                 |                     |
                 v                     v
             PostgreSQL              Redis
                :5432                 :6379
```

Public:

```text
Nginx 80/443
```

Private:

```text
Frontend 8088
Backend 8000
PostgreSQL 5432
Redis 6379
```

Bu topology loyiha network specificationidagi public/private separationga mos.

---

# 161. DOMAIN ACCESS FINAL RULE

ToDo-BOT Mini App uchun:

```text
https://jalolyusuf.info
```

canonical public origin hisoblanadi.

Nginx:

```text
Host = jalolyusuf.info
```

bo'lgan requestni applicationga yuboradi.

Noma'lum Host:

```text
Host != jalolyusuf.info
```

bo'lsa application frontendiga yuborilmaydi.

IP orqali kelgan request ham applicationga yuborilmaydi.

Bu loyiha architecture hujjatidagi:

> Only jalolyusuf.info serves the app.

talabining operational implementationidir.

---

# 162. DEPLOYMENT SEQUENCE

Production deployment:

```text
1. Repository clone
2. .env configure
3. Docker Compose build
4. Docker Compose start
5. Database migration
6. Nginx configuration
7. nginx -t
8. Nginx reload
9. TLS/Certbot verification
10. Telegram webhook configure
11. Healthcheck
12. Mini App browser test
13. Telegram Mini App test
14. Authorization/security tests
```

Deployment documentationda repository clone → `.env` → Docker Compose → Nginx → Certbot → Telegram webhook ketma-ketligi ko'rsatilgan.

---

# 163. RELEASE ACCEPTANCE CRITERIA

Release productionga qabul qilinishi uchun:

### Infrastructure

* [ ] Ubuntu server ishlaydi
* [ ] Docker ishlaydi
* [ ] PostgreSQL healthy
* [ ] Redis healthy
* [ ] Backend healthy
* [ ] Frontend healthy
* [ ] Nginx valid configuration
* [ ] HTTPS valid

### Domain

* [ ] `https://jalolyusuf.info` ishlaydi
* [ ] IP orqali Mini App ochilmaydi
* [ ] Unknown Host orqali Mini App ochilmaydi
* [ ] Frontend direct port public emas
* [ ] Backend direct port public emas

### Telegram

* [ ] Bot ishlaydi
* [ ] `/start` ishlaydi
* [ ] Mini App ochiladi
* [ ] Telegram authentication ishlaydi
* [ ] Webhook ishlaydi

### Security

* [ ] Invalid `initData` rejected
* [ ] Expired `initData` rejected
* [ ] Unauthorized task access rejected
* [ ] Unauthorized group access rejected
* [ ] Master Admin task delete qila olmaydi
* [ ] Secrets log/repositoryga chiqmaydi

### Quality

* [ ] Ruff passed
* [ ] MyPy passed
* [ ] Pytest passed
* [ ] Frontend build passed

---

# 164. TBD REGISTER

Quyidagi masalalar loyiha developmentida alohida qaror bilan yopilishi kerak:

|  № | Masala                      | Status |
| -: | --------------------------- | ------ |
|  1 | Payment provider            | TBD    |
|  2 | Payment currency/price      | TBD    |
|  3 | Exact task status enum      | TBD    |
|  4 | Exact priority enum         | TBD    |
|  5 | Group membership roles      | TBD    |
|  6 | Invite expiry/usage policy  | TBD    |
|  7 | Comment edit/delete policy  | TBD    |
|  8 | Attachment size limits      | TBD    |
|  9 | Notification persistence    | TBD    |
| 10 | Reminder presets            | TBD    |
| 11 | Backup schedule             | TBD    |
| 12 | Backup retention            | TBD    |
| 13 | Monitoring platform         | TBD    |
| 14 | Exact API response envelope | TBD    |
| 15 | Production CSP              | TBD    |
| 16 | API rate limits             | TBD    |

**TBD qiymatlar developer tomonidan o'zboshimchalik bilan belgilanmaydi.** Business owner qarori bilan tasdiqlanadi yoki alohida technical decision record orqali yopiladi.

---

# 165. MASTER DEVELOPMENT RULE

Ushbu TZ bo'yicha eng muhim qoida:

> **Frontend faqat interface. Backend — business logicning authoritative source'i. Database — persistent state source'i. Telegram — user identity va messaging platformasi. Nginx — public entry point. pfSense — network boundary.**

Shuning uchun security yoki business rule faqat frontendda implement qilinmasligi kerak.

---

# 166. FINAL PROJECT MODEL

ToDo-BOT quyidagi yakuniy modelga ega:

```text
                        TO DO-BOT
                            |
          +-----------------+-----------------+
          |                 |                 |
          v                 v                 v
       Telegram          Mini App         Backend API
          |                 |                 |
          |                 |                 |
          +----------------+-----------------+
                            |
                            v
                       PostgreSQL
                            |
                       +----+----+
                       |         |
                     Redis     Storage
                       |
                     ARQ
                       |
                Notifications
                Reminders
```

Infrastructure:

```text
Internet
   |
DNS
   |
pfSense
   |
Ubuntu
   |
Nginx
   |
Docker Compose
   |
Frontend + Backend + PostgreSQL + Redis
```

---

# 167. DOCUMENT STATUS

Ushbu 3 qism birgalikda ToDo-BOT uchun **Master TZ**ning asosiy foundationini tashkil qiladi.

## Hozirgi holatda aniq belgilangan

* loyiha maqsadi;
* Telegram Mini App;
* backend/frontend architecture;
* technology stack;
* PostgreSQL;
* Redis;
* Docker Compose;
* Nginx;
* Let's Encrypt;
* pfSense;
* `jalolyusuf.info`;
* domain-only public application;
* frontend/backend private ports;
* Telegram authentication konsepsiyasi;
* User;
* Group;
* Task;
* Creator;
* Assignee;
* Group Owner;
* Master Admin;
* task visibility;
* task delete restriction;
* Comments;
* Attachments;
* Storage;
* Payment concept;
* Reminders;
* Notifications;
* Blacklist;
* API architecture;
* security;
* testing;
* production deployment.

## Keyingi aniqlashtiriladiganlar

`TBD Register`dagi business decisions tasdiqlangandan keyin ular ushbu Master TZga final values sifatida kiritiladi.

---

# 168. IMPLEMENTATION ORDER

Development quyidagi tartibda davom ettiriladi:

```text
Foundation
    ↓
Telegram Identity
    ↓
Groups
    ↓
Membership / Invites
    ↓
Tasks
    ↓
Comments
    ↓
Attachments
    ↓
Storage
    ↓
Payments
    ↓
Reminders
    ↓
Notifications
    ↓
Blacklist
    ↓
Master Admin
    ↓
Security Hardening
    ↓
Production Acceptance
```

Har bir bosqich uchun:

```text
Database
   +
Backend
   +
Tests
   +
Frontend
   +
Integration
```

ketma-ket ishlab chiqiladi.

---

# 169. END OF MASTER TZ

**ToDo-BOT Master Technical Specification v1.0**

Primary domain:

```text
https://jalolyusuf.info
```

Architecture:

```text
Telegram Mini App
+
FastAPI
+
React
+
PostgreSQL
+
Redis
+
Docker
+
Nginx
+
pfSense
+
Ubuntu
```

Production public entry point:

```text
jalolyusuf.info
```

Application public bo'lmagan internal services:

```text
Frontend
Backend
PostgreSQL
Redis
```

Master specification shu asosiy talablar asosida development uchun reference hujjat sifatida ishlatiladi.
