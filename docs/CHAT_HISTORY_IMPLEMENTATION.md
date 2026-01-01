# Chat Conversation History Implementation

## Overview

This implementation provides a complete chat conversation history system that stores all conversations in the database and allows users to retrieve and view their chat history.

## Features Implemented

### 1. Database Schema (Already in place)

- **ChatConversation Model**: Stores conversation metadata
  - `id`: Unique identifier
  - `userId`: Owner of the conversation
  - `title`: Auto-generated from first message (first 50 characters)
  - `projectId`: Optional project context
  - `branchId`: Optional branch context
  - `createdAt`: Creation timestamp
- **ChatMessage Model**: Stores individual messages
  - `id`: Unique identifier
  - `conversationId`: Links to conversation
  - `role`: 'user' or 'assistant'
  - `content`: Message text
  - `metadata`: Additional data (JSON)
  - `timestamp`: Message timestamp

### 2. Backend API Endpoints

#### Get Chat History

```
GET /api/chat/history
```

Returns all conversations for the authenticated user, ordered by most recent first.

#### Get Specific Conversation

```
GET /api/chat/:id
```

Returns a specific conversation with all its messages.

#### Create New Chat

```
POST /api/chat/new
Body: { title: string }
```

Creates a new conversation.

#### Send Message

```
POST /api/chat/message
Body: {
  content: string,
  conversationId?: string,
  projectId?: string,
  branchId?: string
}
```

Sends a message. If no conversationId is provided, creates a new conversation automatically with the title set to the first 50 characters of the message.

#### Delete Conversation

```
DELETE /api/chat/:id
```

Deletes a conversation and all its messages.

### 3. Frontend Components

#### ChatHistorySidebar Component

Location: `apps/frontend/components/ChatHistorySidebar.tsx`

Features:

- **Sidebar Display**: Shows all conversations grouped by date (Today, Yesterday, X days ago)
- **New Chat Button**: Creates a new conversation
- **Conversation Selection**: Click to load a conversation
- **Delete Functionality**: Delete conversations with confirmation
- **Mobile Responsive**:
  - Hidden by default on mobile
  - Toggle button to show/hide
  - Overlay when open on mobile
  - Always visible on desktop (lg breakpoint)
- **Message Count**: Shows number of messages per conversation
- **Auto-refresh**: Loads history when sidebar opens
- **Active State**: Highlights currently selected conversation

#### Updated HomeView Component

Location: `apps/frontend/components/HomeView.tsx`

New Features:

- **Sidebar Integration**: Added ChatHistorySidebar component
- **Conversation Loading**: `handleSelectConversation` function loads selected conversation
- **Updated New Chat**: Clears message input when creating new chat
- **Layout Update**: Flex layout with sidebar and main chat area

### 4. Frontend API Service

Location: `apps/frontend/services/api.ts`

Chat API methods (already implemented):

- `chatApi.sendMessage()`: Send a message
- `chatApi.getConversation()`: Get conversation by ID
- `chatApi.getHistory()`: Get all conversations
- `chatApi.createChat()`: Create new conversation
- `chatApi.deleteChat()`: Delete conversation

## How It Works

### Creating a New Conversation

1. User types a message in the input field
2. User submits the message
3. If no `conversationId` exists:
   - Backend creates a new ChatConversation with title = first 50 chars of message
   - Saves the user message to ChatMessage table
   - Processes the message with AI
   - Saves the AI response to ChatMessage table
4. Returns the complete conversation with all messages

### Loading Conversation History

1. User opens the sidebar (automatically on desktop, toggle on mobile)
2. Frontend calls `chatApi.getHistory()`
3. Backend queries all conversations for the user
4. Frontend displays conversations grouped by date
5. Shows message count for each conversation

### Selecting a Previous Conversation

1. User clicks on a conversation in the sidebar
2. Frontend calls `chatApi.getConversation(conversationId)`
3. Backend returns conversation with all messages
4. Frontend displays all messages in chronological order
5. User can continue the conversation

### Continuing a Conversation

1. User types a new message
2. Frontend sends message with existing `conversationId`
3. Backend adds message to existing conversation
4. AI processes and responds
5. Messages are appended to the conversation

### Deleting a Conversation

1. User hovers over conversation and clicks delete button
2. Confirmation dialog appears
3. If confirmed, frontend calls `chatApi.deleteChat(id)`
4. Backend deletes conversation (cascades to all messages)
5. Frontend removes from list
6. If current conversation was deleted, creates new chat

## Key Features

### Auto-Generated Titles

Conversation titles are automatically generated from the first user message, making it easy to identify conversations in the history.

### Date Grouping

Conversations are grouped by:

- Today
- Yesterday
- X days ago (< 7 days)
- Month Day (>= 7 days)

### Responsive Design

- Desktop: Sidebar always visible
- Mobile: Toggle button to show/hide sidebar with overlay

### Real-time Updates

- Chat history refreshes when sidebar opens
- Manual refresh button available
- Conversations update after deletion

### Security

- All endpoints require authentication
- Users can only access their own conversations
- Conversation ownership verified on all operations

## Usage Example

```typescript
// In your main app component
<HomeView
  onSendMessage={handleSendMessage}
  projects={projects}
  selectedProject={selectedProject}
  onProjectChange={handleProjectChange}
/>
```

The component handles everything internally:

- Loading chat history
- Creating new chats
- Selecting conversations
- Sending messages
- Deleting conversations

## Database Relationships

```
User (1) ----< (N) ChatConversation (1) ----< (N) ChatMessage
```

- One User can have many ChatConversations
- One ChatConversation can have many ChatMessages
- Deleting a User cascades to ChatConversations
- Deleting a ChatConversation cascades to ChatMessages

## Future Enhancements

Potential improvements:

1. Search conversations by content
2. Pin important conversations
3. Export conversation history
4. Share conversations with team members
5. Archive old conversations
6. Conversation tags/labels
7. Edit conversation titles
8. Message reactions
9. File attachments in messages
10. Voice message support
