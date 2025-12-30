import React from 'react';
import { DashboardMetrics, Project } from '@/types/project';

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
    return colors[status as keyof typeof colors] || 'text-neutral-600 bg-neutral-50';
  };

  return (
    <div className="space-y-6">
      {/* Page Title and Selectors */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-neutral-900">Dashboard</h2>
          <p className="text-sm text-neutral-600 mt-1">
            {selectedProject?.description || 'E-commerce Testing Suite'}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Project Selector */}
          {projects && onProjectChange && selectedProject && (
            <div className="flex items-center space-x-2">
              <label className="text-sm font-semibold text-neutral-700">Project:</label>
              <select
                value={selectedProject.id}
                onChange={(e) => onProjectChange(e.target.value)}
                className="px-4 py-2 bg-white border border-neutral-300 rounded-xl text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-400 cursor-pointer hover:border-primary-300 transition-smooth shadow-soft min-w-[180px]"
              >
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {/* Branch Selector */}
          {selectedProject && onBranchChange && (
            <div className="flex items-center space-x-2">
              <label className="text-sm font-semibold text-neutral-700">Branch:</label>
              <select
                value={selectedProject.currentBranch}
                onChange={(e) => onBranchChange(e.target.value)}
                className="px-4 py-2 bg-white border border-neutral-300 rounded-xl text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-400 cursor-pointer hover:border-primary-300 transition-smooth shadow-soft min-w-[180px]"
              >
                {selectedProject.branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                    {branch.isDefault ? ' (default)' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow-soft border border-neutral-200 p-6 hover:shadow-medium transition-smooth card-hover">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-neutral-600">Total Tests</span>
            <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div className="text-3xl font-bold text-neutral-900">{data.totalTests}</div>
        </div>

        <div className="bg-white rounded-2xl shadow-soft border border-neutral-200 p-6 hover:shadow-medium transition-smooth card-hover">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-neutral-600">Pass Rate</span>
            <span className="text-2xl">✓</span>
          </div>
          <div className="text-3xl font-bold text-green-600">{data.passRate}%</div>
        </div>

        <div className="bg-white rounded-2xl shadow-soft border border-neutral-200 p-6 hover:shadow-medium transition-smooth card-hover">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-neutral-600">Avg Duration</span>
            <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-3xl font-bold text-neutral-900">{formatDuration(data.avgDuration)}</div>
        </div>

        <div className="bg-white rounded-2xl shadow-soft border border-neutral-200 p-6 hover:shadow-medium transition-smooth card-hover">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-neutral-600">Active Suites</span>
            <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div className="text-3xl font-bold text-neutral-900">{data.activeSuites}</div>
        </div>
      </div>

      {/* Execution Trends Chart (Simple Bar Chart) */}
      <div className="bg-white rounded-2xl shadow-soft border border-neutral-200 p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Test Execution Trends (Last 7 Days)</h3>
        <div className="space-y-3">
          {data.executionTrends.map((trend, index) => {
            const passPercentage = (trend.passed / trend.total) * 100;
            const failPercentage = (trend.failed / trend.total) * 100;
            return (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-16 text-sm text-neutral-600 font-medium">{trend.date}</div>
                <div className="flex-1 h-8 bg-neutral-100 rounded-lg overflow-hidden flex">
                  <div
                    className="bg-primary-500 flex items-center justify-center text-xs text-white font-semibold"
                    style={{ width: `${passPercentage}%` }}
                  >
                    {trend.passed > 0 && trend.passed}
                  </div>
                  <div
                    className="bg-red-500 flex items-center justify-center text-xs text-white font-semibold"
                    style={{ width: `${failPercentage}%` }}
                  >
                    {trend.failed > 0 && trend.failed}
                  </div>
                </div>
                <div className="w-12 text-sm text-neutral-600 text-right">{trend.total}</div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-center space-x-6 mt-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-primary-500 rounded"></div>
            <span className="text-neutral-600">Passed</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-neutral-600">Failed</span>
          </div>
        </div>
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Test Distribution (Pie Chart as List) */}
        <div className="bg-white rounded-2xl shadow-soft border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Test Distribution</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-primary-500 rounded"></div>
                <span className="text-sm text-neutral-700">Passed</span>
              </div>
              <span className="text-sm font-semibold text-neutral-900">{data.testDistribution.passed}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-sm text-neutral-700">Failed</span>
              </div>
              <span className="text-sm font-semibold text-neutral-900">{data.testDistribution.failed}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span className="text-sm text-neutral-700">Skipped</span>
              </div>
              <span className="text-sm font-semibold text-neutral-900">{data.testDistribution.skipped}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-primary-400 rounded"></div>
                <span className="text-sm text-neutral-700">Running</span>
              </div>
              <span className="text-sm font-semibold text-neutral-800">{data.testDistribution.running}</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold text-neutral-800 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {data.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${getStatusColor(activity.status)}`}>
                  <span className="text-xs font-bold">{getStatusIcon(activity.status)}</span>
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-800 truncate">{activity.testName}</p>
                  <p className="text-xs text-neutral-500">{formatTimeAgo(activity.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Slowest Tests */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">Slowest Tests</h3>
        <div className="space-y-2">
          {data.slowestTests.map((test, index) => (
            <div key={test.id} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-semibold text-neutral-500">{index + 1}.</span>
                <span className="text-sm text-neutral-800">{test.name}</span>
              </div>
              <span className="text-sm font-semibold text-orange-600">{formatDuration(test.duration)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
