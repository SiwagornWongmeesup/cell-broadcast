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
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !['user','admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = session.user.role;
    let allDisasterAlerts = [];

    if (role === 'user') {
      const now = new Date();
      const { searchParams } = new URL(req.url);
      const lat = parseFloat(searchParams.get('lat'));
      const lng = parseFloat(searchParams.get('lng'));
      const userId = session.user.id;

      if (isNaN(lat) || isNaN(lng)) {
        return NextResponse.json({ error: 'Invalid latitude or longitude' }, { status: 400 });
      }

      const alerts = await Alert.find({ expiresAt: { $gt: now } });

      // filter nearby & unread & undismissed
      const nearbyAlerts = alerts
        .filter(alert => alert.location)
        .filter(alert => !alert.readBy?.includes(userId))
        .filter(alert => !alert.dismissedBy?.includes(userId))
        .filter(alert => {
          const distance = getDistance(lat, lng, alert.location.lat, alert.location.lng);
          const alertRadius = alert.radius < 100 ? alert.radius * 1000 : alert.radius;
          return distance <= alertRadius;
        });

      const latestAlert = alerts
        .filter(alert => alert.location)
        .filter(alert => !alert.readBy?.includes(userId))
        .filter(alert => !alert.dismissedBy?.includes(userId))
        .sort((a,b) => b.createdAt - a.createdAt)[0] || null;

      // สำหรับ table ประวัติ: ส่ง alerts ทั้งหมดที่ยังไม่หมดอายุ
      allDisasterAlerts = alerts.sort((a,b) => b.createdAt - a.createdAt);

      return NextResponse.json({
        success: true,
        nearbyAlerts,
        latestAlert,
        allDisasterAlerts,
      });

    } else if (role === 'admin') {
      // สำหรับ admin: ดึง alert ทั้งหมด
      allDisasterAlerts = await Alert.find().sort({ createdAt: -1 });

      return NextResponse.json({
        success: true,
        allDisasterAlerts,
      });
    }

  } catch (err) {
    console.error('GET /api/alerts error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error', details: err.message },
      { status: 500 }
    );
  }
}
