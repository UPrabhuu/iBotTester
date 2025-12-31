import React from 'react';
import { TestExecution } from '@/types/project';
import { Button, Heading, Text, Badge } from './ui';

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
    const badges = {
      running: 'bg-blue-100 text-blue-700 border border-blue-300 animate-pulse',
      passed: 'bg-green-100 text-green-700 border border-green-300',
      failed: 'bg-red-100 text-red-700 border border-red-300',
      pending: 'bg-gray-100 text-gray-600 border border-gray-300',
    };

    const icons = {
      running: '⏳',
      passed: '✓',
      failed: '✗',
      pending: '○',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center space-x-1 ${badges[status]}`}>
        <span>{icons[status]}</span>
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
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                Execution Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                Labels
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                Timestamp
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                Execution Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                Triggered By
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {executions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="text-4xl">📋</div>
                    <p className="text-sm font-medium text-neutral-600">No test executions yet</p>
                    <p className="text-xs text-neutral-500">Run tests to see execution history</p>
                  </div>
                </td>
              </tr>
            ) : (
              executions.map((execution) => (
                <tr key={execution.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-neutral-800">
                    {execution.executionName}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {execution.labels.map((label, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs font-medium bg-primary-50 text-primary-700 rounded"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(execution.status)}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600">
                    {formatTimestamp(execution.timestamp)}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600">
                    {formatDuration(execution.duration)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 text-xs font-medium bg-purple-50 text-purple-700 rounded border border-purple-200">
                      {execution.executionType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600">
                    {execution.triggeredBy}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onView(execution.id)}
                        className="p-2 text-primary-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                        title="View details"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => onRerun(execution.id)}
                        className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors"
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
