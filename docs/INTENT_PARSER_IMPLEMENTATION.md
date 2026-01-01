# Intent Parser Agent - Implementation Summary

## Overview

The Intent Parser Agent has been successfully implemented across the full stack. It parses natural language prompts from users and extracts structured intent with high confidence.

## Architecture

### Backend Components

#### 1. **Database Model** (`apps/backend/prisma/schema.prisma`)

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
  aiUsed           Boolean
  createdAt        DateTime @default(now())
}
```

#### 2. **Intent Parser Agent** (`apps/backend/src/agents/IntentParserAgent.ts`)

- **AI-Powered Mode**: Uses GPT-4 with temperature 0.1 for deterministic parsing
- **Fallback Mode**: Rule-based parsing when OpenAI API is unavailable
- **Extracts**:
  - `action`: Main action type (purchase, login, search, validate, navigate)
  - `target`: What the user wants to act on
  - `url`: Any URLs mentioned in the prompt
  - `constraints`: Conditions or filters (price, size, etc.)
  - `expectedOutcome`: What should happen
  - `confidence`: 0-1 score (0.9 for AI, 0.6 for fallback)

#### 3. **API Controller** (`apps/backend/src/controllers/intentController.ts`)

- `POST /api/intent/parse`: Parse a user prompt
- `GET /api/intent/history`: Get parsing history for the user

#### 4. **Routes** (`apps/backend/src/routes/intent.ts`)

- Authentication required for all endpoints
- Integrated into main server.ts

### Frontend Components

#### 1. **API Service** (`apps/frontend/services/api.ts`)

```typescript
export const intentApi = {
  parseIntent(prompt: string, projectId?: string)
  getHistory(projectId?: string, limit?: number)
}
```

#### 2. **HomeView Component** (`apps/frontend/components/HomeView.tsx`)

- **Real-time Intent Parsing**: Debounced (500ms) as user types
- **Visual Intent Display**: Shows parsed intent with:
  - Action and Target
  - URL (if detected)
  - Constraints as badges
  - Confidence score with color coding
  - AI vs Rule-based indicator
- **Responsive UI**: Works in both initial view and chat mode

## Usage Example

### User Input:

```
Purchase Nike shoes size 9 under $150 on amazon.com
```

### Parsed Output:

```json
{
  "action": "purchase",
  "target": "Nike shoes",
  "url": "https://amazon.com",
  "constraints": ["under $150", "size 9"],
  "confidence": 0.9,
  "aiUsed": true
}
```

## API Endpoints

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
    "createdAt": "2025-12-31T20:00:00Z"
  },
  "message": "Intent parsed successfully using AI"
}
```

### Get Intent History

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
      "createdAt": "2025-12-31T20:00:00Z"
    }
  ]
}
```

## Features

✅ **AI-Powered with Fallback**: GPT-4 parsing with rule-based backup  
✅ **Real-time Parsing**: Debounced intent extraction as user types  
✅ **Database Storage**: All parsed intents saved for history/analysis  
✅ **Visual Feedback**: Beautiful UI showing parsed intent details  
✅ **Confidence Scoring**: Know how reliable the parsing is  
✅ **Project Context**: Associate intents with specific projects  
✅ **Authentication**: Secure endpoints with user context

## UI Components

### Intent Display Card

- **Color-coded confidence badges**:
  - Green (>80%): High confidence
  - Yellow (60-80%): Medium confidence
  - Gray (<60%): Low confidence
- **AI/Rule-based indicator**
- **Structured display** of action, target, URL, and constraints
- **Smooth animations** for better UX

## Integration Points

The Intent Parser Agent integrates with:

1. **Test Planner Agent**: Passes structured intent for test plan generation
2. **Chat System**: Can display parsed intent in chat messages
3. **Project Management**: Associates intents with projects for context
4. **User Authentication**: Tracks which user made each request

## Environment Variables

```bash
OPENAI_API_KEY=your-api-key-here  # Optional - uses fallback if not set
```

## Database Migration

Migration created: `20251231200632_add_parsed_intent`

To apply:

```bash
cd apps/backend
npx prisma migrate dev
```

## Future Enhancements

- [ ] Multi-language support
- [ ] Custom action type definitions per project
- [ ] Intent similarity search
- [ ] Batch intent parsing
- [ ] Intent templates/suggestions
- [ ] Analytics dashboard for parsed intents

## Testing

### Manual Test:

1. Navigate to Home view
2. Type: "Purchase Nike shoes size 9 under $150 on amazon.com"
3. Wait 500ms for debounce
4. See parsed intent display with action, target, URL, and constraints

### Expected Behavior:

- Intent card appears below input
- Shows "AI-Powered" badge if OpenAI configured
- Displays 90% confidence (AI) or 60% (fallback)
- All constraints shown as badges

---

**Status**: ✅ Fully Implemented  
**Date**: December 31, 2025  
**Version**: 2.0.0
