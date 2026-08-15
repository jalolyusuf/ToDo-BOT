#!/bin/bash
set -e

echo "🚀 ToDo-BOT Deployment Script"
echo "================================"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Project directory
PROJECT_DIR="$HOME/ToDo-BOT"

echo -e "${BLUE}📁 Navigating to project directory...${NC}"
cd "$PROJECT_DIR" || { echo -e "${RED}❌ Project directory not found!${NC}"; exit 1; }

echo -e "${BLUE}📥 Pulling latest code from GitHub...${NC}"
git pull origin main

echo -e "${BLUE}🔧 Updating bot token in .env...${NC}"
# Backup .env
cp .env .env.backup
# Update bot token
sed -i 's|TELEGRAM_BOT_TOKEN=.*|TELEGRAM_BOT_TOKEN=7823007296:AAGPBMacqYQhFM2vUzd94mXCM4GXh_u86EQ|' .env
echo -e "${GREEN}✅ Bot token updated${NC}"

echo -e "${BLUE}🐳 Stopping Docker containers...${NC}"
docker compose down

echo -e "${BLUE}🔨 Building and starting Docker containers...${NC}"
docker compose up -d --build

echo -e "${BLUE}⏳ Waiting for containers to be healthy...${NC}"
sleep 10

echo -e "${BLUE}🗃️  Running database migrations...${NC}"
docker compose exec -T backend alembic upgrade head

echo -e "${BLUE}🏥 Checking health status...${NC}"
HEALTH=$(curl -s https://jalolyusuf.info/api/v1/health)
echo "$HEALTH"

if echo "$HEALTH" | grep -q '"status":"ok"'; then
    echo -e "${GREEN}✅ Backend is healthy!${NC}"
else
    echo -e "${RED}❌ Backend health check failed!${NC}"
    exit 1
fi

echo -e "${BLUE}🤖 Setting up Telegram webhook...${NC}"
WEBHOOK_RESPONSE=$(curl -s -X POST "https://api.telegram.org/bot7823007296:AAGPBMacqYQhFM2vUzd94mXCM4GXh_u86EQ/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://jalolyusuf.info/api/v1/telegram/webhook"}')

echo "$WEBHOOK_RESPONSE"

if echo "$WEBHOOK_RESPONSE" | grep -q '"ok":true'; then
    echo -e "${GREEN}✅ Webhook configured successfully!${NC}"
else
    echo -e "${RED}❌ Webhook setup failed!${NC}"
fi

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}🎉 Deployment completed!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "📊 Check status:"
echo "  Health: curl https://jalolyusuf.info/api/v1/health"
echo "  Logs:   docker compose logs -f backend"
echo ""
echo "🤖 Test your bot:"
echo "  Open Telegram and send /start to your bot"
