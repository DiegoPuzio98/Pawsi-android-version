import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Set Mapbox access token
mapboxgl.accessToken = "pk.eyJ1IjoiZGllZ29wMDA5OCIsImEiOiJjbWZha3A0MmgxYWcxMm1wa3p1dW13aHczIn0.UMYPIYk7DziVJNkBe3v-2A";

interface MapboxPreviewProps {
  lat: number;
  lng: number;
  height?: number;
  zoom?: number;
}

export const MapboxPreview: React.FC<MapboxPreviewProps> = ({ lat, lng, height = 240, zoom = 14 }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [lng, lat],
      zoom: zoom,
      interactive: false,
    });

    new mapboxgl.Marker()
      .setLngLat([lng, lat])
      .addTo(mapRef.current);

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