# Chat History System Architecture

## Component Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend Layer                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────┐         ┌─────────────────────────┐  │
│  │  ChatHistorySidebar  │         │      HomeView          │  │
│  │                      │         │                        │  │
│  │  - Load history      │◄────────┤  - Send messages       │  │
│  │  - Display convos    │         │  - Display chat        │  │
│  │  - Select convo      ├────────►│  - Handle input        │  │
│  │  - Delete convo      │         │  - Show typing         │  │
│  │  - Group by date     │         │  - Scroll messages     │  │
│  └──────────────────────┘         └─────────────────────────┘  │
│            │                                   │                │
│            └───────────────┬───────────────────┘                │
│                            │                                    │
│                    ┌───────▼────────┐                          │
│                    │   chatApi      │                          │
│                    │ (services/api) │                          │
│                    └───────┬────────┘                          │
└────────────────────────────┼───────────────────────────────────┘
                             │ HTTP/JSON
                             │
┌────────────────────────────▼───────────────────────────────────┐
│                        Backend Layer                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Chat Routes                           │  │
│  │  /api/chat/history          (GET)                       │  │
│  │  /api/chat/:id              (GET)                       │  │
│  │  /api/chat/new              (POST)                      │  │
│  │  /api/chat/message          (POST)                      │  │
│  │  /api/chat/:id              (DELETE)                    │  │
│  └────────────────────┬─────────────────────────────────────┘  │
│                       │                                         │
│  ┌────────────────────▼─────────────────────────────────────┐  │
│  │              Chat Controller                             │  │
│  │                                                          │  │
│  │  getChatHistory()    - Fetch all conversations          │  │
│  │  getChat()           - Fetch specific conversation      │  │
│  │  createChat()        - Create new conversation          │  │
│  │  sendMessage()       - Send message & AI process        │  │
│  │  deleteChat()        - Delete conversation              │  │
│  └────────────────────┬─────────────────────────────────────┘  │
│                       │                                         │
│  ┌────────────────────▼─────────────────────────────────────┐  │
│  │               IntentParserAgent                          │  │
│  │  - Parse user intent                                     │  │
│  │  - Determine action                                      │  │
│  │  - Extract parameters                                    │  │
│  └────────────────────┬─────────────────────────────────────┘  │
│                       │                                         │
│                       │                                         │
└───────────────────────┼─────────────────────────────────────────┘
                        │ Prisma ORM
                        │
┌───────────────────────▼─────────────────────────────────────────┐
│                      Database Layer                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              ChatConversation Table                    │    │
│  │  ─────────────────────────────────────────────────     │    │
│  │  id            (uuid)                                  │    │
│  │  userId        (uuid) → FK to User                     │    │
│  │  title         (string)                                │    │
│  │  projectId     (uuid, nullable) → FK to Project        │    │
│  │  branchId      (uuid, nullable)                        │    │
│  │  createdAt     (timestamp)                             │    │
│  └────────────────────┬───────────────────────────────────┘    │
│                       │ 1:N                                     │
│                       │                                         │
│  ┌────────────────────▼───────────────────────────────────┐    │
│  │                ChatMessage Table                       │    │
│  │  ────────────────────────────────────────────────      │    │
│  │  id               (uuid)                               │    │
│  │  conversationId   (uuid) → FK to ChatConversation      │    │
│  │  role             (string) 'user' | 'assistant'        │    │
│  │  content          (text)                               │    │
│  │  metadata         (text/json, nullable)                │    │
│  │  timestamp        (timestamp)                          │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Loading Chat History

```
User clicks sidebar
       │
       ▼
ChatHistorySidebar.loadHistory()
       │
       ▼
chatApi.getHistory()
       │
       ▼
GET /api/chat/history
       │
       ▼
chatController.getChatHistory()
       │
       ▼
Prisma query: findMany(ChatConversation)
       │
       ▼
Returns conversations with message count
       │
       ▼
ChatHistorySidebar groups by date
       │
       ▼
Display in sidebar
```

### 2. Sending a Message

```
User types & sends message
       │
       ▼
HomeView.handleSubmit()
       │
       ▼
chatApi.sendMessage(content, conversationId)
       │
       ▼
POST /api/chat/message
       │
       ▼
chatController.sendMessage()
       │
       ├──> If new conversation:
       │    Create ChatConversation with auto-title
       │
       ├──> Create ChatMessage (user)
       │
       ├──> IntentParserAgent.parseIntent()
       │    │
       │    ├──> Parse with OpenAI (if available)
       │    └──> OR basic rule-based parsing
       │
       ├──> Generate AI response
       │
       ├──> Create ChatMessage (assistant)
       │
       └──> Return full conversation
              │
              ▼
HomeView updates chatMessages state
              │
              ▼
Display messages
```

### 3. Loading a Previous Conversation

```
User clicks conversation in sidebar
       │
       ▼
ChatHistorySidebar triggers onSelectConversation()
       │
       ▼
HomeView.handleSelectConversation(id)
       │
       ▼
chatApi.getConversation(id)
       │
       ▼
GET /api/chat/:id
       │
       ▼
chatController.getChat()
       │
       ▼
Prisma query: findFirst(ChatConversation)
       ├──> Include messages (ordered by timestamp)
       │
       └──> Return conversation with messages
              │
              ▼
HomeView updates state
       ├──> setChatMessages(messages)
       ├──> setConversationId(id)
       └──> setShowChat(true)
              │
              ▼
Display conversation
```

### 4. Deleting a Conversation

```
User clicks delete button
       │
       ▼
Confirmation dialog
       │
       ▼ (confirmed)
ChatHistorySidebar.handleDelete()
       │
       ▼
chatApi.deleteChat(id)
       │
       ▼
DELETE /api/chat/:id
       │
       ▼
chatController.deleteChat()
       │
       ▼
Verify ownership
       │
       ▼
Prisma: delete ChatConversation
       │
       └──> CASCADE delete all ChatMessages
              │
              ▼
Return success
       │
       ▼
ChatHistorySidebar removes from list
       │
       ├──> If current conversation: onNewChat()
       └──> Refresh display
```

## State Management

### ChatHistorySidebar State

```typescript
- conversations: Conversation[]     // List of all conversations
- isLoading: boolean                // Loading indicator
- error: string | null              // Error messages
```

### HomeView State

```typescript
- chatMessages: ChatMessage[]       // Current conversation messages
- conversationId: string | null     // Current conversation ID
- message: string                   // Input field value
- isLoading: boolean                // Sending indicator
- showChat: boolean                 // Show chat vs welcome screen
- isSidebarOpen: boolean            // Mobile sidebar toggle
```

## API Response Formats

### Get History Response

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "title": "Create a test to verify login...",
      "createdAt": "2026-01-01T12:00:00Z",
      "_count": {
        "messages": 5
      }
    }
  ]
}
```

### Get Conversation Response

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "title": "Create a test to verify login...",
    "createdAt": "2026-01-01T12:00:00Z",
    "messages": [
      {
        "id": "uuid",
        "conversationId": "uuid",
        "role": "user",
        "content": "Create a test...",
        "timestamp": "2026-01-01T12:00:00Z"
      },
      {
        "id": "uuid",
        "conversationId": "uuid",
        "role": "assistant",
        "content": "I'll help you...",
        "metadata": "{\"intent\":{...}}",
        "timestamp": "2026-01-01T12:00:05Z"
      }
    ]
  }
}
```

### Send Message Response

```json
{
  "success": true,
  "data": {
    "conversation": {
      "id": "uuid",
      "title": "Create a test...",
      "messages": [...]
    },
    "userMessage": {...},
    "assistantMessage": {...}
  }
}
```

## Security

### Authentication Flow

```
Request → authenticate middleware → verify JWT
                │
                ├──> Valid: attach user to req.user
                └──> Invalid: 401 Unauthorized
```

### Authorization

- All chat endpoints require authentication
- Users can only access their own conversations
- Conversation ownership verified on read/delete operations

## Performance Considerations

1. **Lazy Loading**: History loads only when sidebar opens
2. **Pagination**: Consider adding pagination for users with many conversations
3. **Message Limits**: Full conversation loads all messages (consider virtual scrolling)
4. **Caching**: Frontend could cache conversations to reduce API calls
5. **Database Indexes**: Indexed on userId, conversationId for fast queries

## Error Handling

### Frontend

- Network errors: Display error message with retry button
- Not found: Alert user and refresh list
- Unauthorized: Redirect to login

### Backend

- Validates user ownership
- Returns appropriate HTTP status codes
- Logs errors for debugging
- Provides user-friendly error messages
