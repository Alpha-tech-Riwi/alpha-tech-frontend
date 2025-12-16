import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { petsAPI, sensorAPI } from '../lib/api';
import { ArrowLeft, Heart, Thermometer, MapPin, Activity, Battery, Wifi, WifiOff } from 'lucide-react';
import PetMap from './PetMap';
import PetCharts from './PetCharts';
import CollarControl from './CollarControl';
import CollarAssignment from './CollarAssignment';
import { useRealTimeData } from '../hooks/useRealTimeData';
import { usePetLocation } from '../hooks/usePetLocation';

export default function PetProfile() {
  const { id } = useParams<{ id: string }>();

  const { data: pet, isLoading: petLoading } = useQuery({
    queryKey: ['pet', id],
    queryFn: () => petsAPI.getPet(id!).then(res => res.data)
  });

  const { data: latestData } = useQuery({
    queryKey: ['pet-latest', id],
    queryFn: () => sensorAPI.getLatestData(id!).then(res => res.data),
    refetchInterval: 30000 // Actualizar cada 30 segundos
  });

  const { data: stats } = useQuery({
    queryKey: ['pet-stats', id],
    queryFn: () => sensorAPI.getStats(id!).then(res => res.data)
  });

  // Location data from collar service
  const { locationData, collarId, hasCollar } = usePetLocation(id!);

  const { isConnected, latestSensorData, latestLocationData } = useRealTimeData(id);

  const currentSensorData = latestSensorData || latestData;
  const currentLocationData = latestLocationData || locationData;

  if (petLoading) return <div className="loading">Cargando perfil...</div>;

  return (
    <div className="pet-profile">
      <div className="profile-header">
        <Link to="/dashboard" className="back-button">
          <ArrowLeft size={20} />
          Volver
        </Link>
        <h1>{pet?.name}</h1>
      </div>

      <div className="profile-content">
        <div className="pet-info-card">
          <h2>Información de {pet?.name}</h2>
          <div className="info-grid">
            <div className="info-item">
              <strong>Especie:</strong> {pet?.species}
            </div>
            <div className="info-item">
              <strong>Raza:</strong> {pet?.breed}
            </div>
            <div className="info-item">
              <strong>Edad:</strong> {pet?.age} años
            </div>
            <div className="info-item">
              <strong>Peso:</strong> {pet?.weight} kg
            </div>
            <div className="info-item">
              <strong>Collar ID:</strong> {collarId || pet?.collarId || 'Not assigned'}
            </div>
          </div>
        </div>

        <div className="sensor-data-card">
          <div className="sensor-header">
            <h2>Real-time Data</h2>
            <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
              {isConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
              <span>{isConnected ? 'Live' : 'Offline'}</span>
            </div>
          </div>
          {currentSensorData || currentLocationData ? (
            <div className="sensor-grid">
              <div className="sensor-item">
                <Heart className="sensor-icon" />
                <div>
                  <span className="sensor-label">Ritmo Cardíaco</span>
                  <span className="sensor-value">{currentSensorData?.heartRate || 'N/A'} bpm</span>
                </div>
              </div>
              <div className="sensor-item">
                <Thermometer className="sensor-icon" />
                <div>
                  <span className="sensor-label">Temperatura</span>
                  <span className="sensor-value">{currentSensorData?.temperature || 'N/A'}°C</span>
                </div>
              </div>
              <div className="sensor-item">
                <Activity className="sensor-icon" />
                <div>
                  <span className="sensor-label">Actividad</span>
                  <span className="sensor-value">{currentSensorData?.activityLevel || 'N/A'}/10</span>
                </div>
              </div>
              <div className="sensor-item">
                <Battery className="sensor-icon" />
                <div>
                  <span className="sensor-label">Batería</span>
                  <span className="sensor-value">{currentSensorData?.batteryLevel || 'N/A'}%</span>
                </div>
              </div>
              {(currentSensorData?.latitude && currentSensorData?.longitude) || currentLocationData ? (
                <div className="sensor-item location">
                  <MapPin className="sensor-icon" />
                  <div>
                    <span className="sensor-label">GPS Location</span>
                    <span className="sensor-value">
                      {currentLocationData ? 
                        `${parseFloat(currentLocationData.latitude).toFixed(4)}, ${parseFloat(currentLocationData.longitude).toFixed(4)}` :
                        currentSensorData?.latitude ? `${currentSensorData.latitude.toFixed(4)}, ${currentSensorData.longitude.toFixed(4)}` : 'N/A'
                      }
                    </span>
                    {currentLocationData && (
                      <span className="sensor-timestamp">
                        Updated: {new Date(currentLocationData.timestamp).toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <p>No recent collar data available</p>
          )}
        </div>

        {(currentLocationData || locationData) && (
          <div className="map-card">
            <PetMap 
              latitude={parseFloat((currentLocationData || locationData)!.latitude)}
              longitude={parseFloat((currentLocationData || locationData)!.longitude)}
              petName={pet?.name || 'Pet'}
              timestamp={(currentLocationData || locationData)!.timestamp}
            />
          </div>
        )}
        
        {!currentLocationData && !locationData && hasCollar && (
          <div className="map-card">
            <div className="no-location-message">
              <MapPin size={48} />
              <h3>Waiting for collar location...</h3>
              <p>Collar {collarId} is assigned but hasn't sent location yet.</p>
              <p>Press "FIND MY PET" to activate the collar.</p>
            </div>
          </div>
        )}
        
        {!hasCollar && (
          <div className="map-card">
            <div className="no-collar-message">
              <MapPin size={48} />
              <h3>No collar assigned</h3>
              <p>Assign an ESP32 collar to see real-time location.</p>
            </div>
          </div>
        )}

        <CollarAssignment petId={id!} petName={pet?.name || 'Pet'} currentCollarId={pet?.collarId} />
        
        <CollarControl petId={id!} petName={pet?.name || 'Pet'} />

        <PetCharts petId={id!} />

        <div className="stats-card">
          <h2>Statistics (24h)</h2>
          {stats ? (
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Ritmo Cardíaco Promedio</span>
                <span className="stat-value">{Math.round(stats.avgheartrate || 0)} bpm</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Temperatura Promedio</span>
                <span className="stat-value">{Math.round(stats.avgtemperature || 0)}°C</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Actividad Promedio</span>
                <span className="stat-value">{Math.round(stats.avgactivity || 0)}/10</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Puntos de Datos</span>
                <span className="stat-value">{stats.datapoints || 0}</span>
              </div>
            </div>
          ) : (
            <p>No hay estadísticas disponibles</p>
          )}
        </div>
      </div>
    </div>
  );
}