export const VAPID_PUBLIC_KEY = 'BJ9FRDjTIrC78FfOp3H7ugYZRJQ82HiXmEQv-UiPv7jsSV9Lcfu-3_Ja65c242iFVk3oDUFTV1eSjkBT1yAHn0E';
export const VAPID_PRIVATE_KEY = 'Ai1YZZYLT_Som2DNtduEf22XFYphQNWqzLzPIEXZ7ZE';

import webpush from 'web-push';
webpush.setVapidDetails(
  'mailto:s66122202053@ssru.ac.th',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);
