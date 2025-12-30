# 🤖 iBotTester

_AI-Powered Autonomous Functional Testing Agent_

> Test web applications by simply describing what you want to validate.  
> iBotTester plans, executes, adapts,
> and explains — automatically.

---

## 🚀 What is iBotTester?

_iBotTester_ is an AI-driven functional testing platform that allows users to create, run, and maintain browser-based tests using natural language prompts instead of writing automation scripts.

Example prompt:

> “Purchase Nike shoes under $150 on amazon.com and validate checkout until payment page.”

The iBotTester AI agent:

- Understands user intent
- Creates a structured test plan
- Executes it in a real browser
- Captures screenshots and videos
- Detects UI and flow changes
- Explains failures in plain English

---

## 🎯 Problem Statement

Traditional test automation tools:

- Require heavy scripting
- Break frequently when UI changes
- Produce flaky results
- Provide poor failure explanations
- Are expensive to maintain

---

## 💡 Solution

iBotTester introduces _Intent-Based Testing_ powered by an autonomous AI agent:

- No scripts
- Minimal maintenance
- Self-healing execution
- Human-readable results

---

## 🧠 How It Works

User Prompt  
→ AI Test Planner  
→ Structured Test Plan (JSON)  
→ Autonomous Execution Agent  
→ Real Browser (Playwright)  
→ Evidence, Analysis & Diff

---

## ✨ Key Features

- Natural language test creation (ChatGPT/Gemini-style UI)
- Autonomous browser execution
- Screenshot & video recording
- Flow change detection
- Human-readable failure explanations
- Test history & dashboard

---

## 🛠️ Tech Stack

### Frontend

- React / Next.js
- Tailwind CSS

### Backend

- Node.js (TypeScript)
- Express / Fastify

### Execution

- Playwright

### AI

- OpenAI (GPT-4 / GPT-4.1)
- Gemini (pluggable)

### Database

- PostgreSQL / SQLite

---

## 📁 Repository Structure

```
ibottester/
├── apps/
│   ├── frontend/          # Next.js React application
│   │   ├── pages/         # Next.js pages
│   │   ├── styles/        # Tailwind CSS styles
│   │   ├── components/    # React components
│   │   └── package.json
│   └── backend/           # Node.js Express API
│       ├── server.ts      # Main server file
│       ├── Dockerfile
│       └── package.json
├── docs/
│   └── SETUP.md          # Detailed setup guide
├── README.md
├── docker-compose.yml    # Docker orchestration
└── .env.example          # Environment variables template
```

---

## 🚀 Quick Start

### Option 1: Local Development

**Prerequisites:**
- Node.js 18+
- npm or yarn

**1. Clone and install:**
```bash
git clone https://github.com/UPrabhuu/iBotTester.git
cd iBotTester

# Install backend dependencies
cd apps/backend
npm install
npx playwright install chromium

# Install frontend dependencies
cd ../frontend
npm install
```

**2. Configure environment variables:**
```bash
# Backend - Create apps/backend/.env
cp apps/backend/.env.example apps/backend/.env
# Edit .env and add your OPENAI_API_KEY (optional)

# Frontend - Create apps/frontend/.env.local
cp apps/frontend/.env.example apps/frontend/.env.local
```

**3. Run the application:**

Terminal 1 - Backend:
```bash
cd apps/backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd apps/frontend
npm run dev
```

**4. Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

### Option 2: Docker Compose

**Prerequisites:**
- Docker & Docker Compose

**1. Clone and configure:**
```bash
git clone https://github.com/UPrabhuu/iBotTester.git
cd iBotTester
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY (optional)
```

**2. Start services:**
```bash
docker-compose up -d
```

**3. Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- PostgreSQL: localhost:5432

---

## 🧪 Example Prompt

Create a functional test to purchase Nike shoes size 9 under $150
on amazon.com and validate checkout until payment page.

---

## 📡 API Endpoints

### Health Check
```bash
GET /
GET /api/health
```

### Create Test Plan
```bash
POST /api/test-plan
Content-Type: application/json

{
  "prompt": "Test login functionality on example.com"
}
```

**Response:**
```json
{
  "success": true,
  "testPlan": {
    "id": "test-1234567890",
    "prompt": "Test login functionality on example.com",
    "steps": [
      "Navigate to the target website",
      "Perform the requested action",
      "Validate the expected result"
    ],
    "status": "created",
    "createdAt": "2025-12-30T03:00:00.000Z"
  }
}
```

### Execute Test (Browser Automation)
```bash
POST /api/execute-test
Content-Type: application/json

{
  "testPlanId": "test-1234567890",
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "success": true,
  "execution": {
    "id": "exec-1234567890",
    "testPlanId": "test-1234567890",
    "url": "https://example.com",
    "title": "Example Domain",
    "screenshot": "data:image/png;base64,...",
    "status": "completed",
    "timestamp": "2025-12-30T03:00:00.000Z"
  }
}
```

---

## 🔧 Development Status

### ✅ Implemented Features
- ✅ Next.js frontend with Tailwind CSS
- ✅ TypeScript backend with Express
- ✅ Playwright browser automation
- ✅ Natural language test creation UI
- ✅ REST API for test planning
- ✅ Browser execution with screenshots
- ✅ Docker support
- ✅ OpenAI integration (optional)

### 🚧 Roadmap
- [ ] Database integration (PostgreSQL/SQLite)
- [ ] Test history and dashboard
- [ ] Video recording
- [ ] Flow change detection
- [ ] Advanced AI test planning
- [ ] Multi-browser support
- [ ] CI/CD integration

---

## 📝 License

MIT

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
