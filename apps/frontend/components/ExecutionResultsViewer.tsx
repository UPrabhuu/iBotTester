import React, { useState } from 'react';

export interface StepResult {
  step: number;
  action: string;
  status: 'passed' | 'failed' | 'skipped';
  duration?: number;
  error?: string;
  screenshot?: string;
  retryAttempts?: number;
}

export interface Evidence {
  screenshots: Array<{
    stepNumber: number;
    base64: string;
    filePath?: string;
    timestamp: Date;
  }>;
  logs: Array<{
    level: 'info' | 'warn' | 'error' | 'debug';
    message: string;
    timestamp: Date;
  }>;
  consoleLogs: Array<{
    type: 'log' | 'error' | 'warn' | 'info';
    text: string;
    location?: string;
    timestamp: Date;
  }>;
  video?: string;
}

export interface FlowDifference {
  type: 'BREAKING' | 'NON_BREAKING' | 'COSMETIC' | 'SELF_HEALED';
  impactScore: number;
  description: string;
  diffData?: any;
}

export interface TestReport {
  overallStatus: 'PASS' | 'FAIL' | 'PARTIAL' | 'ERROR';
  confidenceScore: number;
  summary: string;
  detailedAnalysis?: string;
  suggestedFixes: Array<{
    issue: string;
    suggestion: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  actionableInsights: Array<{
    category: string;
    description: string;
    actionable: boolean;
  }>;
}

export interface ExecutionResult {
  testId: string;
  status: 'PASS' | 'FAIL' | 'PARTIAL' | 'ERROR';
  steps: StepResult[];
  evidence: Evidence;
  report?: TestReport;
  diff?: FlowDifference[];
  confidence?: number;
  duration?: number;
}

interface ExecutionResultsViewerProps {
  result: ExecutionResult;
}

export default function ExecutionResultsViewer({ result }: ExecutionResultsViewerProps) {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [selectedTab, setSelectedTab] = useState<'steps' | 'evidence' | 'report' | 'diff'>('steps');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PASS':
      case 'passed':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
      case 'FAIL':
      case 'failed':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
      case 'PARTIAL':
      case 'skipped':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  const getDiffTypeColor = (type: string) => {
    switch (type) {
      case 'BREAKING':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
      case 'NON_BREAKING':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
      case 'COSMETIC':
        return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30';
      case 'SELF_HEALED':
        return 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Test Execution Results
            </h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(result.status)}`}>
              {result.status}
            </span>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Test ID: {result.testId}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {result.steps.length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Total Steps</div>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {result.steps.filter(s => s.status === 'passed').length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Passed</div>
          </div>
          <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {result.steps.filter(s => s.status === 'failed').length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Failed</div>
          </div>
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {result.confidence ? `${Math.round(result.confidence * 100)}%` : 'N/A'}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Confidence</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 px-6">
        {['steps', 'evidence', 'report', 'diff'].map(tab => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab as any)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              selectedTab === tab
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab === 'diff' && result.diff && result.diff.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full">
                {result.diff.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {/* Steps Tab */}
        {selectedTab === 'steps' && (
          <div className="space-y-3">
            {result.steps.map((step, index) => (
              <div
                key={index}
                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => setExpandedStep(expandedStep === index ? null : index)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${getStatusColor(step.status)}`}>
                      {step.step}
                    </span>
                    <div className="text-left">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {step.action}
                      </div>
                      {step.duration && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {step.duration}ms
                          {step.retryAttempts && step.retryAttempts > 0 && (
                            <span className="ml-2 text-yellow-600 dark:text-yellow-400">
                              ({step.retryAttempts} retries)
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${expandedStep === index ? 'transform rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {expandedStep === index && (
                  <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
                    {step.error && (
                      <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-300">
                        {step.error}
                      </div>
                    )}
                    {step.screenshot && (
                      <img
                        src={step.screenshot}
                        alt={`Step ${step.step} screenshot`}
                        className="rounded-lg border border-gray-200 dark:border-gray-700"
                      />
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Evidence Tab */}
        {selectedTab === 'evidence' && (
          <div className="space-y-4">
            {/* Screenshots */}
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">Screenshots ({result.evidence.screenshots.length})</h3>
              <div className="grid grid-cols-3 gap-4">
                {result.evidence.screenshots.map((screenshot, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <img src={screenshot.base64} alt={`Step ${screenshot.stepNumber}`} className="w-full" />
                    <div className="p-2 bg-gray-50 dark:bg-gray-900/50 text-xs text-gray-600 dark:text-gray-400">
                      Step {screenshot.stepNumber}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Logs */}
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">Execution Logs ({result.evidence.logs.length})</h3>
              <div className="bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto font-mono text-xs">
                {result.evidence.logs.map((log, index) => (
                  <div key={index} className={`py-1 ${
                    log.level === 'error' ? 'text-red-400' :
                    log.level === 'warn' ? 'text-yellow-400' :
                    'text-green-400'
                  }`}>
                    <span className="text-gray-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span>{' '}
                    <span className={`font-bold ${
                      log.level === 'error' ? 'text-red-500' :
                      log.level === 'warn' ? 'text-yellow-500' :
                      'text-blue-500'
                    }`}>
                      {log.level.toUpperCase()}
                    </span>{' '}
                    {log.message}
                  </div>
                ))}
              </div>
            </div>

            {/* Console Logs */}
            {result.evidence.consoleLogs && result.evidence.consoleLogs.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Browser Console ({result.evidence.consoleLogs.length})</h3>
                <div className="bg-gray-900 rounded-lg p-4 max-h-64 overflow-y-auto font-mono text-xs">
                  {result.evidence.consoleLogs.map((log, index) => (
                    <div key={index} className={`py-1 ${
                      log.type === 'error' ? 'text-red-400' :
                      log.type === 'warn' ? 'text-yellow-400' :
                      'text-gray-400'
                    }`}>
                      <span className="text-gray-600">[{log.type}]</span> {log.text}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Report Tab */}
        {selectedTab === 'report' && result.report && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Summary</h3>
              <p className="text-gray-700 dark:text-gray-300">{result.report.summary}</p>
            </div>

            {result.report.suggestedFixes && result.report.suggestedFixes.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Suggested Fixes</h3>
                <div className="space-y-2">
                  {result.report.suggestedFixes.map((fix, index) => (
                    <div key={index} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900 dark:text-white">{fix.issue}</span>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          fix.priority === 'high' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                          fix.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
                          'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        }`}>
                          {fix.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{fix.suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.report.actionableInsights && result.report.actionableInsights.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Actionable Insights</h3>
                <div className="space-y-2">
                  {result.report.actionableInsights.map((insight, index) => (
                    <div key={index} className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <span className="text-blue-600 dark:text-blue-400">💡</span>
                        <div>
                          <div className="text-xs text-blue-600 dark:text-blue-400 font-medium uppercase">{insight.category}</div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{insight.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Diff Tab */}
        {selectedTab === 'diff' && (
          <div>
            {result.diff && result.diff.length > 0 ? (
              <div className="space-y-3">
                {result.diff.map((diff, index) => (
                  <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getDiffTypeColor(diff.type)}`}>
                        {diff.type}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Impact: {diff.impactScore}/100
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{diff.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>No differences detected compared to previous run</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
