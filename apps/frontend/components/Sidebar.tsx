import React, { useState, useEffect } from 'react';
import { Project, TabType } from '@/types/project';
import { Button, Badge, Text } from './ui';
import { chatApi } from '../services/api';

interface ChatHistory {
  id: string;
  title: string;
  timestamp: Date;
  createdAt?: string;
  _count?: {
    messages: number;
  };
}

interface SidebarProps {
  chatHistory?: ChatHistory[];
  activeChat: string | null;
  onSelectChat: (id: string) => void;
  onNewChat?: () => void;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  projects: Project[];
  selectedProject: Project;
  onProjectChange: (projectId: string) => void;
  onLogout?: () => void;
  user?: { name: string; email: string } | null;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  chatHistory: propChatHistory, 
  activeChat, 
  onSelectChat,
  onNewChat,
  activeTab,
  onTabChange,
  projects,
  selectedProject,
  onProjectChange,
  onLogout,
  user,
}) => {
  const [isProjectExpanded, setIsProjectExpanded] = useState(true);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>(propChatHistory || []);
  const [isLoadingChats, setIsLoadingChats] = useState(false);

  // Load chat history from API
  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    setIsLoadingChats(true);
    try {
      const response = await chatApi.getHistory();
      if (response.success && response.data) {
        // Map API response to component format and limit to 10 recent chats
        const chats = response.data.slice(0, 10).map((conv: any) => ({
          id: conv.id,
          title: conv.title,
          timestamp: new Date(conv.createdAt),
          createdAt: conv.createdAt,
          _count: conv._count,
        }));
        setChatHistory(chats);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    } finally {
      setIsLoadingChats(false);
    }
  };

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this conversation?')) {
      return;
    }

    try {
      const response = await chatApi.deleteChat(chatId);
      if (response.success) {
        setChatHistory(prev => prev.filter(c => c.id !== chatId));
        if (activeChat === chatId && onNewChat) {
          onNewChat();
        }
      } else {
        alert(response.error || 'Failed to delete conversation');
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      alert('Failed to delete conversation');
    }
  };

  const formatDate = (dateString: Date | string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0 || diffDays === 1) {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };
  
  const navigationTabs = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: 'chart' },
    { id: 'test-list' as TabType, label: 'Test List', icon: 'list' },
    { id: 'test-execution' as TabType, label: 'Test Execution', icon: 'play' },
    { id: 'editor' as TabType, label: 'Editor', icon: 'edit' },
    { id: 'config' as TabType, label: 'Config', icon: 'settings' },
    { id: 'live-execution' as TabType, label: 'Live Execution', icon: 'activity' },
  ];

  const renderIcon = (iconName: string) => {
    const iconProps = { className: "w-5 h-5", strokeWidth: 2, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" };
    
    switch(iconName) {
      case 'chart':
        return <svg {...iconProps}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
      case 'list':
        return <svg {...iconProps}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>;
      case 'play':
        return <svg {...iconProps}><path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
      case 'edit':
        return <svg {...iconProps}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
      case 'settings':
        return <svg {...iconProps}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
      case 'activity':
        return <svg {...iconProps}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
      default:
        return null;
    }
  };

  return (
    <div className="w-64 bg-white border-r border-neutral-200 h-screen flex flex-col shadow-soft">
      {/* Logo */}
      <div className="px-6 py-4 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">
              iBotTester
            </h1>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {/* Home Button */}
        <button
          onClick={() => onNewChat ? onNewChat() : onTabChange('home')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-smooth ${
            activeTab === 'home' && !activeChat
              ? 'bg-primary-50 text-primary-700 border border-primary-200 shadow-soft'
              : 'hover:bg-neutral-50 text-neutral-700'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <span className="font-semibold">New chat</span>
        </button>

        {/* Divider */}
        <div className="border-t border-neutral-200 my-4"></div>

        {/* Project Section */}
        <div className="space-y-2">
          <button
            onClick={() => setIsProjectExpanded(!isProjectExpanded)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-neutral-50 transition-smooth text-neutral-700"
          >
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <span className="font-semibold">Project</span>
            </div>
            <svg
              className={`w-4 h-4 transition-transform ${isProjectExpanded ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
          
          {/* Child Navigation Tabs - Collapsible */}
          {isProjectExpanded && (
            <div className="ml-2 mt-2 space-y-1 border-l-2 border-primary-200 pl-2">
              {navigationTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-smooth text-left ${
                    activeTab === tab.id
                      ? 'bg-primary-50 text-primary-700 border-l-2 border-primary-500'
                      : 'hover:bg-neutral-50 text-neutral-600'
                  }`}
                >
                  {renderIcon(tab.icon)}
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-neutral-200 my-4"></div>

        {/* Settings */}
        <button
          onClick={() => onTabChange('settings')}
          className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-smooth ${
            activeTab === 'settings'
              ? 'bg-primary-50 text-primary-700 border border-primary-200 shadow-soft'
              : 'hover:bg-neutral-50 text-neutral-700'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-sm font-medium">Settings</span>
        </button>

        {/* Recent Chats */}
        <div className="pt-4 border-t border-neutral-200 mt-4">
          <div className="flex items-center justify-between mb-3 px-2">
            <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Recent Chats
            </h3>
            <button
              onClick={loadChatHistory}
              disabled={isLoadingChats}
              className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
              title="Refresh"
            >
              <svg className={`w-3.5 h-3.5 ${isLoadingChats ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
          <div className="space-y-1">
            {isLoadingChats ? (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
              </div>
            ) : chatHistory.length === 0 ? (
              <div className="text-center py-4 px-3">
                <p className="text-xs text-neutral-400">No conversations yet</p>
              </div>
            ) : (
              chatHistory.map((chat) => (
                <div
                  key={chat.id}
                  className={`group relative w-full text-left px-3 py-2 rounded-lg transition-smooth ${
                    activeChat === chat.id
                      ? 'bg-primary-50 text-primary-700'
                      : 'hover:bg-neutral-50 text-neutral-700'
                  }`}
                >
                  <button
                    onClick={() => {
                      console.log('Chat clicked:', chat.id, chat.title);
                      onSelectChat(chat.id);
                    }}
                    className="w-full text-left"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{chat.title}</div>
                        <div className="text-xs text-neutral-500 flex items-center gap-1.5 mt-0.5">
                          <span suppressHydrationWarning>{formatDate(chat.timestamp)}</span>
                          {chat._count && (
                            <>
                              <span>•</span>
                              <span>{chat._count.messages} msg</span>
                            </>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDeleteChat(chat.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-opacity flex-shrink-0"
                        title="Delete"
                      >
                        <svg className="w-3.5 h-3.5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </button>
                </div>
              ))
            )
          }
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-neutral-200">
        <div className="text-xs text-neutral-500 text-center">
          v0.1.0 • AI-Powered Testing
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
