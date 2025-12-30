import React, { useState } from 'react';
import { TestCase } from '@/types/project';

interface TestListViewProps {
  testCases: TestCase[];
  onOpenTestCase: (testCaseId: string) => void;
  onOpenAllTestCases: () => void;
}

const TestListView: React.FC<TestListViewProps> = ({
  testCases,
  onOpenTestCase,
  onOpenAllTestCases,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'modified' | 'status'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const filteredAndSortedTestCases = testCases
    .filter((testCase) =>
      testCase.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      testCase.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'created':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'modified':
          comparison = new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime();
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const getStatusBadge = (status: TestCase['status']) => {
    const badges = {
      active: 'bg-green-100 text-green-700 border border-green-300',
      inactive: 'bg-gray-100 text-gray-600 border border-gray-300',
      draft: 'bg-yellow-100 text-yellow-700 border border-yellow-300',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badges[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleSortChange = (newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search test cases..."
              className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-64"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              🔍
            </span>
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value as typeof sortBy)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white cursor-pointer"
          >
            <option value="name">Sort by Name</option>
            <option value="created">Sort by Created Date</option>
            <option value="modified">Sort by Last Modified</option>
            <option value="status">Sort by Status</option>
          </select>

          <button
            onClick={() => handleSortChange(sortBy)}
            className="px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>

        {/* Open All Button */}
        <button
          onClick={onOpenAllTestCases}
          disabled={testCases.length === 0}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-500 hover:to-purple-500 disabled:from-slate-400 disabled:to-slate-400 disabled:cursor-not-allowed transition-all shadow-md font-semibold text-sm"
        >
          Open All Test Cases
        </button>
      </div>

      {/* Test Cases List */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        {filteredAndSortedTestCases.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="text-4xl">📝</div>
              <p className="text-sm font-medium text-slate-600">
                {searchTerm ? 'No test cases found' : 'No test cases yet'}
              </p>
              <p className="text-xs text-slate-500">
                {searchTerm ? 'Try a different search term' : 'Create test cases to get started'}
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {filteredAndSortedTestCases.map((testCase) => (
              <div
                key={testCase.id}
                className="px-6 py-4 hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => onOpenTestCase(testCase.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-sm font-semibold text-slate-800">
                        {testCase.name}
                      </h3>
                      {getStatusBadge(testCase.status)}
                      <span className="text-xs text-slate-500">
                        {testCase.steps.length} steps
                      </span>
                    </div>
                    {testCase.description && (
                      <p className="text-sm text-slate-600 mb-2">
                        {testCase.description}
                      </p>
                    )}
                    <div className="flex items-center space-x-4 text-xs text-slate-500">
                      <span>Created: {formatDate(testCase.createdAt)}</span>
                      <span>Modified: {formatDate(testCase.lastModified)}</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenTestCase(testCase.id);
                      }}
                      className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      Open →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Results Count */}
      {testCases.length > 0 && (
        <div className="text-sm text-slate-600 text-center">
          Showing {filteredAndSortedTestCases.length} of {testCases.length} test cases
        </div>
      )}
    </div>
  );
};

export default TestListView;
