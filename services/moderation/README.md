# @community-gaming/moderation

Moderation service: rules engine, queues, decisions, appeals.

## Pipeline

1. **Client Prefilter**: Basic profanity/spam detection
2. **Rules Engine**: Community-specific rules
3. **ML Assist**: Toxicity scoring, image classification
4. **Human Review**: Flagged content queue
5. **Appeals**: User appeals and moderator review

## Responsibilities

- Moderation queue management
- Decision logging and audit trail
- Trust score calculations
- Ban/mute/warn actions
- Appeal handling
