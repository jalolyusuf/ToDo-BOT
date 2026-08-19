# 🤖 Claude AI Assistant Bot

> Intelligent AI assistant powered by Claude (AWS Bedrock) with Telegram integration

![Claude AI Assistant](./assets/Logo.png)

## ✨ Features

### 🤖 AI-Powered Assistance
- Powered by **Claude AI** (Haiku model) via AWS Bedrock
- Natural language understanding and conversation
- Context-aware responses
- Multi-turn conversation support

### 💬 Telegram Integration
- Full Telegram Bot integration
- Support for all message types:
  - 📝 Text messages
  - 📷 Photos & Images
  - 📄 Documents
  - 🎥 Videos
  - 🎵 Audio & Voice messages
- Real-time message processing
- Webhook-based updates

### 🌐 Web Interface
- Modern React-based chat interface
- Real-time conversation view
- Markdown rendering for formatted responses
- Responsive design

### 💾 Conversation Management
- Persistent conversation history
- Multi-conversation support
- Message tracking and token usage
- Context window management

## 🛠 Technology Stack

### Backend
- **Python 3.12** - Core language
- **FastAPI** - Modern async web framework
- **SQLAlchemy** - Async ORM
- **PostgreSQL** - Database
- **AWS Bedrock** - Claude AI integration (boto3)
- **aiogram** - Telegram Bot API

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **React Router** - Navigation
- **React Markdown** - Markdown rendering

### Infrastructure
- **Docker & Docker Compose** - Containerization
- **Nginx** - Web server (production)

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- AWS Account with Bedrock access
- Telegram Bot Token (from [@BotFather](https://t.me/BotFather))

### 1. Clone Repository
```bash
git clone https://github.com/jalolyusuf/ToDo-BOT.git
cd ToDo-BOT
```

### 2. Environment Setup
Create `.env` file in project root:

```env
# Database
DATABASE_URL=postgresql+asyncpg://postgres:postgres@db:5432/claude_ai_bot

# AWS Bedrock
AWS_ACCESS_KEY_ID=your_aws_access_key_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_key_here
AWS_REGION=us-east-1
BEDROCK_MODEL_ID=anthropic.claude-3-haiku-20240307-v1:0

# Telegram
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_WEBHOOK_URL=https://your-domain.com/api/v1/telegram/webhook
TELEGRAM_WEBHOOK_SECRET=your_random_secret_here

# Security
SECRET_KEY=your-super-secret-key-change-this
```

### 3. AWS Bedrock Setup

**Enable Claude Models in AWS Bedrock:**
1. Go to [AWS Bedrock Console](https://console.aws.amazon.com/bedrock/)
2. Navigate to "Model access"
3. Request access to **Anthropic Claude** models
4. Wait for approval (usually instant for Haiku)

**Create IAM User with Bedrock Access:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream"
      ],
      "Resource": "arn:aws:bedrock:*::foundation-model/anthropic.claude-*"
    }
  ]
}
```

### 4. Run with Docker
```bash
# Start all services
docker compose up -d --build

# View logs
docker compose logs -f

# Check status
docker compose ps
```

### 5. Setup Telegram Webhook
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-domain.com/api/v1/telegram/webhook",
    "secret_token": "your_webhook_secret"
  }'
```

### 6. Access Application
- **Web Interface**: http://localhost
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Telegram Bot**: https://t.me/your_bot_username

## 📖 Usage

### Telegram Bot Commands
- `/start` - Welcome message and bot introduction
- `/new` - Start a new conversation
- `/help` - Show help and available features

### Chatting with the Bot
Simply send any message to the bot:
- **Questions**: Ask anything, get intelligent responses
- **Code**: Request code examples or explanations
- **Analysis**: Send documents or images (coming soon)
- **Conversation**: Natural multi-turn conversations

## 📊 Database Schema

```
users
  ├─ id (uuid)
  ├─ telegram_id (bigint)
  ├─ username
  ├─ first_name
  ├─ last_name
  └─ language_code

conversations
  ├─ id (uuid)
  ├─ user_id (fk → users)
  ├─ title
  ├─ status (active/archived/deleted)
  └─ summary

messages
  ├─ id (uuid)
  ├─ conversation_id (fk → conversations)
  ├─ role (user/assistant/system)
  ├─ content (text)
  ├─ input_tokens
  ├─ output_tokens
  └─ telegram_message_id

attachments
  ├─ id (uuid)
  ├─ message_id (fk → messages)
  ├─ file_type (photo/video/document/audio/voice)
  ├─ file_id (telegram)
  ├─ file_name
  └─ mime_type
```

## 🔧 Development

### Backend Development
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

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
```

## 💰 Cost Estimation (AWS Bedrock)

**Claude 3 Haiku** pricing:
- Input: ~$0.25 per 1M tokens
- Output: ~$1.25 per 1M tokens

**Estimated monthly costs:**
- Light usage (1K messages): $2-5
- Medium usage (10K messages): $10-20
- Heavy usage (100K messages): $50-100

*Actual costs depend on conversation length and complexity.*

## 🏗 Architecture

```
┌─────────────────┐
│  Telegram User  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────┐
│  Telegram Bot   │─────▶│   FastAPI    │
│   (aiogram)     │      │   Backend    │
└─────────────────┘      └──────┬───────┘
                                │
                    ┌───────────┼───────────┐
                    │           │           │
                    ▼           ▼           ▼
            ┌──────────┐  ┌──────────┐  ┌─────────┐
            │ AWS      │  │PostgreSQL│  │  Web    │
            │ Bedrock  │  │ Database │  │Frontend │
            │(Claude)  │  │          │  │ (React) │
            └──────────┘  └──────────┘  └─────────┘
```

## 🔒 Security

- Webhook secret validation
- Environment-based configuration
- Secure token management
- AWS IAM-based access control
- CORS configuration

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Jalol Yusuf**
- GitHub: [@jalolyusuf](https://github.com/jalolyusuf)
- Telegram: [@jalolyusuf](https://t.me/jalolyusuf)
- Website: [jalolyusuf.info](https://jalolyusuf.info)

## 🙏 Acknowledgments

- Built with ❤️ using Claude AI
- Powered by AWS Bedrock
- Telegram Bot API for messaging
- FastAPI and React for modern web development

---

**⭐ If you find this project useful, please give it a star!**

Made with ❤️ by Jalol Yusuf
