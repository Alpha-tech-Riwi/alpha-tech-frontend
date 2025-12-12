import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useMemo } from 'react';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface PetMapProps {
  readonly latitude: number;
  readonly longitude: number;
  readonly petName: string;
  readonly timestamp?: string;
}

interface Geofence {
  center: [number, number];
  radius: number;
  name: string;
}

// Geofence predefinido para Medellín Centro (zona segura)
const DEFAULT_GEOFENCES: Geofence[] = [
  {
    center: [6.2500, -75.5900], // Centro Medellín
    radius: 300, // 300 metros (más pequeño para demo)
    name: 'Zona Segura - Casa'
  }
];

const MAP_CONFIG = {
  DEFAULT_ZOOM: 15,
  HEIGHT: '300px',
  BORDER_RADIUS: '8px',
  COORDINATE_PRECISION: 6,
} as const;

const TILE_LAYER_CONFIG = {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
} as const;

export default function PetMap({ latitude, longitude, petName, timestamp }: PetMapProps) {
  const position = useMemo((): [number, number] => [latitude, longitude], [latitude, longitude]);
  
  const formattedTimestamp = useMemo(() => {
    return timestamp ? new Date(timestamp).toLocaleTimeString() : null;
  }, [timestamp]);

  const mapStyle = useMemo(() => ({
    height: MAP_CONFIG.HEIGHT,
    width: '100%',
    borderRadius: MAP_CONFIG.BORDER_RADIUS,
  }), []);

  // Función para calcular distancia entre dos puntos (en metros)
  function getDistance(pos1: [number, number], pos2: [number, number]): number {
    const R = 6371e3; // Radio de la Tierra en metros
    const φ1 = pos1[0] * Math.PI/180;
    const φ2 = pos2[0] * Math.PI/180;
    const Δφ = (pos2[0]-pos1[0]) * Math.PI/180;
    const Δλ = (pos2[1]-pos1[1]) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }

  // Calcular si la mascota está dentro de la zona segura
  const isInSafeZone = useMemo(() => {
    const safeZone = DEFAULT_GEOFENCES[0];
    const distance = getDistance(
      [latitude, longitude],
      safeZone.center
    );
    return distance <= safeZone.radius;
  }, [latitude, longitude]);

  return (
    <div className="pet-map-container">
      <div className="map-header">
        <h3 className="map-title">📍 {petName} - Ubicación en Tiempo Real</h3>
        <div className={`geofence-status ${isInSafeZone ? 'safe' : 'danger'}`}>
          {isInSafeZone ? '✅ Zona Segura' : '⚠️ Fuera de Zona'}
        </div>
      </div>
      <MapContainer 
        center={position} 
        zoom={MAP_CONFIG.DEFAULT_ZOOM} 
        style={mapStyle}
      >
        <TileLayer {...TILE_LAYER_CONFIG} />
        
        {/* Geofences */}
        {DEFAULT_GEOFENCES.map((geofence, index) => (
          <Circle
            key={index}
            center={geofence.center}
            radius={geofence.radius}
            pathOptions={{
              color: isInSafeZone ? '#10b981' : '#ef4444',
              fillColor: isInSafeZone ? '#10b981' : '#ef4444',
              fillOpacity: 0.1,
              weight: 2
            }}
          >
            <Popup>
              <div>
                <strong>🏠 {geofence.name}</strong>
                <div>Radio: {geofence.radius}m</div>
                <div>Estado: {isInSafeZone ? 'Seguro' : 'Alerta'}</div>
              </div>
            </Popup>
          </Circle>
        ))}
        
        {/* Marcador de la mascota */}
        <Marker position={position}>
          <Popup>
            <div className="map-popup-content">
              <strong>🐾 {petName}</strong>
              <div className="coordinates">
                <div>Lat: {latitude.toFixed(MAP_CONFIG.COORDINATE_PRECISION)}</div>
                <div>Lng: {longitude.toFixed(MAP_CONFIG.COORDINATE_PRECISION)}</div>
              </div>
              <div className={`geofence-info ${isInSafeZone ? 'safe' : 'danger'}`}>
                {isInSafeZone ? '✅ En zona segura' : '⚠️ Fuera de zona segura'}
                <br />
                <small>Radio de seguridad: 300m</small>
              </div>
              {formattedTimestamp && (
                <div className="timestamp">Updated: {formattedTimestamp}</div>
              )}
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}