// components/MapUser.jsx
'use client';

import { MapContainer, Marker, TileLayer, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// ฟังก์ชันคำนวณระยะทาง (Haversine formula)
function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000; // รัศมีโลก (เมตร)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function MapUser({ markers = [], userLocation }) {
  // userLocation = { lat: xxx, lng: xxx } ต้องส่งเข้ามาจาก props
  // ถ้าไม่มีจะใช้กรุงเทพเป็นค่า default
  const center = userLocation
    ? [userLocation.lat, userLocation.lng]
    : [13.736717, 100.523186];

  // Custom Icon
  const customIcon = L.icon({
    iconUrl: '/marker-icon.png',
    iconRetinaUrl: '/marker-icon-2x.png',
    shadowUrl: '/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  return (
    <MapContainer center={center} zoom={12} style={{ height: '400px', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* Marker แสดงตำแหน่งผู้ใช้ */}
      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lng]}>
          <Popup>ตำแหน่งของคุณ</Popup>
        </Marker>
      )}

      {/* Marker และ Circle สำหรับ Alert */}
      {markers.map((alert, idx) => {
  // ✅ รองรับทั้งสองรูปแบบ:
  // 1. alert.position.lat, alert.position.lng
  // 2. alert.lat, alert.lng
  const markerLat = alert?.position?.lat ?? alert?.lat;
  const markerLng = alert?.position?.lng ?? alert?.lng;

  // ถ้าไม่มี lat หรือ lng → ไม่ render
  if (!markerLat || !markerLng) return null;

  const now = new Date();
  if (alert.expireAt && new Date(alert.expireAt) <= now) {
    return null; // หมดอายุ → ไม่แสดง marker
  }

  return (
    <div key={alert._id || idx}>
      <Marker position={[markerLat, markerLng]} icon={customIcon}>
        <Popup>
          <strong>ประเภทเหตุการณ์:</strong> {alert.type || 'ไม่ระบุ'}
          <br />
          <strong>ข้อความ:</strong> {alert.message || 'ไม่มีข้อความ'}
          <br />
          {alert.radius && (
            <>
              <strong>รัศมี:</strong> {alert.radius} เมตร
              <br />
            </>
          )}
          <strong>เวลา:</strong>{' '}
          {alert.createdAt
            ? new Date(alert.createdAt).toLocaleString()
            : 'ไม่ระบุ'}
        </Popup>
      </Marker>

      {alert.radius && (
        <Circle
          center={[markerLat, markerLng]}
          radius={alert.radius}
          pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.2 }}
        />
      )}
    </div>
  )
})}

    </MapContainer>
  );
}
