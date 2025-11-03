# Project TODOs

## Infrastructure & DevOps

### Docker & Containerization

**Status**: Not Started
**Priority**: Medium
**Blocked by**: Core application development

**Tasks**:

- [ ] Create Dockerfiles for all services:
  - [ ] `apps/web/Dockerfile` - Next.js web application
  - [ ] `apps/api-gateway/Dockerfile` - API Gateway service
  - [ ] `apps/ws-gateway/Dockerfile` - WebSocket Gateway service
  - [ ] `apps/worker/Dockerfile` - Background worker service
  - [ ] `services/identity/Dockerfile` - Identity service
  - [ ] `services/community/Dockerfile` - Community service
  - [ ] `services/matchmaking/Dockerfile` - Matchmaking service
  - [ ] `services/moderation/Dockerfile` - Moderation service
  - [ ] `services/payments/Dockerfile` - Payments service
  - [ ] `services/analytics/Dockerfile` - Analytics service
  - [ ] `services/content/Dockerfile` - Content service
- [ ] Create `.dockerignore` file to optimize build context
- [ ] Create `docker-compose.yml` for local development
- [ ] Create `docker-compose.prod.yml` for production-like environment
- [ ] Test multi-stage builds for optimization
- [ ] Re-enable GitHub Actions workflow: `.github/workflows/docker-build.yml.disabled`
- [ ] Set up GitHub Container Registry (GHCR) permissions
- [ ] Document Docker setup in README

**Notes**:

- Workflow is currently disabled: `.github/workflows/docker-build.yml.disabled`
- Should use multi-stage builds to minimize image size
- Consider using pnpm's workspace support in Docker builds
- Need to handle monorepo structure (shared packages)

---

## Testing

### Test Infrastructure

**Status**: Removed (blocked by MSW environment issues)
**Priority**: High
**Next Steps**: Re-evaluate testing approach

**Tasks**:

- [ ] Decide on testing strategy (unit, integration, e2e)
- [ ] Choose testing framework (Vitest was removed due to MSW issues)
- [ ] Set up test infrastructure that works with monorepo
- [ ] Create test examples for each package type
- [ ] Add tests back to CI pipeline

**Notes**:

- Previous setup used Vitest + MSW but had webidl-conversions errors in WSL
- May need different mocking approach or environment setup
- Consider alternatives: Jest, native Node test runner, or MSW with better polyfills

---

## Future Enhancements

- [ ] Set up Kubernetes manifests (per CLAUDE.md architecture)
- [ ] Configure Terraform for infrastructure as code
- [ ] Add end-to-end testing with Playwright
- [ ] Set up monitoring and observability (OpenTelemetry + Grafana)
- [ ] Implement feature flags system
- [ ] Add database migrations setup
