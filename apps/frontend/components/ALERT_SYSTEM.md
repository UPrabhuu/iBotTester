# Custom Alert System

## Overview

This project uses a custom alert notification system instead of standard browser alerts for a better user experience.

## Components

### Alert Component (`Alert.tsx`)

A reusable alert component that displays styled notifications with:

- **4 Types**: success (green), error (red), warning (yellow), info (blue)
- **Auto-dismiss**: Configurable duration (default 5 seconds)
- **Manual close**: Close button with X icon
- **Animations**: Smooth slide-in from right
- **Icons**: Contextual icons for each alert type

### AlertContext (`contexts/AlertContext.tsx`)

React Context providing global alert functionality:

- Manages multiple simultaneous alerts
- Stacks alerts vertically
- Auto-generates unique IDs
- Provides convenient helper methods

## Usage

### 1. Basic Usage

```tsx
import { useAlert } from "../contexts/AlertContext";

function MyComponent() {
  const { showAlert, showSuccess, showError, showWarning, showInfo } =
    useAlert();

  const handleAction = () => {
    // Generic alert (info by default)
    showAlert("Action completed");

    // Specific type alerts
    showSuccess("Profile saved successfully!");
    showError("Failed to save changes");
    showWarning("This action cannot be undone");
    showInfo("New feature available");
  };

  return <button onClick={handleAction}>Click me</button>;
}
```

### 2. Custom Duration

```tsx
const { showSuccess } = useAlert();

// Show for 10 seconds
showSuccess("Changes saved!", 10000);

// Show indefinitely (0 = no auto-dismiss)
showError("Critical error", 0);
```

### 3. Multiple Alerts

The system automatically stacks multiple alerts:

```tsx
const { showInfo, showWarning } = useAlert();

showInfo("Processing started...");
setTimeout(() => showWarning("Still processing..."), 2000);
```

## Alert Types & Use Cases

| Type      | Color  | When to Use                                          |
| --------- | ------ | ---------------------------------------------------- |
| `success` | Green  | Successful operations (save, create, update, delete) |
| `error`   | Red    | Failures, validation errors, API errors              |
| `warning` | Yellow | Caution messages, destructive actions, warnings      |
| `info`    | Blue   | General information, tips, neutral notifications     |

## Helper Methods

```tsx
const alert = useAlert();

// All methods accept (message, duration?)
alert.showSuccess(message, duration?);  // Green alert
alert.showError(message, duration?);    // Red alert
alert.showWarning(message, duration?);  // Yellow alert
alert.showInfo(message, duration?);     // Blue alert
alert.showAlert(message, type?, duration?);  // Generic with custom type
```

## Styling

The alerts use Tailwind CSS classes and include:

- Gradient backgrounds
- Border accents
- Drop shadows
- Smooth animations
- Responsive design

## Animation

Custom CSS animation in `globals.css`:

```css
@keyframes slide-in-right {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
```

## Position

Alerts appear in the **top-right corner** with fixed positioning and high z-index (50) to stay above other content.

## Migration from Standard Alerts

Before:

```tsx
alert("User saved successfully");
```

After:

```tsx
const { showSuccess } = useAlert();
showSuccess("User saved successfully");
```

## Best Practices

1. **Choose the right type**: Use success for confirmations, error for failures
2. **Be concise**: Keep messages short and clear
3. **Use appropriate duration**: 5s for info, longer for important errors
4. **Avoid spam**: Don't trigger multiple alerts for the same action
5. **Provide context**: Be specific about what happened

## Examples in Project

- **LoginView**: Password reset confirmation
- **PricingView**: Plan subscription demo
- **SettingsView**: Save confirmations, error messages
- **TestEditorView**: JSON import validation

## Accessibility

- Uses semantic HTML with `role="alert"`
- Screen reader support with `sr-only` labels
- Keyboard accessible close button
- Focus management with ring indicators
