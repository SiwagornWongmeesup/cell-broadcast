'use client';
import { MapContainer, Marker, TileLayer, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import 'leaflet-geosearch/dist/geosearch.css';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function MapClient({ location, setLocation }) {
  function LocationSelector() {
    useMapEvents({
      click(e) {
        setLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
      },
    });
    return null;
  }

  function SearchBox() {
    const map = useMap();

    useEffect(() => {
      const provider = new OpenStreetMapProvider();

      const searchControl = new GeoSearchControl({
        provider,
        style: 'bar',
        autoComplete: true,
        autoCompleteDelay: 250,
        showMarker: true,
        retainZoomLevel: false,
        animateZoom: true,
        keepResult: true,
      });

      map.addControl(searchControl);
      // เมื่อค้นหาสำเร็จ ให้ตั้งค่าพิกัดใน state
      // และแสดงตำแหน่งบนแผนที่
      map.on('geosearch/showlocation', (result) => {
        const { x: lng, y: lat } = result.location;
        setLocation({ lat, lng });
      });

      return () => map.removeControl(searchControl);
    }, [map]);

    return null;
  }

  return (
    <div>
      {/* ฟอร์มกรอกพิกัด */}
      <div className="mb-4 flex gap-2">
        <input
          type="number"
          step="0.000001"
          placeholder="Latitude"
          value={location?.lat || ''}
          onChange={(e) =>
            setLocation({ ...location, lat: parseFloat(e.target.value) })
          }
          className="border p-2 w-1/2"
        />
        <input
          type="number"
          step="0.000001"
          placeholder="Longitude"
          value={location?.lng || ''}
          onChange={(e) =>
            setLocation({ ...location, lng: parseFloat(e.target.value) })
          }
          className="border p-2 w-1/2"
        />
      </div>

      {/* แผนที่ */}
      <MapContainer
        center={
          location?.lat && location?.lng
            ? [location.lat, location.lng]
            : [13.736717, 100.523186]
        }
        zoom={13}
        style={{ height: '400px' }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <SearchBox />
        <LocationSelector />
        {location?.lat && location?.lng && (
          <Marker position={[location.lat, location.lng]} />
        )}
      </MapContainer>
    </div>
  );
}
