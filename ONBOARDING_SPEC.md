# Onboarding & Profile Creation System - Technical Specification

## 1. Executive Summary

**Goal**: Create a role-aware, progressive onboarding system that achieves 80%+ completion rate while collecting high-quality data for matchmaking, recommendations, and monetization.

**Success Metrics**:
- Completion rate: ≥80%
- Profile completeness: ≥85%
- Time to first action (join community/mission): <24 hours
- Step load time: <200ms
- Match success rate: ≥90%

---

## 2. System Architecture

### 2.1 Frontend Architecture

```
apps/web/src/
├── app/
│   └── (public)/
│       └── onboarding/
│           ├── layout.tsx                 # Onboarding wrapper (progress, navigation)
│           ├── page.tsx                   # Welcome & role selection
│           ├── profile/
│           │   └── page.tsx               # Step 2: Shared profile setup
│           ├── [role]/                    # Dynamic role-based steps
│           │   ├── intent/page.tsx        # Step 3: Intent definition
│           │   ├── goals/page.tsx         # Step 4: Growth goals
│           │   └── preferences/page.tsx   # Step 5: Discovery preferences
│           └── complete/
│               └── page.tsx               # Step 6: Completion summary
│
├── features/
│   └── onboarding/
│       ├── components/
│       │   ├── OnboardingLayout.tsx       # Progress bar, stepper
│       │   ├── RoleCard.tsx               # Role selection cards
│       │   ├── ProfileForm.tsx            # Shared profile fields
│       │   ├── GamerIntentForm.tsx        # Gamer-specific intent
│       │   ├── LeaderIntentForm.tsx       # Leader-specific intent
│       │   ├── SponsorIntentForm.tsx      # Sponsor-specific intent
│       │   ├── GoalsForm.tsx              # Growth goals (dynamic by role)
│       │   ├── PreferencesForm.tsx        # Discovery preferences
│       │   └── CompletionCard.tsx         # Success animation + CTAs
│       ├── hooks/
│       │   ├── useOnboardingFlow.ts       # State management
│       │   ├── useProfileCompletion.ts    # Completion scoring
│       │   └── useMatchPreview.ts         # Real-time match count
│       ├── slice/
│       │   └── onboardingSlice.ts         # Redux state
│       └── api/
│           └── onboardingApi.ts           # RTK Query endpoints
│
└── lib/
    └── onboarding/
        ├── flowConfig.ts                  # Step definitions by role
        ├── validationSchemas.ts           # Zod schemas per step
        └── completionScoring.ts           # Profile completeness algorithm
```

### 2.2 Backend Architecture

```
services/identity/src/
├── controllers/
│   ├── onboarding.controller.ts          # Onboarding-specific endpoints
│   └── profile.controller.ts             # Profile CRUD (extended)
├── services/
│   ├── onboarding.service.ts             # Onboarding business logic
│   ├── profileCompletion.service.ts      # Calculate completion %
│   └── matchingPreview.service.ts        # Preview potential matches
└── types/
    └── onboarding.types.ts               # Step data types
```

---

## 3. Data Model Extensions

### 3.1 Onboarding Progress Tracking

```prisma
// New model: OnboardingProgress
model OnboardingProgress {
  id              String   @id @default(uuid())
  userId          String   @unique @map("user_id")
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  selectedRole    String   @map("selected_role") // "gamer", "leader", "sponsor"
  currentStep     String   @map("current_step")  // "welcome", "profile", "intent", etc.
  completedSteps  String[] @default([]) @map("completed_steps")

  // Step data (JSONB for flexibility)
  profileData     Json?    @map("profile_data")
  intentData      Json?    @map("intent_data")
  goalsData       Json?    @map("goals_data")
  preferencesData Json?    @map("preferences_data")

  completionScore Int      @default(0) @map("completion_score") // 0-100
  isCompleted     Boolean  @default(false) @map("is_completed")

  startedAt       DateTime @default(now()) @map("started_at")
  completedAt     DateTime? @map("completed_at")
  lastStepAt      DateTime @default(now()) @map("last_step_at")

  @@map("onboarding_progress")
  @@index([userId])
  @@index([isCompleted])
}
```

### 3.2 Profile Completion Weights

```typescript
// Field weights for completion scoring
const COMPLETION_WEIGHTS = {
  // Shared fields (40 points)
  displayName: 5,
  avatar: 10,
  country: 5,
  timezone: 5,
  favoriteGames: 10,  // At least 1 game
  playStyle: 5,

  // Role-specific fields (60 points)
  gamer: {
    currentRank: 10,
    preferredGameModes: 10,
    shortTermGoal: 15,
    longTermVision: 10,
    weeklyCommitment: 10,
    achievementMotivation: 5,
  },
  leader: {
    communityName: 15,
    genreFocus: 10,
    memberSizeGoal: 10,
    missionIntent: 10,
    platforms: 10,  // At least 1 platform
    incentiveSystem: 5,
  },
  sponsor: {
    brandName: 15,
    category: 10,
    targetAudience: 15,  // At least 1 genre
    objective: 10,
    budgetRange: 5,
    preferredPartnerTypes: 5,
  },
};
```

---

## 4. Step-by-Step Flow Design

### Step 0: Welcome & Role Selection

**Route**: `/onboarding`

**UI Components**:
- Hero section with platform tagline
- 3 role cards with benefits:
  - **Gamer**: "Find your squad, track progress, earn rewards"
  - **Leader**: "Build communities, attract members, secure sponsors"
  - **Sponsor**: "Reach your audience, power campaigns, track ROI"
- Preview of what each role unlocks

**Actions**:
```typescript
// User selects role
POST /api/onboarding/start
Body: { role: "gamer" | "leader" | "sponsor" }
Response: { progressId, nextStep: "profile" }
```

**State**:
```typescript
{
  selectedRole: "gamer",
  currentStep: "profile",
  completedSteps: ["welcome"],
  completionScore: 5,
}
```

---

### Step 1: Profile Setup (Shared)

**Route**: `/onboarding/profile`

**Fields**:
```typescript
{
  displayName: string;        // Required
  avatar?: File;              // Optional (can upload later)
  country: string;            // Dropdown (ISO codes)
  timezone: string;           // Auto-detect or select
  favoriteGames: string[];    // Multi-select (min 1, max 10)
  playStyle: PlayStyle;       // CASUAL, COMPETITIVE, CONTENT_CREATOR
}
```

**UI Features**:
- Avatar upload with preview
- Game search autocomplete (popular games suggested)
- Timezone auto-detection with override
- Progress bar: "20% complete"

**Validation**:
```typescript
const ProfileSetupSchema = z.object({
  displayName: z.string().min(3).max(50),
  avatar: z.string().url().optional(),
  country: z.string().length(2), // ISO country code
  timezone: z.string(), // IANA timezone
  favoriteGames: z.array(z.string()).min(1).max(10),
  playStyle: PlayStyleSchema,
});
```

**Actions**:
```typescript
PATCH /api/onboarding/progress/:id
Body: { step: "profile", data: ProfileSetupSchema }
Response: { completionScore: 35, nextStep: "intent" }
```

---

### Step 2: Intent Definition (Role-Specific)

**Route**: `/onboarding/[role]/intent`

#### 2A. Gamer Intent

**Fields**:
```typescript
{
  primaryGoal: "skill" | "rank" | "social" | "recognition";
  shortTermGoal?: string;      // Free text (optional)
  longTermVision: LongTermVision; // STREAMER, COMPETITIVE, CASUAL_EXPERT
}
```

**UI**:
- Radio cards with icons for primary goal
- Text area for short-term goal (e.g., "Reach Diamond this season")
- Long-term vision selector

#### 2B. Leader Intent

**Fields**:
```typescript
{
  communityName: string;
  genreFocus: string;           // Game genre (FPS, MOBA, etc.)
  memberSizeGoal?: number;      // Target member count
  missionIntent: MissionIntent; // GROWTH, ENGAGEMENT, SPONSORSHIP
  collaborationOpenness: CollaborationOpenness; // OPEN, INVITE_ONLY
}
```

**UI**:
- Community name input with availability check
- Genre selector (from favoriteGames or custom)
- Mission intent cards
- Public/Private community toggle

#### 2C. Sponsor Intent

**Fields**:
```typescript
{
  brandName: string;
  category: BrandCategory;      // HARDWARE, SOFTWARE, EVENTS, MERCH
  targetAudience: string[];     // Game genres (min 1)
  objective: CampaignObjective; // AWARENESS, ENGAGEMENT, CONVERSION
}
```

**UI**:
- Brand name input
- Category selector
- Target audience multi-select (genres from platform taxonomy)
- Objective cards with descriptions

**Progress**: "50% complete"

---

### Step 3: Growth Goals (Role-Specific)

**Route**: `/onboarding/[role]/goals`

#### 3A. Gamer Goals

**Fields**:
```typescript
{
  weeklyCommitment: number;     // Hours per week (0-168)
  achievementMotivation: MotivationType; // XP, RECOGNITION, REWARDS
  currentRank?: string;         // Optional rank/tier
  preferredGameModes: string[]; // E.g., ["Ranked", "Arena"]
  willingToMentor: boolean;     // Unlock mentor system
}
```

**UI**:
- Slider for weekly hours
- Motivation cards (XP bar, trophy, gift box icons)
- Rank input (free text or dropdown by game)
- Game mode multi-select
- "Help others improve" checkbox

#### 3B. Leader Goals

**Fields**:
```typescript
{
  incentiveSystem: IncentiveSystem; // TOKENS, BADGES, XP
  desiredMetrics: AnalyticsMetric[]; // RETENTION, ENGAGEMENT, REVENUE
  platforms: Array<{
    platformType: PlatformType;
    platformHandle: string;
  }>;
}
```

**UI**:
- Incentive system selector
- Metrics checkboxes
- Platform connections:
  - Discord (server ID or invite link)
  - Twitch (channel name)
  - Steam (group URL)
  - YouTube (channel)
  - Twitter (handle)

#### 3C. Sponsor Goals

**Fields**:
```typescript
{
  budgetRange?: number;         // Monthly budget in cents
  preferredPartnerTypes: PartnerType[]; // LEADER, COMMUNITY, TOP_GAMER
  conversionMetrics: ConversionMetric[]; // CLICKS, SIGNUPS, REDEMPTIONS
}
```

**UI**:
- Budget slider (optional, ranges: <$500, $500-$2k, $2k-$10k, >$10k)
- Partner type multi-select
- Conversion metric checkboxes

**Progress**: "75% complete"

---

### Step 4: Discovery Preferences (Shared)

**Route**: `/onboarding/[role]/preferences`

**Fields**:
```typescript
{
  contentTypes: ContentType[];           // TOURNAMENTS, STREAMS, TIPS, PRODUCTS
  communicationChannels: CommunicationChannel[]; // DISCORD, IN_APP, EMAIL
  notificationFrequency: "realtime" | "daily" | "weekly";
}
```

**UI**:
- Content type multi-select with descriptions
- Communication channel preferences
- Notification frequency radio buttons

**Progress**: "90% complete"

---

### Step 5: Completion Summary

**Route**: `/onboarding/complete`

**UI Elements**:
- Success animation (confetti, checkmark)
- Profile completeness card: "95% complete"
- Missing fields prompt (if any): "Add your avatar for 5 more points"
- Real-time match preview:
  - **Gamers**: "47 communities match your interests"
  - **Leaders**: "312 potential members found"
  - **Sponsors**: "23 communities seeking sponsorship"

**Next Actions (CTAs)**:
```typescript
// Role-specific suggestions
gamer: [
  "Join your first community",
  "Start a daily mission",
  "Find a mentor"
]

leader: [
  "Invite your first members",
  "Create a community event",
  "Apply for sponsorship"
]

sponsor: [
  "Browse matching communities",
  "Create your first campaign",
  "View analytics dashboard"
]
```

**Actions**:
```typescript
POST /api/onboarding/complete/:id
Response: {
  completionScore: 95,
  missingFields: ["avatar"],
  recommendations: {
    communities: 47,
    missions: 12,
    mentors: 8
  },
  nextSteps: [...]
}
```

---

## 5. API Endpoints

### 5.1 Onboarding Management

```typescript
// Start onboarding
POST /api/onboarding/start
Body: { role: "gamer" | "leader" | "sponsor" }
Response: OnboardingProgress

// Get current progress
GET /api/onboarding/progress
Response: OnboardingProgress

// Update step data
PATCH /api/onboarding/progress/:id
Body: { step: string, data: Record<string, any> }
Response: { completionScore: number, nextStep: string }

// Complete onboarding
POST /api/onboarding/complete/:id
Response: {
  completionScore: number,
  missingFields: string[],
  recommendations: {
    communities?: number,
    missions?: number,
    mentors?: number,
    leaders?: number,
    sponsors?: number
  },
  nextSteps: string[]
}

// Abandon onboarding (resume later)
POST /api/onboarding/abandon/:id
Response: { saved: boolean }
```

### 5.2 Profile Creation Endpoints

```typescript
// Create role-specific profile
POST /api/user/profiles/gamer
Body: CreateGamerProfile
Response: GamerProfile

POST /api/user/profiles/leader
Body: CreateLeaderProfile (with platforms)
Response: LeaderProfile

POST /api/user/profiles/sponsor
Body: CreateSponsorProfile
Response: SponsorProfile
```

### 5.3 Matching Preview Endpoints

```typescript
// Preview potential matches during onboarding
GET /api/onboarding/preview/communities?userId=:id
Response: { count: number, samples: Community[] }

GET /api/onboarding/preview/members?userId=:id
Response: { count: number, samples: User[] }

GET /api/onboarding/preview/sponsors?userId=:id
Response: { count: number, samples: Sponsor[] }
```

---

## 6. Frontend State Management

### 6.1 Redux Slice

```typescript
// features/onboarding/slice/onboardingSlice.ts
interface OnboardingState {
  progressId: string | null;
  selectedRole: "gamer" | "leader" | "sponsor" | null;
  currentStep: string;
  completedSteps: string[];
  completionScore: number;

  // Step data
  profileData: Partial<ProfileSetup>;
  intentData: Record<string, any>;
  goalsData: Record<string, any>;
  preferencesData: Partial<Preferences>;

  // UI state
  isLoading: boolean;
  isSaving: boolean;
  errors: Record<string, string>;

  // Preview data
  matchPreview: {
    communities?: number;
    members?: number;
    sponsors?: number;
  };
}

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    startOnboarding(state, action: PayloadAction<{ role: string }>) {
      state.selectedRole = action.payload.role;
      state.currentStep = "profile";
      state.completedSteps = ["welcome"];
    },

    completeStep(state, action: PayloadAction<{ step: string, data: any }>) {
      state.completedSteps.push(action.payload.step);
      // Store step data
      if (action.payload.step === "profile") {
        state.profileData = action.payload.data;
      }
      // ... similar for other steps
    },

    updateCompletionScore(state, action: PayloadAction<number>) {
      state.completionScore = action.payload;
    },

    updateMatchPreview(state, action: PayloadAction<MatchPreview>) {
      state.matchPreview = action.payload;
    },
  },
});
```

### 6.2 Custom Hooks

```typescript
// features/onboarding/hooks/useOnboardingFlow.ts
export function useOnboardingFlow() {
  const dispatch = useAppDispatch();
  const state = useAppSelector(selectOnboarding);

  const goToNextStep = useCallback(() => {
    const steps = FLOW_CONFIG[state.selectedRole];
    const currentIndex = steps.indexOf(state.currentStep);
    const nextStep = steps[currentIndex + 1];

    dispatch(setCurrentStep(nextStep));
  }, [state.currentStep, state.selectedRole]);

  const saveStepData = useCallback(async (step: string, data: any) => {
    dispatch(completeStep({ step, data }));
    await dispatch(saveOnboardingProgress({ step, data }));
  }, []);

  return {
    currentStep: state.currentStep,
    completionScore: state.completionScore,
    goToNextStep,
    goToPreviousStep,
    saveStepData,
    canProceed: isStepValid(state.currentStep, state[`${state.currentStep}Data`]),
  };
}

// features/onboarding/hooks/useProfileCompletion.ts
export function useProfileCompletion() {
  const state = useAppSelector(selectOnboarding);

  const calculateScore = useMemo(() => {
    return calculateCompletionScore(
      state.selectedRole,
      state.profileData,
      state.intentData,
      state.goalsData,
      state.preferencesData
    );
  }, [state]);

  const missingFields = useMemo(() => {
    return getMissingFields(state.selectedRole, state);
  }, [state]);

  return {
    completionScore: calculateScore,
    missingFields,
    isComplete: calculateScore >= 85,
  };
}
```

---

## 7. Matching Algorithm Integration

### 7.1 Real-Time Match Preview

As users fill out onboarding, show live count of potential matches:

```typescript
// services/identity/src/services/matchingPreview.service.ts
export class MatchingPreviewService {
  async previewCommunities(userId: string): Promise<{ count: number; samples: any[] }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { gamerProfile: true },
    });

    if (!user) throw new Error('User not found');

    // Match communities based on:
    // - favoriteGames ∩ leader.genreFocus
    // - playStyle match
    // - collaborationOpenness = OPEN
    const communities = await prisma.leaderProfile.findMany({
      where: {
        genreFocus: { in: user.favoriteGames },
        collaborationOpenness: 'OPEN',
        user: {
          playStyle: user.playStyle,
        },
      },
      take: 3, // Sample
    });

    const count = await prisma.leaderProfile.count({
      where: { /* same filters */ },
    });

    return { count, samples: communities };
  }

  async previewMembers(userId: string): Promise<{ count: number; samples: any[] }> {
    const leader = await prisma.leaderProfile.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!leader) throw new Error('Leader profile not found');

    // Match gamers based on:
    // - favoriteGames includes leader.genreFocus
    // - playStyle match
    const gamers = await prisma.user.findMany({
      where: {
        favoriteGames: { has: leader.genreFocus },
        playStyle: leader.user.playStyle,
        gamerProfile: { isNot: null },
      },
      take: 3,
    });

    const count = await prisma.user.count({
      where: { /* same filters */ },
    });

    return { count, samples: gamers };
  }

  async previewSponsors(userId: string): Promise<{ count: number; samples: any[] }> {
    const leader = await prisma.leaderProfile.findUnique({
      where: { userId },
    });

    if (!leader) throw new Error('Leader profile not found');

    // Match sponsors based on:
    // - sponsor.targetAudience includes leader.genreFocus
    // - sponsor.preferredPartnerTypes includes LEADER
    const sponsors = await prisma.sponsorProfile.findMany({
      where: {
        targetAudience: { has: leader.genreFocus },
        preferredPartnerTypes: { has: 'LEADER' },
      },
      take: 3,
    });

    const count = await prisma.sponsorProfile.count({
      where: { /* same filters */ },
    });

    return { count, samples: sponsors };
  }
}
```

---

## 8. Gamification & Incentives

### 8.1 Completion Rewards

```typescript
// Unlock features based on completion score
const COMPLETION_MILESTONES = {
  25: {
    reward: "Basic recommendations enabled",
    features: ["browse_communities"],
  },
  50: {
    reward: "Profile visible in search",
    features: ["appear_in_discovery", "send_invites"],
  },
  75: {
    reward: "Personalized missions unlocked",
    features: ["missions", "matchmaking"],
  },
  90: {
    reward: "Full platform access + 100 XP",
    features: ["all"],
    xpReward: 100,
  },
};
```

### 8.2 Progress Visualization

```typescript
// Progress indicators
- Linear progress bar (0-100%)
- Step indicator (1 of 6)
- Visual checklist
- Animated confetti on completion

// Motivational copy
"Just 2 more questions!" (at 80%)
"You're almost there!" (at 90%)
"Profile complete! 🎉" (at 100%)
```

---

## 9. Performance Optimization

### 9.1 Backend

- **Cache match previews** (Redis, 5 min TTL): `preview:communities:{userId}`
- **Lazy load samples**: Only fetch 3 samples for preview
- **Debounce autosave**: Save progress every 10 seconds or on step change
- **Batch profile updates**: Merge updates before writing to DB

### 9.2 Frontend

- **Code split by role**: Lazy load role-specific forms
- **Optimistic updates**: Show completion score immediately, sync in background
- **Prefetch next step**: Load next step component while user fills current
- **Image optimization**: Compress avatars to <100KB

---

## 10. Analytics & Tracking

### 10.1 Events to Track

```typescript
// Onboarding events
onboarding_started { role: string }
onboarding_step_completed { step: string, timeSpent: number }
onboarding_step_abandoned { step: string }
onboarding_completed { completionScore: number, duration: number }

// Engagement events
first_community_joined { withinHours: number }
first_mission_started { withinHours: number }
profile_updated_after_onboarding { fieldsUpdated: string[] }
```

### 10.2 Success Metrics Dashboard

```typescript
// Track in analytics service
{
  completion_rate: (completed / started) * 100,
  avg_completion_time: average(completionDurations),
  drop_off_by_step: {
    welcome: 5%,
    profile: 15%,
    intent: 30%,
    goals: 45%,
    preferences: 60%,
    complete: 80%,
  },
  profile_completeness_avg: average(completionScores),
  time_to_first_action: average(timeToFirstCommunityJoin),
}
```

---

## 11. Testing Strategy

### 11.1 Unit Tests

- Validation schemas (Zod)
- Completion scoring algorithm
- Match preview logic

### 11.2 Integration Tests

- Full onboarding flow (E2E)
- Profile creation with all roles
- Match preview accuracy

### 11.3 A/B Tests

- Step order variations
- Field combinations (required vs optional)
- Progress visualization styles
- CTA copy variations

---

## 12. Future Enhancements

1. **AI-Powered Suggestions**: ML model suggests games, communities based on partial data
2. **Social Onboarding**: Import friends from Steam/Discord
3. **Video Tutorials**: Embedded guides per step
4. **Quick Start Mode**: Skip to 50% complete with smart defaults
5. **Profile Templates**: Pre-filled profiles for common archetypes
6. **Voice Onboarding**: For accessibility
7. **Multi-Language Support**: Localized flows

---

## 13. Implementation Timeline

### Phase 1 (Week 1-2): Foundation
- Database schema updates (OnboardingProgress)
- API endpoints (start, save, complete)
- Basic Redux state management

### Phase 2 (Week 3-4): Core Flow
- Welcome + role selection
- Shared profile setup
- Role-specific intent forms

### Phase 3 (Week 5-6): Advanced Features
- Growth goals forms
- Discovery preferences
- Match preview integration

### Phase 4 (Week 7-8): Polish
- Completion summary
- Gamification (milestones, XP)
- Analytics integration
- Performance optimization

### Phase 5 (Week 9-10): Testing & Launch
- E2E tests
- A/B test setup
- Soft launch + monitoring
- Iteration based on metrics
