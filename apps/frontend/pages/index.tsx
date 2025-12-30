import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import ChatPanel, { Message, ExecutionStep } from '@/components/ChatPanel';
import LiveExecutionPanel from '@/components/LiveExecutionPanel';

interface ChatHistory {
  id: string;
  title: string;
  timestamp: Date;
}

interface Screenshot {
  id: string;
  label: string;
  url: string;
  timestamp: Date;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);

  // Mock chat history
  const [chatHistory] = useState<ChatHistory[]>([
    { id: '1', title: 'Nike Checkout Flow', timestamp: new Date(Date.now() - 86400000) },
    { id: '2', title: 'Login Flow', timestamp: new Date(Date.now() - 172800000) },
    { id: '3', title: 'Real Estate Flow', timestamp: new Date(Date.now() - 259200000) },
  ]);

  const simulateExecution = async (steps: ExecutionStep[]) => {
    setIsExecuting(true);
    setLogs([]);
    
    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update step status
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage.steps) {
          lastMessage.steps[i].status = 'in-progress';
        }
        return newMessages;
      });

      // Add log
      setLogs(prev => [...prev, `Step ${i + 1}: ${steps[i].description}`]);

      await new Promise(resolve => setTimeout(resolve, 1500));

      // Complete step
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage.steps) {
          lastMessage.steps[i].status = i === steps.length - 1 ? 'success' : 'done';
        }
        return newMessages;
      });
    }

    // Add screenshots after execution
    setScreenshots([
      { id: '1', label: 'Previous Run', url: '', timestamp: new Date() },
      { id: '2', label: 'Current Run', url: '', timestamp: new Date() },
    ]);

    setIsExecuting(false);
  };

  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      type: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create agent response with execution steps
    const executionSteps: ExecutionStep[] = [
      { id: 'step-1', description: 'Navigating to amazon.com', status: 'pending' },
      { id: 'step-2', description: 'Searching for Nike shoes size 9 under $150', status: 'pending' },
      { id: 'step-3', description: 'Filtering and selecting product', status: 'pending' },
      { id: 'step-4', description: 'Adding to cart', status: 'pending' },
      { id: 'step-5', description: 'Proceeding to checkout', status: 'pending' },
    ];

    const agentMessage: Message = {
      id: `msg-${Date.now() + 1}`,
      type: 'agent',
      content: `Perfect! I'll help you create a functional test to purchase Nike shoes size 9 under $150 on Amazon.

Here's my plan:
1. Navigate to amazon.com
2. Search for Nike shoes with the specified criteria
3. Filter results and select a suitable product
4. Add the product to cart
5. Proceed through checkout flow

Starting execution now...`,
      timestamp: new Date(),
      steps: executionSteps,
    };

    setMessages(prev => [...prev, agentMessage]);
    setIsProcessing(false);

    // Start simulated execution
    await simulateExecution(executionSteps);
  };

  const handleNewChat = () => {
    setMessages([]);
    setLogs([]);
    setScreenshots([]);
    setActiveChat(null);
  };

  const handleSelectChat = (id: string) => {
    setActiveChat(id);
    // In a real app, this would load the chat history
    // For now, we'll just clear and show a sample message
    const sampleMessage: Message = {
      id: `msg-sample-${id}`,
      type: 'agent',
      content: `Loading chat history for ${chatHistory.find(c => c.id === id)?.title}...`,
      timestamp: new Date(),
    };
    setMessages([sampleMessage]);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      {/* Left Sidebar */}
      <Sidebar
        onNewChat={handleNewChat}
        chatHistory={chatHistory}
        activeChat={activeChat}
        onSelectChat={handleSelectChat}
      />

      {/* Center Chat Panel */}
      <ChatPanel
        messages={messages}
        onSendMessage={handleSendMessage}
        isProcessing={isProcessing}
      />

      {/* Right Execution Panel */}
      <LiveExecutionPanel
        isExecuting={isExecuting}
        currentUrl="https://www.amazon.com"
        screenshots={screenshots}
        logs={logs}
      />
    </div>
  );
}
