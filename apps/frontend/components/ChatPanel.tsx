import React, { useState, useRef, useEffect } from 'react';

export interface Message {
  id: string;
  type: 'user' | 'agent';
  content: string;
  timestamp: Date;
  steps?: ExecutionStep[];
}

export interface ExecutionStep {
  id: string;
  description: string;
  status: 'pending' | 'in-progress' | 'done' | 'success' | 'error';
}

interface ChatPanelProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isProcessing: boolean;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ messages, onSendMessage, isProcessing }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isProcessing) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const getStatusBadge = (status: ExecutionStep['status']) => {
    const badges = {
      pending: 'bg-gray-100 text-gray-600 border border-gray-300',
      'in-progress': 'bg-blue-100 text-blue-700 border border-blue-300 animate-pulse',
      done: 'bg-green-100 text-green-700 border border-green-300',
      success: 'bg-emerald-100 text-emerald-700 border border-emerald-300',
      error: 'bg-red-100 text-red-700 border border-red-300',
    };

    const labels = {
      pending: 'Pending',
      'in-progress': 'In Progress',
      done: 'Done',
      success: 'Success',
      error: 'Error',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badges[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 h-screen">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800">Test Conversation</h2>
        <p className="text-sm text-slate-600">Create and run functional tests with AI</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <div className="text-6xl">🤖</div>
              <h3 className="text-2xl font-semibold text-slate-700">
                Welcome to iBotTester
              </h3>
              <p className="text-slate-600 max-w-md">
                Describe your test scenario in natural language, and I&apos;ll help you create and run it.
              </p>
              <div className="bg-white rounded-lg p-4 max-w-md shadow-sm border border-slate-200">
                <p className="text-sm text-slate-600 italic">
                  Try: &quot;I want to create a functional test to purchase Nike shoes size 9 under $150 on amazon.com...&quot;
                </p>
              </div>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="flex space-x-4">
              {/* Avatar */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                message.type === 'user'
                  ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white'
                  : 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white'
              }`}>
                {message.type === 'user' ? '👤' : '🤖'}
              </div>

              {/* Message Content */}
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-semibold text-slate-800">
                    {message.type === 'user' ? 'You' : 'iBotTester Agent'}
                  </span>
                  <span className="text-xs text-slate-500">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                
                <div className={`rounded-lg p-4 shadow-sm ${
                  message.type === 'user'
                    ? 'bg-white border border-slate-200'
                    : 'bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100'
                }`}>
                  <p className="text-slate-800 whitespace-pre-wrap">{message.content}</p>
                  
                  {/* Execution Steps */}
                  {message.steps && message.steps.length > 0 && (
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className="h-px flex-1 bg-slate-300"></div>
                        <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                          Execution Steps
                        </span>
                        <div className="h-px flex-1 bg-slate-300"></div>
                      </div>
                      
                      {message.steps.map((step, index) => (
                        <div
                          key={step.id}
                          className="flex items-center justify-between bg-white rounded-lg p-3 border border-slate-200 shadow-sm"
                        >
                          <div className="flex items-center space-x-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </span>
                            <span className="text-sm text-slate-700">{step.description}</span>
                          </div>
                          {getStatusBadge(step.status)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-slate-200 px-6 py-4 shadow-lg">
        <form onSubmit={handleSubmit} className="flex space-x-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about your test..."
            disabled={isProcessing}
            className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!input.trim() || isProcessing}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-500 hover:to-purple-500 disabled:from-slate-400 disabled:to-slate-400 disabled:cursor-not-allowed transition-all shadow-md font-semibold"
          >
            {isProcessing ? (
              <span className="flex items-center space-x-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Processing...</span>
              </span>
            ) : (
              <span className="flex items-center space-x-2">
                <span>Send</span>
                <span>→</span>
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPanel;
