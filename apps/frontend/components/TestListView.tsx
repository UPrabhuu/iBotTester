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
              className="pl-10 pr-4 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm w-64"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value as typeof sortBy)}
            className="px-4 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm bg-white cursor-pointer"
          >
            <option value="name">Sort by Name</option>
            <option value="created">Sort by Created Date</option>
            <option value="modified">Sort by Last Modified</option>
            <option value="status">Sort by Status</option>
          </select>

          <button
            onClick={() => handleSortChange(sortBy)}
            className="px-3 py-2 border border-neutral-300 rounded-xl hover:bg-neutral-50 transition-smooth"
            title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>

        {/* Open All Button */}
        <button
          onClick={onOpenAllTestCases}
          disabled={testCases.length === 0}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-smooth font-medium text-sm"
        >
          Open All Test Cases
        </button>
      </div>

      {/* Test Cases List */}
      <div className="bg-white rounded-2xl shadow-soft border border-neutral-200 overflow-hidden">
        {filteredAndSortedTestCases.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-neutral-700">
                {searchTerm ? 'No test cases found' : 'No test cases yet'}
              </p>
              <p className="text-xs text-neutral-500">
                {searchTerm ? 'Try a different search term' : 'Create test cases to get started'}
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-neutral-200">
            {filteredAndSortedTestCases.map((testCase) => (
              <div
                key={testCase.id}
                className="px-6 py-4 hover:bg-neutral-50 transition-smooth cursor-pointer"
                onClick={() => onOpenTestCase(testCase.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-sm font-semibold text-neutral-900">
                        {testCase.name}
                      </h3>
                      {getStatusBadge(testCase.status)}
                      <span className="text-xs text-neutral-500">
                        {testCase.steps.length} steps
                      </span>
                    </div>
                    {testCase.description && (
                      <p className="text-sm text-neutral-600 mb-2">
                        {testCase.description}
                      </p>
                    )}
                    <div className="flex items-center space-x-4 text-xs text-neutral-500">
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
                      className="px-3 py-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-smooth"
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
        <div className="text-sm text-neutral-600 text-center">
          Showing {filteredAndSortedTestCases.length} of {testCases.length} test cases
        </div>
      )}
    </div>
  );
};

export default TestListView;
