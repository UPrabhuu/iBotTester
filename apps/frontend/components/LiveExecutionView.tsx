import React, { useState } from 'react';
import { Button, Input, Heading, Text, Card, CardContent, Badge, Spinner } from './ui';

interface Screenshot {
  id: string;
  label: string;
  url: string;
  timestamp: Date;
}

interface LiveExecutionViewProps {
  isExecuting?: boolean;
  currentUrl?: string;
  screenshots?: Screenshot[];
  logs?: string[];
}

const LiveExecutionView: React.FC<LiveExecutionViewProps> = ({
  isExecuting = false,
  currentUrl = 'https://www.amazon.com',
  screenshots = [],
  logs = [],
}) => {
  const [activeTab, setActiveTab] = useState<'results' | 'diff' | 'video' | 'logs'>('results');

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-6">
        <h2 className="text-2xl font-bold flex items-center space-x-3">
          <span className={`w-3 h-3 rounded-full ${isExecuting ? 'bg-green-500 animate-pulse' : 'bg-gray-400 dark:bg-gray-600'}`}></span>
          <span>Live Execution</span>
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Real-time browser preview and execution monitoring</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Browser Mock */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-300 dark:border-gray-600">
            {/* Browser Chrome */}
            <div className="bg-neutral-100 dark:bg-gray-700 px-4 py-3 flex items-center space-x-3 border-b border-gray-300 dark:border-gray-600">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <div className="flex-1 bg-white dark:bg-gray-800 rounded px-4 py-2 text-sm text-gray-600 dark:text-gray-400 truncate border border-gray-300 dark:border-gray-600">
                🔒 {currentUrl}
              </div>
              <button className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>

            {/* Browser Viewport */}
            <div className="bg-white dark:bg-gray-800 p-8 min-h-[500px] flex items-center justify-center">
              {isExecuting ? (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400 font-medium">Test execution in progress...</p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">Browser preview will appear here</p>
                </div>
              ) : (
                <div className="text-center text-gray-400 dark:text-gray-500">
                  <svg className="w-24 h-24 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <p className="font-medium text-lg">No active execution</p>
                  <p className="text-sm mt-2">Start a test to see live browser preview</p>
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <div className="flex space-x-1 p-2">
                {[
                  { id: 'results' as const, label: 'Results', icon: '✓' },
                  { id: 'diff' as const, label: 'Diff', icon: '⇄' },
                  { id: 'video' as const, label: 'Video', icon: '▶' },
                  { id: 'logs' as const, label: 'Logs', icon: '📋' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-neutral-100'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6">
              {/* Results Tab */}
              {activeTab === 'results' && (
                <div>
                  <h3 className="text-lg font-semibold text-neutral-800 mb-4">Test Results</h3>
                  {screenshots.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {screenshots.map((screenshot) => (
                        <div key={screenshot.id} className="bg-neutral-50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                          <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded mb-3 flex items-center justify-center">
                            <span className="text-neutral-400 text-sm">Screenshot Preview</span>
                          </div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{screenshot.label}</p>
                          <p className="text-xs text-neutral-500">{screenshot.timestamp.toLocaleTimeString()}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-neutral-400">
                      <svg className="w-16 h-16 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p>No screenshots available</p>
                    </div>
                  )}
                </div>
              )}

              {/* Diff Tab */}
              {activeTab === 'diff' && (
                <div>
                  <h3 className="text-lg font-semibold text-neutral-800 mb-4">Visual Diff</h3>
                  <div className="bg-neutral-50 rounded-xl p-8 border border-gray-200 dark:border-gray-700 text-center text-neutral-400">
                    <svg className="w-16 h-16 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <p>No visual diff available</p>
                  </div>
                </div>
              )}

              {/* Video Tab */}
              {activeTab === 'video' && (
                <div>
                  <h3 className="text-lg font-semibold text-neutral-800 mb-4">Execution Recording</h3>
                  <div className="bg-neutral-50 rounded-xl p-8 border border-gray-200 dark:border-gray-700 text-center text-neutral-400">
                    <svg className="w-16 h-16 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <p>No video recording available</p>
                  </div>
                </div>
              )}

              {/* Logs Tab */}
              {activeTab === 'logs' && (
                <div>
                  <h3 className="text-lg font-semibold text-neutral-800 mb-4">Execution Logs</h3>
                  <div className="bg-gray-900 dark:bg-black rounded-xl p-4 font-mono text-sm max-h-96 overflow-y-auto">
                    {logs.length > 0 ? (
                      logs.map((log, index) => (
                        <div key={index} className="text-green-400 mb-1">
                          {log}
                        </div>
                      ))
                    ) : (
                      <div className="text-neutral-500 text-center py-8">No logs available</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveExecutionView;
