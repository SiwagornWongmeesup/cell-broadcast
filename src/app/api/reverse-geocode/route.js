// /app/api/reverse-geocode/route.js
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { lat, lng } = await request.json(); // ดึงจาก body ของ POST

    if (!lat || !lng) {
      return NextResponse.json({ error: 'Missing lat or lng' }, { status: 400 });
    }

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      {
        method: 'GET',
        headers: {
          'User-Agent': 'cell-broadcast-app/1.0 (s66122202053@ssru.ac.th)', 
          'Accept-Language': 'th',
          'Cache-Control': 'no-cache',
        },
      }
    );
    const data = await response.json();

    const province = data.address.state || data.address.region || '';
    const district = 
      data.address.city_district ||
      data.address.suburb ||
      data.address.county ||
      data.address.town ||
      '';

    return NextResponse.json({ province, district });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
