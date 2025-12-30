# iBotTester - Perplexity-Inspired Theme Update

## Overview

The entire application has been updated with a modern, clean Perplexity-inspired theme featuring white and light blue colors.

## Color Palette

### Primary Colors (Light Blue)

- **primary-50**: `#f0f9ff` - Very light blue backgrounds
- **primary-100**: `#e0f2fe` - Light blue backgrounds
- **primary-200**: `#bae6fd` - Border accents
- **primary-300**: `#7dd3fc` - Hover states
- **primary-400**: `#38bdf8` - Interactive elements
- **primary-500**: `#0ea5e9` - Main brand color (buttons, links)
- **primary-600**: `#0284c7` - Hover states for primary
- **primary-700**: `#0369a1` - Active states
- **primary-800**: `#075985` - Dark accents
- **primary-900**: `#0c4a6e` - Darkest blue

### Neutral Colors (White to Gray)

- **neutral-50**: `#fafafa` - Background
- **neutral-100**: `#f5f5f5` - Light backgrounds
- **neutral-200**: `#e5e5e5` - Borders
- **neutral-300**: `#d4d4d4` - Input borders
- **neutral-400**: `#a3a3a3` - Disabled states
- **neutral-500**: `#737373` - Secondary text
- **neutral-600**: `#525252` - Body text
- **neutral-700**: `#404040` - Headings
- **neutral-800**: `#262626` - Dark text
- **neutral-900**: `#171717` - Primary text

### Accent Colors

- **accent-blue**: `#0ea5e9`
- **accent-lightBlue**: `#38bdf8`
- **accent-sky**: `#7dd3fc`

## Design Changes

### 1. Tailwind Configuration

- Custom color palette with primary (light blue) and neutral (white-gray) scales
- Enhanced shadow utilities: `shadow-soft`, `shadow-medium`, `shadow-strong`
- Extended border radius: `xl`, `2xl`, `3xl`
- Custom font families

### 2. Global Styles

- Background color changed to `#fafafa` (very light gray/white)
- Improved scrollbar styling with transparent track
- Smooth transition utilities
- Enhanced focus states with blue ring

### 3. Component Updates

#### Sidebar

- White background instead of dark slate
- Light blue accents for active states
- Border instead of shadow for separation
- Clean, minimal design

#### HomeView

- Pure white background
- Larger, bolder welcome text
- Light blue gradient for bot icon
- Rounded-2xl for cards and inputs
- Subtle hover effects

#### DashboardView

- White cards with soft shadows
- Light blue for passed tests (instead of green)
- Rounded-2xl cards with hover effects
- Clean metric displays

#### ChatPanel

- White background with light accents
- Light blue backgrounds for agent messages
- Neutral gray for user messages
- Clean, modern chat bubbles

#### TestListView

- Rounded-xl inputs and buttons
- Primary blue buttons
- Clean table rows with hover effects
- Minimal borders

#### Other Components

- ConfigurationView: Clean white panels
- TestEditorView: Neutral-800 code blocks
- LiveExecutionView: Modern terminal styles
- All buttons use primary-500 blue

## Typography

- Primary text: `neutral-900` (#171717)
- Headings: `neutral-900` with bold weights
- Body text: `neutral-700` (#404040)
- Secondary text: `neutral-600` (#525252)
- Muted text: `neutral-500` (#737373)

## Shadows

- **shadow-soft**: `0 2px 8px rgba(14, 165, 233, 0.08)` - Subtle depth
- **shadow-medium**: `0 4px 16px rgba(14, 165, 233, 0.12)` - Card elevation
- **shadow-strong**: `0 8px 24px rgba(14, 165, 233, 0.16)` - Modals/overlays

## Border Radius

- Inputs: `rounded-xl` (0.75rem)
- Cards: `rounded-2xl` (1rem)
- Large containers: `rounded-3xl` (1.5rem)
- Icons/avatars: `rounded-full` or `rounded-3xl`

## Transitions

- All interactive elements use `transition-smooth` class
- Duration: 0.2s
- Easing: `cubic-bezier(0.4, 0, 0.2, 1)`

## Button Styles

### Primary Buttons

- Background: `bg-primary-500`
- Hover: `hover:bg-primary-600`
- Text: White (`text-white`)
- Border radius: `rounded-lg` (0.5rem)
- Padding: `px-4 py-2` or `px-5 py-2.5`
- Font weight: `font-medium`
- Transition: `transition-smooth`
- Clean, flat design (no heavy shadows or gradients)

### Secondary/Ghost Buttons

- Background: `bg-white`
- Border: `border border-neutral-300`
- Hover border: `hover:border-neutral-400`
- Hover background: `hover:bg-neutral-50`
- Text: `text-neutral-700`
- Border radius: `rounded-lg`
- Padding: `px-4 py-2.5`
- Font weight: `font-medium`

### Destructive Buttons

- Background: `bg-red-500`
- Hover: `hover:bg-red-600`
- Text: White
- Border radius: `rounded-lg`
- Padding: `px-4 py-2`
- Font weight: `font-medium`

### Button Design Principles

- **No scale transforms**: Removed `transform hover:scale-105` for cleaner, Perplexity-style interaction
- **Minimal shadows**: Flat design instead of heavy `shadow-lg` or `shadow-xl`
- **Consistent sizing**: Standardized padding and height across all buttons
- **Simple hover states**: Subtle color changes only, no dramatic effects
- **Clean transitions**: Smooth 0.2s transitions using `transition-smooth`

## Icons

All icons have been replaced with **clean SVG line icons** similar to Perplexity's UI:

- **Stroke-based** icons (not filled)
- **Consistent stroke width**: 2px
- **24x24 viewBox** for uniformity
- **Rounded line caps and joins** (`strokeLinecap="round"` and `strokeLinejoin="round"`)
- **Proper sizing**: w-4 to w-10 based on context
- **No emojis**: Professional SVG icons throughout

### Icon Examples

- Bot/AI: Lightbulb SVG icon
- Dashboard: Bar chart icon
- Test List: List icon
- Play/Execute: Play circle icon
- Edit: Pencil icon
- Settings: Gear icon
- Search: Magnifying glass icon

## Key Features

1. **Clean & Minimal**: White backgrounds with subtle shadows
2. **Modern**: Rounded corners and smooth transitions
3. **Accessible**: High contrast text on light backgrounds
4. **Consistent**: Unified color palette across all components
5. **Professional**: Perplexity-inspired design language

## Files Modified

- `tailwind.config.js` - Theme configuration
- `styles/globals.css` - Global styles
- All component files in `components/` directory
- `pages/index.tsx` - Main page background

## Browser Support

- Modern browsers with CSS custom properties support
- Tailwind CSS 3.x compatible
- Responsive design maintained
