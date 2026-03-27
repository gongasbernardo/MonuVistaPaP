import { memo, useCallback, useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from "react-leaflet";

interface MapMonument {
  name: string;
  location: string;
  country: string;
  lat: number;
  lng: number;
  century: string;
  style: string;
}

interface Props {
  monuments: MapMonument[];
  onSelect: (m: MapMonument) => void;
}

// Forces Leaflet to recalculate size after Ionic finishes layout
function InvalidateSize() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 300);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

const MonumentMarker = memo(({ m, onSelect }: { m: MapMonument; onSelect: (m: MapMonument) => void }) => {
  const handleClick = useCallback(() => onSelect(m), [m, onSelect]);
  const isPortugal = m.country === "Portugal";

  return (
    <CircleMarker
      center={[m.lat, m.lng]}
      radius={isPortugal ? 7 : 6}
      pathOptions={{
        color: isPortugal ? "#D95F3D" : "#6B7280",
        fillColor: isPortugal ? "#E8805F" : "#9CA3AF",
        fillOpacity: 0.85,
        weight: 2,
      }}
      eventHandlers={{ click: handleClick }}
    >
      <Tooltip direction="top" offset={[0, -8]}>
        <strong>{m.name}</strong><br />
        {m.location}, {m.country}
      </Tooltip>
    </CircleMarker>
  );
});

const MonumentMap = memo(({ monuments, onSelect }: Props) => {
  return (
    <MapContainer
      center={[39.5, -8.0]}
      zoom={6}
      scrollWheelZoom={true}
      preferCanvas={true}
      style={{ height: "350px", width: "100%", borderRadius: "16px" }}
    >
      <InvalidateSize />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {monuments.map((m, idx) => (
        <MonumentMarker key={idx} m={m} onSelect={onSelect} />
      ))}
    </MapContainer>
  );
});

export default MonumentMap;
