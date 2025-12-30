import React, { useState, useMemo } from 'react';
import { TestCase } from '@/types/project';

interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  color?: string;
  createdAt: Date;
}

interface TestListViewProps {
  testCases: TestCase[];
  onOpenTestCase: (testCaseId: string) => void;
  onOpenAllTestCases: () => void;
  onCreateNewTest?: () => void;
}

const TestListView: React.FC<TestListViewProps> = ({
  testCases,
  onOpenTestCase,
  onOpenAllTestCases,
  onCreateNewTest,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'modified' | 'status'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [folders, setFolders] = useState<Folder[]>([
    { id: 'smoke-tests', name: 'Smoke Tests', parentId: null, color: '#10B981', createdAt: new Date() },
    { id: 'regression', name: 'Regression Suite', parentId: null, color: '#3B82F6', createdAt: new Date() },
    { id: 'critical', name: 'Critical Flows', parentId: null, color: '#EF4444', createdAt: new Date() },
  ]);
  const [testFolderMap, setTestFolderMap] = useState<Record<string, string>>({});
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedTests, setSelectedTests] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'draft'>('all');
  const [activeContentTab, setActiveContentTab] = useState<'folders' | 'tests'>('tests');

  // Get current folder breadcrumbs
  const breadcrumbs = useMemo(() => {
    const path: Folder[] = [];
    let currentId = currentFolderId;
    
    while (currentId) {
      const folder = folders.find(f => f.id === currentId);
      if (!folder) break;
      path.unshift(folder);
      currentId = folder.parentId;
    }
    
    return path;
  }, [currentFolderId, folders]);

  // Get tests and subfolders in current folder
  const currentFolderItems = useMemo(() => {
    const testsInFolder = testCases.filter(test => {
      const testFolder = testFolderMap[test.id];
      // Show tests that belong to current folder
      // Or tests without a folder when at root (currentFolderId === null)
      if (currentFolderId === null) {
        return testFolder === null || testFolder === undefined;
      }
      return testFolder === currentFolderId;
    });
    
    const subfoldersInFolder = folders.filter(folder => 
      folder.parentId === currentFolderId
    );
    
    return { tests: testsInFolder, folders: subfoldersInFolder };
  }, [testCases, folders, currentFolderId, testFolderMap]);

  const filteredAndSortedTestCases = useMemo(() => {
    return currentFolderItems.tests
      .filter((testCase) => {
        const matchesSearch = testCase.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          testCase.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || testCase.status === filterStatus;
        return matchesSearch && matchesStatus;
      })
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
  }, [currentFolderItems.tests, searchTerm, filterStatus, sortBy, sortOrder]);


  const getStatusBadge = (status: TestCase['status']) => {
    const badges = {
      active: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      inactive: 'bg-slate-50 text-slate-600 border border-slate-200',
      draft: 'bg-amber-50 text-amber-700 border border-amber-200',
    };

    const icons = {
      active: (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
      inactive: (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
        </svg>
      ),
      draft: (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      ),
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${badges[status]}`}>
        {icons[status]}
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

  const createFolder = () => {
    if (!newFolderName.trim()) return;
    
    const newFolder: Folder = {
      id: `folder-${Date.now()}`,
      name: newFolderName,
      parentId: currentFolderId,
      color: '#6366F1',
      createdAt: new Date(),
    };
    
    setFolders([...folders, newFolder]);
    setNewFolderName('');
    setShowCreateFolder(false);
  };

  const moveTestsToFolder = (folderId: string | null) => {
    const newMap = { ...testFolderMap };
    selectedTests.forEach(testId => {
      if (folderId === null) {
        delete newMap[testId];
      } else {
        newMap[testId] = folderId;
      }
    });
    setTestFolderMap(newMap);
    setSelectedTests(new Set());
  };

  const toggleTestSelection = (testId: string) => {
    const newSelection = new Set(selectedTests);
    if (newSelection.has(testId)) {
      newSelection.delete(testId);
    } else {
      newSelection.add(testId);
    }
    setSelectedTests(newSelection);
  };

  const getTestCountInFolder = (folderId: string): number => {
    let count = 0;
    // Direct tests in folder
    count += Object.entries(testFolderMap).filter(([_, folId]) => folId === folderId).length;
    
    // Tests in subfolders
    const subfolders = folders.filter(f => f.parentId === folderId);
    subfolders.forEach(subfolder => {
      count += getTestCountInFolder(subfolder.id);
    });
    
    return count;
  };



  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 to-blue-50/30">
      {/* Top Navigation Bar - Modern Design */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/60 px-8 py-5 flex-shrink-0 shadow-sm">
        <div className="flex items-center justify-between">
          {/* Left Section: Breadcrumb & Title */}
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Test List</h1>
                <p className="text-sm text-gray-500 mt-0.5">Organize and manage your test</p>
              </div>
            </div>

            {/* Breadcrumb Navigation */}
            {breadcrumbs.length > 0 && (
              <div className="flex items-center gap-2 ml-4 pl-4 border-l border-gray-300">
                <button
                  onClick={() => setCurrentFolderId(null)}
                  className="text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-2.5 py-1 rounded-lg transition-all"
                >
                  All Tests
                </button>
                {breadcrumbs.map((folder, index) => (
                  <React.Fragment key={folder.id}>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    {index === breadcrumbs.length - 1 ? (
                      <span className="text-sm text-gray-900 font-semibold px-2.5 py-1 bg-blue-50 rounded-lg">
                        {folder.name}
                      </span>
                    ) : (
                      <button
                        onClick={() => setCurrentFolderId(folder.id)}
                        className="text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-2.5 py-1 rounded-lg transition-all"
                      >
                        {folder.name}
                      </button>
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>

          {/* Right Section: Actions */}
          <div className="flex items-center gap-3">
            {selectedTests.size > 0 && (
              <div className="flex items-center gap-3 mr-2 px-4 py-2 bg-blue-50 rounded-xl border border-blue-200/60 shadow-sm">
                <span className="text-sm text-blue-700 font-semibold">{selectedTests.size} selected</span>
                <button
                  onClick={() => setSelectedTests(new Set())}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 p-1 rounded-md transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {onCreateNewTest && (
              <button
                onClick={onCreateNewTest}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 flex items-center gap-2 group"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                New Test
              </button>
            )}
          </div>
        </div>

        {/* Search and Filters Row */}
        <div className="flex items-center gap-3 mt-5">
          {/* Search */}
          <div className="relative flex-1 max-w-lg">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search test cases..."
              className="w-full pl-12 pr-10 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm bg-white shadow-sm placeholder:text-gray-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 border border-gray-300 rounded-xl p-1 bg-white shadow-sm">
            {(['all', 'active', 'inactive', 'draft'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                  filterStatus === status
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex border border-gray-300 rounded-xl overflow-hidden shadow-sm">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-3 text-sm transition-all ${
                viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
              title="List view"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-3 text-sm transition-all border-l border-gray-300 ${
                viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
              title="Grid view"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
          </div>

          {/* New Folder Button */}
          <button
            onClick={() => setShowCreateFolder(true)}
            className="px-4 py-3 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-xl transition-all shadow-sm hover:shadow flex items-center gap-2 group"
            title="Create new folder"
          >
            <svg className="w-5 h-5 text-gray-500 group-hover:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <span className="hidden sm:inline">New Folder</span>
          </button>
        </div>
      </div>

      {/* Create Folder Modal */}
      {showCreateFolder && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-[480px]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Create New Folder</h3>
                <p className="text-sm text-gray-500 mt-0.5">Organize your test cases</p>
              </div>
            </div>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Enter folder name..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 mb-6 text-sm shadow-sm"
              autoFocus
              onKeyPress={(e) => e.key === 'Enter' && createFolder()}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCreateFolder(false);
                  setNewFolderName('');
                }}
                className="px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-xl transition-all border border-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={createFolder}
                disabled={!newFolderName.trim()}
                className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed"
              >
                Create Folder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto p-8">
        {/* Tab Selector */}
        {(currentFolderItems.folders.length > 0 || filteredAndSortedTestCases.length > 0) && (
          <div className="flex items-center gap-2 mb-6 bg-white rounded-xl p-1.5 shadow-sm border border-gray-200 w-fit">
            <button
              onClick={() => setActiveContentTab('tests')}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeContentTab === 'tests'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Tests
                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                  activeContentTab === 'tests'
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {filteredAndSortedTestCases.length}
                </span>
              </span>
            </button>
            <button
              onClick={() => setActiveContentTab('folders')}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeContentTab === 'folders'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                Folders
                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                  activeContentTab === 'folders'
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {currentFolderItems.folders.length}
                </span>
              </span>
            </button>
          </div>
        )}

        {/* Folders Section */}
        {activeContentTab === 'folders' && currentFolderItems.folders.length > 0 && (
          <div className="mb-8">
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'grid grid-cols-1 gap-3'}>
              {currentFolderItems.folders.map((folder) => {
                const testCount = getTestCountInFolder(folder.id);
                return (
                  <div
                    key={folder.id}
                    onClick={() => setCurrentFolderId(folder.id)}
                    className="group bg-white border-2 border-gray-200 rounded-2xl p-5 hover:border-blue-400 hover:shadow-xl transition-all cursor-pointer relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-blue-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-14 h-14 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110" style={{ backgroundColor: folder.color + '20' }}>
                          <svg className="w-8 h-8" style={{ color: folder.color }} fill="currentColor" viewBox="0 0 24 24">
                            <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 text-base mb-1">
                          {folder.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span>{testCount} test{testCount !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tests Section */}
        {activeContentTab === 'tests' && filteredAndSortedTestCases.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-16 shadow-sm">
            <div className="flex flex-col items-center justify-center space-y-5">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchTerm ? 'No test cases found' : currentFolderId ? 'No tests in this folder' : 'No test cases yet'}
                </h3>
                <p className="text-sm text-gray-500 mb-6 max-w-md">
                  {searchTerm ? 'Try adjusting your search or filters to find what you are looking for' : 'Get started by creating your first test case or organizing tests into folders'}
                </p>
                {!searchTerm && onCreateNewTest && (
                  <button
                    onClick={onCreateNewTest}
                    className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 inline-flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Create Your First Test
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            {activeContentTab === 'tests' && filteredAndSortedTestCases.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {selectedTests.size > 0 && (
                      <div className="flex gap-2">
                        <select
                          onChange={(e) => {
                            const folderId = e.target.value || null;
                            moveTestsToFolder(folderId);
                          }}
                          className="text-sm px-4 py-2 border border-gray-300 rounded-xl bg-white shadow-sm font-medium text-gray-700 focus:ring-2 focus:ring-blue-500/50"
                        >
                          <option value="">Move to...</option>
                          <option value="">📂 Root</option>
                          {folders.map(f => (
                            <option key={f.id} value={f.id}>📁 {f.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                {viewMode === 'list' ? (
                  // List View
                  <div className="space-y-3">
                    {filteredAndSortedTestCases.map((testCase) => (
                      <div
                        key={testCase.id}
                        className="bg-white border-2 border-gray-200 rounded-2xl px-6 py-5 hover:border-blue-400 hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden"
                        onClick={(e) => {
                          if ((e.target as HTMLElement).tagName !== 'INPUT') {
                            onOpenTestCase(testCase.id);
                          }
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/0 via-blue-50/30 to-blue-50/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative flex items-center gap-5">
                          {/* Checkbox */}
                          <input
                            type="checkbox"
                            checked={selectedTests.has(testCase.id)}
                            onChange={() => toggleTestSelection(testCase.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded-lg focus:ring-blue-500 cursor-pointer"
                          />

                          {/* Test Icon */}
                          <div className="flex-shrink-0">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/20">
                              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                          </div>

                          {/* Test Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-gray-900 truncate text-base group-hover:text-blue-600">
                                {testCase.name}
                              </h3>
                              {getStatusBadge(testCase.status)}
                            </div>
                            {testCase.description && (
                              <p className="text-sm text-gray-600 truncate mb-2">
                                {testCase.description}
                              </p>
                            )}
                            <div className="flex items-center gap-5 text-xs text-gray-500">
                              <span className="flex items-center gap-1.5 font-medium">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                {testCase.steps.length} steps
                              </span>
                              <span className="flex items-center gap-1.5 font-medium">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {formatDate(testCase.lastModified)}
                              </span>
                            </div>
                          </div>

                          {/* Action Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenTestCase(testCase.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 px-5 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-xl transition-all border-2 border-blue-200"
                          >
                            Open →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Grid View
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {filteredAndSortedTestCases.map((testCase) => (
                      <div
                        key={testCase.id}
                        className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-blue-400 hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden"
                        onClick={(e) => {
                          if ((e.target as HTMLElement).tagName !== 'INPUT') {
                            onOpenTestCase(testCase.id);
                          }
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-blue-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative">
                          <div className="flex items-start justify-between mb-4">
                            <input
                              type="checkbox"
                              checked={selectedTests.has(testCase.id)}
                              onChange={() => toggleTestSelection(testCase.id)}
                              onClick={(e) => e.stopPropagation()}
                              className="w-5 h-5 text-blue-600 border-gray-300 rounded-lg focus:ring-blue-500 cursor-pointer"
                            />
                            {getStatusBadge(testCase.status)}
                          </div>
                          
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-xl shadow-blue-500/20">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          
                          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 text-base">
                            {testCase.name}
                          </h3>
                          
                          {testCase.description && (
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                              {testCase.description}
                            </p>
                          )}
                          
                          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                            <span className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                              {testCase.steps.length} steps
                            </span>
                            <span className="text-xs text-gray-500 font-medium">
                              {formatDate(testCase.lastModified)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Results Summary */}
        {(filteredAndSortedTestCases.length > 0 || currentFolderItems.folders.length > 0) && (
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-200 shadow-sm">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-gray-600 font-medium">
                {activeContentTab === 'folders' ? (
                  <span>
                    {currentFolderItems.folders.length} folder{currentFolderItems.folders.length !== 1 ? 's' : ''}
                  </span>
                ) : (
                  <span>
                    {filteredAndSortedTestCases.length} of {currentFolderItems.tests.length} test{currentFolderItems.tests.length !== 1 ? 's' : ''}
                  </span>
                )}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestListView;
