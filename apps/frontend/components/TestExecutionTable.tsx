import React from 'react';
import { TestExecution } from '@/types/project';

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
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Suite Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Labels
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Local Execution
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Grid Execution
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Triggered By
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {executions.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="text-4xl">📋</div>
                    <p className="text-sm font-medium text-slate-600">No test executions yet</p>
                    <p className="text-xs text-slate-500">Run tests to see execution history</p>
                  </div>
                </td>
              </tr>
            ) : (
              executions.map((execution) => (
                <tr key={execution.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-slate-800">
                    {execution.suiteName}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {execution.labels.map((label, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {execution.localExecution ? (
                      <div className="text-xs space-y-1">
                        <div>{getStatusBadge(execution.localExecution.status)}</div>
                        <div className="text-slate-500">
                          {formatTimestamp(execution.localExecution.timestamp)}
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {execution.gridExecution ? (
                      <div className="text-xs space-y-1">
                        <div>{getStatusBadge(execution.gridExecution.status)}</div>
                        <div className="text-slate-500">
                          {formatTimestamp(execution.gridExecution.timestamp)}
                        </div>
                        {execution.gridExecution.gridDetails && (
                          <div className="text-slate-400">{execution.gridExecution.gridDetails}</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(execution.status)}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {formatDuration(execution.duration)}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {execution.triggeredBy}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onView(execution.id)}
                        className="px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                        title="View details"
                      >
                        View
                      </button>
                      <button
                        onClick={() => onRerun(execution.id)}
                        className="px-3 py-1 text-xs font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors"
                        title="Re-run test"
                      >
                        Re-run
                      </button>
                      <button
                        onClick={() => onDelete(execution.id)}
                        className="px-3 py-1 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        Delete
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
