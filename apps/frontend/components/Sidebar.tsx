import React from 'react';
import { Project, TabType } from '@/types/project';

interface ChatHistory {
  id: string;
  title: string;
  timestamp: Date;
}

interface SidebarProps {
  chatHistory: ChatHistory[];
  activeChat: string | null;
  onSelectChat: (id: string) => void;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  projects: Project[];
  selectedProject: Project;
  onProjectChange: (projectId: string) => void;
  onBranchChange: (branchId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  chatHistory, 
  activeChat, 
  onSelectChat,
  activeTab,
  onTabChange,
  projects,
  selectedProject,
  onProjectChange,
  onBranchChange,
}) => {
  const navigationTabs = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: '📊' },
    { id: 'test-list' as TabType, label: 'Test List', icon: '📋' },
    { id: 'test-execution' as TabType, label: 'Test Execution', icon: '▶️' },
    { id: 'editor' as TabType, label: 'Editor', icon: '✏️' },
    { id: 'config' as TabType, label: 'Config', icon: '⚙️' },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white h-screen flex flex-col shadow-2xl">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">🤖</span>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              iBotTester
            </h1>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {/* Home Button */}
        <button
          onClick={() => onTabChange('home')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
            activeTab === 'home'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'hover:bg-slate-800 text-slate-300'
          }`}
        >
          <span className="text-lg">🏠</span>
          <span className="font-semibold">Home</span>
        </button>

        {/* Divider */}
        <div className="border-t border-slate-700 my-4"></div>

        {/* Project Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2">
            Project
          </label>
          <select
            value={selectedProject.id}
            onChange={(e) => onProjectChange(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-slate-750 transition-colors"
          >
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        {/* Branch Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2">
            Branch
          </label>
          <select
            value={selectedProject.currentBranch}
            onChange={(e) => onBranchChange(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-slate-750 transition-colors"
          >
            {selectedProject.branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
                {branch.isDefault ? ' (default)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-700 my-4"></div>

        {/* Navigation Tabs */}
        {navigationTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-slate-700 text-white'
                : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span className="text-sm font-medium">{tab.label}</span>
          </button>
        ))}

        {/* Divider */}
        <div className="border-t border-slate-700 my-4"></div>

        {/* Settings */}
        <button
          className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg hover:bg-slate-800 transition-colors text-slate-300"
        >
          <span className="text-lg">⚙️</span>
          <span className="text-sm font-medium">Settings</span>
        </button>

        {/* Recent Chats */}
        <div className="pt-4 border-t border-slate-700 mt-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-2">
            Recent Chats
          </h3>
          <div className="space-y-1">
            {chatHistory.map((chat) => (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  activeChat === chat.id
                    ? 'bg-slate-700 text-white'
                    : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                <div className="text-sm font-medium truncate">{chat.title}</div>
                <div className="text-xs text-slate-500">
                  {new Date(chat.timestamp).toLocaleDateString()}
                </div>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700">
        <div className="text-xs text-slate-400 text-center">
          v0.1.0 • AI-Powered Testing
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
