import React from "react";
import { MapPicker } from "@/components/MapPicker";

interface LocationPickerProps {
  onLocationChange: (lat: number | null, lng: number | null) => void;
  disabled?: boolean;
  height?: number;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({ onLocationChange, disabled, height = 280 }) => {
  // Proxy to the Leaflet-based MapPicker so all forms get a map UI instead of manual lat/lng
  return (
    <MapPicker
      onLocationChange={onLocationChange}
      disabled={disabled}
      height={height}
    />
  );
};
