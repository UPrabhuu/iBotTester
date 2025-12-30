# iBotTester UI Components

This directory contains the main UI components for the iBotTester modern SaaS interface.

## Component Overview

### Sidebar.tsx

**Left navigation panel with chat history**

**Features:**

- 🤖 iBotTester logo with gradient text effect
- Navigation menu items (Dashboard, Test Flows, Run History, Settings)
- New Chat button with gradient background
- Recent chat history list with timestamps
- Dark slate gradient theme

**Props:**

```typescript
interface SidebarProps {
  onNewChat: () => void; // Handler for new chat creation
  chatHistory: ChatHistory[]; // Array of previous chats
  activeChat: string | null; // Currently selected chat ID
  onSelectChat: (id: string) => void; // Handler for chat selection
}
```

### ChatPanel.tsx

**Center panel for ChatGPT-like conversations**

**Features:**

- User and Agent message bubbles with distinct avatars
- Animated execution steps with status badges:
  - Pending (gray)
  - In Progress (blue with pulse animation)
  - Done (green)
  - Success (emerald)
  - Error (red)
- Welcome screen for new chats
- Auto-scroll to latest message
- Message input with send button
- Processing state with spinner

**Props:**

```typescript
interface ChatPanelProps {
  messages: Message[]; // Array of conversation messages
  onSendMessage: (message: string) => void; // Handler for sending messages
  isProcessing: boolean; // Loading state for message processing
}

interface Message {
  id: string;
  type: "user" | "agent";
  content: string;
  timestamp: Date;
  steps?: ExecutionStep[]; // Optional execution steps for agent messages
}

interface ExecutionStep {
  id: string;
  description: string;
  status: "pending" | "in-progress" | "done" | "success" | "error";
}
```

### LiveExecutionPanel.tsx

**Right panel for live test execution visualization**

**Features:**

- Live execution indicator with pulse animation
- Mock browser window with:
  - Browser chrome (traffic light buttons, URL bar)
  - Simulated product page content
  - Loading state during execution
- Tabbed interface:
  - **Results**: Step-by-step execution logs with checkmarks
  - **Diff**: Screenshot comparison (before/after)
  - **Video**: Video recording placeholder
  - **Logs**: Terminal-style technical logs with timestamps

**Props:**

```typescript
interface LiveExecutionPanelProps {
  isExecuting: boolean; // Whether test is currently running
  currentUrl?: string; // URL shown in browser mock
  screenshots: Screenshot[]; // Array of screenshots for diff view
  logs: string[]; // Execution log messages
}

interface Screenshot {
  id: string;
  label: string;
  url: string;
  timestamp: Date;
}
```

## Usage Example

```typescript
import Sidebar from "@/components/Sidebar";
import ChatPanel from "@/components/ChatPanel";
import LiveExecutionPanel from "@/components/LiveExecutionPanel";

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      <Sidebar
        onNewChat={handleNewChat}
        chatHistory={chatHistory}
        activeChat={activeChat}
        onSelectChat={handleSelectChat}
      />

      <ChatPanel
        messages={messages}
        onSendMessage={handleSendMessage}
        isProcessing={isProcessing}
      />

      <LiveExecutionPanel
        isExecuting={isExecuting}
        currentUrl="https://www.amazon.com"
        screenshots={screenshots}
        logs={logs}
      />
    </div>
  );
}
```

## Styling

All components use **Tailwind CSS** for styling with a consistent design system:

- **Colors:**
  - Slate (900, 800, 700) for dark backgrounds
  - Blue (600, 500) to Purple (600, 500) gradients for CTAs
  - Green for success states
  - Red for error states
- **Spacing:** Consistent use of Tailwind spacing scale
- **Borders:** Rounded corners (lg, md) for modern look
- **Shadows:** Soft shadows (sm, md, lg, xl, 2xl) for depth
- **Transitions:** Smooth hover and state transitions

## Animations

- Pulse animation for live execution indicator
- Fade-in for new messages
- Smooth tab transitions
- Loading spinners for async operations
- Status badge transitions

## Future Enhancements

- [ ] Real API integration (currently mocked)
- [ ] Persistent chat history (localStorage/database)
- [ ] Real screenshot capture and comparison
- [ ] Video recording and playback
- [ ] Multi-user support
- [ ] Search functionality in chat history
- [ ] Export test results
- [ ] Keyboard shortcuts
