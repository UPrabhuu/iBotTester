import React, { useState, useEffect } from 'react';
import { playwrightApi, PlaywrightExecution } from '@/services/playwrightApi';
import TestExecutionTable, { TestExecution } from './TestExecutionTable';
import LiveExecutionPanel from './LiveExecutionPanel';
import { Button, Heading, Spinner } from './ui';
import { useAlert } from '../contexts/AlertContext';

interface PlaywrightExecutionViewProps {
  projectId?: string;
  userId?: string;
}

const PlaywrightExecutionView: React.FC<PlaywrightExecutionViewProps> = ({
  projectId,
  userId,
}) => {
  const [executions, setExecutions] = useState<TestExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExecution, setSelectedExecution] = useState<PlaywrightExecution | null>(null);
  const [showLivePanel, setShowLivePanel] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchExecutions();
    
    // Auto-refresh every 5 seconds when viewing executions
    const interval = setInterval(() => {
      fetchExecutions();
    }, 5000);
    
    setRefreshInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [projectId, userId]);

  const fetchExecutions = async () => {
    try {
      const data = await playwrightApi.getAllExecutions({
        projectId,
        userId,
        limit: 50,
      });

      const formattedExecutions: TestExecution[] = data.map((exec) => ({
        id: exec.id,
        executionName: exec.executionName,
        labels: [], // Can be derived from tags or metadata
        status: mapStatus(exec.status),
        timestamp: new Date(exec.startedAt),
        duration: exec.duration || 0,
        executionType: exec.executionType,
        triggeredBy: exec.triggeredBy || 'Unknown',
        passedSteps: exec.executionReport?.passedSteps,
        totalSteps: exec.executionReport?.totalSteps,
      }));

      setExecutions(formattedExecutions);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching executions:', error);
      setLoading(false);
    }
  };

  const mapStatus = (status: string): 'running' | 'passed' | 'failed' | 'pending' | 'completed' => {
    const statusMap: Record<string, 'running' | 'passed' | 'failed' | 'pending' | 'completed'> = {
      running: 'running',
      completed: 'completed',
      failed: 'failed',
      pending: 'pending',
    };
    return statusMap[status] || 'pending';
  };

  const handleView = async (executionId: string) => {
    try {
      const execution = await playwrightApi.getExecution(executionId);
      setSelectedExecution(execution);
      setShowLivePanel(true);
    } catch (error) {
      console.error('Error fetching execution details:', error);
    }
  };

  const { showConfirm, showInfo, showError } = useAlert();

  const handleRerun = async (executionId: string) => {
    try {
      const execution = await playwrightApi.getExecution(executionId);
      
      // Extract test steps from execution (would need to be stored in execution)
      // For now, show a message
      showInfo('Rerun functionality - would restart the test with same parameters');
      
      // In a real implementation:
      // await playwrightApi.executeTest({...execution.configJson});
      // await fetchExecutions();
    } catch (error) {
      console.error('Error rerunning execution:', error);
    }
  };

  const handleDelete = async (executionId: string) => {
    const confirmed = await showConfirm(
      'Are you sure you want to delete this execution?',
      {
        title: 'Delete Execution',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        confirmVariant: 'danger',
      }
    );

    if (!confirmed) {
      return;
    }

    try {
      await playwrightApi.deleteExecution(executionId);
      await fetchExecutions();
    } catch (error) {
      console.error('Error deleting execution:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading executions...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Heading level={2}>Playwright Test Executions</Heading>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            View and manage your Playwright test executions with evidence, validation, and reports
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button onClick={fetchExecutions} variant="outline">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </Button>
        </div>
      </div>

      <TestExecutionTable
        executions={executions}
        onView={handleView}
        onRerun={handleRerun}
        onDelete={handleDelete}
      />

      {showLivePanel && selectedExecution && (
        <ExecutionDetailsPanel
          execution={selectedExecution}
          onClose={() => {
            setShowLivePanel(false);
            setSelectedExecution(null);
          }}
        />
      )}
    </div>
  );
};

interface ExecutionDetailsPanelProps {
  execution: PlaywrightExecution;
  onClose: () => void;
}

const ExecutionDetailsPanel: React.FC<ExecutionDetailsPanelProps> = ({
  execution,
  onClose,
}) => {
  const [evidence, setEvidence] = useState<any[]>([]);
  const [validation, setValidation] = useState<any>(null);
  const [report, setReport] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'evidence' | 'validation' | 'report'>('overview');

  useEffect(() => {
    fetchExecutionDetails();
  }, [execution.id]);

  const fetchExecutionDetails = async () => {
    try {
      const [evidenceData, validationData, reportData] = await Promise.all([
        playwrightApi.getEvidence(execution.id).catch(() => []),
        playwrightApi.getValidationResult(execution.id).catch(() => null),
        playwrightApi.getExecutionReport(execution.id).catch(() => null),
      ]);

      setEvidence(evidenceData);
      setValidation(validationData);
      setReport(reportData);
    } catch (error) {
      console.error('Error fetching execution details:', error);
    }
  };

  const screenshots = evidence.filter(e => e.evidenceType === 'screenshot').map((e, idx) => ({
    id: e.id,
    label: e.stepDescription || `Step ${e.stepNumber}`,
    url: e.dataUrl || '',
    timestamp: new Date(e.timestamp),
  }));

  const logs = evidence
    .filter(e => e.evidenceType === 'console')
    .map(e => `[${new Date(e.timestamp).toLocaleTimeString()}] ${e.stepDescription}`);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">{execution.executionName}</h2>
            <p className="text-sm text-blue-100">
              Execution ID: {execution.id.substring(0, 8)}...
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white dark:bg-gray-800 hover:bg-opacity-20 rounded-lg p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 bg-neutral-50 dark:bg-neutral-900">
          {(['overview', 'evidence', 'validation', 'report'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-6 py-3 text-sm font-semibold capitalize transition-colors ${
                activeTab === tab
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-neutral-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-4">
                  <p className="text-xs text-neutral-500 mb-1">Status</p>
                  <p className="text-lg font-semibold capitalize">{execution.status}</p>
                </div>
                <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-4">
                  <p className="text-xs text-neutral-500 mb-1">Duration</p>
                  <p className="text-lg font-semibold">
                    {execution.duration ? `${(execution.duration / 1000).toFixed(2)}s` : 'N/A'}
                  </p>
                </div>
                <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-4">
                  <p className="text-xs text-neutral-500 mb-1">Browser</p>
                  <p className="text-lg font-semibold capitalize">{execution.browserType}</p>
                </div>
                <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-4">
                  <p className="text-xs text-neutral-500 mb-1">Evidence Collected</p>
                  <p className="text-lg font-semibold">{evidence.length} items</p>
                </div>
              </div>

              {report && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Summary</h3>
                  <p className="text-sm text-blue-800 whitespace-pre-line">{report.summary}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'evidence' && (
            <div className="space-y-4">
              {screenshots.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {screenshots.map((screenshot) => (
                    <div key={screenshot.id} className="border rounded-lg overflow-hidden">
                      <img
                        src={screenshot.url}
                        alt={screenshot.label}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-3 bg-neutral-50 dark:bg-neutral-900">
                        <p className="text-sm font-medium">{screenshot.label}</p>
                        <p className="text-xs text-neutral-500">
                          {screenshot.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-neutral-500 py-8">No evidence collected</p>
              )}
            </div>
          )}

          {activeTab === 'validation' && (
            <div className="space-y-4">
              {validation ? (
                <>
                  <div className="flex items-center space-x-4">
                    <div className={`px-4 py-2 rounded-lg font-semibold ${
                      validation.overallStatus === 'passed' ? 'bg-green-100 text-green-800' :
                      validation.overallStatus === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {validation.overallStatus.toUpperCase()}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                      {validation.issuesFound} issue(s) found
                    </p>
                  </div>

                  {validation.issuesJson && validation.issuesJson.length > 0 && (
                    <div className="space-y-2">
                      {validation.issuesJson.map((issue: any, idx: number) => (
                        <div key={idx} className="border-l-4 border-red-500 bg-red-50 p-4 rounded">
                          <p className="font-semibold text-red-900">{issue.message}</p>
                          {issue.details && (
                            <p className="text-sm text-red-700 mt-1">{issue.details}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {validation.aiAnalysis && (
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h3 className="font-semibold text-purple-900 mb-2">AI Analysis</h3>
                      <p className="text-sm text-purple-800 whitespace-pre-line">
                        {validation.aiAnalysis}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-center text-neutral-500 py-8">No validation data available</p>
              )}
            </div>
          )}

          {activeTab === 'report' && (
            <div className="space-y-4">
              {report ? (
                <>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-green-700">{report.passedSteps}</p>
                      <p className="text-xs text-green-600">Passed</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-red-700">{report.failedSteps}</p>
                      <p className="text-xs text-red-600">Failed</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900 dark:bg-gray-900 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-gray-700">{report.skippedSteps}</p>
                      <p className="text-xs text-gray-600">Skipped</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-blue-700">{report.totalSteps}</p>
                      <p className="text-xs text-blue-600">Total</p>
                    </div>
                  </div>

                  {report.recommendationsJson && report.recommendationsJson.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">Recommendations</h3>
                      <div className="space-y-2">
                        {report.recommendationsJson.map((rec: any, idx: number) => (
                          <div key={idx} className="border-l-4 border-blue-500 bg-blue-50 p-3 rounded">
                            <p className="font-medium text-blue-900">{rec.message}</p>
                            {rec.details && (
                              <p className="text-sm text-blue-700 mt-1">{rec.details}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-center text-neutral-500 py-8">No report available</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaywrightExecutionView;
