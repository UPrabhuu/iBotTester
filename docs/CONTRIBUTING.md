# Contributing to iBotTester

Thank you for your interest in contributing to iBotTester! This document provides guidelines and instructions for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/iBotTester.git`
3. Create a new branch: `git checkout -b feature/your-feature-name`
4. Follow the setup instructions in [SETUP.md](docs/SETUP.md)

## Development Workflow

### Backend Development

```bash
cd apps/backend
npm install
npm run dev
```

The backend server will start on http://localhost:3001 with hot-reload enabled.

### Frontend Development

```bash
cd apps/frontend
npm install
npm run dev
```

The frontend will start on http://localhost:3000 with hot-reload enabled.

## Code Style

- Use TypeScript for type safety
- Follow existing code formatting
- Write clear, descriptive commit messages
- Add comments for complex logic

## Testing

Currently, the project is in early development. Testing infrastructure will be added soon.

## Submitting Changes

1. Commit your changes: `git commit -m "Add feature: description"`
2. Push to your fork: `git push origin feature/your-feature-name`
3. Create a Pull Request

## Pull Request Guidelines

- Provide a clear description of the changes
- Reference any related issues
- Ensure your code follows the existing style
- Test your changes locally before submitting

## Reporting Issues

- Use the GitHub issue tracker
- Provide detailed information about the problem
- Include steps to reproduce
- Specify your environment (OS, Node version, etc.)

## Questions?

Feel free to open an issue for any questions or concerns.
