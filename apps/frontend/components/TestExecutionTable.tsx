import React from 'react';
import { Button, Heading, Text, Badge } from './ui';

export interface TestExecution {
  id: string;
  executionName: string;
  labels?: string[];
  status: 'running' | 'passed' | 'failed' | 'pending' | 'completed';
  timestamp: Date;
  duration: number;
  executionType: string;
  triggeredBy: string;
  passedSteps?: number;
  totalSteps?: number;
}

interface TestExecutionTableProps {
  executions: TestExecution[];
  onView: (executionId: string) => void;
  onRerun: (executionId: string) => void;
  onDelete: (executionId: string) => void;
}

const TestExecutionTable: React.FC<TestExecutionTableProps> = ({
  executions,
  onView,
  onRerun,
  onDelete,
}) => {
  const getStatusBadge = (status: TestExecution['status']) => {
    const statusMap: Record<string, string> = {
      running: 'running',
      completed: 'passed',
      passed: 'passed',
      failed: 'failed',
      pending: 'pending',
    };
    
    const mappedStatus = statusMap[status] || 'pending';
    
    const badges: Record<string, string> = {
      running: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700 animate-pulse',
      passed: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700',
      failed: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700',
      pending: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600',
    };

    const icons: Record<string, string> = {
      running: '⏳',
      passed: '✓',
      failed: '✗',
      pending: '○',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center space-x-1 ${badges[mappedStatus]}`}>
        <span>{icons[mappedStatus]}</span>
        <span className="capitalize">{status}</span>
      </span>
    );
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${seconds}s`;
  };

  const formatTimestamp = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Execution Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Labels
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Timestamp
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Execution Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Triggered By
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {executions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="text-4xl">📋</div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">No test executions yet</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Run tests to see execution history</p>
                  </div>
                </td>
              </tr>
            ) : (
              executions.map((execution) => (
                <tr key={execution.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-neutral-800 dark:text-neutral-200">
                    {execution.executionName}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {execution.labels && execution.labels.length > 0 ? (
                        execution.labels.map((label, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs font-medium bg-primary-50 text-primary-700 rounded"
                          >
                            {label}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-neutral-400 dark:text-neutral-500">No labels</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(execution.status)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                    {formatTimestamp(execution.timestamp)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                    {formatDuration(execution.duration)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 text-xs font-medium bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded border border-purple-200 dark:border-purple-700">
                      {execution.executionType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                    {execution.triggeredBy}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onView(execution.id)}
                        className="p-2 text-primary-600 dark:text-primary-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                        title="View details"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => onRerun(execution.id)}
                        className="p-2 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                        title="Re-run test"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TestExecutionTable;
