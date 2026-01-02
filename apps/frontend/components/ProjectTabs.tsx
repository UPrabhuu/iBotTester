import React from 'react';
import { TabType } from '@/types/project';
import { Button, Badge, Text } from './ui';

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
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex px-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-6 py-4 text-sm font-semibold transition-colors border-b-2 ${
              activeTab === tab.id
                ? 'text-primary-600 border-blue-600'
                : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-neutral-800 hover:border-gray-300 dark:border-gray-600'
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
