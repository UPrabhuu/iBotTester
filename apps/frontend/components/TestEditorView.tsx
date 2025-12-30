import React, { useState } from 'react';
import { TestStep, TestStepGroup } from '@/types/project';

interface TestEditorViewProps {
  testSteps: TestStep[];
  onEditStep: (stepId: string) => void;
  onDeleteStep: (stepId: string) => void;
  onAddStep: (uiSection: string) => void;
}

const TestEditorView: React.FC<TestEditorViewProps> = ({
  testSteps,
  onEditStep,
  onDeleteStep,
  onAddStep,
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

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

  const toggleSection = (sectionName: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionName)) {
      newExpanded.delete(sectionName);
    } else {
      newExpanded.add(sectionName);
    }
    setExpandedSections(newExpanded);
  };

  const toggleAllSections = () => {
    if (expandedSections.size === groupedSteps.length) {
      setExpandedSections(new Set());
    } else {
      setExpandedSections(new Set(groupedSteps.map((g) => g.sectionName)));
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">
          Test Steps by UI Section
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleAllSections}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {expandedSections.size === groupedSteps.length ? 'Collapse All' : 'Expand All'}
          </button>
        </div>
      </div>

      {/* Test Steps Groups */}
      <div className="space-y-3">
        {groupedSteps.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 px-4 py-12 text-center">
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="text-4xl">📋</div>
              <p className="text-sm font-medium text-slate-600">No test steps yet</p>
              <p className="text-xs text-slate-500">Add test steps to get started</p>
            </div>
          </div>
        ) : (
          groupedSteps.map((group) => {
            const isExpanded = expandedSections.has(group.sectionName);
            return (
              <div
                key={group.sectionName}
                className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden"
              >
                {/* Folder Header */}
                <div
                  className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => toggleSection(group.sectionName)}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">
                      {isExpanded ? '📂' : '📁'}
                    </span>
                    <h4 className="font-semibold text-slate-800">
                      {group.sectionName}
                    </h4>
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                      {group.steps.length} {group.steps.length === 1 ? 'step' : 'steps'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddStep(group.sectionName);
                      }}
                      className="px-3 py-1 text-xs font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors"
                    >
                      + Add Step
                    </button>
                    <span className="text-slate-400">
                      {isExpanded ? '▼' : '▶'}
                    </span>
                  </div>
                </div>

                {/* Steps List */}
                {isExpanded && (
                  <div className="divide-y divide-slate-200">
                    {group.steps.map((step) => (
                      <div
                        key={step.id}
                        className="px-6 py-4 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-start space-x-4">
                          {/* Step Number */}
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">
                            {step.stepNumber}
                          </div>

                          {/* Step Details */}
                          <div className="flex-1">
                            <div className="mb-2">
                              <h5 className="text-sm font-semibold text-slate-800 mb-1">
                                Action
                              </h5>
                              <p className="text-sm text-slate-600">
                                {step.action}
                              </p>
                            </div>

                            <div className="mb-2">
                              <h5 className="text-sm font-semibold text-slate-800 mb-1">
                                Expected Result
                              </h5>
                              <p className="text-sm text-slate-600">
                                {step.expectedResult}
                              </p>
                            </div>

                            {step.elementLocator && (
                              <div className="mb-2">
                                <h5 className="text-sm font-semibold text-slate-800 mb-1">
                                  Element Locator
                                </h5>
                                <code className="text-xs bg-slate-100 text-slate-800 px-2 py-1 rounded font-mono">
                                  {step.elementLocator}
                                </code>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col space-y-2">
                            <button
                              onClick={() => onEditStep(step.id)}
                              className="px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => onDeleteStep(step.id)}
                              className="px-3 py-1 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TestEditorView;
