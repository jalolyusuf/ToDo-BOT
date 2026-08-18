# 📝 Task Manager Bot

> Professional task management system with Telegram integration and modern web interface

[🇺🇿 O'zbekcha](./docs/README.uz.md) | [🇬🇧 English](./docs/README.en.md) | [🇷🇺 Русский](./docs/README.ru.md)

![Task Manager](./assets/Logo.png)

## ✨ Features

### 🤖 Telegram Integration
- Native Telegram Mini App
- WebApp SDK integration
- Bot commands and notifications
- Secure authentication via Telegram

### 📋 Task Management
- Create, edit, delete tasks
- Task priorities (Low, Normal, High, Urgent)
- Task statuses (Created, Assigned, In Progress, Review, Completed)
- Deadlines and reminders
- Task assignment to users
- Bulk actions (multi-select, bulk delete, bulk status change)

### 🎯 Kanban Board
- Drag-and-drop interface
- 5 column workflow
- Real-time status updates
- Smooth animations
- Mobile-responsive

### 👥 Group Collaboration
- Create and manage groups
- Group member management
- Role-based access (Owner, Member)
- Group tasks
- Member statistics

### 📊 Analytics & Reports
- Task completion metrics
- Timeline charts
- Status distribution (pie chart)
- Priority distribution (bar chart)
- Group performance leaderboard
- Date range filtering (7/30/90 days)

### 🌐 Multi-language Support
- 🇺🇿 O'zbekcha
- 🇬🇧 English
- 🇷🇺 Русский
- Language switcher in UI
- Persistent language selection

### 🎨 Modern UI/UX
- Dark theme design
- Responsive layout (mobile, tablet, desktop)
- Smooth transitions and animations
- Professional admin panel interface
- Sidebar navigation
- Search and advanced filters

## 🛠 Technology Stack

### Backend
- **Python 3.12** - Core language
- **FastAPI** - Modern web framework
- **SQLAlchemy** - ORM
- **PostgreSQL** - Database
- **Redis** - Caching and sessions
- **Alembic** - Database migrations
- **python-telegram-bot** - Telegram API

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router** - Navigation
- **Zustand** - State management
- **TailwindCSS** - Styling
- **Recharts** - Data visualization
- **@dnd-kit** - Drag and drop
- **i18next** - Internationalization
- **React Hot Toast** - Notifications
- **Headless UI** - Accessible components

### DevOps
- **Docker & Docker Compose** - Containerization
- **GitHub Actions** - CI/CD
- **Self-hosted Runner** - Deployment automation
- **Nginx** - Reverse proxy and static file serving

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 22+ (for local development)
- Python 3.12+ (for local development)
- Telegram Bot Token (from [@BotFather](https://t.me/BotFather))

### 1. Clone Repository
```bash
git clone https://github.com/jalolyusuf/ToDo-BOT.git
cd ToDo-BOT
```

### 2. Environment Setup
Create `.env` file in project root:

```env
# Telegram
TELEGRAM_BOT_TOKEN=your_bot_token_here

# Database
DATABASE_URL=postgresql://postgres:postgres@db:5432/todobot

# Redis
REDIS_URL=redis://redis:6379/0

# Backend
SECRET_KEY=your-secret-key-here
BACKEND_CORS_ORIGINS=["http://localhost:5173","https://your-domain.com"]

# Frontend
VITE_API_BASE_URL=
```

### 3. Run with Docker
```bash
# Build and start all services
docker compose up -d --build

# View logs
docker compose logs -f

# Run migrations
docker compose exec backend alembic upgrade head
```

### 4. Access Application
- **Web Interface**: http://localhost
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Telegram Bot**: https://t.me/your_bot_username

## 📱 Telegram Bot Setup

1. Create bot with [@BotFather](https://t.me/BotFather)
2. Get bot token
3. Set webhook:
   ```bash
   curl -X POST "https://api.telegram.org/bot<YOUR_TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url":"https://your-domain.com/api/v1/telegram/webhook"}'
   ```
4. Configure Mini App in BotFather:
   - Send `/setmenubutton`
   - Choose your bot
   - Set URL: `https://your-domain.com`

## 🔧 Development

### Backend Development
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows

# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Development
```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Type checking
npm run typecheck
```

### Database Migrations
```bash
# Create new migration
docker compose exec backend alembic revision --autogenerate -m "description"

# Apply migrations
docker compose exec backend alembic upgrade head

# Rollback migration
docker compose exec backend alembic downgrade -1
```

## 🚢 Deployment

### GitHub Actions (Self-hosted Runner)

1. **Setup Runner on Server:**
   ```bash
   # On your Ubuntu server
   mkdir ~/actions-runner && cd ~/actions-runner
   
   # Download runner
   curl -o actions-runner-linux-x64-2.311.0.tar.gz -L \
     https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-linux-x64-2.311.0.tar.gz
   
   tar xzf ./actions-runner-linux-x64-2.311.0.tar.gz
   
   # Configure
   ./config.sh --url https://github.com/YOUR_USERNAME/ToDo-BOT --token YOUR_TOKEN
   
   # Install as service
   sudo ./svc.sh install
   sudo ./svc.sh start
   ```

2. **Add GitHub Secrets:**
   - `TELEGRAM_BOT_TOKEN` - Your Telegram bot token

3. **Push to Main Branch:**
   - Actions automatically deploy on every push to `main`
   - Rebuilds containers
   - Runs migrations
   - Restarts services

### Manual Deployment

```bash
# On your server
cd ~/ToDo-BOT

# Pull latest changes
git pull origin main

# Update environment variables
nano .env

# Rebuild and restart
docker compose down
docker compose up -d --build

# Run migrations
docker compose exec -T backend alembic upgrade head

# Set webhook
curl -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://your-domain.com/api/v1/telegram/webhook"}'
```

## 📖 API Documentation

Interactive API documentation is available at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key Endpoints

#### Authentication
- `GET /api/v1/auth/me` - Get current user

#### Tasks
- `GET /api/v1/tasks` - List tasks (with filters)
- `POST /api/v1/tasks` - Create task
- `GET /api/v1/tasks/{id}` - Get task details
- `PATCH /api/v1/tasks/{id}` - Update task
- `DELETE /api/v1/tasks/{id}` - Delete task
- `PATCH /api/v1/tasks/{id}/status` - Update task status

#### Groups
- `GET /api/v1/groups` - List groups
- `POST /api/v1/groups` - Create group
- `GET /api/v1/groups/{id}` - Get group details
- `DELETE /api/v1/groups/{id}` - Delete group
- `GET /api/v1/groups/{id}/members` - List members
- `DELETE /api/v1/groups/{id}/members/{user_id}` - Remove member

## 🏗 Project Structure

```
ToDo-BOT/
├── backend/
│   ├── app/
│   │   ├── api/          # API endpoints
│   │   ├── models/       # Database models
│   │   ├── services/     # Business logic
│   │   ├── schemas/      # Pydantic schemas
│   │   └── main.py       # FastAPI app
│   ├── alembic/          # Database migrations
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/          # App setup and routing
│   │   ├── components/   # Reusable components
│   │   ├── features/     # Feature modules
│   │   ├── layouts/      # Layout components
│   │   ├── pages/        # Page components
│   │   ├── shared/       # Shared utilities
│   │   └── i18n/         # Translations
│   ├── public/
│   ├── Dockerfile
│   └── package.json
├── .github/
│   └── workflows/
│       └── deploy.yml    # CI/CD workflow
├── docker-compose.yml
└── README.md
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention
Follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Test additions/changes
- `chore:` - Build process or auxiliary tool changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Jalol Yusuf**
- GitHub: [@jalolyusuf](https://github.com/jalolyusuf)
- Telegram: [@jalolyusuf](https://t.me/jalolyusuf)
- Website: [jalolyusuf.info](https://jalolyusuf.info)

## 🙏 Acknowledgments

- Built with ❤️ using modern web technologies
- Telegram Bot API for seamless integration
- Open source community for amazing tools
- Claude Code AI for development assistance

---

**⭐ If you find this project useful, please give it a star!**

Made with ❤️ by Jalol Yusuf
