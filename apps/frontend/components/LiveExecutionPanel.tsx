import React, { useState } from 'react';

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
    <div className="w-96 bg-white border-l border-slate-200 h-screen flex flex-col shadow-xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-6 py-4 border-b border-slate-700">
        <h2 className="text-lg font-bold flex items-center space-x-2">
          <span className={`w-2 h-2 rounded-full ${isExecuting ? 'bg-green-500 animate-pulse' : 'bg-slate-500'}`}></span>
          <span>Live Execution</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">Real-time browser preview</p>
      </div>

      {/* Browser Mock */}
      <div className="p-4 bg-slate-50 border-b border-slate-200">
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-slate-300">
          {/* Browser Chrome */}
          <div className="bg-slate-100 px-3 py-2 flex items-center space-x-2 border-b border-slate-300">
            <div className="flex space-x-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <div className="flex-1 bg-white rounded px-3 py-1 text-xs text-slate-600 truncate border border-slate-300">
              🔒 {currentUrl}
            </div>
          </div>

          {/* Browser Content - Amazon Product Mock */}
          <div className="bg-white p-4 h-64 overflow-y-auto">
            {isExecuting ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center space-y-3">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  <p className="text-sm text-slate-600">Executing test steps...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Mock Amazon Product Card */}
                <div className="border border-slate-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="bg-slate-100 h-32 flex items-center justify-center">
                    <div className="text-4xl">👟</div>
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-slate-800 mb-1">
                      Nike Air Max Running Shoes
                    </h3>
                    <p className="text-xs text-slate-600 mb-2">Men&apos;s Size 9</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-emerald-600">$129.99</span>
                      <button className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 px-3 py-1 rounded text-xs font-semibold">
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-500 text-center">
                  Preview: Product listing page
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white">
        {(['results', 'diff', 'video', 'logs'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-4 py-3 text-sm font-semibold capitalize transition-colors ${
              activeTab === tab
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
        {activeTab === 'results' && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Execution Logs</h3>
            
            {logs.length > 0 ? (
              <div className="space-y-2">
                {logs.map((log, index) => (
                  <div
                    key={index}
                    className="bg-white border border-slate-200 rounded-lg p-3 text-xs text-slate-700 shadow-sm"
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
                <p className="text-sm text-slate-600">No execution logs yet</p>
                <p className="text-xs text-slate-500 mt-1">Start a test to see results</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'diff' && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Screenshot Comparison</h3>
            
            {screenshots.length >= 2 ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  {screenshots.slice(0, 2).map((screenshot) => (
                    <div key={screenshot.id} className="space-y-1">
                      <div className="bg-slate-200 rounded-lg h-32 flex items-center justify-center border border-slate-300">
                        <span className="text-2xl">📸</span>
                      </div>
                      <p className="text-xs text-slate-600 text-center">{screenshot.label}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-xs text-green-700">
                    <span className="font-semibold">✓ No significant changes detected</span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🔍</div>
                <p className="text-sm text-slate-600">No screenshots to compare</p>
                <p className="text-xs text-slate-500 mt-1">Run tests to generate diffs</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'video' && (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🎥</div>
            <p className="text-sm text-slate-600">Video recording</p>
            <p className="text-xs text-slate-500 mt-1">Available after test execution</p>
            <div className="mt-4 bg-slate-200 rounded-lg h-48 flex items-center justify-center border border-slate-300">
              <span className="text-slate-400">Video player placeholder</span>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Technical Logs</h3>
            
            {logs.length > 0 ? (
              <div className="bg-slate-900 rounded-lg p-3 font-mono text-xs text-green-400 overflow-x-auto">
                {logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    <span className="text-slate-500">[{new Date().toLocaleTimeString()}]</span> {log}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📝</div>
                <p className="text-sm text-slate-600">No logs available</p>
                <p className="text-xs text-slate-500 mt-1">Start a test to see logs</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveExecutionPanel;
