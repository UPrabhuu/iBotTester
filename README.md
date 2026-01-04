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

**Complete Agent Flow:**

User Prompt  
→ **Intent Parser Agent** (Understands what you want to test)  
→ **Test Planner Agent** (Generates structured JSON test plan)  
→ **Execution Agent** (Runs tests in real browser with Playwright)  
→ **Evidence Collector** (Captures screenshots, logs, videos)  
→ **Diff & Validation Agent** (Compares with previous runs)  
→ **Report Generator** (Creates detailed, human-readable report)

**Agent Personality:**

- Calm and methodical (like a senior QA engineer)
- Deterministic and repeatable
- Clear explanations of failures
- Never hallucinates results
- States uncertainties explicitly
- Provides confidence scores and actionable suggestions

---

## ✨ Key Features

- **Natural language test creation** - ChatGPT-style UI for test authoring
- **Complete agent orchestration** - 6-stage agent flow from intent to report
- **Self-healing execution** - Automatically adapts to UI changes
- **Comprehensive evidence** - Screenshots, videos, and detailed logs
- **Flow change detection** - Compares runs and classifies differences (breaking/non-breaking/cosmetic)
- **Human-readable reports** - Senior QA engineer-style failure explanations
- **Confidence scoring** - AI-powered analysis with confidence metrics
- **Suggested fixes** - Actionable recommendations for test failures
- **Test history & dashboard** - Track all executions and trends

---

## 🛠️ Tech Stack

### Frontend

- React / Next.js
- Tailwind CSS

### Backend

- Node.js (TypeScript)
- Express / Fastify
- Structured Logging (custom logger utility)

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
│   │   │   ├── ui/        # Reusable UI primitives
│   │   │   └── *View.tsx  # Page-level views
│   │   ├── services/      # API helpers (api.ts, playwrightApi.ts)
│   │   └── package.json
│   └── backend/           # Node.js Express API
│       ├── server.ts      # Main server file
│       ├── src/
│       │   ├── engine/    # Playwright execution engine
│       │   ├── services/  # Business logic services
│       │   ├── utils/     # Utilities (logger.ts, prisma.ts)
│       │   └── agents/    # AI agent implementations
│       ├── Dockerfile
│       └── package.json
├── docs/
│   ├── SETUP_GUIDE.md                 # Detailed setup guide
│   ├── API.md                         # API documentation
│   ├── FINAL_REPORT.md                # Backend flow verification summary
│   ├── BACKEND_FLOW_SUMMARY.md        # Implementation details
│   ├── FLOW_VERIFICATION_REPORT.md    # Complete verification report
│   └── ARCHITECTURE_FLOW_DIAGRAM.md   # Visual architecture diagram
├── .github/
│   └── copilot-instructions.md  # AI coding guidelines
├── README.md
├── docker-compose.yml    # Docker orchestration
└── .env.example          # Environment variables template
```

---

## 🧭 Engineering Standards

- Frontend: reuse primitives from apps/frontend/components/ui (Button, Input, Select, Modal, Alert, Toast, etc.) before adding new UI atoms; compose existing components in components/ and views in components/\*View.tsx.
- Styling: follow Tailwind utility patterns already used in apps/frontend/styles/globals.css and tokens from apps/frontend/tailwind.config.js; avoid ad-hoc inline styles or new design systems.
- API usage: prefer the typed helpers in apps/frontend/services/api.ts and apps/frontend/services/playwrightApi.ts instead of new fetch wrappers.
- Testing and automation: align new flows with Playwright patterns under apps/backend/test-playwright-flow.ts and related engine utilities in apps/backend/src/engine.
- Docs: update relevant README/docs entries whenever behavior or contracts change.

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

## 🔄 Backend Flow Architecture

iBotTester follows a streamlined, AI-powered backend flow:

```
User Prompt
    ↓
Agent (Intent + Plan)              ← IntentParserAgent
    ↓
Playwright Discover Tool           ← PlaywrightDiscoveryAgent
    ↓
Test Model (JSON)                  ← TestModelGenerator
    ↓
[Optional] Code Generator          ← (Future enhancement)
    ↓
Playwright Runner                  ← PlaywrightRunnerService
    ↓
Result + Report                    ← Evidence + Validation + Report Services
```

### Flow Details

1. **User Prompt → Agent**: Parse natural language to extract intent and plan
2. **Playwright Discover**: Launch browser, discover UI elements and selectors
3. **Test Model (JSON)**: Generate structured test cases with steps
4. **Code Generator**: (Optional) Generate executable Playwright code
5. **Playwright Runner**: Execute tests and capture evidence
6. **Result + Report**: Generate comprehensive reports with screenshots/videos

📚 **See detailed documentation:**

- [Backend Flow Summary](./docs/BACKEND_FLOW_SUMMARY.md)
- [Flow Verification Report](./docs/FLOW_VERIFICATION_REPORT.md)
- [Architecture Diagram](./docs/ARCHITECTURE_FLOW_DIAGRAM.md)
- [Final Report](./docs/FINAL_REPORT.md)

---

## 🧪 Example Prompt

Create a functional test to purchase Nike shoes size 9 under $150
on amazon.com and validate checkout until payment page.

---

## 📡 API Endpoints

The backend provides a comprehensive REST API. See [API Documentation](./docs/API.md) and [Agent API Documentation](./docs/AGENT_API.md) for complete details.

### Quick Reference

**Authentication:**

- `POST /api/auth/login` - Email/password login
- `POST /api/auth/google` - Google OAuth
- `POST /api/auth/github` - GitHub OAuth
- `GET /api/auth/me` - Get current user

**Projects:**

- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id/branches` - List branches

**Test Management:**

- `GET /api/test-cases` - List test cases
- `POST /api/test-cases` - Create test case
- `GET /api/test-cases/:id/steps` - Get test steps
- `POST /api/test-cases/:id/steps` - Add test step

**Execution:**

- `GET /api/executions` - List executions
- `POST /api/executions` - Run test execution
- `POST /api/executions/:id/rerun` - Re-run test

**Chat & AI:**

- `POST /api/chat/message` - Send message to AI
- `GET /api/chat/history` - Get chat history
- `POST /api/orchestrated-test` - **NEW: Complete agent flow** (Intent → Plan → Execute → Evidence → Diff → Report)

**Dashboard:**

- `GET /api/dashboard/metrics` - Get metrics
- `GET /api/dashboard/activity` - Recent activity

**Configuration & Settings:**

- `GET /api/config/:projectId` - Get project config
- `PUT /api/settings/profile` - Update user profile

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

- ✅ Complete 6-agent orchestration flow
- ✅ Intent parsing from natural language
- ✅ Structured JSON test plan generation
- ✅ Playwright browser automation with self-healing
- ✅ Evidence collection (screenshots, videos, logs)
- ✅ Flow difference detection and classification
- ✅ AI-powered report generation with confidence scores
- ✅ Natural language test creation UI
- ✅ REST API for all agent operations
- ✅ Docker support
- ✅ OpenAI integration (optional)
- ✅ Database integration (PostgreSQL with Prisma)
- ✅ Structured logging utility

### 🚧 Roadmap

- [x] Complete agent orchestration flow
- [x] Self-healing selector system
- [x] Confidence scoring and suggested fixes
- [x] Flow difference detection and classification
- [x] Database integration (PostgreSQL with Prisma)
- [ ] Advanced AI test planning with vision
- [ ] Multi-browser support
- [ ] CI/CD integration
- [ ] Performance testing capabilities

---

## 📝 License

MIT

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
