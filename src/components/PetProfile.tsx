import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { petsAPI, sensorAPI } from '../lib/api';
import { ArrowLeft, Heart, Thermometer, MapPin, Activity, Battery } from 'lucide-react';

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
              <strong>Collar ID:</strong> {pet?.collarId}
            </div>
          </div>
        </div>

        <div className="sensor-data-card">
          <h2>Datos en Tiempo Real</h2>
          {latestData ? (
            <div className="sensor-grid">
              <div className="sensor-item">
                <Heart className="sensor-icon" />
                <div>
                  <span className="sensor-label">Ritmo Cardíaco</span>
                  <span className="sensor-value">{latestData.heartRate || 'N/A'} bpm</span>
                </div>
              </div>
              <div className="sensor-item">
                <Thermometer className="sensor-icon" />
                <div>
                  <span className="sensor-label">Temperatura</span>
                  <span className="sensor-value">{latestData.temperature || 'N/A'}°C</span>
                </div>
              </div>
              <div className="sensor-item">
                <Activity className="sensor-icon" />
                <div>
                  <span className="sensor-label">Actividad</span>
                  <span className="sensor-value">{latestData.activityLevel || 'N/A'}/10</span>
                </div>
              </div>
              <div className="sensor-item">
                <Battery className="sensor-icon" />
                <div>
                  <span className="sensor-label">Batería</span>
                  <span className="sensor-value">{latestData.batteryLevel || 'N/A'}%</span>
                </div>
              </div>
              {latestData.latitude && latestData.longitude && (
                <div className="sensor-item location">
                  <MapPin className="sensor-icon" />
                  <div>
                    <span className="sensor-label">Ubicación</span>
                    <span className="sensor-value">
                      {latestData.latitude.toFixed(4)}, {latestData.longitude.toFixed(4)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p>No hay datos recientes del collar</p>
          )}
        </div>

        <div className="stats-card">
          <h2>Estadísticas (24h)</h2>
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