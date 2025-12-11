import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { petsAPI } from '../lib/api';
import { Heart, MapPin, Battery, Activity } from 'lucide-react';

export default function Dashboard() {
  const [showAddPet, setShowAddPet] = useState(false);
  const [newPet, setNewPet] = useState({
    name: '',
    species: '',
    breed: '',
    age: 0,
    weight: 0,
    collarId: ''
  });

  const { data: pets, isLoading, refetch } = useQuery({
    queryKey: ['pets'],
    queryFn: () => petsAPI.getMyPets().then(res => res.data)
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

      <div className="pets-grid">
        {pets?.map((pet: any) => (
          <Link key={pet.id} to={`/pet/${pet.id}`} className="pet-card">
            <div className="pet-header">
              <h3>{pet.name}</h3>
              <span className="pet-species">{pet.species}</span>
            </div>
            <div className="pet-info">
              <p><strong>Raza:</strong> {pet.breed}</p>
              <p><strong>Edad:</strong> {pet.age} años</p>
              <p><strong>Peso:</strong> {pet.weight} kg</p>
            </div>
            <div className="pet-status">
              <div className="status-item">
                <Heart size={16} />
                <span>Activo</span>
              </div>
              <div className="status-item">
                <Battery size={16} />
                <span>85%</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {pets?.length === 0 && (
        <div className="empty-state">
          <p>No tienes mascotas registradas aún.</p>
          <button onClick={() => setShowAddPet(true)} className="btn-primary">
            Agregar tu primera mascota
          </button>
        </div>
      )}
    </div>
  );
}