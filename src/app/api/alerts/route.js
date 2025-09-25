import { NextResponse } from 'next/server';
import { connectMongoDB } from "../../../../lib/mongodb";
import Alert from '../../../../Models/Alerts';

// ฟังก์ชันคำนวณระยะทาง (Haversine Formula)
function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000; // รัศมีโลก (เมตร)
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // ระยะทาง (เมตร)
}

export async function GET(req) {
  try {
    await connectMongoDB();

    const now = new Date();
    const { searchParams } = new URL(req.url);

    const lat = parseFloat(searchParams.get('lat'));
    const lng = parseFloat(searchParams.get('lng'));
    const userId = searchParams.get('userId'); // หรือใช้ session.user.id ถ้าใช้ auth

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json({ error: 'Invalid latitude or longitude' }, { status: 400 });
    }

    // ดึง alert ที่ยังไม่หมดอายุ
    const allDisasterAlerts = await Alert.find({ expiresAt: { $gt: now } });

    // แจ้งเตือนล่าสุดที่ยังไม่อ่านโดย user
    const latestAlert = await Alert.findOne({
      readBy: { $ne: userId },
      expiresAt: { $gt: now }
    }).sort({ createdAt: -1 });

    // แจ้งเตือนใกล้เคียง
    const nearbyAlerts = allDisasterAlerts
      .filter(alert => alert.location) // มี location
      .filter(alert => userId && !alert.readBy?.includes(userId))
      .filter(alert => !alert.dismissedBy?.includes(userId))
      .filter(alert => {
        const distance = getDistance(lat, lng, alert.location.lat, alert.location.lng);
        return distance <= alert.radius; // ระยะตาม radius ของ alert
      });

    console.log("Nearby Alerts:", nearbyAlerts);

    return NextResponse.json({
      nearbyAlerts,       // แจ้งเตือนใกล้เคียง
      latestAlert,        // แจ้งเตือนล่าสุด
      allDisasterAlerts,  // หน้าประวัติ
    });
  } catch (err) {
    console.error('GET /api/alerts error:', err);
    return NextResponse.json(
      { error: 'Internal Server Error', details: err.message },
      { status: 500 }
    );
  }
}
