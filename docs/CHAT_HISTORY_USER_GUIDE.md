# Chat History Feature - Quick Start Guide

## Overview

The chat history feature allows you to save, retrieve, and manage all your conversations with iBotTester.

## How to Use

### Starting a New Conversation

1. Navigate to the Home page
2. Type your message in the input field
3. Press Enter or click the send button
4. Your conversation is automatically saved with a title based on your first message

### Viewing Chat History

#### On Desktop (> 1024px)

- The chat history sidebar is always visible on the left
- Shows all your past conversations grouped by date

#### On Mobile (< 1024px)

- Tap the menu icon (☰) in the top-left corner
- The sidebar will slide in from the left
- Tap outside the sidebar or the X button to close it

### Loading a Previous Conversation

1. Open the chat history sidebar
2. Browse your conversations (grouped by Today, Yesterday, etc.)
3. Click on any conversation to load it
4. All messages will appear, and you can continue the conversation

### Creating a New Chat

1. Click the "New Chat" button at the top of the sidebar
2. The current conversation clears
3. Start typing a new message

### Deleting a Conversation

1. Hover over a conversation in the sidebar
2. A delete button (trash icon) appears on the right
3. Click the delete button
4. Confirm the deletion
5. The conversation and all its messages are permanently removed

## Features

### Automatic Title Generation

- Conversations are automatically titled using the first 50 characters of your initial message
- Example: "Create a test to verify login functionality..." becomes the title

### Date Grouping

Conversations are organized by:

- **Today**: Conversations from today
- **Yesterday**: Conversations from yesterday
- **X days ago**: Conversations from the last 7 days
- **Month Day**: Older conversations (e.g., "Dec 25")

### Message Count

Each conversation shows how many messages it contains, making it easy to find detailed discussions.

### Context Preservation

When you select a conversation:

- All messages load in chronological order
- Project and branch context is maintained
- You can continue exactly where you left off

## Tips

1. **Organize Your Work**: Create separate conversations for different testing scenarios
2. **Name Wisely**: Your first message becomes the title, so make it descriptive
3. **Quick Access**: Recently created conversations appear at the top
4. **Clean Up**: Delete old or test conversations to keep your history organized
5. **Mobile-Friendly**: Use the toggle button to access history on mobile devices

## Keyboard Shortcuts

- **Enter**: Send message
- **Shift + Enter**: New line in message (not yet implemented)

## Technical Details

### Storage

- All conversations are stored in a PostgreSQL database
- Messages are linked to conversations
- Deleting a conversation removes all its messages

### Security

- You can only see your own conversations
- All API endpoints require authentication
- Conversation ownership is verified on every operation

### Performance

- History loads on-demand when you open the sidebar
- Manual refresh available if needed
- Conversations are fetched with message counts for efficiency

## Troubleshooting

### Chat history not loading?

1. Click the "Refresh History" button at the bottom of the sidebar
2. Check your internet connection
3. Ensure you're logged in

### Can't find a conversation?

- Check different date groups (scroll down)
- Use the refresh button to reload
- Verify you didn't delete it

### Conversation won't load?

1. Try clicking it again
2. Refresh the page
3. Create a new chat and try again

## API Endpoints (For Developers)

```
GET    /api/chat/history          - Get all conversations
GET    /api/chat/:id              - Get specific conversation
POST   /api/chat/new              - Create new conversation
POST   /api/chat/message          - Send message
DELETE /api/chat/:id              - Delete conversation
```

All endpoints require authentication via Bearer token.

## Future Enhancements

Coming soon:

- Search within conversations
- Export conversation history
- Pin important conversations
- Share conversations with team members
- Conversation tags and filters
- Edit conversation titles
- Archive functionality
