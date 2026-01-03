import React, { useEffect, useState } from 'react';
import { useExecutionStream } from '@/hooks/useExecutionStream';

interface LiveExecutionStreamProps {
  executionId?: string;
  conversationId?: string | null;
  onClose?: () => void;
  autoStart?: boolean;
}

/**
 * Live Execution Stream Component
 * Displays real-time execution updates via WebSocket
 */
const LiveExecutionStream: React.FC<LiveExecutionStreamProps> = ({
  executionId,
  conversationId,
  onClose,
  autoStart = true,
}) => {
  // Try to get executionId from conversation if not provided
  const actualExecutionId = executionId || (conversationId ? `exec-${conversationId}` : null);

  const {
    isConnected,
    isStreaming,
    error,
    latestFrame,
    steps,
    logs,
    executionStatus,
    startUrl,
    totalSteps,
  } = useExecutionStream(actualExecutionId, { autoConnect: autoStart });

  const [showLogs, setShowLogs] = useState(false);

  if (!actualExecutionId || !autoStart) {
    return null;
  }

  const statusColors = {
    idle: 'bg-gray-400',
    starting: 'bg-yellow-500 animate-pulse',
    running: 'bg-blue-500 animate-pulse',
    completed: 'bg-green-500',
    failed: 'bg-red-500',
  };

  const statusLabels = {
    idle: 'Idle',
    starting: 'Starting',
    running: 'Running',
    completed: 'Completed',
    failed: 'Failed',
  };

  const completedSteps = steps.filter((s) => s.status === 'passed').length;
  const failedSteps = steps.filter((s) => s.status === 'failed').length;

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col z-50 max-h-[600px]">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-t-xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${statusColors[executionStatus]}`}></div>
          <div>
            <h3 className="font-semibold text-sm">Live Execution</h3>
            <p className="text-xs opacity-90">
              {statusLabels[executionStatus]} {isConnected && '🔌'}
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded p-1 transition"
          >
            ✕
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <p className="text-red-700 dark:text-red-300 text-xs font-semibold">⚠️ Error</p>
            <p className="text-red-600 dark:text-red-400 text-xs mt-1">{error}</p>
          </div>
        )}

        {/* URL Display */}
        {startUrl && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mb-1">📍 Current URL</p>
            <p className="text-xs font-mono text-blue-700 dark:text-blue-300 truncate">{startUrl}</p>
          </div>
        )}

        {/* Latest Frame (Live Screenshot) */}
        {latestFrame && (
          <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 px-3 py-2 bg-gray-100 dark:bg-gray-800">
              📸 Latest Frame (seq: {latestFrame.sequence})
            </p>
            <img
              src={`data:image/png;base64,${latestFrame.base64}`}
              alt="Live execution screenshot"
              className="w-full h-auto max-h-64 object-contain bg-white"
              title={latestFrame.timestamp}
            />
          </div>
        )}

        {/* Steps Progress */}
        {totalSteps > 0 && (
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                📋 Steps: {completedSteps}/{totalSteps}
              </p>
              <div className="flex gap-2 text-xs">
                {failedSteps > 0 && <span className="text-red-600">❌ {failedSteps}</span>}
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 overflow-hidden">
              {/* Dynamic width based on runtime progress - inline style required */}
              <div
                className={`h-full transition-all duration-300 ${
                  failedSteps > 0 ? 'bg-red-500' : 'bg-gradient-to-r from-blue-500 to-purple-500'
                }`}
                style={{ width: `${totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Steps List */}
        {steps.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg p-3">
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
              ⚙️ Step Timeline ({steps.length})
            </p>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {steps.slice(-8).map((step, idx) => (
                <div
                  key={idx}
                  className="text-xs bg-white dark:bg-gray-800 p-2 rounded flex items-start space-x-2"
                >
                  <span className="flex-shrink-0 mt-0.5">
                    {step.status === 'passed' ? '✅' : step.status === 'failed' ? '❌' : '⏳'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 dark:text-gray-200 text-xs">
                      {step.action}
                    </p>
                    {step.description && (
                      <p className="text-gray-600 dark:text-gray-400 text-xs truncate">{step.description}</p>
                    )}
                    {step.error && <p className="text-red-600 dark:text-red-400 text-xs truncate">{step.error}</p>}
                    {step.duration && (
                      <p className="text-gray-500 dark:text-gray-500 text-xs">{step.duration}ms</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Logs Toggle */}
        {logs.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3">
            <button
              onClick={() => setShowLogs(!showLogs)}
              className="text-xs font-semibold text-gray-700 dark:text-gray-300 w-full text-left hover:text-gray-900 dark:hover:text-gray-100 transition"
            >
              📝 Logs ({logs.length}) {showLogs ? '▼' : '▶'}
            </button>
            {showLogs && (
              <div className="mt-2 bg-gray-900 dark:bg-black rounded p-2 font-mono text-xs max-h-40 overflow-y-auto">
                {logs.slice(-30).map((log, idx) => (
                  <div key={idx} className="text-green-400 mb-1">
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {isStreaming && steps.length === 0 && !latestFrame && (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">Waiting for execution to start...</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2 text-xs text-gray-500 dark:text-gray-400 flex justify-between items-center rounded-b-xl bg-gray-50 dark:bg-gray-700/50">
        <span>{steps.length} steps</span>
        {isConnected && <span className="text-green-600 dark:text-green-400">🟢 Connected</span>}
        {isStreaming && <span className="text-blue-600 dark:text-blue-400">📡 Streaming</span>}
      </div>
    </div>
  );
};

export default LiveExecutionStream;
