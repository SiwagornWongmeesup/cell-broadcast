import webpush from 'web-push';

webpush.setVapidDetails(
  'mailto:' + process.env.GMAIL_USER,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);
