-- CreateEnum
CREATE TYPE "PlayStyle" AS ENUM ('CASUAL', 'COMPETITIVE', 'CONTENT_CREATOR');

-- CreateEnum
CREATE TYPE "GoalType" AS ENUM ('SKILL', 'RANK', 'SOCIAL', 'CREATIVE');

-- CreateEnum
CREATE TYPE "MotivationType" AS ENUM ('XP', 'RECOGNITION', 'REWARDS');

-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('TOURNAMENTS', 'STREAMS', 'TIPS', 'PRODUCTS');

-- CreateEnum
CREATE TYPE "CommunicationChannel" AS ENUM ('DISCORD', 'IN_APP', 'EMAIL');

-- CreateEnum
CREATE TYPE "LongTermVision" AS ENUM ('STREAMER', 'COMPETITIVE', 'CASUAL_EXPERT');

-- CreateEnum
CREATE TYPE "MissionIntent" AS ENUM ('GROWTH', 'ENGAGEMENT', 'SPONSORSHIP');

-- CreateEnum
CREATE TYPE "CollaborationOpenness" AS ENUM ('OPEN', 'INVITE_ONLY');

-- CreateEnum
CREATE TYPE "IncentiveSystem" AS ENUM ('TOKENS', 'BADGES', 'XP');

-- CreateEnum
CREATE TYPE "AnalyticsMetric" AS ENUM ('RETENTION', 'ENGAGEMENT', 'REVENUE');

-- CreateEnum
CREATE TYPE "BrandCategory" AS ENUM ('HARDWARE', 'SOFTWARE', 'EVENTS', 'MERCH');

-- CreateEnum
CREATE TYPE "CampaignObjective" AS ENUM ('AWARENESS', 'ENGAGEMENT', 'CONVERSION');

-- CreateEnum
CREATE TYPE "PartnerType" AS ENUM ('LEADER', 'COMMUNITY', 'TOP_GAMER');

-- CreateEnum
CREATE TYPE "ConversionMetric" AS ENUM ('CLICKS', 'SIGNUPS', 'REDEMPTIONS');

-- CreateEnum
CREATE TYPE "PlatformType" AS ENUM ('DISCORD', 'TWITCH', 'STEAM', 'YOUTUBE', 'TWITTER');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "achievement_motivation" "MotivationType",
ADD COLUMN     "communication_channels" "CommunicationChannel"[] DEFAULT ARRAY[]::"CommunicationChannel"[],
ADD COLUMN     "content_types" "ContentType"[] DEFAULT ARRAY[]::"ContentType"[],
ADD COLUMN     "country" TEXT,
ADD COLUMN     "favorite_games" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "goal_type" "GoalType",
ADD COLUMN     "play_style" "PlayStyle",
ADD COLUMN     "timezone" TEXT,
ADD COLUMN     "weekly_commitment" INTEGER;

-- CreateTable
CREATE TABLE "gamer_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "current_rank" TEXT,
    "preferred_game_modes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "short_term_goal" TEXT,
    "long_term_vision" "LongTermVision",
    "willing_to_mentor" BOOLEAN NOT NULL DEFAULT false,
    "share_achievements" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gamer_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leader_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "community_name" TEXT NOT NULL,
    "genre_focus" TEXT NOT NULL,
    "member_size_goal" INTEGER,
    "mission_intent" "MissionIntent" NOT NULL,
    "collaboration_openness" "CollaborationOpenness" NOT NULL,
    "incentive_system" "IncentiveSystem" NOT NULL,
    "desired_metrics" "AnalyticsMetric"[] DEFAULT ARRAY[]::"AnalyticsMetric"[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leader_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leader_platforms" (
    "id" TEXT NOT NULL,
    "leader_profile_id" TEXT NOT NULL,
    "platform_type" "PlatformType" NOT NULL,
    "platform_handle" TEXT NOT NULL,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leader_platforms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sponsor_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "brand_name" TEXT NOT NULL,
    "category" "BrandCategory" NOT NULL,
    "target_audience" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "objective" "CampaignObjective" NOT NULL,
    "budget_range" INTEGER,
    "preferred_partner_types" "PartnerType"[] DEFAULT ARRAY[]::"PartnerType"[],
    "conversion_metrics" "ConversionMetric"[] DEFAULT ARRAY[]::"ConversionMetric"[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sponsor_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "gamer_profiles_user_id_key" ON "gamer_profiles"("user_id");

-- CreateIndex
CREATE INDEX "gamer_profiles_user_id_idx" ON "gamer_profiles"("user_id");

-- CreateIndex
CREATE INDEX "gamer_profiles_current_rank_idx" ON "gamer_profiles"("current_rank");

-- CreateIndex
CREATE INDEX "gamer_profiles_willing_to_mentor_idx" ON "gamer_profiles"("willing_to_mentor");

-- CreateIndex
CREATE UNIQUE INDEX "leader_profiles_user_id_key" ON "leader_profiles"("user_id");

-- CreateIndex
CREATE INDEX "leader_profiles_user_id_idx" ON "leader_profiles"("user_id");

-- CreateIndex
CREATE INDEX "leader_profiles_genre_focus_idx" ON "leader_profiles"("genre_focus");

-- CreateIndex
CREATE INDEX "leader_profiles_mission_intent_idx" ON "leader_profiles"("mission_intent");

-- CreateIndex
CREATE INDEX "leader_profiles_collaboration_openness_idx" ON "leader_profiles"("collaboration_openness");

-- CreateIndex
CREATE INDEX "leader_platforms_leader_profile_id_idx" ON "leader_platforms"("leader_profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "leader_platforms_leader_profile_id_platform_type_key" ON "leader_platforms"("leader_profile_id", "platform_type");

-- CreateIndex
CREATE UNIQUE INDEX "sponsor_profiles_user_id_key" ON "sponsor_profiles"("user_id");

-- CreateIndex
CREATE INDEX "sponsor_profiles_user_id_idx" ON "sponsor_profiles"("user_id");

-- CreateIndex
CREATE INDEX "sponsor_profiles_category_idx" ON "sponsor_profiles"("category");

-- CreateIndex
CREATE INDEX "sponsor_profiles_objective_idx" ON "sponsor_profiles"("objective");

-- AddForeignKey
ALTER TABLE "gamer_profiles" ADD CONSTRAINT "gamer_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leader_profiles" ADD CONSTRAINT "leader_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leader_platforms" ADD CONSTRAINT "leader_platforms_leader_profile_id_fkey" FOREIGN KEY ("leader_profile_id") REFERENCES "leader_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sponsor_profiles" ADD CONSTRAINT "sponsor_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
