# 📚 iBotTester Complete Tutorial & Learning Guide

**Version 1.0** | Last Updated: December 2024

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Prerequisites & Setup](#prerequisites--setup)
4. [Project Structure](#project-structure)
5. [Running the Application](#running-the-application)
6. [Architecture & How It Works](#architecture--how-it-works)
7. [Key Concepts](#key-concepts)
8. [Frontend Development](#frontend-development)
9. [Backend Development](#backend-development)
10. [Using Playwright](#using-playwright)
11. [AI Integration (OpenAI)](#ai-integration-openai)
12. [Common Development Tasks](#common-development-tasks)
13. [Troubleshooting](#troubleshooting)
14. [Best Practices](#best-practices)

---

## Project Overview

### What is iBotTester?

iBotTester is an **AI-powered autonomous functional testing platform** that enables users to create and execute browser-based tests using **natural language prompts** instead of traditional automation scripts.

### Problem It Solves

Traditional test automation:

- ❌ Requires heavy scripting and coding
- ❌ Breaks frequently when UI changes
- ❌ Produces flaky/unreliable results
- ❌ Difficult to maintain and update
- ❌ Poor failure explanations

### iBotTester Solution

- ✅ **Natural language input** - describe what you want to test
- ✅ **AI-powered planning** - automatically creates test strategy
- ✅ **Autonomous execution** - runs in real browser (Playwright)
- ✅ **Self-healing** - adapts to UI changes
- ✅ **Human-readable results** - clear pass/fail with explanations

### Example Use Case

**User Input:**

> "Navigate to amazon.com, search for Nike shoes under $150, add one to cart, and validate checkout until payment page."

**iBotTester Does:**

1. Understands the intent
2. Creates a structured test plan
3. Executes in a real browser
4. Takes screenshots/videos for evidence
5. Detects UI changes
6. Reports in plain English

---

## Technology Stack

### Frontend (Customer-Facing UI)

| Technology       | Purpose                     | Version |
| ---------------- | --------------------------- | ------- |
| **React**        | UI component framework      | 18.2.0  |
| **Next.js**      | Full-stack React framework  | 14.0.4  |
| **TypeScript**   | Type-safe JavaScript        | 5.3.3   |
| **Tailwind CSS** | Utility-first CSS framework | 3.3.6   |
| **Axios**        | HTTP client for API calls   | 1.6.2   |

### Backend (API Server)

| Technology     | Purpose                         | Version |
| -------------- | ------------------------------- | ------- |
| **Node.js**    | JavaScript runtime              | 18+     |
| **Express**    | Web framework                   | 4.18.2  |
| **TypeScript** | Type-safe JavaScript            | 5.3.3   |
| **CORS**       | Cross-origin resource handling  | 2.8.5   |
| **Dotenv**     | Environment variable management | 16.3.1  |

### Test Execution

| Technology     | Purpose            | Version |
| -------------- | ------------------ | ------- |
| **Playwright** | Browser automation | 1.40.1  |

### AI/ML Integration

| Service            | Purpose                                        |
| ------------------ | ---------------------------------------------- |
| **OpenAI (GPT-4)** | Natural language understanding & test planning |
| **Gemini**         | Alternative LLM provider (pluggable)           |

### Infrastructure & Database

| Tool               | Purpose                       |
| ------------------ | ----------------------------- |
| **Docker**         | Containerization              |
| **Docker Compose** | Multi-container orchestration |
| **PostgreSQL**     | Production database           |
| **SQLite**         | Development/testing database  |

---

## Prerequisites & Setup

### System Requirements

- **Node.js**: Version 18 or higher
- **npm** or **yarn**: Package manager
- **Docker**: For containerized deployment (optional but recommended)
- **Git**: Version control
- **RAM**: Minimum 4GB (8GB recommended)
- **Disk Space**: Minimum 2GB for dependencies

### Installation Steps

#### Step 1: Clone the Repository

```bash
git clone <your-repository-url>
cd iBotTester
```

#### Step 2: Verify Node.js Installation

```bash
node --version  # Should be v18.0.0 or higher
npm --version   # Should be 8.0.0 or higher
```

#### Step 3: Install Backend Dependencies

```bash
cd apps/backend
npm install
```

**What gets installed:**

- Express (HTTP server)
- Playwright (browser automation)
- OpenAI SDK
- TypeScript compiler
- Type definitions

#### Step 4: Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

**What gets installed:**

- React & Next.js
- Tailwind CSS & PostCSS
- Type definitions for React

#### Step 5: Create Environment Configuration Files

**Backend `.env` file at `apps/backend/.env`:**

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DATABASE_URL=sqlite:./dev.db
# For PostgreSQL: DATABASE_URL=postgresql://user:password@localhost:5432/ibottester

# AI Configuration
OPENAI_API_KEY=your-openai-api-key-here
# Get your API key from: https://platform.openai.com/api-keys

# Playwright Configuration
PLAYWRIGHT_BROWSER=chromium
PLAYWRIGHT_HEADLESS=true

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

**Frontend `.env.local` file at `apps/frontend/.env.local`:**

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=iBotTester
```

#### Step 6: Get an OpenAI API Key (Required for AI Features)

1. Visit https://platform.openai.com/api-keys
2. Sign up or log in with your account
3. Create a new API key
4. Copy the key to your `.env` file (it won't be shown again)
5. Keep it secret - never commit to version control

---

## Project Structure

```
iBotTester/
├── apps/
│   ├── backend/                    # API server & test execution
│   │   ├── server.ts              # Main server file
│   │   ├── package.json           # Dependencies
│   │   ├── tsconfig.json          # TypeScript config
│   │   ├── Dockerfile            # Container image
│   │   └── .env                   # Environment variables
│   │
│   └── frontend/                   # User interface
│       ├── pages/
│       │   ├── _app.tsx           # Next.js app wrapper
│       │   ├── _document.tsx      # HTML structure
│       │   └── index.tsx          # Home page
│       ├── styles/
│       │   └── globals.css        # Global styles
│       ├── package.json           # Dependencies
│       ├── tsconfig.json          # TypeScript config
│       ├── next.config.js         # Next.js config
│       ├── tailwind.config.js     # Tailwind config
│       ├── postcss.config.js      # PostCSS config
│       ├── Dockerfile            # Container image
│       └── .env.local             # Environment variables
│
├── docs/
│   ├── SETUP.md                   # Quick start guide
│   ├── TUTORIAL.md               # This file!
│   └── ARCHITECTURE.md           # Detailed architecture
│
├── docker-compose.yml             # Multi-container setup
├── README.md                       # Project overview
├── CONTRIBUTING.md                # Contribution guidelines
└── .gitignore                      # Git ignore rules
```

### Key Files Explained

#### Backend Server (`apps/backend/server.ts`)

- **Purpose**: Main API server
- **Handles**:
  - Incoming test requests
  - AI test planning
  - Playwright browser automation
  - Test execution & reporting

#### Frontend Pages (`apps/frontend/pages/`)

- **\_app.tsx**: Wraps all pages, global state
- **\_document.tsx**: HTML structure, meta tags
- **index.tsx**: Home page UI

#### Configuration Files

- **tsconfig.json**: TypeScript compiler settings
- **next.config.js**: Next.js framework settings
- **tailwind.config.js**: Tailwind CSS customization
- **docker-compose.yml**: Production deployment config

---

## Running the Application

### Option 1: Local Development (Recommended for Learning)

**Terminal 1 - Start Backend (Port 3001)**

```bash
cd apps/backend
npm run dev
```

Expected output:

```
iBotTester API Server
Version 1.0.0
Listening on port 3001
```

**Terminal 2 - Start Frontend (Port 3000)**

```bash
cd apps/frontend
npm run dev
```

Expected output:

```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

**Access the Application:**

- Frontend UI: http://localhost:3000
- Backend API: http://localhost:3001
- API Health Check: http://localhost:3001/api/health

### Option 2: Docker Compose (Production-like)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Option 3: Production Build

**Backend:**

```bash
cd apps/backend
npm run build        # Creates dist/ folder
npm start            # Runs compiled code
```

**Frontend:**

```bash
cd apps/frontend
npm run build        # Creates optimized build
npm start            # Starts production server
```

### Testing Endpoints

**Check Backend Health:**

```bash
curl http://localhost:3001/api/health
```

Response:

```json
{
  "status": "healthy",
  "timestamp": "2024-12-29T10:30:45.123Z",
  "services": {
    "api": "running",
    "playwright": "available",
    "openai": "configured"
  }
}
```

---

## Architecture & How It Works

### System Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     USER INTERFACE                           │
│                   (Next.js Frontend)                         │
│   ┌──────────────────────────────────────────────────────┐  │
│   │ Test Request: "Click Login, Enter Credentials, ..."  │  │
│   └──────────────────────────────────────────────────────┘  │
└────────────────────┬──────────────────────────────────────────┘
                     │ HTTP POST
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    API SERVER                                │
│                 (Express + TypeScript)                       │
│   ┌──────────────────────────────────────────────────────┐  │
│   │ /api/test-plan  - Receives user prompt              │  │
│   │ /api/execute    - Runs browser automation            │  │
│   │ /api/health     - System status check                │  │
│   └──────────────────────────────────────────────────────┘  │
└────────────────────┬──────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
┌──────────────────┐   ┌──────────────────────┐
│  OPENAI API      │   │  PLAYWRIGHT BROWSER  │
│                  │   │                      │
│ • Understands    │   │ • Chromium           │
│   natural lang   │   │ • Firefox            │
│ • Creates plan   │   │ • WebKit             │
│ • Analyzes       │   │ • Takes screenshots  │
│   failures       │   │ • Records videos     │
└──────────────────┘   └──────────────────────┘
        │                         │
        └────────────┬────────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │  TEST RESULTS & REPORT │
        │                        │
        │ • Screenshots          │
        │ • Videos               │
        │ • Success/Failure      │
        │ • Explanations         │
        └────────────────────────┘
```

### Step-by-Step Execution Flow

#### 1. User Creates Test (Frontend)

- User enters: "Search for laptop on Amazon"
- Clicks "Create & Run Test"
- Frontend sends to backend API

#### 2. API Receives Request (Backend)

```typescript
POST /api/test-plan
{
  "prompt": "Search for laptop on Amazon",
  "targetUrl": "https://amazon.com",
  "timeout": 60000
}
```

#### 3. AI Planning (OpenAI)

- Request sent to GPT-4
- Returns structured test plan:

```json
{
  "steps": [
    "Navigate to amazon.com",
    "Find search box",
    "Type 'laptop'",
    "Press Enter",
    "Verify results loaded"
  ],
  "validations": ["Results page visible", "Product count > 0"]
}
```

#### 4. Browser Automation (Playwright)

- Launch Chromium browser
- Execute each step
- Capture screenshots
- Record video
- Compare expected vs actual

#### 5. Results & Reporting

- Detect failures
- Explain what went wrong
- Return to frontend
- Display to user

---

## Key Concepts

### 1. Natural Language Prompts

Instead of writing code:

```javascript
// ❌ Traditional automation (hard to maintain)
await page.goto("https://amazon.com");
const searchBox = await page.$('[data-test="search"]');
await searchBox.type("laptop");
await searchBox.press("Enter");
await page.waitForSelector(".results");
```

You write:

```
✅ "Go to Amazon, search for laptop, verify results appear"
```

**iBotTester AI converts this to an executable test plan.**

### 2. Autonomous Execution

The system doesn't just replay recorded actions. It:

- **Understands intent**: What are you trying to validate?
- **Adapts to changes**: If UI changes, it adjusts
- **Handles variations**: Different page layouts, timing issues
- **Makes decisions**: Click the right button even if position changes

### 3. Test Evidence

Every test execution captures:

- **Screenshots**: Visual evidence of each step
- **Videos**: Complete execution video
- **Logs**: Detailed action log
- **Comparisons**: Before/after state

### 4. Self-Healing

When a test fails:

- System analyzes the failure
- Tries alternative selectors
- Suggests fixes to user
- Learns from changes

### 5. Flow-Based Testing

Tests don't just verify individual pages. They test **complete user journeys**:

- Login → Dashboard → Create Item → Verify Success

---

## Frontend Development

### Understanding Next.js

Next.js is a React framework that provides:

- **File-based routing**: File structure = URL routes
- **Server-side rendering**: Fast initial loads
- **API routes**: Backend endpoints in `/pages/api`
- **Hot reload**: Changes appear instantly

### Project Structure

```
apps/frontend/
├── pages/
│   ├── _app.tsx          # Global wrapper
│   ├── _document.tsx     # HTML structure
│   ├── index.tsx         # Home page (/)
│   └── api/              # Backend endpoints
├── styles/
│   └── globals.css       # Global styles
├── public/               # Static assets (images, etc)
├── next.config.js        # Framework config
├── tailwind.config.js    # CSS config
└── tsconfig.json         # TypeScript config
```

### Creating a New Page

Create file `apps/frontend/pages/dashboard.tsx`:

```typescript
import { useState } from "react";
import Link from "next/link";

export default function Dashboard() {
  const [tests, setTests] = useState([]);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Test Dashboard</h1>
      <Link href="/">Back to Home</Link>

      <div className="mt-8">
        {tests.length === 0 ? (
          <p>No tests yet</p>
        ) : (
          tests.map((test) => (
            <div key={test.id} className="border p-4 mb-2">
              {test.name}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
```

**This automatically becomes**: `http://localhost:3000/dashboard`

### Making API Calls

```typescript
import axios from "axios";
import { useEffect, useState } from "react";

export default function TestForm() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Call backend API
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/test-plan`,
        { prompt, targetUrl: "https://example.com" }
      );

      console.log("Test Plan:", response.data);
      // Handle result...
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe your test..."
        className="w-full p-2 border rounded"
      />
      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        {loading ? "Creating Test..." : "Create Test"}
      </button>
    </form>
  );
}
```

### Using Tailwind CSS

Tailwind uses utility classes instead of writing CSS:

```typescript
// ❌ Old way: write CSS
<div style={{ padding: '16px', backgroundColor: '#3b82f6', color: 'white' }}>

// ✅ Tailwind way: use class names
<div className="p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
```

Common Tailwind classes:

- **Spacing**: `p-4` (padding), `m-2` (margin), `gap-4` (grid gap)
- **Colors**: `bg-blue-500` (background), `text-white` (text), `border-gray-200` (border)
- **Size**: `w-full` (width), `h-32` (height)
- **Layout**: `flex` (flexbox), `grid`, `block`, `inline`
- **Responsive**: `md:text-lg` (medium screens and up)

### Development Tips

**Hot Module Reloading:**

- Save a file
- Browser instantly updates
- No manual refresh needed

**Debugging:**

```typescript
console.log("Value:", value); // See in browser console
```

**Environment Variables:**

- Must start with `NEXT_PUBLIC_` to be accessible in browser
- Add to `.env.local`
- Restart dev server after changes

---

## Backend Development

### Understanding Express

Express is a minimal web framework for Node.js:

```typescript
import express from "express";
const app = express();

// Middleware: runs on every request
app.use(express.json()); // Parse JSON body

// Route: GET /
app.get("/", (req, res) => {
  res.json({ message: "Hello World" });
});

// Route: POST /api/data
app.post("/api/data", (req, res) => {
  const data = req.body; // Get JSON body
  res.json({ received: data });
});

// Start server
app.listen(3001, () => {
  console.log("Server running on port 3001");
});
```

### Project Structure

```
apps/backend/
├── server.ts           # Main file (entry point)
├── routes/             # API endpoints
├── controllers/        # Business logic
├── services/           # External integrations
├── models/             # Data structures
├── middleware/         # Request processing
└── utils/              # Helper functions
```

### Adding a New Endpoint

In `apps/backend/server.ts`:

```typescript
// GET endpoint - retrieve data
app.get("/api/tests", (req: Request, res: Response) => {
  res.json({
    tests: [
      { id: 1, name: "Login Test", status: "passed" },
      { id: 2, name: "Checkout Test", status: "failed" },
    ],
  });
});

// POST endpoint - create data
app.post("/api/tests", async (req: Request, res: Response) => {
  try {
    const { name, prompt } = req.body;

    // Validate input
    if (!name || !prompt) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Create test
    const test = {
      id: Date.now(),
      name,
      prompt,
      status: "pending",
      createdAt: new Date(),
    };

    res.json(test);
  } catch (error) {
    res.status(500).json({ error: "Failed to create test" });
  }
});

// DELETE endpoint - remove data
app.delete("/api/tests/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  res.json({ message: `Test ${id} deleted` });
});
```

### Error Handling

```typescript
app.post("/api/tests", async (req: Request, res: Response) => {
  try {
    // Your logic here
    if (!req.body.prompt) {
      // Client error - bad request
      return res.status(400).json({ error: "Prompt required" });
    }

    // Simulate processing
    const result = await processTest(req.body.prompt);
    res.json({ success: true, data: result });
  } catch (error) {
    // Server error
    console.error("Test failed:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});
```

### Database Connection

Currently supports SQLite (development) or PostgreSQL (production).

**SQLite Connection:**

```typescript
import sqlite3 from "sqlite3";
import { open } from "sqlite";

const db = await open({
  filename: "./dev.db",
  driver: sqlite3.Database,
});

// Query
const test = await db.get("SELECT * FROM tests WHERE id = ?", [1]);
```

**PostgreSQL Connection:**

```typescript
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Query
const result = await pool.query("SELECT * FROM tests WHERE id = $1", [1]);
```

---

## Using Playwright

### What is Playwright?

Playwright is a browser automation library that:

- **Controls browsers**: Chrome, Firefox, Safari
- **Simulates user actions**: Click, type, scroll
- **Captures evidence**: Screenshots, videos
- **Waits intelligently**: For elements to load

### Basic Playwright Usage

```typescript
import { chromium } from "playwright";

async function runTest() {
  // Launch browser
  const browser = await chromium.launch({
    headless: true, // false to see the browser
  });

  const page = await browser.newPage();

  try {
    // Navigate to URL
    await page.goto("https://amazon.com", {
      waitUntil: "networkidle", // Wait for page to fully load
    });

    // Wait for element and click
    await page.click('[data-test="search-input"]');

    // Type text
    await page.type('[data-test="search-input"]', "laptop");

    // Press keyboard key
    await page.press('[data-test="search-input"]', "Enter");

    // Wait for results
    await page.waitForSelector(".product-list", { timeout: 5000 });

    // Take screenshot
    await page.screenshot({ path: "screenshot.png" });

    // Get page content
    const title = await page.title();
    console.log("Page title:", title);
  } finally {
    await browser.close();
  }
}
```

### Integrating with Express Backend

```typescript
app.post("/api/test-execute", async (req: Request, res: Response) => {
  const { testSteps, targetUrl } = req.body;

  const browser = await chromium.launch();
  const page = await browser.newPage();
  const results = [];

  try {
    await page.goto(targetUrl);

    for (const step of testSteps) {
      if (step.action === "click") {
        await page.click(step.selector);
        results.push({ action: "click", success: true });
      } else if (step.action === "type") {
        await page.type(step.selector, step.text);
        results.push({ action: "type", success: true });
      }

      // Take screenshot after each action
      const screenshot = await page.screenshot({ type: "jpeg" });
      results[results.length - 1].screenshot = screenshot.toString("base64");
    }

    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Test failed",
    });
  } finally {
    await browser.close();
  }
});
```

### Common Playwright Selectors

```typescript
// By test attribute (most reliable)
await page.click('[data-test="login-button"]');

// By CSS class
await page.click(".btn-primary");

// By ID
await page.click("#email-input");

// By XPath
await page.click('//button[contains(text(), "Submit")]');

// By text content
await page.click('button:has-text("Click me")');

// By role (accessibility)
await page.click('button[role="submit"]');
```

### Waiting for Elements

```typescript
// Wait for selector to appear
await page.waitForSelector(".results", { timeout: 10000 });

// Wait for navigation
await page.waitForNavigation();

// Wait for network to be idle (no requests for 500ms)
await page.waitForLoadState("networkidle");

// Wait for DOM to load
await page.waitForLoadState("domcontentloaded");
```

### Recording Videos

```typescript
const browser = await chromium.launch();
const context = await browser.newContext({
  recordVideo: { dir: "./videos" },
});
const page = await context.newPage();

// ... run test ...

const videoPath = await page.video()?.path();
console.log("Video saved to:", videoPath);
```

---

## AI Integration (OpenAI)

### Setting Up OpenAI

1. **Get API Key**:

   - Visit https://platform.openai.com/api-keys
   - Create new API key
   - Add to `.env`: `OPENAI_API_KEY=sk-...`

2. **Cost**: Pay-as-you-go (~$0.03 per test plan)

### Using OpenAI in Backend

```typescript
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/api/test-plan", async (req: Request, res: Response) => {
  try {
    const { prompt, targetUrl } = req.body;

    // Create test plan using AI
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a QA test expert. Convert user test requests into structured test plans.
                    Return JSON with: { steps: string[], validations: string[] }`,
        },
        {
          role: "user",
          content: `Create a test plan for: "${prompt}" on ${targetUrl}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const testPlan = JSON.parse(completion.choices[0].message.content || "{}");

    res.json({ success: true, testPlan });
  } catch (error) {
    res.status(500).json({ error: "Failed to generate test plan" });
  }
});
```

### Analyzing Test Failures

```typescript
async function analyzeFailure(
  testSteps: string[],
  failureDetails: string
): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content:
          "You are a QA expert. Analyze test failures and suggest fixes in plain English.",
      },
      {
        role: "user",
        content: `Test steps: ${testSteps.join(
          ", "
        )}\n\nFailure: ${failureDetails}`,
      },
    ],
  });

  return completion.choices[0].message.content || "";
}
```

### Best Practices for AI Integration

1. **Set temperature**: 0.7 for balanced creativity
2. **Use system prompts**: Define expected output format
3. **Request JSON**: Ask for structured responses
4. **Handle errors**: OpenAI API might be slow or unavailable
5. **Cache results**: Don't re-plan identical tests
6. **Monitor costs**: Track API usage

---

## Common Development Tasks

### Task 1: Add a New Feature to Frontend

**Scenario**: Add a "Recent Tests" section to home page

**Steps**:

1. Open `apps/frontend/pages/index.tsx`
2. Add state for recent tests:

```typescript
import { useEffect, useState } from "react";

const [recentTests, setRecentTests] = useState([]);

useEffect(() => {
  // Fetch recent tests from API
  fetch("/api/tests/recent")
    .then((r) => r.json())
    .then((data) => setRecentTests(data));
}, []);
```

3. Add UI to display them:

```typescript
<div className="mt-8">
  <h2 className="text-2xl font-bold mb-4">Recent Tests</h2>
  {recentTests.map((test) => (
    <div key={test.id} className="border p-4 mb-2 rounded">
      <p className="font-semibold">{test.name}</p>
      <p className="text-sm text-gray-600">{test.status}</p>
    </div>
  ))}
</div>
```

### Task 2: Add a New Backend API Endpoint

**Scenario**: Create endpoint to list all tests

**Steps**:

1. Open `apps/backend/server.ts`
2. Add new route:

```typescript
app.get("/api/tests", (req: Request, res: Response) => {
  // Fetch from database
  const tests = [
    { id: 1, name: "Login Test", status: "passed" },
    { id: 2, name: "Checkout", status: "failed" },
  ];

  res.json({ tests });
});
```

3. Restart backend: `npm run dev`
4. Test in browser: `http://localhost:3001/api/tests`

### Task 3: Deploy to Docker

**Steps**:

1. Build and start containers:

```bash
docker-compose up -d
```

2. Check status:

```bash
docker-compose ps
docker-compose logs -f backend
```

3. Access application:

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

### Task 4: Debug a Failing Test

**Steps**:

1. **Enable headless mode** to see browser:

```typescript
const browser = await chromium.launch({ headless: false });
```

2. **Add console logs**:

```typescript
console.log("Navigating to:", targetUrl);
await page.goto(targetUrl);
console.log("Page loaded, title:", await page.title());
```

3. **Take screenshots** at each step:

```typescript
await page.screenshot({ path: `step-${i}.png` });
```

4. **Check network tab** for failed requests:

```typescript
page.on("response", (response) => {
  if (!response.ok()) {
    console.log(`Failed: ${response.url()} - ${response.status()}`);
  }
});
```

### Task 5: Add Environment-Specific Configuration

**Create `apps/backend/config.ts`**:

```typescript
export const config = {
  isDev: process.env.NODE_ENV === "development",
  port: parseInt(process.env.PORT || "3001"),
  databaseUrl: process.env.DATABASE_URL,
  openaiKey: process.env.OPENAI_API_KEY,
  headless: process.env.PLAYWRIGHT_HEADLESS !== "false",
};
```

**Use in `server.ts`**:

```typescript
import { config } from "./config";

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
```

---

## Troubleshooting

### Issue: "Cannot find module 'express'"

**Cause**: Dependencies not installed

**Solution**:

```bash
cd apps/backend
npm install
```

### Issue: Frontend can't connect to backend

**Cause**: Incorrect API URL or backend not running

**Solution**:

1. Check `apps/frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

2. Verify backend is running:

```bash
curl http://localhost:3001/api/health
```

3. Restart frontend: Stop and run `npm run dev` again

### Issue: "Port 3001 already in use"

**Cause**: Another process using the port

**Solution**:

```bash
# Windows: Find and kill process
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Mac/Linux: Find and kill process
lsof -i :3001
kill -9 <PID>
```

### Issue: OpenAI API rate limit

**Cause**: Too many requests to OpenAI

**Solution**:

1. Add delay between requests
2. Implement caching
3. Check usage at https://platform.openai.com/usage

### Issue: Playwright installation fails

**Cause**: Missing system dependencies

**Solution**:

```bash
# Reinstall with system dependencies
npm install --force
npx playwright install
```

### Issue: TypeScript compilation errors

**Cause**: Type mismatches

**Solution**:

```bash
# Check errors
npx tsc --noEmit

# Fix by adding types or checking variable types
const value: string = req.body.prompt;
```

### Issue: Docker container crashes on startup

**Cause**: Missing environment variables or port conflicts

**Solution**:

```bash
# Check logs
docker-compose logs backend

# Rebuild and restart
docker-compose down
docker-compose up -d --build
```

---

## Best Practices

### Code Quality

1. **Use TypeScript**: Catch errors before runtime

   ```typescript
   // ❌ Bad: any type
   function process(data: any) {
     return data.name;
   }

   // ✅ Good: explicit types
   interface Test {
     id: number;
     name: string;
   }
   function process(test: Test): string {
     return test.name;
   }
   ```

2. **Error Handling**: Always handle errors

   ```typescript
   try {
     await riskyOperation();
   } catch (error) {
     console.error("Failed:", error);
     res.status(500).json({ error: "Operation failed" });
   }
   ```

3. **Logging**: Log important events
   ```typescript
   console.log(`Test started: ${testName}`);
   console.error(`Test failed: ${error.message}`);
   ```

### Performance

1. **Parallelize Operations**:

   ```typescript
   // ❌ Slow: sequential
   await step1();
   await step2();
   await step3();

   // ✅ Fast: parallel
   await Promise.all([step1(), step2(), step3()]);
   ```

2. **Cache Results**:

   ```typescript
   const cache = new Map();

   function getCachedResult(key: string) {
     if (cache.has(key)) return cache.get(key);
     const result = expensiveOperation();
     cache.set(key, result);
     return result;
   }
   ```

### Security

1. **Never commit secrets**:

   - Use `.env` files (added to `.gitignore`)
   - Don't hardcode API keys

2. **Validate input**:

   ```typescript
   if (!prompt || prompt.length === 0) {
     return res.status(400).json({ error: "Prompt required" });
   }
   ```

3. **Use CORS properly**:
   ```typescript
   app.use(
     cors({
       origin: process.env.FRONTEND_URL,
       credentials: true,
     })
   );
   ```

### Testing

1. **Test edge cases**:

   - Empty inputs
   - Large payloads
   - Slow networks
   - Browser crashes

2. **Manual testing steps**:
   - Test on localhost
   - Test with real browser
   - Test with slow network (DevTools)
   - Test on different screen sizes

### Version Control

1. **Commit frequently**:

   ```bash
   git add .
   git commit -m "feat: add test execution endpoint"
   ```

2. **Use descriptive messages**:

   - `feat: add new feature`
   - `fix: resolve bug`
   - `docs: update documentation`

3. **Never force push** to main branch:
   ```bash
   git push origin feature-branch  # Good
   git push -f origin main         # ❌ Don't do this
   ```

---

## Learning Path

### Week 1: Foundations

- [ ] Set up development environment
- [ ] Understand project structure
- [ ] Run frontend and backend locally
- [ ] Make first API call

### Week 2: Frontend

- [ ] Learn React/Next.js basics
- [ ] Add a new page
- [ ] Create form component
- [ ] Call backend API

### Week 3: Backend

- [ ] Learn Express basics
- [ ] Add new API endpoint
- [ ] Connect to database
- [ ] Handle errors

### Week 4: Browser Automation

- [ ] Learn Playwright basics
- [ ] Write first automation test
- [ ] Integrate with backend
- [ ] Capture evidence

### Week 5: AI Integration

- [ ] Get OpenAI API key
- [ ] Understand prompt engineering
- [ ] Generate test plans
- [ ] Analyze results

### Week 6: Advanced Topics

- [ ] Deploy to Docker
- [ ] Optimize performance
- [ ] Add more features
- [ ] Contribute to project

---

## Additional Resources

### Official Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Express Docs](https://expressjs.com)
- [Playwright Docs](https://playwright.dev)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [TypeScript Docs](https://www.typescriptlang.org/docs)
- [OpenAI API Docs](https://platform.openai.com/docs)

### Tutorials & Guides

- [Next.js Tutorial](https://nextjs.org/learn)
- [Playwright Tutorial](https://playwright.dev/docs/intro)
- [TypeScript in 5 minutes](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html)

### Community

- [GitHub Issues](https://github.com/your-repo/issues)
- [Discussions](https://github.com/your-repo/discussions)

---

## Quick Reference

### Common Commands

```bash
# Frontend
cd apps/frontend
npm install                    # Install dependencies
npm run dev                   # Start development server
npm run build                 # Create production build
npm start                     # Start production server

# Backend
cd apps/backend
npm install                   # Install dependencies
npm run dev                   # Start with hot reload
npm run build                 # Compile TypeScript
npm start                     # Start compiled server

# Docker
docker-compose up -d          # Start all services
docker-compose down           # Stop all services
docker-compose logs -f        # View logs
docker-compose restart        # Restart services

# Git
git clone <url>              # Clone repository
git status                   # Check changes
git add .                    # Stage changes
git commit -m "message"      # Commit changes
git push                     # Push to remote
```

### Environment Variables Checklist

**Backend `.env`**

- [ ] PORT=3001
- [ ] NODE_ENV=development
- [ ] OPENAI_API_KEY=sk-...
- [ ] DATABASE_URL=sqlite:./dev.db (or PostgreSQL)
- [ ] FRONTEND_URL=http://localhost:3000

**Frontend `.env.local`**

- [ ] NEXT_PUBLIC_API_URL=http://localhost:3001

---

## Conclusion

iBotTester is a powerful platform that combines:

- **Modern Frontend**: React/Next.js for beautiful UIs
- **Robust Backend**: Express + TypeScript for reliable APIs
- **Browser Automation**: Playwright for real browser testing
- **AI Intelligence**: OpenAI for smart test creation

By following this tutorial, you now understand:
✅ The project architecture  
✅ How to set up the development environment  
✅ How to run the application  
✅ Frontend development with Next.js  
✅ Backend development with Express  
✅ Browser automation with Playwright  
✅ AI integration with OpenAI  
✅ Common development tasks  
✅ Best practices and troubleshooting

**Next Steps**:

1. Set up your development environment
2. Run the application locally
3. Modify a frontend page
4. Add a new API endpoint
5. Create a simple browser automation test

Happy coding! 🚀
