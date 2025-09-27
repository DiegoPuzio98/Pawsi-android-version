import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, X } from "lucide-react";

interface MapPickerProps {
  onLocationChange: (lat: number | null, lng: number | null) => void;
  disabled?: boolean;
  height?: number;
}

export const MapPicker: React.FC<MapPickerProps> = ({ onLocationChange, disabled, height = 280 }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const init = () => {
      try {
        setLoading(true);
        setError(null);

        if (!containerRef.current || !isMounted) return;

        // Fix for default markers in Leaflet
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });

        // Initialize map
        mapRef.current = L.map(containerRef.current).setView([20, 0], 2);

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapRef.current);

        // Click to place marker
        mapRef.current.on("click", (ev: L.LeafletMouseEvent) => {
          if (disabled) return;
          const { lat, lng } = ev.latlng;
          placeMarker([lat, lng]);
          onLocationChange(lat, lng);
        });

        setLoading(false);
      } catch (err: any) {
        console.error("Map init error", err);
        if (!isMounted) return;
        setError(err?.message ?? "Error inicializando el mapa");
        setLoading(false);
      }
    };

    init();

    return () => {
      isMounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [onLocationChange, disabled]);

  const placeMarker = (latLng: [number, number]) => {
    if (!mapRef.current) return;
    if (markerRef.current) {
      mapRef.current.removeLayer(markerRef.current);
    }
    markerRef.current = L.marker(latLng).addTo(mapRef.current);
  };

  const clearLocation = () => {
    if (markerRef.current && mapRef.current) {
      mapRef.current.removeLayer(markerRef.current);
    }
    markerRef.current = null;
    onLocationChange(null, null);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          placeMarker([lat, lng]);
          onLocationChange(lat, lng);
          mapRef.current?.setView([lat, lng], 14);
          setLoading(false);
        },
        (error) => {
          console.error("Geolocation error:", error);
          setError("No se pudo obtener la ubicación actual");
          setLoading(false);
        }
      );
    } else {
      setError("Geolocation no está soportado en este navegador");
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" size="sm" disabled={disabled || loading} onClick={getCurrentLocation}>
          {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <MapPin className="h-4 w-4 mr-2" />}
          {loading ? "Obteniendo ubicación..." : "Usar mi ubicación"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={clearLocation} disabled={disabled}>
          <X className="h-4 w-4 mr-1" /> Limpiar
        </Button>
      </div>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      <div
        ref={containerRef}
        style={{ height, borderRadius: 8, overflow: "hidden" }}
        className="relative w-full bg-muted"
        aria-label="Seleccionar ubicación en mapa"
      />
    </div>
  );
};