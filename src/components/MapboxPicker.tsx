// mapboxPicker.tsx
import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

// Read token from env (support NEXT_PUBLIC_ prefix or legacy name)
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? process.env.MAPBOX_TOKEN ?? "";
mapboxgl.accessToken = MAPBOX_TOKEN;

interface MapboxPickerProps {
  onLocationChange: (lat: number | null, lng: number | null) => void;
  disabled?: boolean;
  height?: number;
}

export const MapboxPicker: React.FC<MapboxPickerProps> = ({ onLocationChange, disabled, height = 280 }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Region context derived from user profile
  const [regionQuery, setRegionQuery] = useState<string | null>(null);
  const [regionBBox, setRegionBBox] = useState<number[] | null>(null);
  const [hasMarker, setHasMarker] = useState<boolean>(false);

  // Keep a stable reference to the callback to avoid re-initializing the map
  const callbackRef = useRef(onLocationChange);
  useEffect(() => {
    callbackRef.current = onLocationChange;
  }, [onLocationChange]);

  useEffect(() => {
    let isMounted = true;

    const init = () => {
      try {
        setLoading(true);
        setError(null);

        if (!containerRef.current || !isMounted) return;

        // Initialize map
        mapRef.current = new mapboxgl.Map({
          container: containerRef.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [0, 20],
          zoom: 2,
        });

        // Add navigation controls
        mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

        // Click to place marker
        mapRef.current.on("click", (ev) => {
          if (disabled) return;
          const { lat, lng } = ev.lngLat;
          placeMarker([lng, lat]);
          callbackRef.current?.(lat, lng);
        });

        mapRef.current.on('load', () => {
          setLoading(false);
        });

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
  }, []);

  // Cargar región desde el perfil y centrar el mapa; precargar departamentos/municipios
  useEffect(() => {
    const loadRegion = async () => {
      if (!user) return;
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('country, province')
          .eq('id', user.id)
          .single();

        const region = [profile?.province, profile?.country].filter(Boolean).join(', ');
        if (!region) return;
        setRegionQuery(region);

        // Geocodificar región para obtener centro y bbox
        const regionRes = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(region)}.json?types=place,region&access_token=${mapboxgl.accessToken}&limit=1`);
        const regionJson = await regionRes.json();
        const regionFeature = regionJson.features?.[0];
        if (regionFeature) {
          const bbox = regionFeature.bbox as number[] | undefined;
          if (bbox) setRegionBBox(bbox);
          const center = regionFeature.center as [number, number];
          if (mapRef.current && center && !markerRef.current) {
            mapRef.current.flyTo({ center, zoom: 10 });
          }
        }

      } catch (e) {
        console.warn('No se pudo cargar la región del perfil', e);
      }
    };
    loadRegion();
  }, [user]);


  const placeMarker = (lngLat: [number, number]) => {
    if (!mapRef.current) return;
    if (markerRef.current) {
      markerRef.current.remove();
    }
    markerRef.current = new mapboxgl.Marker()
      .setLngLat(lngLat)
      .addTo(mapRef.current);
    setHasMarker(true);
  };

  const clearLocation = () => {
    if (markerRef.current) {
      markerRef.current.remove();
    }
    markerRef.current = null;
    setHasMarker(false);
    callbackRef.current?.(null, null);
  };
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          placeMarker([lng, lat]);
          callbackRef.current?.(lat, lng);
          mapRef.current?.flyTo({ center: [lng, lat], zoom: 14 });
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
      <div className="flex items-center gap-2 flex-wrap">
        <Button type="button" variant="outline" size="sm" disabled={disabled || loading} onClick={getCurrentLocation}>
          {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <MapPin className="h-4 w-4 mr-2" />}
          {loading ? "Obteniendo ubicación..." : "Usar mi ubicación"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={clearLocation} disabled={disabled}>
          <X className="h-4 w-4 mr-1" /> Limpiar
        </Button>
      </div>
      
      <p className="text-sm text-muted-foreground">
        Haz clic en el mapa para seleccionar una ubicación o usa tu ubicación actual.
      </p>

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
