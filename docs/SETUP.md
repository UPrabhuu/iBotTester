# 🚀 iBotTester Setup Guide

## Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL (or SQLite for development)
- OpenAI API key

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd iBotTester
```

### 2. Install dependencies

#### Frontend

```bash
cd apps/frontend
npm install
```

#### Backend

```bash
cd apps/backend
npm install
```

### 3. Environment Setup

Create `.env` files:

**Backend `.env`**

```
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/ibottester
OPENAI_API_KEY=your-api-key-here
```

**Frontend `.env.local`**

```
REACT_APP_API_URL=http://localhost:3001
```

## Running the Application

### Using Docker Compose

```bash
docker-compose up -d
```

### Local Development

**Terminal 1 - Backend:**

```bash
cd apps/backend
npm run dev
```

**Terminal 2 - Frontend:**

```bash
cd apps/frontend
npm start
```

The application will be available at `http://localhost:3000`

## Documentation

See the [docs](.) folder for architecture and API documentation.
