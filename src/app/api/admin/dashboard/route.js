import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../../lib/mongodb";

export async function GET() {
  try {
    const { db } = await connectMongoDB();  

    // ดึงข้อมูล alerts, users, userreports
    const alerts = await db.collection("alerts").find({}).toArray();
    const users = await db.collection("users").find({}).toArray();
    const userreports = await db.collection("userreports").find({}).toArray();

    // ดึง userprofiles เฉพาะที่มี instagram
    const userprofiles = await db.collection("userprofiles").find({
      instagram: { $exists: true, $ne: "" }
    }).toArray();

    const totalAlerts = alerts.length;
    const totalUsers = users.length;
    const totalUserreports = userreports.length;
    const totalUserprofiles = userprofiles.length;

    // สถิติประเภท alert
    const typeStats = alerts.reduce((acc, alert) => {
      acc[alert.type] = (acc[alert.type] || 0) + 1;
      return acc;
    }, {});

    // สถิติ user reports โดย title
    const statsReports = userreports.reduce((acc, report) => {
      acc[report.title] = (acc[report.title] || 0) + 1;
      return acc;
    }, {});
    //รวมเหตุการณ์ทั้งสอง
    const allDisasters = [...alerts.map(a => ({ key: a.type })), 
        ...userreports.map(r => ({ key: r.title }))];

    const allStats = allDisasters.reduce((acc, item) => {
    acc[item.key] = (acc[item.key] || 0) + 1;
    return acc;
    }, {});
    //รวมเหตุการณ์ส่งแจ้งเตือนรายเดือน
    const allEvents = [
      ...userreports.map(r => r.createdAt),
      ...alerts.map(a => a.createdAt)
    ];
    
    const countsByMonth = allEvents.reduce((acc, dateStr) => {
      const date = new Date(dateStr);
      const key = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const months = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."]
    const labels = Object.keys(countsByMonth)
    .sort()
    .map(k => {
    const [year, month] = k.split("-");
    return `${months[parseInt(month)-1]} ${year}`;
  });

  //Top user
  const topUsers = await db.collection("userreports").aggregate([
    { $match: { userId: { $ne: null } } },  // นับเฉพาะผู้ใช้ที่ล็อกอิน
    { 
      $group: {
        _id: "$userId",
        name: { $first: "$name" },  // ใช้ชื่อปัจจุบันของ user
        count: { $sum: 1 }          // นับจำนวน report
      }
    },
    { $sort: { count: -1 } },        // เรียงจากเยอะสุด
    { $limit: 5 }                    // Top 5
  ]).toArray();

    // ดึง IG ของ user ทั้งหมดเป็น array ของ string
    const instagramList = userprofiles.map(u => u.instagram);

    return NextResponse.json({
      totalAlerts,
      totalUsers,
      totalUserreports,
      totalUserprofiles,
      typeStats,
      statsReports,
      instagramList,
      allStats,
      countsByMonth,
      labels,
      topUsers
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
