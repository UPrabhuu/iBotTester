import React from 'react';

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <h1 className="text-3xl font-bold text-gray-900">🤖 iBotTester</h1>
          <p className="text-gray-600">AI-Powered Autonomous Functional Testing Agent</p>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-12 px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">Welcome to iBotTester</h2>
          <p className="text-gray-700 mb-4">
            Create and run automated tests using natural language prompts.
          </p>
          <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">
            Start Testing
          </button>
        </div>
      </main>
    </div>
  );
}
