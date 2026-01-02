import React, { useState } from 'react';
import { TestStep, TestStepGroup } from '@/types/project';
import { useAlert } from '../contexts/AlertContext';
import { Button, Input, Textarea, Heading, Text, Card, CardHeader, CardTitle, CardContent, Badge, FileUpload } from './ui';

interface TestEditorViewProps {
  testSteps: TestStep[];
  onEditStep: (stepId: string) => void;
  onDeleteStep: (stepId: string) => void;
  onAddStep: (uiSection: string) => void;
  testCaseName?: string;
  testCaseData?: Record<string, string>;
  onTestDataChange?: (data: Record<string, string>) => void;
}

const TestEditorView: React.FC<TestEditorViewProps> = ({
  testSteps,
  onEditStep,
  onDeleteStep,
  onAddStep,
  testCaseName = 'Test Case',
  testCaseData,
  onTestDataChange,
}) => {
  const { showError } = useAlert();
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [showTestData, setShowTestData] = useState(false);
  const [isEditingTestData, setIsEditingTestData] = useState(false);
  
  // Initialize test data from props or use defaults
  const [testData, setTestData] = useState<Record<string, string>>(testCaseData || {
    username: 'testuser@example.com',
    password: 'Test@123',
    firstName: 'John',
    lastName: 'Doe',
    phoneNumber: '+1234567890',
    address: '123 Test Street',
    city: 'Test City',
    zipCode: '12345'
  });

  const handleImportTestData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);
          setTestData(json);
        } catch (error) {
          showError('Invalid JSON file');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleTestDataChange = (key: string, value: string) => {
    setTestData(prev => ({ ...prev, [key]: value }));
  };

  // Extract auto-mapped test data from steps
  const autoMappedData = React.useMemo(() => {
    const mapped: Record<string, string> = {};
    testSteps.forEach(step => {
      if (step.dataMapping && typeof step.dataMapping === 'object') {
        Object.entries(step.dataMapping).forEach(([key, value]) => {
          if (testData[value as string]) {
            mapped[key] = testData[value as string];
          }
        });
      }
    });
    return mapped;
  }, [testSteps, testData]);

  const handleSaveTestData = () => {
    setIsEditingTestData(false);
    if (onTestDataChange) {
      onTestDataChange(testData);
    }
  };

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
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header - Google Material Design Style */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {selectedFolder && (
              <button
                onClick={handleBackToFolders}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
            )}
            <div>
              <h1 className="text-xl font-normal text-gray-900">
                {selectedFolder || testCaseName}
              </h1>
              {!selectedFolder && (
                <p className="text-sm text-gray-500 mt-0.5">
                  {groupedSteps.length} section{groupedSteps.length !== 1 ? 's' : ''}, {testSteps.length} step{testSteps.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowTestData(!showTestData)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
              Test Data
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Save
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Run Test
            </button>
            <button
              onClick={() => selectedFolder ? onAddStep(selectedFolder) : onAddStep('')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Step
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto px-6 py-6">
        {!selectedFolder ? (
          /* Sections Grid */
          <div className="max-w-7xl mx-auto">
            {groupedSteps.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-base font-medium text-gray-900 mb-1">No test steps yet</h3>
                <p className="text-sm text-gray-500 mb-6">Get started by adding your first test step</p>
                <button
                  onClick={() => onAddStep('')}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Add First Step
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedSteps.map((group) => {
                  // Determine section type based on name
                  const sharedSections = ['Login', 'Navigation', 'Header', 'Footer', 'Search', 'Form'];
                  const isShared = sharedSections.some(s => group.sectionName.toLowerCase().includes(s.toLowerCase()));
                  
                  return (
                    <div
                      key={group.sectionName}
                      onClick={() => handleFolderClick(group.sectionName)}
                      className="bg-white border border-gray-200 rounded-lg p-6 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-gray-900 truncate">{group.sectionName}</h3>
                            {isShared && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                Shared
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            {group.steps.length} step{group.steps.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <svg className="w-5 h-5 text-gray-400 flex-shrink-0 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* Steps Grid View */
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentFolder?.steps.map((step, index) => (
                <div
                  key={step.id}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:border-blue-500 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                      <span className="text-lg font-semibold text-blue-600">{step.stepNumber}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 mb-1">Step {step.stepNumber}</h3>
                      <p className="text-xs text-gray-500">
                        {step.action.length > 30 ? step.action.substring(0, 30) + '...' : step.action}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3 mb-4">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Action</p>
                      <p className="text-sm text-gray-900 line-clamp-2">{step.action}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Expected Result</p>
                      <p className="text-sm text-gray-700 line-clamp-2">{step.expectedResult}</p>
                    </div>
                    {step.elementLocator && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Locator</p>
                        <code className="text-xs bg-gray-50 text-gray-800 px-2 py-1 rounded border border-gray-200 font-mono block truncate">
                          {step.elementLocator}
                        </code>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => onEditStep(step.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit step"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => onDeleteStep(step.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete step"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Test Data Modal */}
      {showTestData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowTestData(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Test Data & Mappings</h2>
                <p className="text-sm text-gray-500 mt-1">{Object.keys(testData).length} variables, {Object.keys(autoMappedData).length} auto-mapped</p>
              </div>
              <button
                onClick={() => setShowTestData(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {/* Auto-mapped data section */}
              {Object.keys(autoMappedData).length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-green-700 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Auto-Mapped Test Data (from steps)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(autoMappedData).map(([key, value]) => (
                      <div key={key} className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="text-xs font-medium text-green-700 uppercase tracking-wide mb-1">{key}</div>
                        <div className="text-sm text-green-900 font-mono break-all">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Regular test data section */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">All Test Variables</h3>
                <div className="space-y-3">
                  {Object.entries(testData).map(([key, value]) => (
                    <div key={key} className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex-1">
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{key}</div>
                        {isEditingTestData ? (
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => handleTestDataChange(key, e.target.value)}
                            className="w-full text-sm text-gray-900 font-mono bg-white border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <div className="text-sm text-gray-900 font-mono">{value}</div>
                        )}
                      </div>
                      {!isEditingTestData && (
                        <button
                          onClick={() => navigator.clipboard.writeText(value)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Copy value"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
              <div className="flex gap-2">
                <FileUpload
                  accept=".json"
                  label="Import JSON"
                  onFileSelect={async (files) => {
                    if (files.length > 0) {
                      const file = files[0];
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        try {
                          const json = JSON.parse(e.target?.result as string);
                          setTestData(json);
                          showError('Test data imported successfully!');
                        } catch (error) {
                          showError('Invalid JSON file');
                        }
                      };
                      reader.readAsText(file);
                    }
                  }}
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  }
                />
                {isEditingTestData ? (
                  <button
                    onClick={handleSaveTestData}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Save
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditingTestData(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowTestData(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => navigator.clipboard.writeText(JSON.stringify(testData, null, 2))}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Copy All JSON
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestEditorView;
