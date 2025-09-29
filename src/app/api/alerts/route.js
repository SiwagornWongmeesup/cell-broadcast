import { NextResponse } from 'next/server';
import { connectMongoDB } from "../../../../lib/mongodb";
import Alert from '../../../../Models/Alerts';
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route"; 

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

    // ดึง session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session?.user?.role !== 'user') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const lat = parseFloat(searchParams.get('lat'));
    const lng = parseFloat(searchParams.get('lng'));

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json({ error: 'Invalid latitude or longitude' }, { status: 400 });
    }

    // ดึง alert ที่ยังไม่หมดอายุ
    const allDisasterAlerts = await Alert.find({ expiresAt: { $gt: now } });

    // แจ้งเตือนใกล้เคียง
    const nearbyAlerts = allDisasterAlerts
      .filter(alert => alert.location)
      .filter(alert => !alert.readBy?.includes(userId))
      .filter(alert => !alert.dismissedBy?.includes(userId))
      .filter(alert => {
        const distance = getDistance(lat, lng, alert.location.lat, alert.location.lng);
        // แปลง radius ถ้าเป็นค่าเล็กกว่า 100 สมมติเป็น km
        const alertRadius = alert.radius < 100 ? alert.radius * 1000 : alert.radius;
        return distance <= alertRadius;
      });

    // แจ้งเตือนล่าสุด
    const latestAlert = allDisasterAlerts
      .filter(alert => alert.location)
      .filter(alert => !alert.readBy?.includes(userId))
      .filter(alert => !alert.dismissedBy?.includes(userId))
      .sort((a, b) => b.createdAt - a.createdAt)[0] || null;

    console.log("Nearby Alerts:", nearbyAlerts);

    return NextResponse.json({
      nearbyAlerts,       // แจ้งเตือนใกล้เคียง
      latestAlert,        // แจ้งเตือนล่าสุด
      allDisasterAlerts,  // สำหรับหน้าประวัติ
    });
  } catch (err) {
    console.error('GET /api/alerts error:', err);
    return NextResponse.json(
      { error: 'Internal Server Error', details: err.message },
      { status: 500 }
    );
  }
}
