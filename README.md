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

ibottester/
├── apps/
│ ├── frontend/
│ └── backend/
├── docs/
├── README.md
└── docker-compose.yml

---

## 🧪 Example Prompt

Create a functional test to purchase Nike shoes size 9 under $150
on amazon.com and validate checkout until payment page.
