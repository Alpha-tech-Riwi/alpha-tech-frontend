import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { petsAPI, sensorAPI, api } from '../lib/api';
import { Heart, MapPin, Battery, Activity } from 'lucide-react';
import Notifications from './Notifications';
import DashboardMetrics from './DashboardMetrics';
import PetQRCode from './PetQRCode';
import './DashboardMetrics.css';
import './Dashboard.css';
import './PetQRCode.css';

export default function Dashboard() {
  // Check authentication immediately
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/login';
    return <div>Redirecting to login...</div>;
  }

  const [showAddPet, setShowAddPet] = useState(false);
  const [showQR, setShowQR] = useState<{petId: string, petName: string} | null>(null);
  const [newPet, setNewPet] = useState({
    name: '',
    species: '',
    breed: '',
    age: 0,
    weight: 0,
    collarId: ''
  });

  const { data: pets, isLoading, refetch, error } = useQuery({
    queryKey: ['pets'],
    queryFn: () => petsAPI.getMyPets().then(res => res.data),
    refetchInterval: 30000,
    retry: false
  });

  // Redirect to login if unauthorized
  if (error && (error as any)?.response?.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    return null;
  }

  // Obtener datos de sensores para cada mascota
  const petsWithSensorData = useQuery({
    queryKey: ['pets-with-sensors', pets],
    queryFn: async () => {
      if (!pets) return [];
      const petsWithData = await Promise.all(
        pets.map(async (pet: any) => {
          try {
            const latestData = await sensorAPI.getLatestData(pet.id).then(res => res.data);
            return { ...pet, latestSensorData: latestData };
          } catch {
            return { ...pet, latestSensorData: null };
          }
        })
      );
      return petsWithData;
    },
    enabled: !!pets,
    refetchInterval: 30000
  });

  const handleAddPet = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await petsAPI.createPet(newPet);
      setShowAddPet(false);
      setNewPet({ name: '', species: '', breed: '', age: 0, weight: 0, collarId: '' });
      refetch();
    } catch (error) {
      console.error('Error adding pet:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  };

  const handleToggleLostMode = async (petId: string, petName: string, isLost: boolean) => {
    try {
      if (isLost) {
        const response = await fetch('https://prefers-cheapest-blues-parental.trycloudflare.com/qr/collar/emergency', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            petId,
            action: 'ACTIVATE_LOST_MODE',
            settings: {
              soundEnabled: true,
              lightEnabled: true,
              soundInterval: 30,
              lightPattern: 'BLINK_FAST'
            }
          })
        });
        
        const data = await response.json();
        
        if (data.success) {
          alert(`¡Modo perdido activado para ${petName}!\n\n• El collar emitirá sonidos cada 30 segundos\n• Las luces parpadearán para llamar la atención\n• El QR estará en modo prioritario\n• Recibirás notificaciones inmediatas si alguien lo escanea`);
        }
      } else {
        const response = await fetch('https://prefers-cheapest-blues-parental.trycloudflare.com/qr/collar/emergency', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            petId,
            action: 'DEACTIVATE_LOST_MODE'
          })
        });
        
        const data = await response.json();
        
        if (data.success) {
          alert(`Modo perdido desactivado para ${petName}`);
        }
      }
      
      refetch();
    } catch (error) {
      console.error('Error toggling lost mode:', error);
      alert('Error al cambiar el modo perdido. Verifica que todos los servicios estén funcionando.');
    }
  };

  if (isLoading) return <div className="loading">Cargando mascotas...</div>;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Mis Mascotas</h2>
        <div className="header-actions">
          <button onClick={() => setShowAddPet(true)} className="btn-primary">
            + Agregar Mascota
          </button>
          <button onClick={handleLogout} className="btn-secondary">
            Cerrar Sesión
          </button>
        </div>
      </div>

      {showAddPet && (
        <div className="modal">
          <div className="modal-content">
            <h3>Agregar Nueva Mascota</h3>
            <form onSubmit={handleAddPet}>
              <input
                type="text"
                placeholder="Nombre"
                value={newPet.name}
                onChange={(e) => setNewPet({...newPet, name: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="Especie (ej: Perro, Gato)"
                value={newPet.species}
                onChange={(e) => setNewPet({...newPet, species: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="Raza"
                value={newPet.breed}
                onChange={(e) => setNewPet({...newPet, breed: e.target.value})}
                required
              />
              <input
                type="number"
                placeholder="Edad (años)"
                value={newPet.age}
                onChange={(e) => setNewPet({...newPet, age: parseInt(e.target.value)})}
                required
              />
              <input
                type="number"
                step="0.1"
                placeholder="Peso (kg)"
                value={newPet.weight}
                onChange={(e) => setNewPet({...newPet, weight: parseFloat(e.target.value)})}
                required
              />
              <input
                type="text"
                placeholder="ID del Collar"
                value={newPet.collarId}
                onChange={(e) => setNewPet({...newPet, collarId: e.target.value})}
                required
              />
              <div className="modal-actions">
                <button type="submit" className="btn-primary">Agregar</button>
                <button type="button" onClick={() => setShowAddPet(false)} className="btn-secondary">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DashboardMetrics />

      <div style={{background: 'white', padding: '1rem', margin: '1rem 0', borderRadius: '8px'}}>
        <h3>🔔 Notificaciones Recientes</h3>
        <Notifications />
      </div>

      <div className="pets-grid">
        {petsWithSensorData.data?.map((pet: any) => {
          const sensorData = pet.latestSensorData;
          const batteryLevel = sensorData?.batteryLevel || 0;
          const isActive = pet.isActive && sensorData;
          const batteryStatus = batteryLevel > 50 ? 'good' : batteryLevel > 20 ? 'warning' : 'critical';
          
          return (
            <Link key={pet.id} to={`/pet/${pet.id}`} className="pet-card">
              <div className="pet-header">
                <h3>{pet.name}</h3>
                <span className="pet-species">{pet.species}</span>
                <div className={`connection-status ${isActive ? 'connected' : 'disconnected'}`}>
                  <div className={`status-dot ${isActive ? 'online' : 'offline'}`}></div>
                  {isActive ? 'En línea' : 'Desconectado'}
                </div>
              </div>
              <div className="pet-info">
                <p><strong>Raza:</strong> {pet.breed}</p>
                <p><strong>Edad:</strong> {pet.age} años</p>
                <p><strong>Peso:</strong> {pet.weight} kg</p>
                {sensorData && (
                  <div className="sensor-preview">
                    <span>❤️ {sensorData.heartRate} bpm</span>
                    <span>🌡️ {sensorData.temperature}°C</span>
                  </div>
                )}
              </div>
              <div className="pet-status">
                <div className="status-item">
                  <Heart size={16} color={isActive ? '#10b981' : '#6b7280'} />
                  <span>{isActive ? 'Activo' : 'Inactivo'}</span>
                </div>
                <div className="status-item">
                  <Battery size={16} color={batteryStatus === 'good' ? '#10b981' : batteryStatus === 'warning' ? '#f59e0b' : '#ef4444'} />
                  <span>{batteryLevel}%</span>
                </div>
              </div>
              
              <div className="pet-actions">
                <button 
                  className="qr-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowQR({petId: pet.id, petName: pet.name});
                  }}
                  title="Ver código QR"
                >
                  🏷️ QR
                </button>
                <button 
                  className="lost-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    const isCurrentlyLost = confirm(`¿Activar modo perdido para ${pet.name}?\n\nEsto activará:\n• Sonidos de alerta cada 30 segundos\n• Luces parpadeantes\n• QR en modo prioritario`);
                    if (isCurrentlyLost) {
                      handleToggleLostMode(pet.id, pet.name, true);
                    }
                  }}
                  title="Activar modo perdido"
                >
                  🚨 SOS
                </button>
              </div>
            </Link>
          );
        })}
      </div>

      {pets?.length === 0 && (
        <div className="empty-state">
          <p>No tienes mascotas registradas aún.</p>
          <button onClick={() => setShowAddPet(true)} className="btn-primary">
            Agregar tu primera mascota
          </button>
        </div>
      )}
      
      {showQR && (
        <PetQRCode 
          petId={showQR.petId}
          petName={showQR.petName}
          onClose={() => setShowQR(null)}
        />
      )}
    </div>
  );
}