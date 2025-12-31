import React, { useState } from 'react';
import { Project, TabType } from '@/types/project';
import { Button, Badge, Text } from './ui';

interface ChatHistory {
  id: string;
  title: string;
  timestamp: Date;
}

interface SidebarProps {
  chatHistory: ChatHistory[];
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
  chatHistory, 
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
          <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3 px-2">
            Recent Chats
          </h3>
          <div className="space-y-1">
            {chatHistory.map((chat) => (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-smooth ${
                  activeChat === chat.id
                    ? 'bg-primary-50 text-primary-700'
                    : 'hover:bg-neutral-50 text-neutral-700'
                }`}
              >
                <div className="text-sm font-medium truncate">{chat.title}</div>
                <div className="text-xs text-neutral-500" suppressHydrationWarning>
                  {new Date(chat.timestamp).toLocaleDateString('en-US')}
                </div>
              </button>
            ))}
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
