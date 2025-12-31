import React, { useState, useEffect, useRef, useCallback } from 'react';
import { chatApi } from '../services/api';

interface Branch {
  id: string;
  name: string;
  isDefault: boolean;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  branches: Branch[];
  currentBranch: string;
}

interface MessageMetadata {
  intent?: {
    action: string;
    target: string;
    url?: string;
  };
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: MessageMetadata;
}

interface HomeViewProps {
  onSendMessage?: (message: string) => void;
  projects?: Project[];
  selectedProject?: Project;
  onProjectChange?: (projectId: string) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ 
  onSendMessage,
  projects = [],
  selectedProject,
  onProjectChange,
}) => {
  const [message, setMessage] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState<string>(selectedProject?.currentBranch || '');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Update branch when project changes
  useEffect(() => {
    if (selectedProject) {
      setSelectedBranchId(selectedProject.currentBranch);
    }
  }, [selectedProject]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleBranchChange = useCallback((branchId: string) => {
    setSelectedBranchId(branchId);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      const userMessage = message.trim();
      setMessage('');
      setShowChat(true);
      setIsLoading(true);

      // Add user message to UI immediately
      const tempUserMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        role: 'user',
        content: userMessage,
        timestamp: new Date().toISOString(),
      };
      setChatMessages(prev => [...prev, tempUserMessage]);

      try {
        // Send to backend
        const response = await chatApi.sendMessage(
          userMessage,
          conversationId || undefined,
          selectedProject?.id,
          selectedBranchId
        );

        if (response.success && response.data) {
          const { conversation, userMessage: actualUserMsg, assistantMessage } = response.data;
          
          // Update conversation ID if new
          if (conversation && !conversationId) {
            setConversationId(conversation.id);
          }

          // Replace temp message with actual messages from server
          const newMessages = conversation?.messages || [];
          setChatMessages(newMessages);
        } else {
          // Show error message
          setChatMessages(prev => [...prev, {
            id: `error-${Date.now()}`,
            role: 'assistant',
            content: `Error: ${response.error || 'Failed to send message'}`,
            timestamp: new Date().toISOString(),
          }]);
        }
      } catch (error) {
        console.error('Chat error:', error);
        setChatMessages(prev => [...prev, {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date().toISOString(),
        }]);
      } finally {
        setIsLoading(false);
      }

      // Call the optional callback
      if (onSendMessage) {
        onSendMessage(userMessage);
      }
    }
  };

  const handleNewChat = useCallback(() => {
    setChatMessages([]);
    setConversationId(null);
    setShowChat(false);
  }, []);

  const examplePrompt = `I want to create a functional test to purchase Nike shoes size 9 under $150 on amazon.com...`;

  const quickActions = [
    'Create new test from conversation',
    'Browse existing test projects',
    'View recent test executions',
  ];

  return (
    <div className="flex-1 flex flex-col bg-white h-full relative overflow-hidden">
      {!showChat ? (
        /* Initial view with content positioned higher */
        <div className="flex-1 flex flex-col pt-24">
          <div className="text-center space-y-4 max-w-2xl mx-auto px-6">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                Welcome to iBotTester ✨
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Your AI-powered testing companion. I can help you create, run, and analyze functional tests with ease. Just describe what you want to test!
              </p>
            </div>
            <div className="grid gap-3 mt-4">
              <div 
                className="group bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-5 border border-purple-200/50 text-left hover:border-purple-400 hover:shadow-lg transition-all cursor-pointer focus-within:ring-2 focus-within:ring-purple-400 focus-within:ring-offset-2"
                role="button"
                tabIndex={0}
                onClick={() => setMessage(examplePrompt)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setMessage(examplePrompt);
                  }
                }}
              >
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">✨</span>
                  <div className="flex-1">
                    <p className="text-sm text-gray-800 font-semibold mb-1.5">Test Creation</p>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {examplePrompt}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Input Area - Positioned in flow for initial view */}
            <div className="mt-8 max-w-3xl mx-auto w-full">
              <form onSubmit={handleSubmit} className="relative">
                {/* Context Selection */}
                {projects.length > 0 && selectedProject && (
                  <div className="mb-3 flex items-center space-x-2 px-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-medium text-gray-500">CONTEXT:</span>
                      
                      {/* Project Selector */}
                      <div className="relative">
                        <button
                          type="button"
                          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 hover:border-purple-400 transition-all"
                          onClick={(e) => {
                            const select = e.currentTarget.nextElementSibling as HTMLSelectElement;
                            select?.focus();
                            select?.click();
                          }}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                          </svg>
                          <span>{selectedProject.name}</span>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        <select
                          value={selectedProject.id}
                          onChange={(e) => onProjectChange?.(e.target.value)}
                          className="absolute opacity-0 pointer-events-auto inset-0 w-full h-full cursor-pointer"
                          aria-label="Select project"
                        >
                          {projects.map((project) => (
                            <option key={project.id} value={project.id}>
                              {project.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Branch Selector */}
                      <div className="relative">
                        <button
                          type="button"
                          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 hover:border-purple-400 transition-all"
                          onClick={(e) => {
                            const select = e.currentTarget.nextElementSibling as HTMLSelectElement;
                            select?.focus();
                            select?.click();
                          }}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                          </svg>
                          <span>{selectedProject.branches.find(b => b.id === selectedBranchId)?.name || 'Select branch'}</span>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        <select
                          value={selectedBranchId}
                          onChange={(e) => handleBranchChange(e.target.value)}
                          className="absolute opacity-0 pointer-events-auto inset-0 w-full h-full cursor-pointer"
                          aria-label="Select branch"
                        >
                          {selectedProject.branches.map((branch) => (
                            <option key={branch.id} value={branch.id}>
                              {branch.name} {branch.isDefault ? '(default)' : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Chat Input */}
                <div className="relative flex items-end bg-white rounded-3xl shadow-xl border border-gray-200 focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-100 transition-all">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                    placeholder="Message iBotTester..."
                    disabled={isLoading}
                    className="flex-1 px-5 py-4 bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ minHeight: '56px' }}
                    aria-label="Chat message input"
                    aria-describedby="chat-help-text"
                    autoComplete="off"
                  />
                  <button
                    type="submit"
                    disabled={!message.trim() || isLoading}
                    className="mb-2 mr-2 p-2.5 bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all shadow-lg disabled:shadow-none focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
                    title="Send message"
                    aria-label={isLoading ? 'Sending message...' : 'Send message'}
                  >
                    {isLoading ? (
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    )}
                  </button>
                </div>
              </form>
              <div className="flex items-center justify-center mt-3">
                <p id="chat-help-text" className="text-xs text-gray-400">
                  iBotTester can make mistakes. Consider verifying important information.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Chat view with messages scrollable and input at bottom */
        <>
          {/* Messages - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto px-6 py-6 space-y-6">
              {chatMessages.map((msg) => (
                <div key={msg.id} className={`flex animate-fadeIn mb-6 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'} space-x-3 max-w-[85%]`}>
                    {/* Avatar */}
                    <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center shadow-lg ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-gray-600 to-gray-700'
                        : 'bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600'
                    }`}>
                      {msg.role === 'user' ? (
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      )}
                    </div>

                    {/* Message Content */}
                    <div className="flex-1 min-w-0">
                      <div className={`flex items-center space-x-2 mb-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <span className="font-semibold text-gray-900 text-sm">
                          {msg.role === 'user' ? 'You' : 'iBotTester'}
                        </span>
                        <span className="text-xs text-gray-400" suppressHydrationWarning>
                          {new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      
                      <div className={`rounded-2xl px-5 py-3.5 ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-md'
                          : 'bg-gray-100 border border-gray-200'
                      }`}>
                        <div className={`text-sm leading-relaxed ${
                          msg.role === 'user' ? 'text-white' : 'text-gray-800'
                        }`}>
                          <div className="whitespace-pre-wrap">{msg.content}</div>
                        </div>
                        {msg.metadata?.intent && (
                          <div className="mt-3 pt-3 border-t border-gray-300 text-xs">
                            <p className="font-semibold mb-1">Detected Intent:</p>
                            <p>Action: {msg.metadata.intent.action}</p>
                            <p>Target: {msg.metadata.intent.target}</p>
                            {msg.metadata.intent.url && <p>URL: {msg.metadata.intent.url}</p>}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
        
              {/* Typing Indicator */}
              {isLoading && (
                <div className="flex space-x-4 animate-fadeIn">
                  <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-semibold text-gray-900 text-sm">iBotTester</span>
                      <span className="text-xs text-gray-400">thinking...</span>
                    </div>
                    <div className="inline-flex items-center space-x-1 px-4 py-3 bg-gray-50 rounded-2xl border border-gray-200">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>
        </>
      )}

      {/* Input Area - For chat view only */}
      {showChat && (
        <div className="border-t border-gray-200 bg-white pt-4 pb-6">
          <div className="max-w-3xl mx-auto px-6">
          <form onSubmit={handleSubmit} className="relative">
            {/* Context Selection */}
            {projects.length > 0 && selectedProject && (
              <div className="mb-3 flex items-center space-x-2 px-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-medium text-gray-500">CONTEXT:</span>
                  
                  {/* Project Selector */}
                  <div className="relative">
                    <button
                      type="button"
                      className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 hover:border-purple-400 transition-all"
                      onClick={(e) => {
                        const select = e.currentTarget.nextElementSibling as HTMLSelectElement;
                        select?.focus();
                        select?.click();
                      }}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                      <span>{selectedProject.name}</span>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <select
                      value={selectedProject.id}
                      onChange={(e) => onProjectChange?.(e.target.value)}
                      className="absolute opacity-0 pointer-events-auto inset-0 w-full h-full cursor-pointer"
                      aria-label="Select project"
                    >
                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Branch Selector */}
                  <div className="relative">
                    <button
                      type="button"
                      className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 hover:border-purple-400 transition-all"
                      onClick={(e) => {
                        const select = e.currentTarget.nextElementSibling as HTMLSelectElement;
                        select?.focus();
                        select?.click();
                      }}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                      <span>{selectedProject.branches.find(b => b.id === selectedBranchId)?.name || 'Select branch'}</span>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <select
                      value={selectedBranchId}
                      onChange={(e) => handleBranchChange(e.target.value)}
                      className="absolute opacity-0 pointer-events-auto inset-0 w-full h-full cursor-pointer"
                      aria-label="Select branch"
                    >
                      {selectedProject.branches.map((branch) => (
                        <option key={branch.id} value={branch.id}>
                          {branch.name} {branch.isDefault ? '(default)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Chat Input */}
            <div className="relative flex items-end bg-white rounded-3xl shadow-xl border border-gray-200 focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-100 transition-all">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="Message iBotTester..."
                disabled={isLoading}
                className="flex-1 px-5 py-4 bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ minHeight: '56px' }}
                aria-label="Chat message input"
                aria-describedby="chat-help-text"
                autoComplete="off"
              />
              <button
                type="submit"
                disabled={!message.trim() || isLoading}
                className="mb-2 mr-2 p-2.5 bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all shadow-lg disabled:shadow-none focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
                title="Send message"
                aria-label={isLoading ? 'Sending message...' : 'Send message'}
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
          </form>
          <div className="flex items-center justify-center mt-3">
            <p id="chat-help-text" className="text-xs text-gray-400">
              iBotTester can make mistakes. Consider verifying important information.
            </p>
          </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeView;
