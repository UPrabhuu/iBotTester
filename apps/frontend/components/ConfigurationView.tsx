import React, { useState } from 'react';
import { Button, Input, Textarea, Heading, Text, Card, CardHeader, CardTitle, CardContent, Select } from './ui';
import { ProjectConfiguration } from '@/types/project';

interface ConfigurationViewProps {
  configuration: ProjectConfiguration;
  onSave: (configuration: ProjectConfiguration) => void;
}

const ConfigurationView: React.FC<ConfigurationViewProps> = ({
  configuration,
  onSave,
}) => {
  const [config, setConfig] = useState<ProjectConfiguration>(configuration);
  const [activeSection, setActiveSection] = useState<'environment' | 'browser' | 'execution' | 'integrations' | 'variables'>('environment');

  const handleSave = () => {
    onSave(config);
  };

  const updateEnvironment = (field: string, value: string | Record<string, string>) => {
    setConfig({
      ...config,
      environment: {
        ...config.environment,
        [field]: value,
      },
    });
  };

  const updateBrowser = (field: string, value: string | boolean | Record<string, number>) => {
    setConfig({
      ...config,
      browser: {
        ...config.browser,
        [field]: value,
      },
    });
  };

  const updateExecution = (field: string, value: number | boolean) => {
    setConfig({
      ...config,
      execution: {
        ...config.execution,
        [field]: value,
      },
    });
  };

  const sections = [
    { id: 'environment', label: 'Environment', icon: '🌍' },
    { id: 'browser', label: 'Browser', icon: '🌐' },
    { id: 'execution', label: 'Execution', icon: '⚡' },
    { id: 'integrations', label: 'Integrations', icon: '🔗' },
    { id: 'variables', label: 'Variables', icon: '📝' },
  ] as const;

  return (
    <div className="flex h-full bg-gray-50 dark:bg-gray-900">
      {/* Left Sidebar - Sections */}
      <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Configuration</h3>
        </div>
        <nav className="p-2 space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all ${
                activeSection === section.id
                  ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-800/50 shadow-sm dark:shadow-lg'
                  : 'text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 border border-transparent dark:border-transparent'
              }`}
            >
              <span className="text-lg">{section.icon}</span>
              <span className="text-sm">{section.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 bg-gray-50 dark:bg-gray-900/50 overflow-y-auto">
        <div className="p-6">
          <div className="max-w-3xl mx-auto">
            {/* Environment Settings */}
            {activeSection === 'environment' && (
              <div className="bg-white dark:bg-gray-800/50 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Environment Settings</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Base URL
                  </label>
                  <input
                    type="url"
                    value={config.environment.baseUrl}
                    onChange={(e) => updateEnvironment('baseUrl', e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                  />
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Credentials (Optional)</h5>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Username
                      </label>
                      <input
                        type="text"
                        value={config.environment.credentials?.username || ''}
                        onChange={(e) => updateEnvironment('credentials', { ...config.environment.credentials, username: e.target.value })}
                        placeholder="admin@example.com"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Password
                      </label>
                      <input
                        type="password"
                        value={config.environment.credentials?.password || ''}
                        onChange={(e) => updateEnvironment('credentials', { ...config.environment.credentials, password: e.target.value })}
                        placeholder="••••••••"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Browser Settings */}
            {activeSection === 'browser' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Browser Configuration</h4>
                
                <div>
                  <Select
                    value={config.browser.type}
                    onChange={(e) => updateBrowser('type', e.target.value)}
                    label="Browser Type"
                    size="md"
                  >
                    <option value="chromium">Chromium</option>
                    <option value="firefox">Firefox</option>
                    <option value="webkit">WebKit</option>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="headless"
                    checked={config.browser.headless}
                    onChange={(e) => updateBrowser('headless', e.target.checked)}
                    className="w-4 h-4 text-primary-600 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-400"
                  />
                  <label htmlFor="headless" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Run in headless mode
                  </label>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Viewport (Optional)</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Width
                      </label>
                      <input
                        type="number"
                        value={config.browser.viewport?.width || 1280}
                        onChange={(e) => updateBrowser('viewport', { ...config.browser.viewport, width: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Height
                      </label>
                      <input
                        type="number"
                        value={config.browser.viewport?.height || 720}
                        onChange={(e) => updateBrowser('viewport', { ...config.browser.viewport, height: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Execution Settings */}
            {activeSection === 'execution' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Execution Preferences</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Timeout (milliseconds)
                  </label>
                  <input
                    type="number"
                    value={config.execution.timeout}
                    onChange={(e) => updateExecution('timeout', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Number of Retries
                  </label>
                  <input
                    type="number"
                    value={config.execution.retries}
                    onChange={(e) => updateExecution('retries', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="screenshots"
                      checked={config.execution.screenshots}
                      onChange={(e) => updateExecution('screenshots', e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-400"
                    />
                    <label htmlFor="screenshots" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Capture screenshots
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="video"
                      checked={config.execution.video}
                      onChange={(e) => updateExecution('video', e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-400"
                    />
                    <label htmlFor="video" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Record video
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Integrations */}
            {activeSection === 'integrations' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Integration Settings</h4>
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">🔗</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">No integrations configured</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Add integrations to connect with external services</p>
                </div>
              </div>
            )}

            {/* Variables */}
            {activeSection === 'variables' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Variables & Constants</h4>
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">📝</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">No variables defined</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Add variables to reuse across your tests</p>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="mt-6">
              <button
                onClick={handleSave}
                className="w-full px-5 py-2.5 bg-blue-600 dark:bg-blue-600 text-white dark:text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-700 active:bg-blue-800 dark:active:bg-blue-800 transition-colors font-medium shadow-sm dark:shadow-md"
              >
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigurationView;
