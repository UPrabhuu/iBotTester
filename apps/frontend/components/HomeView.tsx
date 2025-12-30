import React, { useState } from 'react';

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

  // Update branch when project changes
  React.useEffect(() => {
    if (selectedProject) {
      setSelectedBranchId(selectedProject.currentBranch);
    }
  }, [selectedProject]);

  const handleBranchChange = (branchId: string) => {
    setSelectedBranchId(branchId);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && onSendMessage) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const examplePrompt = `I want to create a functional test to purchase Nike shoes size 9 under $150 on amazon.com...`;

  const quickActions = [
    'Create new test from conversation',
    'Browse existing test projects',
    'View recent test executions',
  ];

  return (
    <div className="flex items-center justify-center min-h-full bg-white">
      <div className="max-w-3xl w-full px-8 py-12">
        {/* Bot Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl flex items-center justify-center shadow-medium">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-neutral-900 mb-4 tracking-tight">
            Welcome to iBotTester
          </h1>
          <p className="text-xl text-neutral-600">
            Create and run functional tests with AI
          </p>
        </div>

        {/* Example Prompt Card */}
        <div className="mb-8">
          <div className="bg-neutral-50 rounded-2xl border border-neutral-200 p-6 hover:bg-neutral-100 transition-smooth card-hover">
            <div className="flex items-start space-x-3">
              <svg className="w-6 h-6 text-primary-500 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-semibold text-neutral-700 mb-2">Try:</p>
                <p className="text-neutral-600 leading-relaxed">
                  {examplePrompt}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Input with Context Selectors */}
        <div className="mb-10">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border-2 border-neutral-200 overflow-hidden focus-within:border-primary-400 transition-smooth shadow-soft hover:shadow-medium">
            {/* Context Selection */}
            {projects.length > 0 && selectedProject && (
              <div className="px-5 pt-4 pb-3 border-b border-neutral-200 bg-neutral-50/50">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">Context:</span>
                  
                  {/* Project Selector - Button Style */}
                  <div className="relative">
                    <button
                      type="button"
                      className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 hover:border-primary-400 transition-smooth"
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
                    >
                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Branch Selector - Button Style */}
                  <div className="relative">
                    <button
                      type="button"
                      className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 hover:border-primary-400 transition-smooth"
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
            <div className="relative">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask anything about your test..."
                className="w-full px-6 py-5 pr-28 focus:outline-none text-neutral-800 placeholder-neutral-400 border-none text-base"
              />
              <button
                type="submit"
                disabled={!message.trim()}
                className="absolute right-4 top-1/2 -translate-y-1/2 px-5 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-smooth font-medium text-sm"
              >
                Send
              </button>
            </div>
          </form>
        </div>

        {/* Quick Actions */}
        <div className="text-center">
          <p className="text-sm font-semibold text-neutral-700 mb-4">Quick Actions:</p>
          <div className="space-y-2">
            {quickActions.map((action, index) => (
              <div key={index} className="flex items-center justify-center space-x-2">
                <svg className="w-4 h-4 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                  <circle cx="10" cy="10" r="3" />
                </svg>
                <span className="text-sm text-neutral-600">{action}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeView;
