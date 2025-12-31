# Chat Agent System Implementation

## Overview

Complete chat agent system implementation with Planner LLM integration for the iBotTester home page.

## Features Implemented

### 1. Backend Chat API

**Location:** `apps/backend/src/controllers/chatController.ts`

- **POST /api/chat/message** - Enhanced with Planner LLM integration

  - Accepts user prompts
  - Automatically creates conversations if not exists
  - Parses intent using IntentParserAgent
  - Generates intelligent responses
  - Stores conversation context with metadata
  - Supports project and branch context

- **GET /api/chat/history** - Get all chat conversations for user
- **GET /api/chat/:id** - Get specific conversation with messages
- **POST /api/chat/new** - Create new conversation
- **DELETE /api/chat/:id** - Delete conversation

### 2. Planner LLM Integration

**Location:** `apps/backend/src/agents/IntentParserAgent.ts`

The system uses the Intent Parser Agent to:

- Parse user prompts
- Extract action types (purchase, test, create, etc.)
- Identify targets and URLs
- Detect constraints and filters
- Determine expected outcomes
- Calculate confidence scores

**Flow:**

1. User sends message → Chat API
2. IntentParserAgent analyzes the prompt
3. System creates "thinking" message with intent
4. Generates contextual response based on intent
5. If test-related, creates test plan outline
6. Returns conversation with all messages

### 3. Frontend Chat UI

**Location:** `apps/frontend/components/HomeView.tsx`

Features:

- **Adaptive UI** - Shows welcome screen or chat interface
- **Real-time messaging** - Messages appear immediately
- **Loading indicators** - Animated dots while AI processes
- **Message bubbles** - Different styles for user/assistant/thinking
- **Intent display** - Shows detected intent metadata
- **Auto-scroll** - Automatically scrolls to new messages
- **Context selection** - Project and branch selectors
- **New chat** - Start fresh conversations
- **Error handling** - Graceful error messages

### 4. Database Schema Updates

**Location:** `apps/backend/prisma/schema.prisma`

**ChatConversation:**

```prisma
model ChatConversation {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  title     String
  projectId String?  @map("project_id")  // NEW
  branchId  String?  @map("branch_id")   // NEW
  createdAt DateTime @default(now())
  user      User     @relation(...)
  messages  ChatMessage[]
}
```

**ChatMessage:**

```prisma
model ChatMessage {
  id             String   @id @default(uuid())
  conversationId String   @map("conversation_id")
  role           String
  content        String   @db.Text
  metadata       String?  @db.Text  // NEW - Stores JSON metadata
  timestamp      DateTime @default(now())
  conversation   ChatConversation @relation(...)
}
```

### 5. API Service

**Location:** `apps/frontend/services/api.ts`

Enhanced Chat API methods:

- `sendMessage(content, conversationId?, projectId?, branchId?)` - Send message with context
- `getConversation(id)` - Get full conversation
- `getHistory()` - Get all conversations
- `createChat(title)` - Create new chat
- `deleteChat(id)` - Delete chat

## Usage Example

### User Interaction Flow:

1. **User enters:** "I want to create a functional test to purchase Nike shoes size 9 under $150 on amazon.com"

2. **System processes:**

   ```json
   {
     "intent": {
       "action": "purchase",
       "target": "Nike shoes",
       "url": "amazon.com",
       "constraints": ["size 9", "under $150"],
       "confidence": 0.95
     }
   }
   ```

3. **AI responds:**

   ```
   I understand you want to purchase "Nike shoes" on amazon.com

   Constraints: size 9, under $150

   📋 I'll create a test plan for this. Here's what I'll do:

   1. Navigate to amazon.com
   2. Search for "Nike shoes"
   3. Apply filters and constraints
   4. Complete the purchase action
   5. Verify the outcome

   Would you like me to execute this test plan?
   ```

## Key Components

### IntentParserAgent

- Uses GPT-4 for advanced intent parsing
- Falls back to regex-based parsing if no API key
- Extracts structured data from natural language
- Returns confidence scores

### Chat Controller

- Handles message routing
- Manages conversations
- Integrates with LLM agents
- Stores metadata in JSON format
- Creates thinking messages for UX

### HomeView Component

- React hooks for state management
- Real-time message updates
- Responsive UI design
- Context-aware conversations
- Error handling and fallbacks

## Configuration

### Environment Variables Required:

```bash
OPENAI_API_KEY=your-api-key-here  # For LLM functionality
DATABASE_URL=postgresql://...     # PostgreSQL database
```

### Database Migration:

```bash
cd apps/backend
npx prisma migrate dev --name add_chat_metadata
```

## Testing the Chat System

1. **Start the backend:**

   ```bash
   cd apps/backend
   npm run dev
   ```

2. **Start the frontend:**

   ```bash
   cd apps/frontend
   npm run dev
   ```

3. **Navigate to:** http://localhost:3000

4. **Try these prompts:**
   - "Create a test to search for products on amazon.com"
   - "I want to test login on example.com"
   - "Purchase Nike shoes under $100"
   - "Validate checkout flow on shopify.com"

## Architecture Diagram

```
┌─────────────┐
│   User UI   │
│  HomeView   │
└──────┬──────┘
       │ Message
       ▼
┌─────────────┐
│  Chat API   │
│ Controller  │
└──────┬──────┘
       │
       ├──────────────┐
       ▼              ▼
┌──────────────┐  ┌──────────────┐
│   Intent     │  │  Database    │
│   Parser     │  │  (Prisma)    │
│   Agent      │  │              │
└──────┬───────┘  └──────────────┘
       │
       ▼
┌──────────────┐
│   Response   │
│  Generator   │
└──────────────┘
```

## Next Steps

1. **Execute Test Plans** - Add ability to execute generated test plans
2. **Orchestrator Integration** - Full OrchestratorAgent integration
3. **Progress Updates** - Real-time test execution updates
4. **Test History** - Link conversations to test executions
5. **Export Tests** - Save conversations as test cases

## Files Modified

- ✅ `apps/backend/src/controllers/chatController.ts` - Enhanced with LLM
- ✅ `apps/backend/prisma/schema.prisma` - Added metadata fields
- ✅ `apps/frontend/components/HomeView.tsx` - Complete chat UI
- ✅ `apps/frontend/services/api.ts` - Enhanced chat API methods
- ✅ Database migration created and applied

## Status

✅ **COMPLETE** - Chat agent system fully implemented and ready to use!
