import React from 'react';
import { TabType } from '@/types/project';

interface ProjectTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const ProjectTabs: React.FC<ProjectTabsProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'test-execution' as TabType, label: 'Test Execution', icon: '▶️' },
    { id: 'test-list' as TabType, label: 'Test List', icon: '📋' },
    { id: 'test-editor' as TabType, label: 'Test Editor', icon: '✏️' },
    { id: 'configuration' as TabType, label: 'Configuration', icon: '⚙️' },
  ];

  return (
    <div className="bg-white border-b border-slate-200 shadow-sm">
      <div className="flex px-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-6 py-4 text-sm font-semibold transition-colors border-b-2 ${
              activeTab === tab.id
                ? 'text-blue-600 border-blue-600'
                : 'text-slate-600 border-transparent hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <span className="flex items-center space-x-2">
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProjectTabs;
