import React, { useState } from 'react';
import { TestStep, TestStepGroup } from '@/types/project';

interface TestEditorViewProps {
  testSteps: TestStep[];
  onEditStep: (stepId: string) => void;
  onDeleteStep: (stepId: string) => void;
  onAddStep: (uiSection: string) => void;
  testCaseName?: string;
}

const TestEditorView: React.FC<TestEditorViewProps> = ({
  testSteps,
  onEditStep,
  onDeleteStep,
  onAddStep,
  testCaseName = 'Test Case',
}) => {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  // Group test steps by UI section
  const groupedSteps: TestStepGroup[] = testSteps.reduce((groups, step) => {
    const existingGroup = groups.find((g) => g.sectionName === step.uiSection);
    if (existingGroup) {
      existingGroup.steps.push(step);
    } else {
      groups.push({
        sectionName: step.uiSection,
        steps: [step],
      });
    }
    return groups;
  }, [] as TestStepGroup[]);

  // Sort steps by step number within each group
  groupedSteps.forEach((group) => {
    group.steps.sort((a, b) => a.stepNumber - b.stepNumber);
  });

  const handleFolderClick = (folderName: string) => {
    setSelectedFolder(folderName);
  };

  const handleBackToFolders = () => {
    setSelectedFolder(null);
  };

  // Get currently selected folder data
  const currentFolder = selectedFolder 
    ? groupedSteps.find(g => g.sectionName === selectedFolder)
    : null;

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {selectedFolder && (
            <button
              onClick={handleBackToFolders}
              className="px-4 py-2 text-sm font-bold text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100 rounded-xl transition-colors"
            >
              ← Back to Folders
            </button>
          )}
          <h3 className="text-2xl font-bold text-neutral-800">
            {selectedFolder ? selectedFolder : testCaseName}
          </h3>
        </div>
        <div className="flex items-center space-x-3">
          <button
            className="flex items-center space-x-2 px-4 py-2.5 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50 rounded-lg transition-smooth"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>Edit</span>
          </button>
          <button
            className="flex items-center space-x-2 px-4 py-2.5 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50 rounded-lg transition-smooth"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            <span>Save</span>
          </button>
          <button
            className="flex items-center space-x-2 px-4 py-2.5 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-smooth shadow-soft"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Run</span>
          </button>
          <button
            onClick={() => selectedFolder ? onAddStep(selectedFolder) : onAddStep('')}
            className="flex items-center space-x-2 px-5 py-2.5 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-smooth shadow-soft"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>Add New Step</span>
          </button>
        </div>
      </div>

      {/* Folders Grid View or Steps View */}
      {!selectedFolder ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {groupedSteps.length === 0 ? (
            <div className="col-span-full bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg border-2 border-dashed border-neutral-300 px-8 py-20 text-center">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-lg">
                  <svg className="w-12 h-12 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-xl font-bold text-neutral-700">No test steps yet</p>
                <p className="text-sm text-neutral-500">Create your first test step to get started</p>
              </div>
            </div>
          ) : (
            groupedSteps.map((group) => (
              <div
                key={group.sectionName}
                className="bg-white rounded-2xl shadow-soft border border-neutral-200 overflow-hidden hover:shadow-medium hover:border-primary-300 transition-smooth cursor-pointer"
                onClick={() => handleFolderClick(group.sectionName)}
              >
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 px-6 py-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    {/* Medium Folder Icon */}
                    <div className="w-24 h-24 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                      <span className="text-5xl drop-shadow-lg">📁</span>
                    </div>
                    {/* Folder Info */}
                    <div className="w-full">
                      <h4 className="text-xl font-black text-white mb-2 drop-shadow-md break-words">
                        {group.sectionName}
                      </h4>
                      <div className="flex flex-col items-center space-y-2">
                        <span className="px-3 py-1.5 text-xs font-bold bg-white/90 text-blue-700 rounded-xl shadow-md">
                          {group.steps.length} {group.steps.length === 1 ? 'step' : 'steps'}
                        </span>
                        <span className="px-3 py-1.5 text-xs font-bold bg-white/20 text-white rounded-xl">
                          Click to open
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Steps Grid View for Selected Folder */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {currentFolder?.steps.map((step) => (
            <div
              key={step.id}
              className="bg-white rounded-2xl shadow-xl border-2 border-neutral-200 overflow-hidden hover:shadow-2xl hover:border-blue-400 transition-all transform hover:scale-105"
            >
              {/* Card Header */}
              <div className="bg-gradient-to-r from-slate-700 to-slate-900 px-6 py-6 text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shadow-lg">
                  <span className="text-3xl">📝</span>
                </div>
                <h5 className="mt-3 text-base font-bold text-white">
                  Step {step.stepNumber}
                </h5>
              </div>

              {/* Card Content */}
              <div className="p-6 space-y-4">
                <div>
                  <h6 className="text-xs font-bold text-primary-600 uppercase tracking-wide mb-2">
                    Action
                  </h6>
                  <p className="text-sm text-neutral-700 font-medium leading-relaxed">
                    {step.action}
                  </p>
                </div>

                <div>
                  <h6 className="text-xs font-bold text-green-600 uppercase tracking-wide mb-2">
                    Expected Result
                  </h6>
                  <p className="text-sm text-neutral-700 leading-relaxed">
                    {step.expectedResult}
                  </p>
                </div>

                {step.elementLocator && (
                  <div>
                    <h6 className="text-xs font-bold text-purple-600 uppercase tracking-wide mb-2">
                      Element Locator
                    </h6>
                    <code className="block text-xs bg-neutral-800 text-green-400 px-3 py-2 rounded-xl font-mono break-all">
                      {step.elementLocator}
                    </code>
                  </div>
                )}
              </div>

              {/* Card Actions */}
              <div className="border-t-2 border-neutral-200 bg-neutral-50 px-6 py-4 flex items-center justify-center space-x-3">
                <button
                  onClick={() => onEditStep(step.id)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-smooth"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => onDeleteStep(step.id)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-smooth"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TestEditorView;
