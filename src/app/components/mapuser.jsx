'use client';

import { MapContainer, Marker, TileLayer, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

// ✅ Component สำหรับ zoom ไปที่ marker เดียว
function SetViewOnMarker({ lat, lng, zoom = 15 }) {
  const map = useMap();

  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], zoom);
    }
  }, [lat, lng, zoom, map]);

  return null;
}

// ✅ Component สำหรับ zoom ให้เห็นทุก marker
function FitBoundsOnMarkers({ markers }) {
  const map = useMap();

  useEffect(() => {
    if (markers.length > 1) {
      const bounds = L.latLngBounds(
        markers.map(m => [
          m?.position?.lat ?? m?.lat,
          m?.position?.lng ?? m?.lng
        ])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [markers, map]);

  return null;
}

export default function MapUser({ markers = [], userLocation }) {
  const center = userLocation
    ? [userLocation.lat, userLocation.lng]
    : [13.736717, 100.523186]; // default กรุงเทพ

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
    <MapContainer
      center={center}
      zoom={12}
      style={{ height: '100%', minHeight: '300px', width: '100%' }}
      scrollWheelZoom={true}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* Marker ผู้ใช้ */}
      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lng]}>
          <Popup>ตำแหน่งของคุณ</Popup>
        </Marker>
      )}

      {/* Marker และ Circle สำหรับ Alert */}
      {markers.map((alert, idx) => {
        const markerLat = alert?.position?.lat ?? alert?.lat;
        const markerLng = alert?.position?.lng ?? alert?.lng;

        if (!markerLat || !markerLng) return null;

        const now = new Date();
        if (alert.expireAt && new Date(alert.expireAt) <= now) return null;

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
                {alert.createdAt ? new Date(alert.createdAt).toLocaleString() : 'ไม่ระบุ'}
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
        );
      })}

      {/* Auto center */}
      {markers.length === 1 && (
        <SetViewOnMarker
          lat={markers[0]?.position?.lat ?? markers[0]?.lat}
          lng={markers[0]?.position?.lng ?? markers[0]?.lng}
        />
      )}
      {markers.length > 1 && <FitBoundsOnMarkers markers={markers} />}
    </MapContainer>
  );
}
