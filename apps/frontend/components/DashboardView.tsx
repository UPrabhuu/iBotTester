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
    return colors[status as keyof typeof colors] || 'text-neutral-600 bg-neutral-50';
  };

  return (
    <div className="space-y-6">
      {/* Page Title and Selectors */}
      <div className="flex items-center justify-between">
        <div>
          <Heading level="h2">Dashboard</Heading>
          <Text size="sm" color="text-neutral-600" className="mt-1">
            {selectedProject?.description || 'E-commerce Testing Suite'}
          </Text>
        </div>
        <div className="flex items-center space-x-4">
          {/* Project Selector */}
          {projects && onProjectChange && selectedProject && (
            <Select
              value={selectedProject.id}
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Text size="sm" weight="medium" color="text-neutral-600">Total Tests</Text>
              <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-neutral-900">{data.totalTests}</div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Text size="sm" weight="medium" color="text-neutral-600">Pass Rate</Text>
              <span className="text-2xl">✓</span>
            </div>
            <div className="text-3xl font-bold text-green-600">{data.passRate}%</div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Text size="sm" weight="medium" color="text-neutral-600">Avg Duration</Text>
              <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-neutral-900">{formatDuration(data.avgDuration)}</div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Text size="sm" weight="medium" color="text-neutral-600">Active Suites</Text>
              <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-neutral-900">{data.activeSuites}</div>
          </CardContent>
        </Card>
      </div>

      {/* Execution Trends Chart (Simple Bar Chart) */}
      <Card>
        <CardContent className="p-6">
          <Heading level="h3" className="mb-4">Test Execution Trends (Last 7 Days)</Heading>
          <div className="space-y-3">
            {data.executionTrends.map((trend, index) => {
              const passPercentage = (trend.passed / trend.total) * 100;
              const failPercentage = (trend.failed / trend.total) * 100;
              return (
                <div key={index} className="flex items-center space-x-3">
                  <Text size="sm" weight="medium" className="w-16" color="text-neutral-600">{trend.date}</Text>
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
                  <Text size="sm" className="w-12 text-right" color="text-neutral-600">{trend.total}</Text>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-center space-x-6 mt-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-primary-500 rounded"></div>
              <Text size="sm" color="text-neutral-600">Passed</Text>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <Text size="sm" color="text-neutral-600">Failed</Text>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Test Distribution (Pie Chart as List) */}
        <Card>
          <CardContent className="p-6">
            <Heading level="h3" className="mb-4">Test Distribution</Heading>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-primary-500 rounded"></div>
                  <Text size="sm" color="text-neutral-700">Passed</Text>
                </div>
                <Text size="sm" weight="semibold">{data.testDistribution.passed}</Text>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <Text size="sm" color="text-neutral-700">Failed</Text>
                </div>
                <Text size="sm" weight="semibold">{data.testDistribution.failed}</Text>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <Text size="sm" color="text-neutral-700">Skipped</Text>
                </div>
                <Text size="sm" weight="semibold">{data.testDistribution.skipped}</Text>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-primary-400 rounded"></div>
                  <Text size="sm" color="text-neutral-700">Running</Text>
                </div>
                <Text size="sm" weight="semibold" color="text-neutral-800">{data.testDistribution.running}</Text>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardContent className="p-6">
            <Heading level="h3" className="mb-4">Recent Activity</Heading>
            <div className="space-y-3">
              {data.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${getStatusColor(activity.status)}`}>
                    <span className="text-xs font-bold">{getStatusIcon(activity.status)}</span>
                  </span>
                  <div className="flex-1 min-w-0">
                    <Text size="sm" weight="medium" className="truncate">{activity.testName}</Text>
                    <Text size="xs" color="text-neutral-500">{formatTimeAgo(activity.timestamp)}</Text>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Slowest Tests */}
      <Card>
        <CardContent className="p-6">
          <Heading level="h3" className="mb-4">Slowest Tests</Heading>
          <div className="space-y-2">
            {data.slowestTests.map((test, index) => (
              <div key={test.id} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                <div className="flex items-center space-x-3">
                  <Text size="sm" weight="semibold" color="text-neutral-500">{index + 1}.</Text>
                  <Text size="sm">{test.name}</Text>
                </div>
                <Text size="sm" weight="semibold" className="text-orange-600">{formatDuration(test.duration)}</Text>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardView;
