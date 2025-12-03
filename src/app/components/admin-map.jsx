'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';


delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/marker-icon-2x.png',
  shadowUrl: '/marker-shadow.png',
});

export default function AdminMap({ requests }) {
  // กำหนดค่า default map (เช่น กรุงเทพ)
  const defaultCenter = [13.7563, 100.5018];
  const zoomLevel = 6;

  return (
    <MapContainer
      center={requests.length ? [requests[0].lat, requests[0].lng] : defaultCenter}
      zoom={requests.length ? 12 : zoomLevel}
      style={{ width: '100%', height: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      {requests.map((req) => (
        <Marker key={req._id} position={[req.lat, req.lng]}>
          <Popup>
            <div className="text-sm">
              <p><strong>{req.name}</strong></p>
              <p>{req.message}</p>
              <p>{req.phone}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
