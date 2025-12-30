import React, { useState } from 'react';

interface HomeViewProps {
  onSendMessage?: (message: string) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && onSendMessage) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const examplePrompt = `I want to create a functional test to purchase Nike shoes size 9 under $150 on amazon.com...`;

  const quickActions = [
    'Create new test from conversation',
    'Browse existing test projects',
    'View recent test executions',
  ];

  return (
    <div className="flex items-center justify-center min-h-full bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-3xl w-full px-8 py-12">
        {/* Bot Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
            <span className="text-4xl">🤖</span>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800 mb-3">
            Welcome to iBotTester
          </h1>
          <p className="text-lg text-slate-600">
            Create and run functional tests with AI
          </p>
        </div>

        {/* Example Prompt Card */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start space-x-3">
              <span className="text-2xl mt-1">💡</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-700 mb-2">Try:</p>
                <p className="text-slate-600 leading-relaxed">
                  {examplePrompt}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Input */}
        <div className="mb-10">
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask anything about your test..."
              className="w-full px-6 py-4 pr-24 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm text-slate-700 placeholder-slate-400"
            />
            <button
              type="submit"
              disabled={!message.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-500 hover:to-purple-500 disabled:from-slate-400 disabled:to-slate-400 disabled:cursor-not-allowed transition-all font-semibold shadow-md"
            >
              Send
            </button>
          </form>
        </div>

        {/* Quick Actions */}
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-700 mb-4">💡 Quick Actions:</p>
          <div className="space-y-2">
            {quickActions.map((action, index) => (
              <div key={index} className="flex items-center justify-center space-x-2">
                <span className="text-blue-600">•</span>
                <span className="text-sm text-slate-600">{action}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeView;
