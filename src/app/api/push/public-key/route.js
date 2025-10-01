// backend
import { VAPID_PUBLIC_KEY } from '../../../../../lib/push-keys'; // generate ด้วย web-push library

export default function handler(req, res) {
  res.status(200).json({ publicKey: VAPID_PUBLIC_KEY });
}
