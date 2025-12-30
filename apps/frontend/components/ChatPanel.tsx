import React, { useState, useRef, useEffect } from 'react';

export interface Message {
  id: string;
  type: 'user' | 'agent';
  content: string;
  timestamp: Date;
  steps?: ExecutionStep[];
  isStreaming?: boolean;
  status?: 'completed' | 'wip' | 'pending';
  hasExecution?: boolean;
  executionId?: string;
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
  onViewExecution?: (executionId: string) => void;
  chatHistoryName?: string;
}

// Typing indicator component
const TypingIndicator: React.FC = () => {
  return (
    <div className="flex space-x-4 animate-fadeIn">
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-md">
        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
        </svg>
      </div>
      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-2">
          <span className="font-medium text-gray-900 text-sm">AI Assistant</span>
          <span className="text-xs text-gray-500">thinking...</span>
        </div>
        <div className="inline-flex items-center space-x-1 px-4 py-3 bg-gray-50 rounded-2xl border border-gray-200">
          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
};

const ChatPanel: React.FC<ChatPanelProps> = ({ messages, onSendMessage, isProcessing, onViewExecution, chatHistoryName }) => {
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
      'in-progress': 'bg-blue-50 text-blue-700 border border-blue-300 animate-pulse',
      done: 'bg-green-50 text-green-700 border border-green-300',
      success: 'bg-emerald-50 text-emerald-700 border border-emerald-300',
      error: 'bg-red-50 text-red-700 border border-red-300',
    };

    const icons = {
      pending: '⏳',
      'in-progress': '🔄',
      done: '✓',
      success: '✓',
      error: '✗',
    };

    return (
      <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${badges[status]}`}>
        <span>{icons[status]}</span>
        <span>{status === 'in-progress' ? 'Running' : status.charAt(0).toUpperCase() + status.slice(1)}</span>
      </span>
    );
  };

  const getMessageStatusBadge = (status: 'completed' | 'wip' | 'pending') => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-300">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Completed
          </span>
        );
      case 'wip':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-300">
            <svg className="w-3 h-3 mr-1 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            WIP
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600 border border-gray-300">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            Pending
          </span>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white h-screen">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-3.5">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <h2 className="text-base font-semibold text-gray-800">{chatHistoryName || 'Chat'}</h2>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-5 max-w-2xl px-6">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Hi, I&apos;m your AI Assistant
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  I can help you create and run functional tests. Describe what you want to test, and I&apos;ll guide you through the process.
                </p>
              </div>
              <div className="space-y-3">
                <div className="bg-white rounded-xl p-4 border border-gray-200 text-left hover:border-purple-400 transition-colors cursor-pointer shadow-sm">
                  <div className="flex items-start space-x-3">
                    <span className="text-purple-500 mt-0.5">✨</span>
                    <div>
                      <p className="text-sm text-gray-700 font-medium mb-1">Example Test</p>
                      <p className="text-xs text-gray-500">
                        &quot;Create a test to verify login functionality with valid credentials on example.com&quot;
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200 text-left hover:border-purple-400 transition-colors cursor-pointer shadow-sm">
                  <div className="flex items-start space-x-3">
                    <span className="text-blue-500 mt-0.5">🛒</span>
                    <div>
                      <p className="text-sm text-gray-700 font-medium mb-1">E-commerce Test</p>
                      <p className="text-xs text-gray-500">
                        &quot;Test adding Nike shoes to cart and checkout process on amazon.com&quot;
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="flex space-x-3 animate-fadeIn">
              {/* Avatar */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center shadow-md ${
                message.type === 'user'
                  ? 'bg-gray-100 border border-gray-300'
                  : 'bg-gradient-to-br from-purple-500 to-blue-600'
              }`}>
                {message.type === 'user' ? (
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                  </svg>
                )}
              </div>

              {/* Message Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-medium text-gray-900 text-sm">
                    {message.type === 'user' ? 'You' : 'AI Assistant'}
                  </span>
                  <span className="text-xs text-gray-500" suppressHydrationWarning>
                    {new Date(message.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {/* Status Badge for agent messages */}
                  {message.type === 'agent' && message.status && (
                    <span className="ml-auto">{getMessageStatusBadge(message.status)}</span>
                  )}
                </div>
                
                <div className={`rounded-2xl px-4 py-3 ${
                  message.type === 'user'
                    ? 'bg-gray-50 border border-gray-200'
                    : 'bg-white border border-gray-200 shadow-sm'
                }`}>
                  <div className={`text-sm leading-relaxed ${
                    message.type === 'user' ? 'text-gray-700' : 'text-gray-800'
                  }`}>
                    {message.isStreaming ? (
                      <div className="flex items-center space-x-2">
                        <span className="whitespace-pre-wrap">{message.content}</span>
                        <span className="inline-block w-1.5 h-4 bg-purple-500 animate-pulse"></span>
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    )}
                  </div>
                  
                  {/* Execution Steps */}
                  {message.steps && message.steps.length > 0 && (
                    <div className="mt-4 space-y-2.5">
                      <div className="flex items-center space-x-2">
                        <div className="h-px flex-1 bg-gray-300"></div>
                        <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                          Execution Steps
                        </span>
                        <div className="h-px flex-1 bg-gray-300"></div>
                      </div>
                      
                      {message.steps.map((step, index) => (
                        <div
                          key={step.id}
                          className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-200 hover:border-purple-400 transition-colors"
                        >
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-white border border-gray-300 text-gray-600 flex items-center justify-center text-xs font-medium">
                              {index + 1}
                            </span>
                            <span className="text-xs text-gray-700 truncate">{step.description}</span>
                          </div>
                          {getStatusBadge(step.status)}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action Buttons for agent messages */}
                  {message.type === 'agent' && (message.hasExecution || message.status) && (
                    <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {message.hasExecution && message.executionId && onViewExecution && (
                          <button
                            onClick={() => onViewExecution(message.executionId!)}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md transition-colors"
                          >
                            <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            View Execution
                          </button>
                        )}
                        <button
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-50 border border-gray-300 hover:border-gray-400 rounded-md transition-colors"
                          onClick={() => {
                            // Copy to input for reply
                            const inputElement = document.querySelector('textarea');
                            if (inputElement) {
                              inputElement.focus();
                            }
                          }}
                        >
                          <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                          </svg>
                          Reply
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        
        {/* Typing Indicator (WIP) */}
        {isProcessing && <TypingIndicator />}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-gray-50 border-t border-gray-200 px-4 py-3">
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Ask a question or describe your test..."
            disabled={isProcessing}
            rows={1}
            className="w-full px-4 py-3 pr-12 bg-white text-gray-900 placeholder-gray-500 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-none transition-all"
            style={{ minHeight: '44px', maxHeight: '200px' }}
          />
          <button
            type="submit"
            disabled={!input.trim() || isProcessing}
            className="absolute right-2 bottom-2 p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors shadow-md disabled:shadow-none"
            title="Send message"
          >
            {isProcessing ? (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </form>
        <div className="flex items-center justify-between mt-2 px-1">
          <p className="text-[10px] text-gray-500">
            Press <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-gray-600">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-gray-600">Shift+Enter</kbd> for new line
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
