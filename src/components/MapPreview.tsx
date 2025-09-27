import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapPreviewProps {
  lat: number;
  lng: number;
  height?: number;
  zoom?: number;
}

export const MapPreview: React.FC<MapPreviewProps> = ({ lat, lng, height = 240, zoom = 14 }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Fix default Leaflet marker icons
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });

    mapRef.current = L.map(containerRef.current, { zoomControl: false }).setView([lat, lng], zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapRef.current);

    L.marker([lat, lng]).addTo(mapRef.current);

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [lat, lng, zoom]);

  return (
    <div
      ref={containerRef}
      style={{ height, borderRadius: 8, overflow: "hidden" }}
      className="w-full bg-muted"
      aria-label="Vista previa del mapa"
    />
  );
};
