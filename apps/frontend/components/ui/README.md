# UI Component Library

A comprehensive, reusable UI component library for iBotTester built with **React**, **TypeScript**, **Next.js**, and **Tailwind CSS**.

## 📚 Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Components](#components)
  - [Button](#button)
  - [Input](#input)
  - [Textarea](#textarea)
  - [Typography (Heading & Text)](#typography)
  - [Badge](#badge)
  - [Card](#card)
  - [Spinner](#spinner)
  - [Divider](#divider)
- [Design System](#design-system)
- [Accessibility](#accessibility)

## Overview

This component library provides a consistent set of reusable UI components that follow the iBotTester design language. All components are:

- ✅ **TypeScript-first** with full type definitions
- ✅ **Accessible** with ARIA attributes and keyboard navigation
- ✅ **Customizable** with flexible props and variants
- ✅ **Responsive** and mobile-friendly
- ✅ **Themeable** using Tailwind CSS
- ✅ **Tree-shakeable** for optimal bundle size

## Installation

All components are located in `/components/ui/` and can be imported individually or collectively:

```tsx
// Import individual components
import Button from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui';

// Import everything
import * as UI from '@/components/ui';
```

## Components

### Button

A versatile button component with multiple variants, sizes, and states.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'outline' \| 'ghost' \| 'danger'` | `'primary'` | Visual style variant |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Button size |
| `isLoading` | `boolean` | `false` | Shows loading spinner |
| `fullWidth` | `boolean` | `false` | Makes button full width |
| `leftIcon` | `ReactNode` | - | Icon before text |
| `rightIcon` | `ReactNode` | - | Icon after text |
| `disabled` | `boolean` | `false` | Disables the button |

#### Example Usage

```tsx
import Button from '@/components/ui/Button';
import { ArrowRight, Download } from 'lucide-react';

function MyComponent() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-4">
      {/* Primary button with icon */}
      <Button variant="primary" rightIcon={<ArrowRight size={16} />}>
        Get Started
      </Button>

      {/* Loading state */}
      <Button variant="primary" isLoading={loading} onClick={() => setLoading(true)}>
        Save Changes
      </Button>

      {/* Different variants */}
      <Button variant="secondary">Cancel</Button>
      <Button variant="outline">Learn More</Button>
      <Button variant="ghost">Skip</Button>
      <Button variant="danger">Delete Account</Button>

      {/* Sizes */}
      <Button size="sm">Small Button</Button>
      <Button size="md">Medium Button</Button>
      <Button size="lg">Large Button</Button>

      {/* Full width */}
      <Button fullWidth variant="primary">
        Full Width Button
      </Button>

      {/* With left icon */}
      <Button leftIcon={<Download size={16} />} variant="secondary">
        Download Report
      </Button>
    </div>
  );
}
```

---

### Input

A flexible input field component with label, error states, and icon support.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Input size |
| `variant` | `'default' \| 'filled'` | `'default'` | Visual variant |
| `error` | `boolean` | `false` | Error state |
| `errorMessage` | `string` | - | Error message to display |
| `label` | `string` | - | Input label |
| `helperText` | `string` | - | Helper text below input |
| `leftIcon` | `ReactNode` | - | Icon on left side |
| `rightIcon` | `ReactNode` | - | Icon on right side |
| `fullWidth` | `boolean` | `true` | Full width input |

#### Example Usage

```tsx
import Input from '@/components/ui/Input';
import { Mail, Lock, Search, Eye, EyeOff } from 'lucide-react';

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  return (
    <form className="space-y-4">
      {/* Basic input with label */}
      <Input
        label="Email Address"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      {/* Input with left icon */}
      <Input
        label="Search"
        leftIcon={<Search size={20} />}
        placeholder="Search tests..."
      />

      {/* Input with error state */}
      <Input
        label="Email"
        type="email"
        leftIcon={<Mail size={20} />}
        error={!!emailError}
        errorMessage={emailError}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      {/* Password input with toggle visibility */}
      <Input
        label="Password"
        type={showPassword ? 'text' : 'password'}
        leftIcon={<Lock size={20} />}
        rightIcon={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="cursor-pointer"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        }
      />

      {/* Input with helper text */}
      <Input
        label="Username"
        helperText="Your username must be unique and contain only letters and numbers"
        placeholder="johndoe"
      />

      {/* Filled variant */}
      <Input
        variant="filled"
        label="API Key"
        placeholder="Enter your API key"
      />

      {/* Different sizes */}
      <Input size="sm" placeholder="Small input" />
      <Input size="md" placeholder="Medium input" />
      <Input size="lg" placeholder="Large input" />
    </form>
  );
}
```

---

### Textarea

A multiline text input component with resize options.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Textarea size |
| `error` | `boolean` | `false` | Error state |
| `errorMessage` | `string` | - | Error message to display |
| `label` | `string` | - | Textarea label |
| `helperText` | `string` | - | Helper text below textarea |
| `fullWidth` | `boolean` | `true` | Full width textarea |
| `resize` | `'none' \| 'vertical' \| 'horizontal' \| 'both'` | `'vertical'` | Resize behavior |

#### Example Usage

```tsx
import Textarea from '@/components/ui/Textarea';

function CommentForm() {
  const [comment, setComment] = useState('');
  const maxLength = 500;

  return (
    <div className="space-y-4">
      {/* Basic textarea */}
      <Textarea
        label="Description"
        placeholder="Enter test description..."
        rows={4}
      />

      {/* With character count */}
      <Textarea
        label="Comment"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={maxLength}
        helperText={`${comment.length}/${maxLength} characters`}
        rows={5}
      />

      {/* No resize */}
      <Textarea
        label="Fixed Size Comment"
        resize="none"
        rows={3}
        placeholder="This textarea cannot be resized"
      />

      {/* With error */}
      <Textarea
        label="Feedback"
        error={comment.length < 10}
        errorMessage="Feedback must be at least 10 characters"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        required
      />

      {/* Different sizes */}
      <Textarea size="sm" placeholder="Small textarea" rows={3} />
      <Textarea size="lg" placeholder="Large textarea" rows={3} />
    </div>
  );
}
```

---

### Typography

#### Heading Component

Semantic heading component (h1-h6) with customizable styles.

##### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `as` | `'h1' \| 'h2' \| 'h3' \| 'h4' \| 'h5' \| 'h6'` | `'h2'` | HTML heading level |
| `weight` | `'normal' \| 'medium' \| 'semibold' \| 'bold'` | `'bold'` | Font weight |
| `color` | `string` | `'text-neutral-900'` | Text color class |
| `gradient` | `boolean` | `false` | Apply gradient effect |

##### Example Usage

```tsx
import Heading from '@/components/ui/Heading';

function PageHeader() {
  return (
    <div className="space-y-4">
      {/* Different heading levels */}
      <Heading as="h1">Main Page Title</Heading>
      <Heading as="h2">Section Heading</Heading>
      <Heading as="h3">Subsection Title</Heading>

      {/* With gradient */}
      <Heading as="h1" gradient>
        iBotTester Dashboard
      </Heading>

      {/* Custom weight */}
      <Heading as="h2" weight="medium">
        Medium Weight Heading
      </Heading>

      {/* Custom color */}
      <Heading as="h3" color="text-blue-600">
        Colored Heading
      </Heading>
    </div>
  );
}
```

#### Text Component

Flexible text component for paragraphs and labels.

##### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `as` | `'p' \| 'span' \| 'div' \| 'label'` | `'p'` | HTML element |
| `size` | `'xs' \| 'sm' \| 'base' \| 'lg' \| 'xl'` | `'base'` | Text size |
| `weight` | `'normal' \| 'medium' \| 'semibold' \| 'bold'` | `'normal'` | Font weight |
| `color` | `string` | `'text-neutral-700'` | Text color class |
| `truncate` | `boolean` | `false` | Truncate with ellipsis |

##### Example Usage

```tsx
import Text from '@/components/ui/Text';

function ContentSection() {
  return (
    <div className="space-y-3">
      {/* Different sizes */}
      <Text size="xs">Extra small text</Text>
      <Text size="sm">Small text</Text>
      <Text size="base">Regular text</Text>
      <Text size="lg">Large text</Text>
      <Text size="xl">Extra large text</Text>

      {/* As different elements */}
      <Text as="p">This is a paragraph</Text>
      <Text as="span">This is inline text</Text>
      <Text as="label">This is a label</Text>

      {/* With truncate */}
      <Text truncate>
        This is a very long text that will be truncated with an ellipsis when it exceeds the container width
      </Text>

      {/* Custom styling */}
      <Text weight="bold" color="text-blue-600">
        Bold blue text
      </Text>
    </div>
  );
}
```

---

### Badge

Small status indicators and labels.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'primary' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `'default'` | Visual variant |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Badge size |
| `outlined` | `boolean` | `false` | Use outlined style |
| `icon` | `ReactNode` | - | Icon before text |
| `dot` | `boolean` | `false` | Show as dot indicator |

#### Example Usage

```tsx
import Badge from '@/components/ui/Badge';
import { Check, X, AlertTriangle } from 'lucide-react';

function TestStatus() {
  return (
    <div className="space-y-4">
      {/* Status badges */}
      <div className="flex gap-2">
        <Badge variant="success">Passed</Badge>
        <Badge variant="danger">Failed</Badge>
        <Badge variant="warning">Pending</Badge>
        <Badge variant="info">Running</Badge>
        <Badge variant="default">Skipped</Badge>
      </div>

      {/* Outlined badges */}
      <div className="flex gap-2">
        <Badge variant="success" outlined>Completed</Badge>
        <Badge variant="danger" outlined>Error</Badge>
      </div>

      {/* With icons */}
      <div className="flex gap-2">
        <Badge variant="success" icon={<Check size={14} />}>
          Success
        </Badge>
        <Badge variant="danger" icon={<X size={14} />}>
          Failed
        </Badge>
        <Badge variant="warning" icon={<AlertTriangle size={14} />}>
          Warning
        </Badge>
      </div>

      {/* Dot indicators */}
      <div className="flex gap-2">
        <Badge variant="success" dot>Online</Badge>
        <Badge variant="danger" dot>Offline</Badge>
        <Badge variant="warning" dot>Away</Badge>
      </div>

      {/* Different sizes */}
      <div className="flex gap-2 items-center">
        <Badge size="sm">Small</Badge>
        <Badge size="md">Medium</Badge>
        <Badge size="lg">Large</Badge>
      </div>
    </div>
  );
}
```

---

### Card

Container component with header, content, and footer sections.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'bordered' \| 'elevated'` | `'default'` | Visual variant |
| `hoverable` | `boolean` | `false` | Enable hover effects |
| `noPadding` | `boolean` | `false` | Remove default padding |

#### Subcomponents

- `CardHeader` - Card header section
- `CardTitle` - Card title heading
- `CardDescription` - Card subtitle/description
- `CardContent` - Main card content area
- `CardFooter` - Card footer section

#### Example Usage

```tsx
import Card, {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/Card';
import Button from '@/components/ui/Button';

function DashboardCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Basic card */}
      <Card>
        <CardHeader>
          <CardTitle>Total Tests</CardTitle>
          <CardDescription>All test cases in your project</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold text-blue-600">245</p>
        </CardContent>
      </Card>

      {/* Card with footer */}
      <Card variant="bordered">
        <CardHeader>
          <CardTitle>Test Execution</CardTitle>
          <CardDescription>Run your test suite</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-neutral-600">
            Execute all tests in the current branch
          </p>
        </CardContent>
        <CardFooter>
          <Button variant="primary" fullWidth>
            Run Tests
          </Button>
        </CardFooter>
      </Card>

      {/* Hoverable card */}
      <Card variant="elevated" hoverable>
        <CardHeader>
          <CardTitle>API Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-neutral-600">
            Connect your testing tools and CI/CD pipelines
          </p>
        </CardContent>
      </Card>

      {/* Card without padding */}
      <Card noPadding>
        <img
          src="/preview.jpg"
          alt="Preview"
          className="w-full h-48 object-cover rounded-t-xl"
        />
        <div className="p-6">
          <CardTitle>Screenshot Preview</CardTitle>
          <CardDescription>Test execution screenshot</CardDescription>
        </div>
      </Card>
    </div>
  );
}
```

---

### Spinner

Loading indicator component.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Spinner size |
| `variant` | `'primary' \| 'secondary' \| 'white'` | `'primary'` | Color variant |
| `label` | `string` | - | Loading text label |
| `centered` | `boolean` | `false` | Center in container |

#### Example Usage

```tsx
import Spinner from '@/components/ui/Spinner';

function LoadingStates() {
  return (
    <div className="space-y-8">
      {/* Basic spinner */}
      <Spinner />

      {/* With label */}
      <Spinner label="Loading tests..." />

      {/* Different sizes */}
      <div className="flex gap-4 items-center">
        <Spinner size="xs" />
        <Spinner size="sm" />
        <Spinner size="md" />
        <Spinner size="lg" />
        <Spinner size="xl" />
      </div>

      {/* Different variants */}
      <div className="flex gap-4">
        <Spinner variant="primary" label="Primary" />
        <Spinner variant="secondary" label="Secondary" />
        <div className="bg-neutral-800 p-4 rounded">
          <Spinner variant="white" label="White" />
        </div>
      </div>

      {/* Centered spinner */}
      <div className="h-64 border border-neutral-200 rounded-lg">
        <Spinner centered label="Loading content..." />
      </div>

      {/* In button */}
      <Button disabled>
        <Spinner size="sm" variant="white" />
        <span className="ml-2">Processing...</span>
      </Button>
    </div>
  );
}
```

---

### Divider

Horizontal or vertical separator line.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Divider direction |
| `variant` | `'solid' \| 'dashed' \| 'dotted'` | `'solid'` | Line style |
| `label` | `string` | - | Text label in middle |
| `color` | `string` | `'border-neutral-200'` | Border color class |

#### Example Usage

```tsx
import Divider from '@/components/ui/Divider';

function ContentSections() {
  return (
    <div className="space-y-6">
      {/* Basic horizontal divider */}
      <div>
        <p>Section 1</p>
        <Divider />
        <p>Section 2</p>
      </div>

      {/* With label */}
      <div>
        <p>Above content</p>
        <Divider label="OR" />
        <p>Below content</p>
      </div>

      {/* Different variants */}
      <div className="space-y-4">
        <Divider variant="solid" />
        <Divider variant="dashed" />
        <Divider variant="dotted" />
      </div>

      {/* Vertical divider */}
      <div className="flex items-center h-12 gap-4">
        <span>Left content</span>
        <Divider orientation="vertical" />
        <span>Right content</span>
      </div>

      {/* Custom color */}
      <Divider color="border-blue-300" />

      {/* In navigation */}
      <nav className="flex items-center gap-4">
        <a href="#">Home</a>
        <Divider orientation="vertical" />
        <a href="#">About</a>
        <Divider orientation="vertical" />
        <a href="#">Contact</a>
      </nav>
    </div>
  );
}
```

---

## Design System

### Colors

Components use the following color system defined in `tailwind.config.js`:

- **Primary**: Blue (`#0ea5e9`) to Purple (`#9333ea`) gradients
- **Neutral**: Gray scale from 50 to 900
- **Success**: Green (`#10b981`)
- **Warning**: Yellow (`#f59e0b`)
- **Danger**: Red (`#ef4444`)
- **Info**: Blue (`#3b82f6`)

### Typography

- **Font Family**: System fonts (Apple System, Segoe UI, Roboto, etc.)
- **Display Font**: Inter
- **Sizes**: xs (0.75rem) to 5xl (3rem)

### Spacing

Following Tailwind's default spacing scale (4px base unit)

### Border Radius

- `lg`: 0.5rem
- `xl`: 0.75rem
- `2xl`: 1rem
- `3xl`: 1.5rem

### Shadows

- `soft`: Subtle shadow for cards
- `medium`: Medium depth shadow
- `strong`: Strong elevation shadow

### Animations

All components use smooth transitions (200ms) with the `cubic-bezier(0.4, 0, 0.2, 1)` easing function.

## Accessibility

All components follow accessibility best practices:

- ✅ **Semantic HTML**: Proper element usage (button, input, etc.)
- ✅ **ARIA attributes**: role, aria-label, aria-describedby where needed
- ✅ **Keyboard navigation**: Full keyboard support with focus indicators
- ✅ **Focus management**: Visible focus rings (ring-2)
- ✅ **Screen reader support**: sr-only labels for icons
- ✅ **Color contrast**: WCAG AA compliant color combinations
- ✅ **Disabled states**: Proper disabled styling and cursor changes

### Focus Ring

All interactive components have a focus ring using `focus:ring-2` with appropriate colors.

### Required Fields

Form components show a red asterisk (*) for required fields and include the `required` attribute.

---

## Contributing

When adding new components:

1. Follow TypeScript conventions with proper type definitions
2. Include comprehensive prop documentation
3. Support common variants and sizes
4. Ensure accessibility compliance
5. Add usage examples to this documentation
6. Test with keyboard navigation
7. Verify responsive behavior

---

**Built with ❤️ for iBotTester**
