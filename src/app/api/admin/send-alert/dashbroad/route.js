import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../../../lib/mongodb";

export async function GET() {
  try {
    const client = await connectMongoDB();
    const db = client.db("gayman"); // ชื่อ DB จริง
    const alerts = await db.collection("alerts").find({}).toArray(); 

    const totalAlerts = alerts.length;
    const success = alerts.filter(a => a.status === "success").length;
    const fail = alerts.filter(a => a.status === "fail").length;

    const typeStats = alerts.reduce((acc, alert) => {
      acc[alert.type] = (acc[alert.type] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({
      totalAlerts,
      success,
      fail,
      typeStats,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
