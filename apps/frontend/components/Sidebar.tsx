import React from 'react';

interface ChatHistory {
  id: string;
  title: string;
  timestamp: Date;
}

interface SidebarProps {
  onNewChat: () => void;
  chatHistory: ChatHistory[];
  activeChat: string | null;
  onSelectChat: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onNewChat, chatHistory, activeChat, onSelectChat }) => {
  const menuItems = [
    { icon: '📊', label: 'Dashboard', href: '#dashboard' },
    { icon: '🔄', label: 'Test Flows', href: '#flows' },
    { icon: '📜', label: 'Run History', href: '#history' },
    { icon: '⚙️', label: 'Settings', href: '#settings' },
  ];

  return (
    <div className="w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white h-screen flex flex-col shadow-2xl">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">🤖</span>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              iBotTesting
            </h1>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <button
          onClick={onNewChat}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg mb-4"
        >
          <span className="text-lg">✨</span>
          <span className="font-semibold">New Chat</span>
        </button>

        {menuItems.map((item, index) => (
          <a
            key={index}
            href={item.href}
            className="flex items-center space-x-3 px-4 py-2.5 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-sm font-medium">{item.label}</span>
          </a>
        ))}

        <div className="pt-4 border-t border-slate-700 mt-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-4">
            Recent Chats
          </h3>
          <div className="space-y-1">
            {chatHistory.map((chat) => (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  activeChat === chat.id
                    ? 'bg-slate-700 text-white'
                    : 'hover:bg-slate-700/50 text-slate-300'
                }`}
              >
                <div className="text-sm font-medium truncate">{chat.title}</div>
                <div className="text-xs text-slate-500">
                  {new Date(chat.timestamp).toLocaleDateString()}
                </div>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700">
        <div className="text-xs text-slate-400 text-center">
          v0.1.0 • AI-Powered Testing
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
