import React from 'react';
import { DashboardMetrics, Project } from '@/types/project';
import { Card, CardHeader, CardTitle, CardContent, Heading, Text, Badge, Select } from './ui';

interface DashboardViewProps {
  metrics?: DashboardMetrics;
  selectedProject?: Project;
  onBranchChange?: (branchId: string) => void;
  projects?: Project[];
  onProjectChange?: (projectId: string) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ 
  metrics, 
  selectedProject, 
  onBranchChange,
  projects,
  onProjectChange,
}) => {
  // Default mock data if no metrics provided
  const defaultMetrics: DashboardMetrics = {
    totalTests: 245,
    passRate: 94.2,
    avgDuration: 45300,
    activeSuites: 12,
    executionTrends: [
      { date: '12/23', passed: 20, failed: 2, total: 22 },
      { date: '12/24', passed: 18, failed: 3, total: 21 },
      { date: '12/25', passed: 22, failed: 1, total: 23 },
      { date: '12/26', passed: 25, failed: 2, total: 27 },
      { date: '12/27', passed: 23, failed: 1, total: 24 },
      { date: '12/28', passed: 28, failed: 2, total: 30 },
      { date: '12/29', passed: 26, failed: 1, total: 27 },
    ],
    recentActivity: [
      { id: '1', testName: 'Login test', status: 'passed', timestamp: new Date(Date.now() - 120000), duration: 15000 },
      { id: '2', testName: 'Checkout flow', status: 'failed', timestamp: new Date(Date.now() - 300000), duration: 42000 },
      { id: '3', testName: 'Product search', status: 'passed', timestamp: new Date(Date.now() - 600000), duration: 18000 },
      { id: '4', testName: 'User registration', status: 'passed', timestamp: new Date(Date.now() - 900000), duration: 22000 },
    ],
    slowestTests: [
      { id: '1', name: 'Payment Flow', duration: 125000 },
      { id: '2', name: 'Full Checkout', duration: 98000 },
      { id: '3', name: 'User Registration', duration: 76000 },
      { id: '4', name: 'Product Search & Filter', duration: 54000 },
    ],
    testDistribution: {
      passed: 230,
      failed: 12,
      skipped: 3,
      running: 0,
    },
  };

  const data = metrics || defaultMetrics;

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      passed: '✓',
      failed: '✗',
      running: '⚡',
    };
    return icons[status as keyof typeof icons] || '○';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      passed: 'text-green-600 bg-green-50',
      failed: 'text-red-600 bg-red-50',
      running: 'text-primary-600 bg-blue-50',
    };
    return colors[status as keyof typeof colors] || 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800';
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg">
      {/* Page Header with Quick Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 mt-1">
            {selectedProject?.name || 'All Projects'} • Real-time testing insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Project Selector */}
          {projects && projects.length > 0 && onProjectChange && (
            <Select
              value={selectedProject?.id || ''}
              onChange={(e) => onProjectChange(e.target.value)}
              label="Project"
              size="sm"
              fullWidth={false}
              className="min-w-[180px]"
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </Select>
          )}
          
          {/* Branch Selector */}
          {selectedProject && onBranchChange && (
            <Select
              value={selectedProject.currentBranch}
              onChange={(e) => onBranchChange(e.target.value)}
              label="Branch"
              size="sm"
              fullWidth={false}
              className="min-w-[180px]"
            >
              {selectedProject.branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                  {branch.isDefault ? ' (default)' : ''}
                </option>
              ))}
            </Select>
          )}
        </div>
      </div>

      {/* KPI Cards - Enhanced Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Tests Card */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">Total</span>
          </div>
          <div className="text-4xl font-bold mb-1">{data.totalTests}</div>
          <div className="text-sm text-blue-100">Test Cases</div>
          <div className="mt-3 flex items-center text-xs">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
            </svg>
            <span className="text-blue-100">+{Math.floor(data.totalTests * 0.12)} this week</span>
          </div>
        </div>

        {/* Pass Rate Card */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="w-16 h-16 relative">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="32" cy="32" r="28" stroke="white" strokeOpacity="0.2" strokeWidth="6" fill="none" />
                <circle 
                  cx="32" 
                  cy="32" 
                  r="28" 
                  stroke="white" 
                  strokeWidth="6" 
                  fill="none"
                  strokeDasharray={`${(data.passRate / 100) * 175.93} 175.93`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold">{Math.round(data.passRate)}%</span>
              </div>
            </div>
          </div>
          <div className="text-4xl font-bold mb-1">{data.passRate.toFixed(1)}%</div>
          <div className="text-sm text-green-100">Pass Rate</div>
          <div className="mt-3 flex items-center text-xs text-green-100">
            {data.passRate >= 90 ? '🎯 Excellent!' : data.passRate >= 75 ? '👍 Good' : '⚠️ Needs improvement'}
          </div>
        </div>

        {/* Average Duration Card */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">Avg</span>
          </div>
          <div className="text-4xl font-bold mb-1">{formatDuration(data.avgDuration)}</div>
          <div className="text-sm text-purple-100">Execution Time</div>
          <div className="mt-3 flex items-center text-xs">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-purple-100">15% faster than last week</span>
          </div>
        </div>

        {/* Active Tests Card */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-white dark:bg-gray-800 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium">Live</span>
            </div>
          </div>
          <div className="text-4xl font-bold mb-1">{data.testDistribution.running}</div>
          <div className="text-sm text-orange-100">Running Now</div>
          <div className="mt-3 text-xs text-orange-100">
            {data.activeSuites} active test suites
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Test Distribution - Donut Chart Simulation */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Test Distribution</h3>
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-48 h-48">
              {/* Donut Chart Simulation */}
              <svg className="w-full h-full transform -rotate-90">
                {(() => {
                  const total = data.testDistribution.passed + data.testDistribution.failed + data.testDistribution.skipped;
                  const passedPercent = total > 0 ? (data.testDistribution.passed / total) * 100 : 0;
                  const failedPercent = total > 0 ? (data.testDistribution.failed / total) * 100 : 0;
                  const skippedPercent = total > 0 ? (data.testDistribution.skipped / total) * 100 : 0;
                  
                  const circumference = 2 * Math.PI * 70;
                  const passedLength = (passedPercent / 100) * circumference;
                  const failedLength = (failedPercent / 100) * circumference;
                  const skippedLength = (skippedPercent / 100) * circumference;
                  
                  return (
                    <>
                      <circle cx="96" cy="96" r="70" fill="none" stroke="#E5E7EB" strokeWidth="24" />
                      <circle 
                        cx="96" 
                        cy="96" 
                        r="70" 
                        fill="none" 
                        stroke="#10B981" 
                        strokeWidth="24" 
                        strokeDasharray={`${passedLength} ${circumference}`}
                        strokeLinecap="round"
                      />
                      <circle 
                        cx="96" 
                        cy="96" 
                        r="70" 
                        fill="none" 
                        stroke="#EF4444" 
                        strokeWidth="24" 
                        strokeDasharray={`${failedLength} ${circumference}`}
                        strokeDashoffset={-passedLength}
                        strokeLinecap="round"
                      />
                      <circle 
                        cx="96" 
                        cy="96" 
                        r="70" 
                        fill="none" 
                        stroke="#F59E0B" 
                        strokeWidth="24" 
                        strokeDasharray={`${skippedLength} ${circumference}`}
                        strokeDashoffset={-(passedLength + failedLength)}
                        strokeLinecap="round"
                      />
                    </>
                  );
                })()}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {data.testDistribution.passed + data.testDistribution.failed + data.testDistribution.skipped}
                </div>
                <div className="text-xs text-gray-500">Total Tests</div>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">Passed</span>
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{data.testDistribution.passed}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">Failed</span>
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{data.testDistribution.failed}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">Skipped</span>
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{data.testDistribution.skipped}</span>
            </div>
          </div>
        </div>

        {/* Recent Activity - Enhanced */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Test Executions</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All →</button>
          </div>
          <div className="space-y-3">
            {data.recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500">No recent test executions</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 dark:text-gray-400 mt-1">Run your first test to see activity here</p>
              </div>
            ) : (
              data.recentActivity.slice(0, 6).map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800 dark:bg-gray-900 rounded-lg transition-colors">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    activity.status === 'passed' ? 'bg-green-100' :
                    activity.status === 'failed' ? 'bg-red-100' : 'bg-blue-100'
                  }`}>
                    {activity.status === 'passed' && (
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {activity.status === 'failed' && (
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                    {activity.status === 'running' && (
                      <svg className="w-5 h-5 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{activity.testName}</p>
                    <p className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp)} • {formatDuration(activity.duration || 0)}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    activity.status === 'passed' ? 'bg-green-100 text-green-700' :
                    activity.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">⚡ Performance Insights</h3>
          <span className="text-xs text-gray-500">Last 30 days</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200/50 dark:border-blue-800/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Fastest Test</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {data.slowestTests.length > 0 ? formatDuration(Math.min(...data.slowestTests.map(t => t.duration))) : 'N/A'}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Execution speed champion 🏆</p>
          </div>
          
          <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-4 border border-orange-200/50 dark:border-orange-800/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Needs Attention</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{data.testDistribution.failed}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Failed tests requiring review</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200/50 dark:border-green-800/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Success Rate</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(data.passRate)}%</div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Overall test reliability</p>
          </div>
        </div>
      </div>

      {/* Slowest Tests - Redesigned */}
      {data.slowestTests.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">🐌 Slowest Tests</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Optimize these tests to improve overall execution time</p>
            </div>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">Optimize →</button>
          </div>
          <div className="space-y-2">
            {data.slowestTests.map((test, index) => {
              const maxDuration = Math.max(...data.slowestTests.map(t => t.duration));
              const widthPercent = (test.duration / maxDuration) * 100;
              return (
                <div key={test.id} className="group hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800 dark:bg-gray-900 p-3 rounded-lg transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3 flex-1">
                      <span className="flex-shrink-0 w-6 h-6 bg-gray-100 dark:bg-gray-700 group-hover:bg-orange-100 rounded-full flex items-center justify-center text-xs font-semibold text-gray-600 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 group-hover:text-orange-600 transition-colors">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{test.name}</span>
                    </div>
                    <span className="text-sm font-bold text-orange-600 ml-4">{formatDuration(test.duration)}</span>
                  </div>
                  <div className="ml-9">
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      {/* Dynamic width based on runtime duration - inline style required */}
                      <div 
                        className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full transition-all duration-500"
                        style={{ width: `${widthPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardView;
