'use client';
import { MapContainer, Marker, TileLayer, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import 'leaflet-geosearch/dist/geosearch.css';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';

// ตั้งค่า icon ของ marker
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function MapClient({ location, setLocation, showInputs = true }) {

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

      map.on('geosearch/showlocation', (result) => {
        const { x: lng, y: lat } = result.location;
        setLocation({ lat, lng });
      });

      return () => map.removeControl(searchControl);
    }, [map]);

    return null;
  }

  function FlyToLocation({ location }) {
    const map = useMap();
    useEffect(() => {
      if (location?.lat != null && location?.lng != null) {
        map.flyTo([location.lat, location.lng], map.getZoom());
      }
    }, [location, map]);
    return null;
  }

  return (
    <div className="w-full flex flex-col gap-2 max-h-[calc(100vh-4rem)]">
      {/* ฟอร์มกรอกพิกัด: ซ่อนบนมือถือเล็ก */}
      {showInputs && (
        <div className="mb-2 flex flex-col md:flex-row gap-2">
          <input
            type="number"
            step="0.000001"
            placeholder="Latitude"
            value={location?.lat || ''}
            onChange={(e) =>
              setLocation({ ...location, lat: isNaN(parseFloat(e.target.value)) ? null : parseFloat(e.target.value) })
            }
            className="border p-2 w-full md:w-1/2 rounded"
          />
          <input
            type="number"
            step="0.000001"
            placeholder="Longitude"
            value={location?.lng || ''}
            onChange={(e) =>
              setLocation({ ...location, lng: isNaN(parseFloat(e.target.value)) ? null : parseFloat(e.target.value) })
            }
            className="border p-2 w-full md:w-1/2 rounded"
          />
        </div>
      )}

      {/* Map */}
      <div className="flex-1 overflow-hidden rounded">
        <MapContainer
          center={location ? [location.lat, location.lng] : [13.736717, 100.523186]}
          zoom={13}
          className="w-full h-[250px] sm:h-[300px] md:h-[400px] lg:h-[500px]"
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <SearchBox />
          <LocationSelector />
          <FlyToLocation location={location} />
          {location?.lat && location?.lng && <Marker position={[location.lat, location.lng]} />}
        </MapContainer>
      </div>
    </div>
  );
}
