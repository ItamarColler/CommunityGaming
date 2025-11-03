import { z } from 'zod';

export const CommunitySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(3).max(64),
  description: z.string().max(500).optional(),
  iconUrl: z.string().url().optional(),
  ownerId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Community = z.infer<typeof CommunitySchema>;
