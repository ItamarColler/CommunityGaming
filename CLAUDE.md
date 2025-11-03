CLAUDE.md

Project Overview

CommunityGaming is a realtime, event-driven social platform for gamers that blends community, co-play discovery, creator tools, and safety-first governance.
It targets niche gaming subcultures—speedrunners, co-op roguelikes, regional or language-based groups—and solo/duo squad formation, delivering instant “find a squad,” creator-run micro-clubs, and low-friction UGC sharing without replicating Discord.

This repository is in its initial stages: the core architecture, codebase structure, and technology stack are being established.

Current State

The repository currently contains minimal content.
Initial tasks include:

Establishing the technology stack and project structure.

Setting up build tools and development environments.

Configuring testing frameworks.

Implementing the core application architecture (frontend, backend, realtime, and infra).

Context & Vision
Who It’s For

Players: Discover communities by game, skill, or timezone; find squads; join chat or events.

Creators/Moderators: Run gated clubs, paid tiers, sell digital goods, moderate safely, and track analytics.

Studios/Partners (later): Embed white-label community widgets/SDKs inside their games or portals.

Core Capabilities

Community Graph: Communities, channels, roles, invites, trust levels.

Realtime Co-play: Matchmaking pools (MMR/region/language), lobbies, presence, voice/video.

Creator Tools: Memberships, gated rooms, marketplace for UGC.

Safety & Trust: Multi-stage moderation pipeline, audit logs, reputation scoring.

Personalization: Recommendation and discovery based on behavioral signals.

Analytics: Activation funnels, retention cohorts, GMV, creator metrics.

North-Star Outcome

A safe, sticky, creator-aligned platform where finding the right people to play with and building thriving micro-communities feels instant—driven by realtime social primitives, trust systems, and defensible data network effects.

Architecture at a Glance
Frontend

Next.js (App Router) — RSC for server data, client components for interactivity.

State: TanStack Query + Zustand for UI state.

UI: CSS Modules + global CSS management, Radix Primitives for accessible components.

Realtime: WebSocket client for presence/matchmaking.

Backend & Services

Gateway: Fastify API Gateway with AuthN/Z (OIDC), RBAC/ABAC.

Services: identity, community, matchmaking, payments, content, moderation, analytics.

Events: NATS or Kafka backbone with the outbox pattern (community.created, match.found).

Realtime Voice: WebRTC SFU (later).

Storage:

PostgreSQL (Prisma) – accounts, communities, memberships, ledger.

Redis – presence, matchmaking pools (ZSETs), rate limits, feature flags.

ClickHouse – events, funnels, retention analytics.

S3 / R2 + CDN – media and UGC.

Optional OpenSearch/Meilisearch – discovery.

Infra / DevEx

Turborepo monorepo with pnpm.

Shared types and SDK packages.

Terraform + Kubernetes (HPA, canary deploys).

GitHub Actions for CI/CD.

Observability via OpenTelemetry + Grafana dashboards.

Quality, Safety & Performance

Validation: zod DTOs, idempotency keys, rate-limiting middleware.

Moderation: client prefilters → rules engine → ML assist → human review → appeals.

Access Control: RBAC/ABAC, scoped tokens, short-lived secrets.

Performance SLOs:

P95 join-lobby < 120 ms (warm cache)

Message latency < 150 ms intra-region

Presence reconnects smoothed via jitter/backoff.

Rollout Phases
Phase	Focus	Highlights
MVP	Identity + Communities, text chat, presence, S3 uploads, event pipeline.	Minimal analytics and moderation.
Private Beta	Matchmaking (Redis ZSET), lobbies, voice (WebRTC SFU), creator micro-clubs.	Early referral loops and Meilisearch.
Public Launch	UGC marketplace + ledger, trust scores, appeals, OAuth with Steam/Riot/Xbox.	SDK/embed for partners.
Scale	Regional edges, sharded chat, B2B white-label mode.	Global localization and growth.
Next Steps for Development

As the project evolves, update this file to include:

Build commands: e.g. pnpm build, npm run dev, docker compose up.

Test commands and patterns: unit, integration, e2e.

Dev server instructions: local API + web startup.

Code architecture & patterns: service-controller-repository, DTO validation, event outbox.

Key modules: identity, community, matchmaking, payments, moderation.

Database schema & data flow: PostgreSQL ERD + Redis cache maps.

API structure: endpoint design, auth flows, response contracts.

Non-Goals (for Now)

Full cloud-gaming or game-streaming stack.

On-chain/token economies (optional experiments only).

Generic forum software beyond community-centric chat/posts.

In short:
CommunityGaming aims to become the trusted social backbone of gaming—fast, safe, creator-first, and architected for scale from day one.