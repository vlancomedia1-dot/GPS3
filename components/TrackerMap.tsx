'use client';

import { MapContainer, Marker, Polyline, TileLayer, Popup } from 'react-leaflet';
import L from 'leaflet';

type Point = {
  latitude: number;
  longitude: number;
  trackedAt: string;
};

type Props = {
  points: Point[];
};

const markerIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

export default function TrackerMap({ points }: Props) {
  const latest = points[points.length - 1];
  const center: [number, number] = latest
    ? [latest.latitude, latest.longitude]
    : [24.7136, 46.6753];

  const polyline = points.map((point) => [point.latitude, point.longitude] as [number, number]);

  return (
    <MapContainer center={center} zoom={15} scrollWheelZoom className="mapWrap">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {polyline.length > 1 && <Polyline positions={polyline} />}

      {latest && (
        <Marker position={[latest.latitude, latest.longitude]} icon={markerIcon}>
          <Popup>
            آخر تحديث<br />
            {new Date(latest.trackedAt).toLocaleString('ar-SA')}
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
