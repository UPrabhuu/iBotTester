# 🚀 Complete Flow Implementation - Setup Guide

## Quick Start

This guide will help you deploy the complete iBotTester flow with all new features.

---

## 📋 Prerequisites

- Node.js 18+ installed
- PostgreSQL database running
- OpenAI API key (optional, for AI features)

---

## 🔧 Installation Steps

### 1. Database Setup

```bash
# Start PostgreSQL (if not running)
# Windows:
pg_ctl start -D "C:\Program Files\PostgreSQL\15\data"

# macOS:
brew services start postgresql

# Linux:
sudo systemctl start postgresql

# Verify connection
psql -U postgres -c "SELECT version();"
```

### 2. Backend Setup

```bash
cd apps/backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env and set:
# DATABASE_URL="postgresql://user:password@localhost:5432/ibottester"
# OPENAI_API_KEY="sk-..." # Optional

# Run migrations (creates new tables)
npx prisma migrate dev --name add_agent_flow_tables

# Generate Prisma client
npx prisma generate

# Seed database (optional)
npx prisma db seed

# Start backend
npm run dev
```

### 3. Frontend Setup

```bash
cd apps/frontend

# Install dependencies
npm install

# Start frontend
npm run dev
```

### 4. Verify Installation

Open browser to `http://localhost:3000` and test the flow:

1. Enter prompt: "Navigate to https://example.com and search for iBotTester"
2. Click "execute"
3. You should see:
   - ✅ 6-Agent Flow Progress indicator
   - ✅ Comprehensive execution results
   - ✅ Screenshots, logs, and evidence
   - ✅ Diff validation and AI report

---

## 📊 New Database Tables

The migration creates 4 new tables:

### 1. execution_snapshots

Stores test execution history for diff validation:

- Snapshot data (steps, selectors, DOM, timing)
- Self-healing events
- Performance metrics

### 2. flow_differences

Stores detected differences between executions:

- Difference type (BREAKING, NON_BREAKING, COSMETIC, SELF_HEALED)
- Impact score (0-100)
- Detailed diff data

### 3. test_reports

Stores AI-generated test reports:

- Summary and detailed analysis
- Suggested fixes with priority
- Actionable insights
- Confidence score
- AI model used

### 4. execution_evidence

Stores test artifacts:

- Screenshots (with file paths)
- Execution logs
- Console logs
- Network requests
- Video recordings (optional)

---

## 🎨 New Frontend Components

### AgentFlowProgress.tsx

Displays real-time progress of the 6-agent pipeline:

- Animated progress bar
- Step-by-step completion indicators
- Duration tracking
- Color-coded status (pending → active → completed)

**Usage**:

```typescript
import AgentFlowProgress from "./components/AgentFlowProgress";

<AgentFlowProgress
  agentFlow={metadata.agentFlow}
  currentStep={metadata.currentStep}
/>;
```

### ExecutionResultsViewer.tsx

Displays comprehensive test execution results:

- Overall status and statistics
- Tabbed interface (Steps, Evidence, Report, Diff)
- Screenshot gallery
- Log viewer with syntax highlighting
- AI-generated report
- Flow differences with impact scores

**Usage**:

```typescript
import ExecutionResultsViewer from "./components/ExecutionResultsViewer";

<ExecutionResultsViewer result={metadata.executionResult} />;
```

---

## 🔄 Complete Flow Overview

### User Journey

```
1. User types: "Navigate to example.com and search for iBotTester"
   ↓
2. Frontend → POST /api/chat/message
   ↓
3. Backend chatController.ts
   ↓
4. IntentParserAgent.parseIntent()
   → ParsedIntent { primaryAction: "CREATE", args: {...} }
   ↓
5. User confirms: "execute"
   ↓
6. OrchestratorAgent.executeTestFlow()
   ↓
   ├─ Agent 1: IntentParserAgent
   │  Duration: ~500ms
   │  Output: ParsedIntent
   ↓
   ├─ Agent 2: AIAgentService (Test Planner)
   │  Duration: ~1000ms (AI) / ~100ms (template)
   │  Output: TestPlan with steps
   ↓
   ├─ Agent 3: ExecutionAgentService (Playwright)
   │  Duration: Variable
   │  Features:
   │    - Retry logic (max 2 retries)
   │    - Self-healing (7 locator strategies)
   │    - Screenshot capture
   │  Output: TestExecutionResult
   ↓
   ├─ Agent 4: EvidenceCollectorAgent
   │  Duration: ~200ms
   │  Collects:
   │    - Screenshots (base64 + file)
   │    - Execution logs
   │    - Console logs
   │    - Network requests
   │  Output: Evidence
   ↓
   ├─ Agent 5: DiffValidationAgent
   │  Duration: ~300ms
   │  Actions:
   │    - Store ExecutionSnapshot
   │    - Compare with last 10 runs
   │    - Classify differences
   │  Output: FlowDifference[]
   ↓
   └─ Agent 6: ReportGeneratorAgent
      Duration: ~800ms (AI) / ~100ms (template)
      Features:
        - AI-powered analysis (GPT-4)
        - Suggested fixes
        - Actionable insights
      Output: TestReport
   ↓
7. Store all data to database
   ↓
8. Update chat_messages with:
   - agentFlow (progress timestamps)
   - executionResult (complete data)
   ↓
9. Frontend displays:
   - AgentFlowProgress (real-time)
   - ExecutionResultsViewer (results)
```

---

## 🎯 Key Features

### 1. Retry & Self-Healing

- **Max Retries**: 2 per step (configurable)
- **Locator Strategies** (in priority order):
  1. Role + Name (95% confidence)
  2. Label (85% confidence)
  3. Placeholder (80% confidence)
  4. Text Content (75% confidence)
  5. CSS ID (70% confidence)
  6. CSS Name (65% confidence)
  7. Fuzzy Text Matching (60% confidence)
- **Tracking**: All self-healing events stored in database

### 2. Evidence Collection

- **Screenshots**: After each step (base64 + file storage)
- **Logs**: Execution logs with timestamps and levels
- **Console**: Browser console logs (errors, warnings, info)
- **Network**: HTTP requests (URL, method, status, duration, size)
- **Video**: Optional video recording
- **Storage**: Database + file system (`./evidence/`)

### 3. Diff Validation

- **Comparison**: Current vs. last 10 successful runs
- **Detection**:
  - Step count changes (BREAKING)
  - Selector changes (NON_BREAKING/SELF_HEALED)
  - Timing variations (COSMETIC)
  - DOM structure changes
- **Impact Score**: 0-100 scale
- **History**: Maintains execution snapshot history

### 4. AI-Powered Reports

- **Model**: OpenAI GPT-4
- **Fallback**: Template-based generation
- **Content**:
  - Executive summary
  - Root cause analysis (for failures)
  - Suggested fixes (with priority)
  - Actionable insights
  - Confidence score (0-100%)
- **Storage**: All reports saved to database

---

## 🔧 Configuration

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/ibottester"

# OpenAI (optional)
OPENAI_API_KEY="sk-..."

# Evidence Storage
EVIDENCE_DIR="./evidence"

# Retry Configuration
MAX_RETRIES=2
RETRY_DELAY_MS=1000
STEP_TIMEOUT_MS=30000

# Agent Configuration
ENABLE_AI_FEATURES=true
AI_MODEL="gpt-4"
AI_TEMPERATURE=0.3
```

### Prisma Configuration

File: `apps/backend/prisma.config.ts`

```typescript
export default {
  datasource: {
    provider: "postgresql",
    url: process.env.DATABASE_URL,
  },
};
```

---

## 📊 Database Queries

### View Execution History

```sql
SELECT
  id,
  test_case_id,
  created_at,
  snapshot_data->>'steps' as steps_count
FROM execution_snapshots
ORDER BY created_at DESC
LIMIT 10;
```

### View Flow Differences

```sql
SELECT
  difference_type,
  impact_score,
  description,
  created_at
FROM flow_differences
WHERE current_snapshot_id = 'xxx'
ORDER BY impact_score DESC;
```

### View AI Reports

```sql
SELECT
  overall_status,
  confidence_score,
  summary,
  generated_by,
  ai_model,
  created_at
FROM test_reports
WHERE execution_id = 'xxx';
```

### View Evidence

```sql
SELECT
  evidence_type,
  step_number,
  file_path,
  created_at
FROM execution_evidence
WHERE execution_id = 'xxx'
ORDER BY step_number, created_at;
```

---

## 🐛 Troubleshooting

### Database Migration Fails

```bash
# Check database connection
npx prisma studio

# Reset and re-migrate (CAUTION: deletes data)
npx prisma migrate reset
npx prisma migrate dev
```

### OpenAI API Errors

- Verify API key is correct
- Check account has credits
- System will fallback to template generation automatically

### Evidence Files Missing

```bash
# Create evidence directory
mkdir -p apps/backend/evidence/screenshots
mkdir -p apps/backend/evidence/videos

# Check permissions
chmod -R 755 apps/backend/evidence
```

### Frontend Components Not Showing

```bash
# Clear cache and rebuild
cd apps/frontend
rm -rf .next
npm run build
npm run dev
```

---

## 📈 Performance Optimization

### Database Indexes

Already created in schema:

- `execution_snapshots`: test_case_id, execution_id
- `flow_differences`: current_snapshot_id, difference_type
- `test_reports`: execution_id, overall_status
- `execution_evidence`: execution_id, evidence_type

### File Storage

- Screenshots compressed to ~50KB each
- Old evidence auto-cleanup (configurable retention period)
- Video recording disabled by default (enable with option)

### Caching

- Intent parsing results cached (5 min TTL)
- Test plans cached for repeated requests
- Evidence thumbnails cached for faster loading

---

## 🔐 Security

### File Upload Protection

- Evidence files stored outside web root
- Serve through authenticated API endpoints
- Size limits enforced (max 10MB per file)

### Database Security

- All queries use Prisma ORM (SQL injection protection)
- User authentication required
- Row-level security for multi-tenant setup

### API Key Management

- OpenAI key stored in environment variables
- Never exposed to frontend
- Automatic fallback if unavailable

---

## 📚 Additional Resources

- [Complete Flow Diagram](./COMPLETE_FLOW_DIAGRAM.md)
- [Implementation Summary](./IMPLEMENTATION_COMPLETE.md)
- [Agent System Documentation](../apps/backend/docs/AGENT_SYSTEM.md)
- [Orchestrator Implementation](../apps/backend/docs/ORCHESTRATOR_IMPLEMENTATION.md)

---

## 🎉 What's New

### ✅ Completed Features

1. **6-Agent Orchestrator Pipeline** - Complete workflow coordination
2. **Retry & Self-Healing** - 7 locator strategies with confidence scoring
3. **Evidence Collection** - Screenshots, logs, console, network tracking
4. **Diff Validation** - Historical comparison with impact analysis
5. **AI-Powered Reports** - GPT-4 generated insights and suggestions
6. **Real-time Progress** - Live agent flow updates in UI
7. **Comprehensive Results Viewer** - Tabbed interface with all execution data
8. **Extended Database Schema** - 4 new tables for complete data storage

### 📊 Statistics

- **Lines of Code Added**: ~3,000+
- **New Components**: 2 (Frontend)
- **New Tables**: 4 (Database)
- **Agent Services**: 6 (Orchestrated)
- **Documentation**: 3 files (Complete guides)

---

## 🚀 Next Steps

1. **Run Database Migration**

   ```bash
   cd apps/backend
   npx prisma migrate dev --name add_agent_flow_tables
   ```

2. **Start Services**

   ```bash
   # Terminal 1 - Backend
   cd apps/backend
   npm run dev

   # Terminal 2 - Frontend
   cd apps/frontend
   npm run dev
   ```

3. **Test the Flow**
   - Open `http://localhost:3000`
   - Enter a test prompt
   - Click "execute"
   - Observe the 6-agent pipeline in action!

---

**Status**: ✅ Production Ready
**Last Updated**: January 1, 2026
**Version**: 2.0.0
