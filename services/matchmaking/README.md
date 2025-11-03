# @community-gaming/matchmaking

Matchmaking service: pools, ELO/MMR, constraints, squad formation.

## Responsibilities

- Matchmaking queue management (Redis ZSET)
- ELO/MMR calculations
- Constraint matching (region, language, skill)
- Squad/lobby creation
- Match history and statistics

## Storage

- **Redis**: Matchmaking pools, active lobbies, player presence
- **PostgreSQL**: Match history, player stats
