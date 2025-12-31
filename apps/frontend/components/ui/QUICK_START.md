# UI Component Library - Quick Start Guide

## Installation

All UI components are located in `/components/ui/` and are ready to use. No additional installation is required.

## Basic Usage

### Importing Components

```tsx
// Import individual components
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

// Import multiple components
import { Button, Input, Card, Badge } from '@/components/ui';

// Import all components
import * as UI from '@/components/ui';
```

## Quick Examples

### 1. Simple Login Form

```tsx
import React, { useState } from 'react';
import { Input, Button, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Mail, Lock } from 'lucide-react';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Your login logic here
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Login to iBotTester</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            leftIcon={<Mail size={20} />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          <Input
            label="Password"
            type="password"
            leftIcon={<Lock size={20} />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

### 2. Status Dashboard

```tsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Heading, Text } from '@/components/ui';
import { Check, X, Clock } from 'lucide-react';

function StatusDashboard() {
  return (
    <div className="space-y-6">
      <Heading as="h1" gradient>Test Execution Dashboard</Heading>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <Text size="xl" weight="bold" color="text-blue-600" as="div">
              245
            </Text>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pass Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <Text size="xl" weight="bold" color="text-green-600" as="div">
              94.2%
            </Text>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Badge variant="success" icon={<Check size={14} />}>
                12 Passed
              </Badge>
              <Badge variant="danger" icon={<X size={14} />}>
                3 Failed
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

### 3. Loading States

```tsx
import React from 'react';
import { Spinner, Card, CardContent } from '@/components/ui';

function LoadingExample() {
  return (
    <Card>
      <CardContent>
        <Spinner centered label="Loading test results..." />
      </CardContent>
    </Card>
  );
}
```

### 4. Form with Validation

```tsx
import React, { useState } from 'react';
import { Input, Textarea, Button } from '@/components/ui';

function TestCaseForm() {
  const [testName, setTestName] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({ testName: '', description: '' });

  const validate = () => {
    const newErrors = { testName: '', description: '' };
    
    if (testName.length < 3) {
      newErrors.testName = 'Test name must be at least 3 characters';
    }
    
    if (description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }
    
    setErrors(newErrors);
    return !newErrors.testName && !newErrors.description;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      // Submit form
      console.log('Form submitted:', { testName, description });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Test Name"
        value={testName}
        onChange={(e) => setTestName(e.target.value)}
        error={!!errors.testName}
        errorMessage={errors.testName}
        placeholder="Enter test name"
        required
      />
      
      <Textarea
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        error={!!errors.description}
        errorMessage={errors.description}
        placeholder="Describe your test case"
        rows={4}
        required
      />
      
      <Button type="submit" variant="primary">
        Create Test Case
      </Button>
    </form>
  );
}
```

### 5. Content Sections with Dividers

```tsx
import React from 'react';
import { Heading, Text, Divider } from '@/components/ui';

function ContentSections() {
  return (
    <div className="space-y-6">
      <Heading as="h2">Configuration Settings</Heading>
      <Text>Manage your test environment configuration</Text>
      
      <Divider />
      
      <Heading as="h3">Browser Settings</Heading>
      <Text>Configure browser-specific settings</Text>
      
      <Divider label="OR" />
      
      <Heading as="h3">API Settings</Heading>
      <Text>Configure API endpoints and keys</Text>
    </div>
  );
}
```

## Component Combinations

### Action Card with Button

```tsx
<Card hoverable>
  <CardHeader>
    <CardTitle>Create New Test</CardTitle>
    <CardDescription>Start building your test suite</CardDescription>
  </CardHeader>
  <CardContent>
    <Text>Click below to create a new automated test case</Text>
  </CardContent>
  <CardFooter>
    <Button variant="primary" fullWidth>
      Get Started
    </Button>
  </CardFooter>
</Card>
```

### Badge List

```tsx
<div className="flex flex-wrap gap-2">
  <Badge variant="success" dot>Online</Badge>
  <Badge variant="warning">Pending Review</Badge>
  <Badge variant="info" outlined>Draft</Badge>
</div>
```

## Design System Integration

All components use the existing iBotTester design tokens:

- **Colors**: Blue-purple gradients, neutral grays
- **Spacing**: Tailwind's standard spacing scale
- **Typography**: System fonts with responsive sizing
- **Shadows**: Soft, medium, and strong elevations
- **Border Radius**: Consistent rounded corners (lg, xl, 2xl)

## Best Practices

1. **Always provide labels** for form inputs to improve accessibility
2. **Use appropriate variants** to convey meaning (success for positive actions, danger for destructive actions)
3. **Combine components** to create consistent patterns across your application
4. **Use loading states** with the `isLoading` prop on buttons during async operations
5. **Provide error messages** with the `errorMessage` prop on inputs when validation fails
6. **Use the Card component** to group related content and create visual hierarchy

## Live Demo

Visit [/ui-showcase](/ui-showcase) to see all components in action with interactive examples.

## Full Documentation

See [components/ui/README.md](/components/ui/README.md) for complete documentation including all props, variants, and advanced usage examples.
