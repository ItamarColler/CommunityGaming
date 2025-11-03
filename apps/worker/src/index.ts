console.log('Worker started');

// Background job consumers:
// - Email notifications
// - Analytics event processing
// - Content moderation queue
// - Image/video processing

process.on('SIGTERM', () => {
  console.log('Worker shutting down...');
  process.exit(0);
});
