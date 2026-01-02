import React, { useState } from 'react';
import { Button, Heading, Text, Card, CardContent, Badge, Spinner } from './ui';

interface Screenshot {
  id: string;
  label: string;
  url: string;
  timestamp: Date;
}

interface LiveExecutionPanelProps {
  isExecuting: boolean;
  currentUrl?: string;
  screenshots: Screenshot[];
  logs: string[];
}

const LiveExecutionPanel: React.FC<LiveExecutionPanelProps> = ({
  isExecuting,
  currentUrl = 'https://www.amazon.com',
  screenshots,
  logs,
}) => {
  const [activeTab, setActiveTab] = useState<'results' | 'diff' | 'video' | 'logs'>('results');

  return (
    <div className="w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 h-screen flex flex-col shadow-xl">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <h2 className="text-lg font-bold flex items-center space-x-2">
          <span className={`w-2 h-2 rounded-full ${isExecuting ? 'bg-green-500 animate-pulse' : 'bg-neutral-500'}`}></span>
          <span>Live Execution</span>
        </h2>
        <p className="text-xs text-neutral-400 mt-1">Real-time browser preview</p>
      </div>

      {/* Browser Mock */}
      <div className="p-4 bg-neutral-50 border-b border-gray-200 dark:border-gray-700">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-300 dark:border-gray-600">
          {/* Browser Chrome */}
          <div className="bg-neutral-100 px-3 py-2 flex items-center space-x-2 border-b border-gray-300 dark:border-gray-600">
            <div className="flex space-x-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <div className="flex-1 bg-white dark:bg-gray-800 rounded px-3 py-1 text-xs text-gray-600 dark:text-gray-400 truncate border border-gray-300 dark:border-gray-600">
              🔒 {currentUrl}
            </div>
          </div>

          {/* Browser Content - Amazon Product Mock */}
          <div className="bg-white dark:bg-gray-800 p-4 h-64 overflow-y-auto">
            {isExecuting ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center space-y-3">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Executing test steps...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Mock Amazon Product Card */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="bg-neutral-100 h-32 flex items-center justify-center">
                    <div className="text-4xl">👟</div>
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-neutral-800 mb-1">
                      Nike Air Max Running Shoes
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Men&apos;s Size 9</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-emerald-600">$129.99</span>
                      <button className="bg-yellow-400 hover:bg-yellow-500 text-neutral-900 px-3 py-1 rounded text-xs font-semibold">
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-neutral-500 text-center">
                  Preview: Product listing page
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white">
        {(['results', 'diff', 'video', 'logs'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-4 py-3 text-sm font-semibold capitalize transition-colors ${
              activeTab === tab
                ? 'text-primary-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 dark:text-gray-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 bg-neutral-50 dark:bg-neutral-900">
        {activeTab === 'results' && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Execution Logs</h3>
            
            {logs.length > 0 ? (
              <div className="space-y-2">
                {logs.map((log, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-xs text-gray-700 dark:text-gray-300 shadow-sm"
                  >
                    <div className="flex items-start space-x-2">
                      <span className="text-green-500 font-bold">✓</span>
                      <span>{log}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📋</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">No execution logs yet</p>
                <p className="text-xs text-neutral-500 mt-1">Start a test to see results</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'diff' && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Screenshot Comparison</h3>
            
            {screenshots.length >= 2 ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  {screenshots.slice(0, 2).map((screenshot) => (
                    <div key={screenshot.id} className="space-y-1">
                      <div className="bg-neutral-200 rounded-xl h-32 flex items-center justify-center border border-gray-300 dark:border-gray-600">
                        <span className="text-2xl">📸</span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 text-center">{screenshot.label}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                  <p className="text-xs text-green-700">
                    <span className="font-semibold">✓ No significant changes detected</span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🔍</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">No screenshots to compare</p>
                <p className="text-xs text-neutral-500 mt-1">Run tests to generate diffs</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'video' && (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🎥</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Video recording</p>
            <p className="text-xs text-neutral-500 mt-1">Available after test execution</p>
            <div className="mt-4 bg-neutral-200 rounded-xl h-48 flex items-center justify-center border border-gray-300 dark:border-gray-600">
              <span className="text-neutral-400">Video player placeholder</span>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Technical Logs</h3>
            
            {logs.length > 0 ? (
              <div className="bg-neutral-900 rounded-xl p-3 font-mono text-xs text-green-400 overflow-x-auto">
                {logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    <span className="text-neutral-500">[{new Date().toLocaleTimeString()}]</span> {log}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📝</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">No logs available</p>
                <p className="text-xs text-neutral-500 mt-1">Start a test to see logs</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveExecutionPanel;
