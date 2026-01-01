# Intent Parser Agent - Complete Implementation Guide

## 🎉 Implementation Status: COMPLETE ✅

The Intent Parser Agent has been fully implemented across the entire stack with real-time natural language parsing capabilities.

---

## 📋 What Was Implemented

### 1. Database Layer ✅

**File**: `apps/backend/prisma/schema.prisma`

Added `ParsedIntent` model to store all parsed intents:

```prisma
model ParsedIntent {
  id               String   @id @default(uuid())
  userId           String
  projectId        String?
  prompt           String   @db.Text
  action           String
  target           String   @db.Text
  url              String?
  constraintsJson  Json?
  expectedOutcome  String?
  confidence       Float
  aiUsed           Boolean  @default(false)
  createdAt        DateTime @default(now())

  @@index([userId])
  @@index([projectId])
  @@index([createdAt])
  @@map("parsed_intents")
}
```

**Migration**: `20251231200632_add_parsed_intent`  
**Status**: ✅ Applied to database

---

### 2. Backend Agent ✅

**File**: `apps/backend/src/agents/IntentParserAgent.ts`

Already existed with:

- ✅ GPT-4 powered parsing (temperature: 0.1 for determinism)
- ✅ Rule-based fallback for when OpenAI is unavailable
- ✅ Comprehensive URL extraction
- ✅ Constraint detection (price, size, etc.)
- ✅ Confidence scoring

**Example Output**:

```typescript
{
  action: "purchase",
  target: "Nike shoes",
  url: "https://amazon.com",
  constraints: ["under $150", "size 9"],
  confidence: 0.9
}
```

---

### 3. API Layer ✅

#### Routes

**File**: `apps/backend/src/routes/intent.ts`

- `POST /api/intent/parse` - Parse user prompt
- `GET /api/intent/history` - Get parsing history

#### Controller

**File**: `apps/backend/src/controllers/intentController.ts`

- Handles intent parsing requests
- Saves results to database
- Returns structured intent data
- Requires authentication

#### Server Integration

**File**: `apps/backend/server.ts`

- Added intent routes to main server
- Registered `/api/intent` endpoint

---

### 4. Frontend Service ✅

**File**: `apps/frontend/services/api.ts`

Added `intentApi` with:

```typescript
export const intentApi = {
  parseIntent(prompt: string, projectId?: string)
  getHistory(projectId?: string, limit?: number)
}
```

Added TypeScript types:

```typescript
export interface ParsedIntent {
  id: string;
  action: string;
  target: string;
  url?: string;
  constraints?: string[];
  expectedOutcome?: string;
  confidence: number;
  aiUsed: boolean;
  createdAt: string;
}
```

---

### 5. Frontend UI ✅

**File**: `apps/frontend/components/HomeView.tsx`

Implemented real-time intent parsing with:

#### Features:

- ✅ **Debounced parsing** (500ms delay as user types)
- ✅ **Real-time intent display** below input field
- ✅ **Visual intent card** showing:
  - Action and Target
  - URL (if detected)
  - Constraints as badges
  - Confidence score with color coding
  - AI vs Rule-based indicator
- ✅ **Responsive design** - works in both initial and chat views
- ✅ **Smooth animations** for better UX

#### UI Components:

```tsx
{parsedIntent && (
  <div className="intent-card">
    <Badge>🤖 AI-Powered</Badge>
    <Badge>90% Confidence</Badge>
    <div>Action: {parsedIntent.action}</div>
    <div>Target: {parsedIntent.target}</div>
    <div>URL: {parsedIntent.url}</div>
    <div>Constraints: {parsedIntent.constraints.map(...)}</div>
  </div>
)}
```

---

## 🚀 How It Works

### User Flow:

1. User types in HomeView input: "Purchase Nike shoes size 9 under $150 on amazon.com"
2. After 500ms debounce, frontend calls `/api/intent/parse`
3. Backend uses IntentParserAgent (AI or fallback)
4. Parsed intent is saved to database
5. Response returned to frontend
6. Intent card appears below input showing:
   - Action: "purchase"
   - Target: "Nike shoes"
   - URL: "https://amazon.com"
   - Constraints: ["under $150", "size 9"]
   - Confidence: 90%

### Visual Feedback:

- **Green badge** (>80% confidence): High confidence
- **Yellow badge** (60-80%): Medium confidence
- **Gray badge** (<60%): Low confidence
- **Blue "AI-Powered" badge**: Using GPT-4
- **Gray "Rule-Based" badge**: Using fallback

---

## 🔌 API Reference

### Parse Intent

```http
POST /api/intent/parse
Authorization: Bearer <token>
Content-Type: application/json

{
  "prompt": "Purchase Nike shoes size 9 under $150 on amazon.com",
  "projectId": "optional-project-id"
}
```

**Response:**

```json
{
  "success": true,
  "intent": {
    "id": "uuid",
    "action": "purchase",
    "target": "Nike shoes",
    "url": "https://amazon.com",
    "constraints": ["under $150", "size 9"],
    "confidence": 0.9,
    "aiUsed": true,
    "createdAt": "2025-12-31T20:06:32Z"
  },
  "message": "Intent parsed successfully using AI"
}
```

### Get History

```http
GET /api/intent/history?projectId=<id>&limit=20
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "intents": [
    {
      "id": "uuid",
      "prompt": "Purchase Nike shoes...",
      "action": "purchase",
      "target": "Nike shoes",
      "url": "https://amazon.com",
      "constraints": ["under $150", "size 9"],
      "confidence": 0.9,
      "aiUsed": true,
      "createdAt": "2025-12-31T20:06:32Z"
    }
  ]
}
```

---

## 🧪 Testing Instructions

### 1. Start Backend

```bash
cd apps/backend
npm install
npx prisma generate
npm run dev
```

### 2. Start Frontend

```bash
cd apps/frontend
npm install
npm run dev
```

### 3. Test the Feature

1. Navigate to http://localhost:3000
2. Login or register
3. Go to Home view
4. Type: "Purchase Nike shoes size 9 under $150 on amazon.com"
5. Wait 500ms
6. See parsed intent appear below input

### Expected Result:

✅ Intent card displays with:

- Action: purchase
- Target: Nike shoes
- URL: https://amazon.com
- Constraints: under $150, size 9
- 90% confidence (if OpenAI configured) or 60% (fallback)

---

## ⚙️ Configuration

### OpenAI API Key (Optional)

```bash
# .env file in apps/backend
OPENAI_API_KEY=your-api-key-here
```

**With OpenAI**: Uses GPT-4 for parsing (confidence: 0.9)  
**Without OpenAI**: Uses rule-based fallback (confidence: 0.6)

---

## 📊 Database Schema

Table: `parsed_intents`

| Column           | Type              | Description                             |
| ---------------- | ----------------- | --------------------------------------- |
| id               | UUID              | Primary key                             |
| user_id          | String            | User who created the intent             |
| project_id       | String (optional) | Associated project                      |
| prompt           | Text              | Original user prompt                    |
| action           | String            | Detected action (purchase, login, etc.) |
| target           | Text              | What to act on                          |
| url              | String (optional) | Extracted URL                           |
| constraints_json | JSON              | Array of constraints                    |
| expected_outcome | Text (optional)   | Expected result                         |
| confidence       | Float             | 0-1 confidence score                    |
| ai_used          | Boolean           | Whether AI was used                     |
| created_at       | Timestamp         | When created                            |

**Indexes**: user_id, project_id, created_at

---

## 🔄 Integration with Other Agents

The Intent Parser Agent is the **first step** in the agent pipeline:

```
User Prompt → Intent Parser → Test Planner → Execution → Evidence → Diff → Report
```

### Next Steps:

The parsed intent can be passed to:

1. **Test Planner Agent**: To generate structured test steps
2. **Orchestrator Agent**: For complete test flow
3. **Chat Agent**: To provide intelligent responses

---

## 📁 Files Modified/Created

### Created:

- ✅ `apps/backend/src/routes/intent.ts`
- ✅ `apps/backend/src/controllers/intentController.ts`
- ✅ `apps/backend/prisma/migrations/20251231200632_add_parsed_intent/migration.sql`
- ✅ `docs/INTENT_PARSER_IMPLEMENTATION.md`

### Modified:

- ✅ `apps/backend/prisma/schema.prisma` (Added ParsedIntent model)
- ✅ `apps/backend/server.ts` (Added intent routes)
- ✅ `apps/frontend/services/api.ts` (Added intentApi)
- ✅ `apps/frontend/components/HomeView.tsx` (Added real-time intent parsing UI)

---

## ✨ Features Summary

✅ **Real-time Parsing**: Debounced intent extraction as user types  
✅ **AI-Powered**: GPT-4 with temperature 0.1 for determinism  
✅ **Fallback Mode**: Rule-based when OpenAI unavailable  
✅ **Database Storage**: All intents saved for history  
✅ **Visual Feedback**: Beautiful UI with badges and colors  
✅ **Confidence Scoring**: Know reliability of parsing  
✅ **Project Context**: Associate with projects  
✅ **Authentication**: Secure user-specific data  
✅ **TypeScript**: Full type safety across stack  
✅ **Responsive**: Works on all screen sizes

---

## 🎯 Example Use Cases

1. **E-commerce Testing**: "Purchase Nike shoes size 9 under $150 on amazon.com"
2. **Login Testing**: "Login to example.com with username test@example.com"
3. **Search Testing**: "Search for laptops under $1000 on bestbuy.com"
4. **Form Testing**: "Fill out contact form on example.com with name John Doe"
5. **Navigation**: "Navigate to https://example.com and click the signup button"

---

## 🐛 Known Issues

1. **TypeScript IDE errors**: May need to restart TypeScript server to pick up new Prisma types

   - Solution: Reload VS Code window or run `npx prisma generate`

2. **Pre-existing compilation error**: There's an error in `PlaywrightExecutionEngine.ts` (unrelated to this implementation)

---

## 🚀 Future Enhancements

- [ ] Intent templates/suggestions based on history
- [ ] Multi-language support
- [ ] Custom action types per project
- [ ] Intent similarity search
- [ ] Batch intent parsing
- [ ] Analytics dashboard
- [ ] Export intent history
- [ ] Intent validation rules

---

**Implementation Complete**: December 31, 2025  
**Version**: 2.0.0  
**Status**: ✅ Production Ready
