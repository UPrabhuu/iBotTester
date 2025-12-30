import React from 'react';
import { DashboardMetrics } from '@/types/project';

interface DashboardViewProps {
  metrics?: DashboardMetrics;
}

const DashboardView: React.FC<DashboardViewProps> = ({ metrics }) => {
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
      running: 'text-blue-600 bg-blue-50',
    };
    return colors[status as keyof typeof colors] || 'text-slate-600 bg-slate-50';
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
        <p className="text-sm text-slate-600 mt-1">E-commerce Testing Suite</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">Total Tests</span>
            <span className="text-2xl">📊</span>
          </div>
          <div className="text-3xl font-bold text-slate-800">{data.totalTests}</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">Pass Rate</span>
            <span className="text-2xl">✓</span>
          </div>
          <div className="text-3xl font-bold text-green-600">{data.passRate}%</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">Avg Duration</span>
            <span className="text-2xl">⏱️</span>
          </div>
          <div className="text-3xl font-bold text-slate-800">{formatDuration(data.avgDuration)}</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">Active Suites</span>
            <span className="text-2xl">📦</span>
          </div>
          <div className="text-3xl font-bold text-slate-800">{data.activeSuites}</div>
        </div>
      </div>

      {/* Execution Trends Chart (Simple Bar Chart) */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Test Execution Trends (Last 7 Days)</h3>
        <div className="space-y-3">
          {data.executionTrends.map((trend, index) => {
            const passPercentage = (trend.passed / trend.total) * 100;
            const failPercentage = (trend.failed / trend.total) * 100;
            return (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-16 text-sm text-slate-600 font-medium">{trend.date}</div>
                <div className="flex-1 h-8 bg-slate-100 rounded-lg overflow-hidden flex">
                  <div
                    className="bg-green-500 flex items-center justify-center text-xs text-white font-semibold"
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
                <div className="w-12 text-sm text-slate-600 text-right">{trend.total}</div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-center space-x-6 mt-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-slate-600">Passed</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-slate-600">Failed</span>
          </div>
        </div>
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Test Distribution (Pie Chart as List) */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Test Distribution</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm text-slate-700">Passed</span>
              </div>
              <span className="text-sm font-semibold text-slate-800">{data.testDistribution.passed}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-sm text-slate-700">Failed</span>
              </div>
              <span className="text-sm font-semibold text-slate-800">{data.testDistribution.failed}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span className="text-sm text-slate-700">Skipped</span>
              </div>
              <span className="text-sm font-semibold text-slate-800">{data.testDistribution.skipped}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-sm text-slate-700">Running</span>
              </div>
              <span className="text-sm font-semibold text-slate-800">{data.testDistribution.running}</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {data.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${getStatusColor(activity.status)}`}>
                  <span className="text-xs font-bold">{getStatusIcon(activity.status)}</span>
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{activity.testName}</p>
                  <p className="text-xs text-slate-500">{formatTimeAgo(activity.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Slowest Tests */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Slowest Tests</h3>
        <div className="space-y-2">
          {data.slowestTests.map((test, index) => (
            <div key={test.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-semibold text-slate-500">{index + 1}.</span>
                <span className="text-sm text-slate-800">{test.name}</span>
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
