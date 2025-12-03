'use client';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function EmergencyMap({ userLocation, userLabel, requests = [] }) {
  const center = userLocation ? [userLocation.lat, userLocation.lng] : [13.736717, 100.523186];

  const nameIcon = (name, color = '#ff4d4f') =>
    L.divIcon({
      className: 'name-label',
      html: `<div style="
        display: inline-block;
        background: red;
        color: white;
        padding: 6px 12px;
        border-radius: 8px;
        font-weight: bold;
        font-size: 14px;
        border: 2px solid white;
        white-space: nowrap;
        text-align: center;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        ">${name}</div>`,
    });

  return (
    <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* ชื่อของเรา */}
      {userLocation && userLabel && (
        <Marker position={[userLocation.lat, userLocation.lng]} icon={nameIcon(userLabel, '#1890ff')} />
      )}

      {/* ชื่อผู้ใช้คนอื่น */}
      {requests.map((req, idx) => (
        <Marker key={idx} position={[req.lat, req.lng]} icon={nameIcon(req.name)} />
      ))}
    </MapContainer>
  );
}
