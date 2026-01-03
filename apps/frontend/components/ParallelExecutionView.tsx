import React, { useState, useEffect } from 'react';
import { Badge } from './ui';

interface TestExecution {
  id: string;
  order: number;
  testCaseId: string;
  testCaseName: string;
  projectName: string;
  branchId?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number; // 0-100
  startedAt?: Date;
  completedAt?: Date;
  duration?: number;
  errorMessage?: string;
  currentUrl?: string;
  lastScreenshot?: string;
}

interface ExecutionBatch {
  id: string;
  batchName: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  totalTests: number;
  completedTests: number;
  passedTests: number;
  failedTests: number;
  executions: TestExecution[];
  startedAt: Date;
  completedAt?: Date;
}

interface ParallelExecutionViewProps {
  batch: ExecutionBatch;
  onExecutionUpdate?: (executionId: string, updates: any) => void;
}

const ParallelExecutionView: React.FC<ParallelExecutionViewProps> = ({ batch, onExecutionUpdate }) => {
  const [selectedExecution, setSelectedExecution] = useState<TestExecution | null>(
    batch.executions.length > 0 ? batch.executions[0] : null
  );
  const [activeTab, setActiveTab] = useState<'live' | 'results' | 'logs'>('live');

  // Calculate progress percentage
  const progressPercentage = batch.totalTests > 0 ? Math.round((batch.completedTests / batch.totalTests) * 100) : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'text-blue-500';
      case 'completed':
        return 'text-green-500';
      case 'failed':
        return 'text-red-500';
      case 'pending':
        return 'text-gray-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700';
      case 'completed':
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700';
      case 'failed':
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700';
      case 'pending':
        return 'bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-700';
      default:
        return 'bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-700';
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center space-x-3">
            <span className={`w-3 h-3 rounded-full ${batch.status === 'running' ? 'bg-blue-500 animate-pulse' : 'bg-gray-400'}`}></span>
            <span>{batch.batchName}</span>
          </h2>
          <Badge variant={batch.status === 'running' ? 'default' : batch.status === 'completed' ? 'success' : 'destructive'}>
            {batch.status.charAt(0).toUpperCase() + batch.status.slice(1)}
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">Progress</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {batch.completedTests}/{batch.totalTests} Tests
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            {/* Dynamic width based on runtime progress - inline style required */}
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
            <div className="flex space-x-4">
              <span>
                <span className="text-green-600 dark:text-green-400 font-semibold">{batch.passedTests}</span> Passed
              </span>
              <span>
                <span className="text-red-600 dark:text-red-400 font-semibold">{batch.failedTests}</span> Failed
              </span>
            </div>
            <span>
              {progressPercentage}% Complete
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Test Cases List */}
        <div className="w-80 border-r border-gray-200 dark:border-gray-700 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="p-4 space-y-2">
            {batch.executions.map((execution) => (
              <button
                key={execution.id}
                onClick={() => setSelectedExecution(execution)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  selectedExecution?.id === execution.id
                    ? 'border-blue-500 bg-white dark:bg-gray-800'
                    : `border-gray-200 dark:border-gray-700 ${getStatusBgColor(execution.status)}`
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm truncate flex-1">
                    {execution.testCaseName}
                  </h4>
                  <span className={`text-xs font-bold ml-2 ${getStatusColor(execution.status)}`}>
                    {execution.status.toUpperCase()}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Project: <span className="font-medium text-gray-900 dark:text-white">{execution.projectName}</span>
                  </p>
                  {execution.branchId && (
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Branch: <span className="font-medium text-gray-900 dark:text-white">{execution.branchId}</span>
                    </p>
                  )}
                  {execution.duration && (
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Duration: <span className="font-medium text-gray-900 dark:text-white">{execution.duration}s</span>
                    </p>
                  )}
                  {execution.status === 'running' && (
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                        <span>Progress</span>
                        <span>{execution.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-1.5">
                        {/* Dynamic width based on runtime progress - inline style required */}
                        <div
                          className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${execution.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Execution Details */}
        <div className="flex-1 flex flex-col">
          {selectedExecution ? (
            <>
              {/* Tabs */}
              <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-3 bg-gray-50 dark:bg-gray-900">
                <div className="flex space-x-4">
                  {[
                    { id: 'live' as const, label: 'Live View', icon: '▶' },
                    { id: 'results' as const, label: 'Results', icon: '✓' },
                    { id: 'logs' as const, label: 'Logs', icon: '📋' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors text-sm font-medium ${
                        activeTab === tab.id
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800'
                      }`}
                    >
                      <span>{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {activeTab === 'live' && (
                  <div className="space-y-4">
                    {/* Test Info */}
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Test Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                          <p className={`font-semibold ${getStatusColor(selectedExecution.status)}`}>
                            {selectedExecution.status.toUpperCase()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Test Case</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{selectedExecution.testCaseName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Project</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{selectedExecution.projectName}</p>
                        </div>
                        {selectedExecution.branchId && (
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Branch</p>
                            <p className="font-semibold text-gray-900 dark:text-white">{selectedExecution.branchId}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Browser Preview */}
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      <div className="bg-neutral-100 dark:bg-gray-700 px-4 py-3 flex items-center space-x-3 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex space-x-2">
                          <div className="w-3 h-3 rounded-full bg-red-400"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                          <div className="w-3 h-3 rounded-full bg-green-400"></div>
                        </div>
                        <div className="flex-1 bg-white dark:bg-gray-800 rounded px-3 py-1 text-xs text-gray-600 dark:text-gray-400 truncate border border-gray-300 dark:border-gray-600">
                          🔒 {selectedExecution.currentUrl || 'https://example.com'}
                        </div>
                      </div>
                      <div className="aspect-video bg-gray-200 dark:bg-gray-700 flex items-center justify-center min-h-[300px]">
                        {selectedExecution.lastScreenshot ? (
                          <img
                            src={selectedExecution.lastScreenshot}
                            alt="Execution screenshot"
                            className="w-full h-full object-cover"
                          />
                        ) : selectedExecution.status === 'running' ? (
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-3"></div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">Execution in progress...</p>
                          </div>
                        ) : (
                          <div className="text-center text-gray-400 dark:text-gray-500">
                            <svg className="w-16 h-16 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <p>No active execution</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {selectedExecution.errorMessage && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
                        <h4 className="font-semibold text-red-900 dark:text-red-200 mb-2">Error</h4>
                        <p className="text-sm text-red-800 dark:text-red-300">{selectedExecution.errorMessage}</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'results' && (
                  <div className="space-y-4">
                    <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                      <p>Test results will be available when execution completes</p>
                    </div>
                  </div>
                )}

                {activeTab === 'logs' && (
                  <div className="bg-gray-900 dark:bg-black rounded-lg p-4 font-mono text-sm text-green-400 max-h-96 overflow-y-auto">
                    <div className="space-y-1">
                      <div>[TEST] Starting {selectedExecution.testCaseName}...</div>
                      <div>[TEST] Navigating to {selectedExecution.currentUrl}...</div>
                      {selectedExecution.status === 'running' && (
                        <div>
                          <span className="animate-pulse">[TEST] Execution in progress...</span>
                        </div>
                      )}
                      {selectedExecution.status === 'completed' && (
                        <div>[TEST] ✓ Test completed successfully</div>
                      )}
                      {selectedExecution.status === 'failed' && (
                        <div className="text-red-400">[TEST] ✗ Test failed: {selectedExecution.errorMessage}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-500">
              <p>Select a test case to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParallelExecutionView;
