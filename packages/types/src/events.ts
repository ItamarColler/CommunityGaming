import { z } from 'zod';

// Event backbone schemas for NATS/Kafka

export const BaseEventSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  version: z.string().default('1.0'),
});

export const CommunityCreatedEventSchema = BaseEventSchema.extend({
  type: z.literal('community.created'),
  payload: z.object({
    communityId: z.string().uuid(),
    ownerId: z.string().uuid(),
    name: z.string(),
  }),
});

export const MatchFoundEventSchema = BaseEventSchema.extend({
  type: z.literal('match.found'),
  payload: z.object({
    matchId: z.string().uuid(),
    playerIds: z.array(z.string().uuid()),
    gameMode: z.string(),
  }),
});

export type CommunityCreatedEvent = z.infer<typeof CommunityCreatedEventSchema>;
export type MatchFoundEvent = z.infer<typeof MatchFoundEventSchema>;
