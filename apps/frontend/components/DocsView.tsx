import React, { useState } from 'react';
import { Heading, Text, Card, CardHeader, CardTitle, CardContent, Divider } from './ui';
import { Search, BookOpen, Code, Zap, Settings, Terminal, FileText, ChevronRight } from 'lucide-react';

interface DocSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  subsections: {
    id: string;
    title: string;
    content: string;
  }[];
}

const DocsView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('getting-started');
  const [activeSubsection, setActiveSubsection] = useState('introduction');

  const sections: DocSection[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: <Zap size={18} />,
      subsections: [
        {
          id: 'introduction',
          title: 'Introduction',
          content: `# Welcome to iBotTester

iBotTester is a powerful AI-driven test automation platform that helps you create, manage, and execute automated tests with ease.

## Key Features

- **AI-Powered Test Generation**: Create tests using natural language
- **Multi-Browser Support**: Test across Chrome, Firefox, Safari, and Edge
- **Parallel Execution**: Run multiple tests simultaneously
- **Rich Analytics**: Get detailed insights into your test results
- **Team Collaboration**: Work together with your team seamlessly

## Quick Start

1. Create a new project
2. Define your test cases
3. Run your tests
4. Analyze the results`,
        },
        {
          id: 'installation',
          title: 'Installation',
          content: `# Installation Guide

## Prerequisites

Before installing iBotTester, ensure you have:

- Node.js 16.x or higher
- npm or yarn package manager
- Git (for version control)

## Installation Steps

### Using npm

\`\`\`bash
npm install -g ibottester
\`\`\`

### Using yarn

\`\`\`bash
yarn global add ibottester
\`\`\`

### Verify Installation

\`\`\`bash
ibottester --version
\`\`\`

## Initial Setup

After installation, initialize your first project:

\`\`\`bash
ibottester init my-first-project
cd my-first-project
\`\`\`

This will create a new project with a basic configuration.`,
        },
        {
          id: 'quick-start',
          title: 'Quick Start Tutorial',
          content: `# Quick Start Tutorial

Let's create your first test in just 5 minutes!

## Step 1: Create a New Project

\`\`\`bash
ibottester create project "My E-commerce Tests"
\`\`\`

## Step 2: Create Your First Test

Navigate to the chat interface and type:

\`\`\`
Create a test that logs into my website at example.com
\`\`\`

The AI will generate the test steps for you.

## Step 3: Review and Edit

Review the generated test in the Test Editor. You can modify steps, add assertions, or customize selectors.

## Step 4: Run Your Test

Click the "Run Test" button or use the command:

\`\`\`bash
ibottester run --test "Login Test"
\`\`\`

## Step 5: View Results

Check the execution results in the Dashboard or Test Execution view.

Congratulations! You've created and run your first automated test! 🎉`,
        },
      ],
    },
    {
      id: 'core-concepts',
      title: 'Core Concepts',
      icon: <BookOpen size={18} />,
      subsections: [
        {
          id: 'projects',
          title: 'Projects & Branches',
          content: `# Projects & Branches

## Projects

A project in iBotTester represents a collection of related test cases, configurations, and executions.

### Creating a Project

\`\`\`javascript
const project = {
  name: "E-commerce Testing",
  description: "Test suite for our online store",
  baseUrl: "https://mystore.com"
}
\`\`\`

## Branches

Similar to Git, iBotTester supports branches to help you organize tests across different environments or features.

### Common Branch Strategies

- **main**: Production tests
- **develop**: Development environment tests
- **staging**: Pre-production tests
- **feature/***: Feature-specific tests

### Switching Branches

Use the branch selector in the sidebar to switch between different branches.`,
        },
        {
          id: 'test-cases',
          title: 'Test Cases',
          content: `# Test Cases

## What is a Test Case?

A test case is a sequence of steps that verify specific functionality of your application.

## Test Case Structure

\`\`\`javascript
{
  name: "User Login",
  description: "Verify user can log in with valid credentials",
  status: "active",
  steps: [
    {
      action: "Navigate to login page",
      expectedResult: "Login page loads successfully"
    },
    {
      action: "Enter valid credentials",
      expectedResult: "User is logged in"
    }
  ]
}
\`\`\`

## Test Case Status

- **Active**: Ready to be executed
- **Draft**: Still being developed
- **Inactive**: Temporarily disabled

## Best Practices

1. Keep test cases focused on a single feature
2. Use descriptive names
3. Write clear expected results
4. Group related tests together`,
        },
        {
          id: 'test-execution',
          title: 'Test Execution',
          content: `# Test Execution

## Running Tests

### Via UI

Click the "Run" button in the Test List or Dashboard.

### Via CLI

\`\`\`bash
# Run all tests
ibottester run --all

# Run specific test
ibottester run --test "Login Test"

# Run tests with specific tag
ibottester run --tag smoke
\`\`\`

## Execution Options

- **Parallel Execution**: Run multiple tests simultaneously
- **Browser Selection**: Choose which browser to use
- **Environment**: Select testing environment
- **Screenshots**: Enable/disable screenshot capture
- **Video Recording**: Record test execution

## Monitoring Execution

Watch your tests run in real-time with the Live Execution view, which shows:

- Current URL
- Live screenshots
- Execution logs
- Test progress`,
        },
      ],
    },
    {
      id: 'api-reference',
      title: 'API Reference',
      icon: <Code size={18} />,
      subsections: [
        {
          id: 'rest-api',
          title: 'REST API',
          content: `# REST API Reference

## Authentication

All API requests require an API key in the header:

\`\`\`bash
curl -H "Authorization: Bearer YOUR_API_KEY" \\
  https://api.ibottester.com/v1/projects
\`\`\`

## Endpoints

### Projects

**GET /v1/projects**
Get all projects

\`\`\`javascript
fetch('https://api.ibottester.com/v1/projects', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
})
\`\`\`

**POST /v1/projects**
Create a new project

\`\`\`javascript
fetch('https://api.ibottester.com/v1/projects', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: "My Project",
    description: "Project description"
  })
})
\`\`\`

### Test Executions

**POST /v1/executions**
Trigger a test execution

\`\`\`javascript
fetch('https://api.ibottester.com/v1/executions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    testCaseId: "test-123",
    environment: "production"
  })
})
\`\`\``,
        },
        {
          id: 'sdk',
          title: 'JavaScript SDK',
          content: `# JavaScript SDK

## Installation

\`\`\`bash
npm install @ibottester/sdk
\`\`\`

## Initialization

\`\`\`javascript
const IBotTester = require('@ibottester/sdk');

const client = new IBotTester({
  apiKey: 'YOUR_API_KEY',
  baseUrl: 'https://api.ibottester.com'
});
\`\`\`

## Usage Examples

### Create a Test

\`\`\`javascript
const test = await client.tests.create({
  name: 'Login Test',
  steps: [
    {
      action: 'navigate',
      url: 'https://example.com/login'
    },
    {
      action: 'type',
      selector: '#username',
      value: 'testuser'
    }
  ]
});
\`\`\`

### Run a Test

\`\`\`javascript
const execution = await client.executions.run({
  testId: test.id,
  browser: 'chrome',
  headless: true
});

console.log('Execution ID:', execution.id);
\`\`\`

### Get Test Results

\`\`\`javascript
const results = await client.executions.getResults(execution.id);
console.log('Status:', results.status);
console.log('Duration:', results.duration);
\`\`\``,
        },
      ],
    },
    {
      id: 'integrations',
      title: 'Integrations',
      icon: <Settings size={18} />,
      subsections: [
        {
          id: 'jira',
          title: 'Jira Integration',
          content: `# Jira Integration

Connect iBotTester with Jira to link test cases to tickets and sync results.

## Setup

1. Navigate to Settings → Integrations
2. Click "Connect" on Jira
3. Enter your Jira URL and API token
4. Click "Save & Connect"

## Features

- Link test cases to Jira tickets
- Auto-create bugs from failed tests
- Sync test execution status
- Add test results as comments

## Usage

### Link a Test to Jira

In the test editor, add a Jira ticket ID in the metadata:

\`\`\`
Jira Ticket: PROJ-123
\`\`\`

### Create Bugs from Failures

Failed test results can automatically create Jira bugs with:
- Screenshots
- Error logs
- Steps to reproduce
- Environment details`,
        },
        {
          id: 'gitlab',
          title: 'GitLab Integration',
          content: `# GitLab Integration

Integrate with GitLab for CI/CD automation and version control.

## Setup

1. Navigate to Settings → Integrations
2. Click "Connect" on GitLab
3. Enter your GitLab URL and access token
4. Click "Save & Connect"

## GitLab CI/CD

Add iBotTester to your \`.gitlab-ci.yml\`:

\`\`\`yaml
test:
  stage: test
  script:
    - npm install -g ibottester
    - ibottester run --all --environment staging
  only:
    - merge_requests
\`\`\`

## Features

- Trigger tests on merge requests
- View test results in pipeline
- Block merges on test failures
- Auto-deploy on test success`,
        },
        {
          id: 'slack',
          title: 'Slack Integration',
          content: `# Slack Integration

Get real-time notifications about test executions in Slack.

## Setup

1. Navigate to Settings → Integrations
2. Click "Connect" on Slack
3. Enter your Slack workspace name
4. Enter your Slack Bot token
5. Click "Save & Connect"

## Notifications

Once connected, you'll receive notifications for:

- Test execution started
- Test execution completed (success/failure)
- Daily test summary
- Critical failures

## Custom Notifications

Configure notification preferences:

\`\`\`javascript
{
  "channels": ["#testing", "#alerts"],
  "notify_on": ["failure", "success"],
  "mention_on_failure": "@here"
}
\`\`\`

## Slash Commands

Use Slack slash commands:

\`\`\`
/ibottester run "Login Test"
/ibottester status
/ibottester last-results
\`\`\``,
        },
      ],
    },
    {
      id: 'cli',
      title: 'CLI Reference',
      icon: <Terminal size={18} />,
      subsections: [
        {
          id: 'commands',
          title: 'CLI Commands',
          content: `# CLI Commands Reference

## Project Commands

### Create Project
\`\`\`bash
ibottester create project <name>
\`\`\`

### List Projects
\`\`\`bash
ibottester list projects
\`\`\`

### Switch Project
\`\`\`bash
ibottester use project <name>
\`\`\`

## Test Commands

### Create Test
\`\`\`bash
ibottester create test <name>
\`\`\`

### Run Tests
\`\`\`bash
# Run all tests
ibottester run --all

# Run specific test
ibottester run --test <name>

# Run with tags
ibottester run --tag smoke,regression
\`\`\`

### List Tests
\`\`\`bash
ibottester list tests
\`\`\`

## Configuration Commands

### Show Config
\`\`\`bash
ibottester config show
\`\`\`

### Set Config
\`\`\`bash
ibottester config set <key> <value>
\`\`\`

## Global Options

\`\`\`bash
--verbose, -v    Verbose output
--quiet, -q      Minimal output
--help, -h       Show help
--version        Show version
\`\`\``,
        },
      ],
    },
  ];

  const currentSection = sections.find(s => s.id === activeSection);
  const currentContent = currentSection?.subsections.find(
    s => s.id === activeSubsection
  )?.content || '';

  // Simple markdown-like rendering
  const renderContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, i) => {
      // Headers
      if (line.startsWith('# ')) {
        return <h1 key={i} className="text-3xl font-bold text-slate-900 mb-4 mt-8">{line.slice(2)}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={i} className="text-2xl font-bold text-slate-800 mb-3 mt-6">{line.slice(3)}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={i} className="text-xl font-semibold text-slate-700 mb-2 mt-4">{line.slice(4)}</h3>;
      }
      
      // Code blocks
      if (line.startsWith('```')) {
        return <div key={i} className="my-2"></div>;
      }
      
      // Lists
      if (line.startsWith('- ')) {
        return (
          <li key={i} className="ml-6 text-slate-700 mb-1">
            {line.slice(2)}
          </li>
        );
      }
      
      // Bold
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={i} className="font-semibold text-slate-800 mb-2">{line.slice(2, -2)}</p>;
      }
      
      // Code inline
      if (line.includes('`') && !line.startsWith('```')) {
        const parts = line.split('`');
        return (
          <p key={i} className="text-slate-700 mb-2">
            {parts.map((part, j) => 
              j % 2 === 0 ? part : <code key={j} className="bg-slate-100 px-2 py-0.5 rounded text-sm font-mono text-blue-600">{part}</code>
            )}
          </p>
        );
      }
      
      // Regular paragraph
      if (line.trim()) {
        return <p key={i} className="text-slate-700 mb-3">{line}</p>;
      }
      
      return <br key={i} />;
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex h-screen">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-white border-r border-slate-200 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <FileText className="text-blue-600" size={24} />
              <h2 className="text-xl font-bold text-slate-900">Documentation</h2>
            </div>

            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search docs..."
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Navigation */}
            <nav className="space-y-1">
              {sections.map((section) => (
                <div key={section.id}>
                  <button
                    onClick={() => {
                      setActiveSection(section.id);
                      setActiveSubsection(section.subsections[0].id);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left font-medium transition-colors ${
                      activeSection === section.id
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {section.icon}
                    <span className="text-sm">{section.title}</span>
                  </button>
                  
                  {activeSection === section.id && (
                    <div className="ml-8 mt-1 space-y-1">
                      {section.subsections.map((subsection) => (
                        <button
                          key={subsection.id}
                          onClick={() => setActiveSubsection(subsection.id)}
                          className={`w-full text-left px-3 py-1.5 rounded text-sm transition-colors ${
                            activeSubsection === subsection.id
                              ? 'text-blue-600 font-medium'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {subsection.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-8 py-12">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-slate-600 mb-8">
              <span>Docs</span>
              <ChevronRight size={16} />
              <span>{currentSection?.title}</span>
              <ChevronRight size={16} />
              <span className="text-slate-900 font-medium">
                {currentSection?.subsections.find(s => s.id === activeSubsection)?.title}
              </span>
            </div>

            {/* Content */}
            <div className="prose prose-slate max-w-none">
              {renderContent(currentContent)}
            </div>

            {/* Footer Navigation */}
            <div className="mt-16 pt-8 border-t border-slate-200 flex justify-between">
              <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
                ← Previous
              </button>
              <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
                Next →
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Table of Contents */}
        <div className="w-64 bg-white border-l border-slate-200 p-6 overflow-y-auto hidden xl:block">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">On This Page</h3>
          <nav className="space-y-2 text-sm">
            <a href="#" className="block text-blue-600 hover:text-blue-700">Introduction</a>
            <a href="#" className="block text-slate-600 hover:text-slate-900">Key Features</a>
            <a href="#" className="block text-slate-600 hover:text-slate-900">Quick Start</a>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default DocsView;
