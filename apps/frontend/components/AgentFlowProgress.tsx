import React from 'react';
import { Heading, Text, Card, CardContent } from './ui';

export interface AgentFlowStep {
  completed: boolean;
  timestamp?: string;
}

export interface AgentFlowProgress {
  intentParser: AgentFlowStep;
  testPlanner: AgentFlowStep;
  execution: AgentFlowStep;
  evidenceCollector: AgentFlowStep;
  diffValidation: AgentFlowStep;
  reportGenerator: AgentFlowStep;
}

interface AgentFlowProgressProps {
  agentFlow: AgentFlowProgress;
  currentStep?: string;
}

const steps = [
  { key: 'intentParser', label: 'Intent Parser', icon: '🔍', description: 'Analyzing your request' },
  { key: 'testPlanner', label: 'Test Planner', icon: '📋', description: 'Generating test plan' },
  { key: 'execution', label: 'Execution', icon: '🤖', description: 'Running Playwright tests' },
  { key: 'evidenceCollector', label: 'Evidence Collector', icon: '📸', description: 'Capturing screenshots & logs' },
  { key: 'diffValidation', label: 'Diff Validation', icon: '🔬', description: 'Comparing with history' },
  { key: 'reportGenerator', label: 'Report Generator', icon: '📊', description: 'Generating report' },
];

export default function AgentFlowProgressComponent({ agentFlow, currentStep }: AgentFlowProgressProps) {
  const calculateProgress = () => {
    const completedSteps = Object.values(agentFlow).filter(step => step.completed).length;
    return (completedSteps / 6) * 100;
  };

  const getStepStatus = (stepKey: string) => {
    const step = agentFlow[stepKey as keyof AgentFlowProgress];
    if (step.completed) return 'completed';
    if (currentStep === stepKey) return 'active';
    return 'pending';
  };

  const formatDuration = (timestamp?: string) => {
    if (!timestamp) return '';
    const duration = Date.now() - new Date(timestamp).getTime();
    if (duration < 1000) return `${duration}ms`;
    return `${(duration / 1000).toFixed(1)}s`;
  };

  return (
    <Card>
      <CardContent>
        <div className="flex items-center justify-between mb-6">
          <Heading level="h3">
            🚀 6-Agent Workflow Pipeline
          </Heading>
          <Text size="sm" color="text-gray-600 dark:text-gray-400">
            {Math.round(calculateProgress())}% Complete
          </Text>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-6">
          {/* Dynamic width based on runtime progress - inline style required */}
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${calculateProgress()}%` }}
          />
        </div>

        {/* Agent Steps */}
        <div className="space-y-3">
          {steps.map((stepConfig, index) => {
            const status = getStepStatus(stepConfig.key);
            const step = agentFlow[stepConfig.key as keyof AgentFlowProgress];

            return (
              <div
                key={stepConfig.key}
                className={`
                  flex items-start p-3 rounded-lg transition-all duration-300
                  ${status === 'completed' ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : ''}
                  ${status === 'active' ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 animate-pulse' : ''}
                  ${status === 'pending' ? 'bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 opacity-60' : ''}
                `}
              >
                {/* Status Icon */}
                <div className="flex-shrink-0 mr-3">
                  {status === 'completed' && (
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                      ✓
                    </div>
                  )}
                  {status === 'active' && (
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  {status === 'pending' && (
                    <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
                      {index + 1}
                    </div>
                  )}
                </div>

                {/* Step Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{stepConfig.icon}</span>
                      <Text
                        weight="medium"
                        color={
                          status === 'completed' ? 'text-green-700 dark:text-green-400' :
                          status === 'active' ? 'text-blue-700 dark:text-blue-400' :
                          'text-gray-500 dark:text-gray-400'
                        }
                      >
                        {stepConfig.label}
                      </Text>
                    </div>
                    {step.timestamp && (
                      <Text size="xs" color="text-gray-500 dark:text-gray-400">
                        {formatDuration(step.timestamp)} ago
                      </Text>
                    )}
                  </div>
                  <Text
                    size="sm"
                    className="mt-1"
                    color={
                      status === 'completed' ? 'text-green-600 dark:text-green-400' :
                      status === 'active' ? 'text-blue-600 dark:text-blue-400' :
                      'text-gray-400 dark:text-gray-500'
                    }
                  >
                    {status === 'completed' && '✅ '}
                    {status === 'active' && '🔄 '}
                    {status === 'pending' && '⏳ '}
                    {stepConfig.description}
                  </Text>
                </div>
              </div>
            );
          })}
        </div>

        {/* Completion Message */}
        {calculateProgress() === 100 && (
          <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🎉</span>
              <Text weight="medium" color="text-green-700 dark:text-green-400">
                Workflow completed successfully!
              </Text>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
