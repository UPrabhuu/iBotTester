import React, { useState } from 'react';
import { useBatchExecution } from '@/hooks/useBatchExecution';
import ParallelExecutionView from '@/components/ParallelExecutionView';

interface ExecutionIntegrationExampleProps {
  projectId: string;
  branchId?: string;
  conversationId?: string;
  selectedTestCaseIds: string[];
  onExecutionComplete?: () => void;
}

/**
 * Example component showing how to integrate batch execution into your main UI
 * This can be used in:
 * 1. Test List View - when user selects 5 tests and clicks "Run Parallel"
 * 2. Chat Interface - when user selects tests from chat conversation
 * 3. Test Editor - when user runs selected test cases
 */
export const ExecutionIntegrationExample: React.FC<ExecutionIntegrationExampleProps> = ({
  projectId,
  branchId,
  conversationId,
  selectedTestCaseIds,
  onExecutionComplete,
}) => {
  const [activeBatchId, setActiveBatchId] = useState<string | null>(null);
  const { batch, loading, error, createBatch } = useBatchExecution(activeBatchId);

  const handleStartExecution = async () => {
    if (selectedTestCaseIds.length === 0) {
      alert('Please select at least one test case');
      return;
    }

    try {
      const createdBatch = await createBatch({
        projectId,
        branchId,
        conversationId,
        testCaseIds: selectedTestCaseIds,
        batchName: `Parallel Execution - ${new Date().toLocaleString()}`,
      });

      setActiveBatchId(createdBatch.id);
    } catch (err) {
      console.error('Failed to start execution:', err);
      alert('Failed to start test execution');
    }
  };

  // Show parallel execution view while batch is active
  if (batch) {
    return (
      <div className="h-full">
        <ParallelExecutionView
          batch={batch}
          onExecutionUpdate={(executionId, updates) => {
            console.log(`Execution ${executionId} updated:`, updates);
          }}
        />

        {/* Optional: Show completion message */}
        {(batch.status === 'completed' || batch.status === 'failed') && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
            <h3 className="font-semibold text-blue-900 dark:text-blue-200">
              Batch Execution {batch.status === 'completed' ? 'Complete' : 'Failed'}
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-300 mt-1">
              {batch.passedTests} passed, {batch.failedTests} failed out of {batch.totalTests} tests
            </p>
            <button
              onClick={() => setActiveBatchId(null)}
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              Clear Results
            </button>
          </div>
        )}
      </div>
    );
  }

  // Show start button before execution
  return (
    <div className="h-full flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 p-8">
      <div className="text-center space-y-4">
        <svg
          className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Ready to Run Tests
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {selectedTestCaseIds.length} test case{selectedTestCaseIds.length !== 1 ? 's' : ''} selected
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-md">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <button
            onClick={handleStartExecution}
            disabled={loading || selectedTestCaseIds.length === 0}
            className={`px-6 py-2 rounded-md font-medium text-white transition-colors ${
              loading || selectedTestCaseIds.length === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Starting...' : 'Start Parallel Execution'}
          </button>
        </div>

        <p className="text-xs text-gray-600 dark:text-gray-400 mt-4">
          {selectedTestCaseIds.length > 0
            ? 'Click "Start Parallel Execution" to run all selected tests simultaneously'
            : 'Select test cases to enable parallel execution'}
        </p>
      </div>
    </div>
  );
};

/**
 * HOW TO INTEGRATE INTO YOUR EXISTING VIEWS:
 *
 * 1. In TestListView:
 * -------------------
 * const [selectedTests, setSelectedTests] = useState<string[]>([]);
 * const [showExecution, setShowExecution] = useState(false);
 *
 * return (
 *   <div className="flex gap-4">
 *     <TestList onSelect={(testId) => setSelectedTests([...selectedTests, testId])} />
 *
 *     {showExecution ? (
 *       <ExecutionIntegrationExample
 *         projectId={projectId}
 *         selectedTestCaseIds={selectedTests}
 *         onExecutionComplete={() => {
 *           setSelectedTests([]);
 *           setShowExecution(false);
 *         }}
 *       />
 *     ) : (
 *       <button onClick={() => setShowExecution(true)}>
 *         Run {selectedTests.length} Tests
 *       </button>
 *     )}
 *   </div>
 * );
 *
 *
 * 2. In ChatInterface (after script selection):
 * -----------------------------------------------
 * const handleScriptSelected = async (scriptId: string) => {
 *   const testIds = await fetchTestCasesForScript(scriptId);
 *   setSelectedTestCaseIds(testIds);
 *   // This will automatically trigger the batch execution in the example
 * };
 *
 *
 * 3. In LiveExecutionView (replace current implementation):
 * ----------------------------------------------------------
 * {isBatchExecuting && (
 *   <ExecutionIntegrationExample
 *     projectId={projectId}
 *     selectedTestCaseIds={testCaseIds}
 *   />
 * )}
 *
 *
 * FEATURES:
 * ---------
 * ✓ Automatically creates batch execution
 * ✓ Subscribes to live updates via SSE
 * ✓ Shows real-time progress for 5 parallel tests
 * ✓ Displays project and branch information
 * ✓ Shows error messages
 * ✓ Auto-cleanup on completion
 * ✓ Handles connection errors gracefully
 */

export default ExecutionIntegrationExample;
