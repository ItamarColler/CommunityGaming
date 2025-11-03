# Getting Started with CommunityGaming

## Prerequisites

- Node.js 18+ (you have 18.20.8 ✓)
- pnpm 8+ (or yarn/npm)
- Docker and Docker Compose (for local infrastructure)

## Installation

```bash
# Install dependencies
pnpm install

# Or with yarn
yarn install
```

## Development

### 1. Start Local Infrastructure

Start all required services (PostgreSQL, Redis, NATS, ClickHouse, Meilisearch):

```bash
pnpm docker:up

# Or
docker compose up -d
```

### 2. Build All Packages

```bash
pnpm build
```

### 3. Start Development Servers

```bash
# Start all services in development mode
pnpm dev
```

This will start:

- **Web App** (Next.js): http://localhost:3000
- **API Gateway** (Fastify): http://localhost:3001
- **WebSocket Gateway**: ws://localhost:3002
- **Identity Service**: http://localhost:4001
- **Community Service**: http://localhost:4002
- **Matchmaking Service**: http://localhost:4003
- **Payments Service**: http://localhost:4004
- **Content Service**: http://localhost:4005
- **Moderation Service**: http://localhost:4006
- **Analytics Service**: http://localhost:4007
- **Worker**: Background process

## Project Structure

```
CommunityGamingApp/
├── apps/
│   ├── web/              # Next.js frontend (CSS Modules + Zustand)
│   ├── api-gateway/      # Main API gateway with auth
│   ├── ws-gateway/       # WebSocket server
│   └── worker/           # Background job processor
├── services/
│   ├── identity/         # User authentication & profiles
│   ├── community/        # Communities & channels
│   ├── matchmaking/      # Squad formation & MMR
│   ├── payments/         # Stripe integration
│   ├── content/          # UGC & media management
│   ├── moderation/       # Content moderation pipeline
│   └── analytics/        # Event tracking & analytics
├── packages/
│   ├── types/            # Shared TypeScript types & Zod schemas
│   ├── sdk/              # Typed API client
│   ├── ui/               # Design system (Radix Primitives + CSS Modules)
│   ├── config/           # Shared build configs
│   └── utils/            # Common utilities
└── infra/
    ├── terraform/        # AWS infrastructure
    └── k8s/              # Kubernetes manifests
```

## Common Commands

```bash
# Development
pnpm dev                  # Start all dev servers
pnpm build                # Build all packages
pnpm lint                 # Lint all packages
pnpm typecheck            # Type check all packages
pnpm test                 # Run all tests

# Docker
pnpm docker:up            # Start local infrastructure
pnpm docker:down          # Stop local infrastructure

# Database
pnpm db:migrate           # Run database migrations
pnpm db:seed              # Seed database
pnpm db:studio            # Open Prisma Studio

# Formatting
pnpm format               # Format all files
pnpm format:check         # Check formatting
```

## Tech Stack

### Frontend

- **Framework**: Next.js 14 (App Router, RSC)
- **Styling**: CSS Modules + Global CSS Variables
- **State**: Zustand + TanStack Query
- **UI Components**: Radix Primitives
- **Validation**: Zod

### Backend

- **API Gateway**: Fastify
- **Services**: Fastify microservices
- **WebSocket**: ws library
- **Database**: PostgreSQL (Prisma ORM)
- **Cache**: Redis
- **Events**: NATS
- **Analytics**: ClickHouse
- **Search**: Meilisearch

### Infrastructure

- **Monorepo**: Turborepo + pnpm workspaces
- **Container Orchestration**: Kubernetes
- **IaC**: Terraform
- **CI/CD**: GitHub Actions

## Environment Variables

Copy `.env.example` files in each app/service and configure:

```bash
# Example for web app
cd apps/web
cp .env.example .env.local
# Edit .env.local with your values
```

## Troubleshooting

### Port Already in Use

If a port is already in use, either stop the conflicting service or change the port in the `.env` file.

### Docker Services Not Starting

```bash
# Check Docker logs
docker compose logs

# Restart specific service
docker compose restart postgres
```

### Build Errors

```bash
# Clean and rebuild
pnpm clean
pnpm install
pnpm build
```

## Next Steps

1. **Set up your IDE**: Configure ESLint and Prettier
2. **Read CLAUDE.md**: Understand the architecture and vision
3. **Start coding**: Pick a service and start implementing features!

## Resources

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Fastify Documentation](https://fastify.dev/)
- [Prisma Documentation](https://www.prisma.io/docs)

---

Built with ❤️ for the gaming community
