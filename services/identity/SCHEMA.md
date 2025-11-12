# Identity Service Schema Architecture

## Overview

The Identity Service uses a **polymorphic role-based profile system** that allows users to have multiple roles simultaneously (e.g., a gamer can also be a community leader and receive sponsorships).

## Core Design Principles

### 1. **Single Source of Truth**

- One `User` table for core identity (auth, email, username)
- Common fields shared across all roles (timezone, favorite games, play style)

### 2. **Role-Specific Profile Tables**

- `GamerProfile` - For players/gamers
- `LeaderProfile` - For community managers/guild leaders
- `SponsorProfile` - For brands/advertisers
- Users can have 0, 1, or multiple profiles (flexible role system)

### 3. **Strategic Indexing**

- Composite indexes on frequently queried fields for matchmaking
- Separate indexes for discovery, filtering, and recommendation algorithms

### 4. **Relationship Mapping**

The schema supports three-way relationship mapping:

- **Gamer ↔ Leader**: Matched by game, play style, goals
- **Leader ↔ Sponsor**: Matched by genre focus, audience, mission intent
- **Gamer ↔ Sponsor**: Matched by game + motivation type

## Schema Structure

```
User (Core Identity)
├── GamerProfile (Optional, 1:1)
├── LeaderProfile (Optional, 1:1)
│   └── LeaderPlatforms (1:Many)
└── SponsorProfile (Optional, 1:1)
```

## Data Models

### User (Core)

**Purpose**: Core authentication and shared profile data

**Key Fields**:

- `id`, `email`, `username`, `passwordHash` - Authentication
- `userType` - PLAYER, CREATOR, MODERATOR, ADMIN (for permissions)
- `country`, `timezone` - For event/matchmaking
- `favoriteGames[]` - Shared across all roles
- `playStyle` - CASUAL, COMPETITIVE, CONTENT_CREATOR
- `goalType` - SKILL, RANK, SOCIAL, CREATIVE
- `weeklyCommitment` - Hours per week
- `achievementMotivation` - XP, RECOGNITION, REWARDS
- `contentTypes[]` - TOURNAMENTS, STREAMS, TIPS, PRODUCTS
- `communicationChannels[]` - DISCORD, IN_APP, EMAIL

**Relations**:

- `sessions[]` - Active JWT sessions
- `refreshTokens[]` - Long-lived auth tokens
- `gamerProfile` - Optional 1:1
- `leaderProfile` - Optional 1:1
- `sponsorProfile` - Optional 1:1

---

### GamerProfile

**Purpose**: Gamer-specific data for matchmaking and progression

**Key Fields**:

- `currentRank` - "Diamond 2", "Gold III" (indexed for matchmaking)
- `preferredGameModes[]` - ["Ranked", "Arena", "2v2"]
- `shortTermGoal` - Free-form text (e.g., "Reach Platinum this season")
- `longTermVision` - STREAMER, COMPETITIVE, CASUAL_EXPERT
- `willingToMentor` - Boolean (indexed for mentor discovery)
- `shareAchievements` - Boolean (controls profile visibility)

**Indexes**:

- `userId` - Primary lookup
- `currentRank` - Matchmaking queries
- `willingToMentor` - Mentor discovery

**Matching Algorithm Inputs**:

- Rank → Match similar skill levels
- Game modes → Find compatible teammates
- Long-term vision → Community suggestions
- Willing to mentor → Growth loop unlocking

---

### LeaderProfile

**Purpose**: Community leader/guild manager profile

**Key Fields**:

- `communityName` - Display name of community
- `genreFocus` - "FPS", "MOBA", "RPG" (indexed for discovery)
- `memberSizeGoal` - Target community size (KPI)
- `missionIntent` - GROWTH, ENGAGEMENT, SPONSORSHIP (indexed for sponsor matching)
- `collaborationOpenness` - OPEN, INVITE_ONLY (indexed for visibility)
- `incentiveSystem` - TOKENS, BADGES, XP
- `desiredMetrics[]` - RETENTION, ENGAGEMENT, REVENUE (dashboard customization)
- `platforms[]` - Connected social platforms (1:Many)

**Relations**:

- `platforms` - LeaderPlatform[] (Discord, Twitch, Steam, YouTube, Twitter)

**Indexes**:

- `userId` - Primary lookup
- `genreFocus` - Community discovery
- `missionIntent` - Sponsor matching
- `collaborationOpenness` - Visibility filtering

**Matching Algorithm Inputs**:

- Genre focus + Game → Gamer community suggestions
- Mission intent + Genre → Sponsor campaign matching
- Collaboration openness → Discovery visibility

---

### LeaderPlatform

**Purpose**: Track leader's connected social platforms

**Key Fields**:

- `leaderProfileId` - Foreign key
- `platformType` - DISCORD, TWITCH, STEAM, YOUTUBE, TWITTER
- `platformHandle` - Username/URL on that platform
- `isVerified` - Platform ownership verified

**Unique Constraint**: `[leaderProfileId, platformType]` - One entry per platform

**Use Cases**:

- Sync community members from Discord
- Display Twitch stream embeds
- Verify Steam group ownership

---

### SponsorProfile

**Purpose**: Brand/advertiser profile for campaigns

**Key Fields**:

- `brandName` - Display name
- `category` - HARDWARE, SOFTWARE, EVENTS, MERCH (indexed)
- `targetAudience[]` - ["FPS", "MMO", "RPG"] (game genres)
- `objective` - AWARENESS, ENGAGEMENT, CONVERSION (indexed)
- `budgetRange` - Monthly budget in cents
- `preferredPartnerTypes[]` - LEADER, COMMUNITY, TOP_GAMER
- `conversionMetrics[]` - CLICKS, SIGNUPS, REDEMPTIONS

**Indexes**:

- `userId` - Primary lookup
- `category` - Sponsor discovery
- `objective` - Campaign matching

**Matching Algorithm Inputs**:

- Target audience ∩ Leader genre focus → Campaign suggestions
- Objective + Budget → Campaign prioritization
- Partner type → Leader/gamer targeting

---

## Relationship Mapping Queries

### Gamer → Leader (Community Suggestions)

```sql
-- Find communities for a gamer
SELECT lp.* FROM leader_profiles lp
JOIN users u ON u.id = lp.user_id
WHERE lp.genre_focus IN (SELECT unnest(favorite_games) FROM users WHERE id = :gamer_id)
  AND u.play_style = (SELECT play_style FROM users WHERE id = :gamer_id)
  AND lp.collaboration_openness = 'OPEN'
ORDER BY lp.member_size_goal DESC;
```

### Leader → Sponsor (Campaign Matching)

```sql
-- Find sponsors for a leader
SELECT sp.* FROM sponsor_profiles sp
WHERE sp.target_audience && ARRAY[(SELECT genre_focus FROM leader_profiles WHERE user_id = :leader_id)]
  AND sp.objective IN ('AWARENESS', 'ENGAGEMENT')
  AND 'LEADER' = ANY(sp.preferred_partner_types)
ORDER BY sp.budget_range DESC;
```

### Gamer → Sponsor (Product Targeting)

```sql
-- Find products for a gamer
SELECT sp.* FROM sponsor_profiles sp
JOIN users u ON u.id = :gamer_id
WHERE sp.target_audience && u.favorite_games
  AND sp.objective = 'CONVERSION'
  AND u.achievement_motivation = ANY(ARRAY['REWARDS', 'RECOGNITION'])
ORDER BY sp.budget_range DESC;
```

---

## Migration Strategy

### Phase 1: MVP (Current)

- User table with auth + common fields
- GamerProfile for basic matchmaking
- Simple queries based on rank + game

### Phase 2: Communities

- LeaderProfile + LeaderPlatform
- Community discovery algorithm
- Leader-Gamer matching

### Phase 3: Monetization

- SponsorProfile
- Campaign matching algorithms
- Revenue tracking

### Phase 4: Advanced

- Multi-game profiles (one gamer, multiple game ranks)
- Reputation/trust scores
- ML-based recommendation engine

---

## Performance Considerations

### Index Strategy

- **B-tree indexes**: For equality and range queries (rank, budget)
- **GIN indexes**: For array containment queries (favorite_games, target_audience)
- **Composite indexes**: For multi-column filters (genre + openness)

### Query Optimization

- Use `EXPLAIN ANALYZE` to validate index usage
- Denormalize frequently accessed counts (member_count on LeaderProfile)
- Cache discovery queries in Redis with 5-minute TTL

### Scalability

- Partition User table by created_at for historical data
- Separate read replicas for discovery/search queries
- Use materialized views for complex recommendation queries

---

## Data Validation Rules

### User Level

- `email`: Valid email format, unique
- `username`: 3-30 chars, alphanumeric + underscore, unique
- `favoriteGames[]`: Max 10 games
- `weeklyCommitment`: 0-168 hours (max hours in a week)

### GamerProfile

- `currentRank`: Free-form but typically structured (e.g., "Rank Tier")
- `shortTermGoal`: Max 500 chars
- `preferredGameModes[]`: Max 10 modes

### LeaderProfile

- `communityName`: 3-100 chars, required
- `genreFocus`: Required for matching
- `memberSizeGoal`: > 0 if set
- `platforms`: At least one platform recommended

### SponsorProfile

- `brandName`: 3-100 chars, required
- `targetAudience[]`: At least one genre required
- `budgetRange`: >= 0 (in cents)

---

## Example Use Cases

### 1. Gamer Onboarding

```typescript
// Step 1: Create user
const user = await prisma.user.create({
  data: {
    email: 'gamer@example.com',
    username: 'ProGamer123',
    passwordHash: hashedPassword,
    displayName: 'Pro Gamer',
    country: 'US',
    timezone: 'America/New_York',
    favoriteGames: ['Valorant', 'CS:GO'],
    playStyle: 'COMPETITIVE',
    weeklyCommitment: 20,
  },
});

// Step 2: Create gamer profile
const gamerProfile = await prisma.gamerProfile.create({
  data: {
    userId: user.id,
    currentRank: 'Diamond 2',
    preferredGameModes: ['Ranked', 'Competitive'],
    longTermVision: 'COMPETITIVE',
    willingToMentor: false,
    shareAchievements: true,
  },
});
```

### 2. Leader Onboarding

```typescript
// Create leader profile for existing user
const leaderProfile = await prisma.leaderProfile.create({
  data: {
    userId: user.id,
    communityName: 'FPS Legends',
    genreFocus: 'FPS',
    memberSizeGoal: 1000,
    missionIntent: 'GROWTH',
    collaborationOpenness: 'OPEN',
    incentiveSystem: 'XP',
    desiredMetrics: ['RETENTION', 'ENGAGEMENT'],
    platforms: {
      create: [
        {
          platformType: 'DISCORD',
          platformHandle: 'FPSLegends#1234',
          isVerified: true,
        },
        {
          platformType: 'TWITCH',
          platformHandle: 'FPSLegends',
          isVerified: false,
        },
      ],
    },
  },
});
```

### 3. Multi-Role User

```typescript
// User can be both gamer and leader
const fullProfile = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    gamerProfile: true,
    leaderProfile: {
      include: { platforms: true },
    },
    sponsorProfile: true,
  },
});

// Check roles
const isGamer = !!fullProfile.gamerProfile;
const isLeader = !!fullProfile.leaderProfile;
const isSponsor = !!fullProfile.sponsorProfile;
```

---

## Future Enhancements

1. **Multi-Game Profiles**: Allow one gamer to have different ranks per game
2. **Skill Verification**: Integrate with game APIs (Riot, Steam) to verify ranks
3. **Reputation System**: Track mentor effectiveness, community engagement
4. **Dynamic Recommendations**: ML model trained on successful matches
5. **Achievement System**: Store achievements with rarity/unlock criteria
6. **Team Formation**: Group profiles for squad/clan management
7. **Event Participation**: Track tournament/event attendance
8. **Content Creation**: Link created content (guides, streams) to profiles
