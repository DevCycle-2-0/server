# Bee-Twin Backend API

A production-ready TypeScript backend for Bee-Twin product management system built with Express.js, PostgreSQL, and Redis following Domain-Driven Design (DDD) architecture principles.

## 🏗️ Architecture

- **Domain Layer**: Entities, Value Objects, Repository Interfaces
- **Application Layer**: Use Cases, Services, DTOs
- **Infrastructure Layer**: Database Models, HTTP Routes, Middleware, External Services
- **Shared Kernel**: Errors, Utilities, Types

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose (optional)

### Installation

\`\`\`bash
npm install
\`\`\`

### Environment Setup

\`\`\`bash
cp .env.example .env.development
\`\`\`

### Development

\`\`\`bash
npm run dev
\`\`\`

### Build & Production

\`\`\`bash
npm run build
npm start
\`\`\`

## 📦 Available Scripts

- `npm run dev` - Start development server with hot-reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Run production build
- `npm test` - Run unit tests
- `npm run test:watch` - Watch mode for tests
- `npm run test:e2e` - Run end-to-end tests
- `npm run lint` - Check code quality
- `npm run format` - Format code with Prettier

## 🐳 Docker

\`\`\`bash
docker-compose up
\`\`\`

## 📄 License

MIT
