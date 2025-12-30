import React, { useState } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface TestResult {
  id: string;
  prompt: string;
  steps: any[];
  status: string;
}

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      setError('Please enter a test prompt');
      return;
    }

    setLoading(true);
    setError('');
    setTestResult(null);

    try {
      const response = await axios.post(`${API_URL}/api/test-plan`, {
        prompt: prompt.trim()
      });

      if (response.data.success) {
        setTestResult(response.data.testPlan);
      } else {
        setError('Failed to create test plan');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to connect to API server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <h1 className="text-3xl font-bold text-gray-900">🤖 iBotTester</h1>
          <p className="text-gray-600">AI-Powered Autonomous Functional Testing Agent</p>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-12 px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Create a Test</h2>
          <p className="text-gray-700 mb-6">
            Describe what you want to test using natural language. For example:
            <em className="block mt-2 text-gray-600">
              "Purchase Nike shoes under $150 on amazon.com and validate checkout until payment page."
            </em>
          </p>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
                Test Prompt
              </label>
              <textarea
                id="prompt"
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter your test scenario..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={loading}
              />
            </div>
            
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating Test Plan...' : 'Create Test Plan'}
            </button>
          </form>
        </div>

        {testResult && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-xl font-semibold mb-4 text-green-700">✓ Test Plan Created</h3>
            <div className="space-y-3">
              <div>
                <span className="font-medium text-gray-700">Test ID:</span>
                <span className="ml-2 text-gray-900">{testResult.id}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Prompt:</span>
                <p className="ml-2 text-gray-900 mt-1">{testResult.prompt}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Status:</span>
                <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {testResult.status}
                </span>
              </div>
              {testResult.steps && testResult.steps.length > 0 && (
                <div>
                  <span className="font-medium text-gray-700">Steps:</span>
                  <ul className="ml-2 mt-1 space-y-1">
                    {testResult.steps.map((step, index) => (
                      <li key={index} className="text-gray-900">
                        {index + 1}. {step}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="max-w-7xl mx-auto py-6 px-4 text-center text-gray-600">
        <p>iBotTester - AI-Powered Autonomous Functional Testing</p>
      </footer>
    </div>
  );
}
