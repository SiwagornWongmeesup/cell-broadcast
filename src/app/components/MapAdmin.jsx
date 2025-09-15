// components/MapAdmin.jsx
'use client';

import { MapContainer, Marker, TileLayer, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

export default function MapAdmin({ alerts = [] }) {
  // ใช้ location ของ alert แรก หรือ default = กรุงเทพ
  const center = alerts.length > 0
    ? [alerts[0].location.lat, alerts[0].location.lng]
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
    <div className="w-full h-[300px] md:h-[400px] lg:h-[500px] rounded-xl overflow-hidden shadow">
      <MapContainer
        center={center}
        zoom={12}
        className="w-full h-full"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* แสดง Marker ของทุก Alert */}
        {alerts.map((alert, idx) => {
          if (!alert?.location?.lat || !alert?.location?.lng) return null;

          return (
            <Marker
              key={alert._id || idx}
              position={[alert.location.lat, alert.location.lng]}
              icon={customIcon}
            >
              <Popup>
                <strong>ประเภท:</strong> {alert.title}
                <br />
                <strong>รายละเอียด:</strong> {alert.details}
                <br />
                <strong>เวลา:</strong> {new Date(alert.createdAt).toLocaleString()}
                <br />
                <strong>สถานะ:</strong> {alert.status}
                <br />
                {alert.file && (
                  <a
                    href={alert.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    ดูไฟล์แนบ
                  </a>
                )}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
