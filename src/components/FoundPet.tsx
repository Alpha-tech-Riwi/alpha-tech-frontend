import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Phone, Mail, Heart, Calendar, Weight, Camera } from 'lucide-react';
import axios from 'axios';

interface PetData {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  weight: number;
  profileImage?: string;
  description?: string;
  ownerPhone?: string;
  owner: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function FoundPet() {
  const { qrCode } = useParams<{ qrCode: string }>();
  const [pet, setPet] = useState<PetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportData, setReportData] = useState({
    finderName: '',
    finderPhone: '',
    finderEmail: '',
    message: '',
    latitude: null as number | null,
    longitude: null as number | null
  });
  const [reportSubmitted, setReportSubmitted] = useState(false);

  useEffect(() => {
    fetchPetData();
    getCurrentLocation();
  }, [qrCode]);

  const fetchPetData = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/public/pets/found/${qrCode}`);
      setPet(response.data);
    } catch (err) {
      setError('Mascota no encontrada o QR inválido');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setReportData(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }));
        },
        (error) => {
          console.log('Error getting location:', error);
        }
      );
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:3000/public/pets/found/${qrCode}/report`, reportData);
      setReportSubmitted(true);
      setShowReportForm(false);
    } catch (err) {
      alert('Error al enviar el reporte. Intenta nuevamente.');
    }
  };

  if (loading) {
    return (
      <div className="found-pet-loading">
        <div className="loading-spinner"></div>
        <p>Cargando información de la mascota...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="found-pet-error">
        <h1>❌ {error}</h1>
        <p>Verifica que el código QR sea válido</p>
      </div>
    );
  }

  if (reportSubmitted) {
    return (
      <div className="found-pet-success">
        <div className="success-content">
          <h1>✅ ¡Reporte Enviado!</h1>
          <p>Hemos notificado al dueño de <strong>{pet?.name}</strong></p>
          <p>Se pondrán en contacto contigo pronto.</p>
          <div className="success-icon">🐾</div>
        </div>
      </div>
    );
  }

  return (
    <div className="found-pet-container">
      <div className="found-pet-header">
        <h1>🐾 ¿Encontraste a esta mascota?</h1>
        <p>Ayuda a reunir a <strong>{pet?.name}</strong> con su familia</p>
      </div>

      <div className="pet-profile-card">
        <div className="pet-image">
          {pet?.profileImage ? (
            <img src={pet.profileImage} alt={pet.name} />
          ) : (
            <div className="pet-placeholder">
              <Heart size={48} />
              <span>Sin foto</span>
            </div>
          )}
        </div>

        <div className="pet-info">
          <h2>{pet?.name}</h2>
          <div className="pet-details">
            <div className="detail-item">
              <span className="label">Especie:</span>
              <span className="value">{pet?.species}</span>
            </div>
            <div className="detail-item">
              <span className="label">Raza:</span>
              <span className="value">{pet?.breed}</span>
            </div>
            <div className="detail-item">
              <Calendar size={16} />
              <span className="value">{pet?.age} años</span>
            </div>
            <div className="detail-item">
              <Weight size={16} />
              <span className="value">{pet?.weight} kg</span>
            </div>
          </div>

          {pet?.description && (
            <div className="pet-description">
              <h3>Descripción:</h3>
              <p>{pet.description}</p>
            </div>
          )}
        </div>
      </div>

      <div className="owner-contact">
        <h3>👤 Información del Dueño</h3>
        <div className="contact-info">
          <div className="contact-item">
            <span className="label">Nombre:</span>
            <span className="value">{pet?.owner.firstName} {pet?.owner.lastName}</span>
          </div>
          {pet?.ownerPhone && (
            <div className="contact-item">
              <Phone size={16} />
              <a href={`tel:${pet.ownerPhone}`} className="contact-link">
                {pet.ownerPhone}
              </a>
            </div>
          )}
          <div className="contact-item">
            <Mail size={16} />
            <a href={`mailto:${pet?.owner.email}`} className="contact-link">
              {pet?.owner.email}
            </a>
          </div>
        </div>
      </div>

      <div className="action-buttons">
        <button 
          className="btn-primary btn-large"
          onClick={() => setShowReportForm(true)}
        >
          📍 ¡Encontré esta mascota!
        </button>
        
        {pet?.ownerPhone && (
          <a 
            href={`tel:${pet.ownerPhone}`} 
            className="btn-secondary btn-large"
          >
            📞 Llamar al dueño
          </a>
        )}
      </div>

      {showReportForm && (
        <div className="modal-overlay">
          <div className="report-modal">
            <h3>📍 Reportar Mascota Encontrada</h3>
            <form onSubmit={handleReportSubmit}>
              <div className="form-group">
                <label>Tu nombre (opcional):</label>
                <input
                  type="text"
                  value={reportData.finderName}
                  onChange={(e) => setReportData({...reportData, finderName: e.target.value})}
                  placeholder="Nombre completo"
                />
              </div>

              <div className="form-group">
                <label>Tu teléfono (opcional):</label>
                <input
                  type="tel"
                  value={reportData.finderPhone}
                  onChange={(e) => setReportData({...reportData, finderPhone: e.target.value})}
                  placeholder="+57 300 123 4567"
                />
              </div>

              <div className="form-group">
                <label>Tu email (opcional):</label>
                <input
                  type="email"
                  value={reportData.finderEmail}
                  onChange={(e) => setReportData({...reportData, finderEmail: e.target.value})}
                  placeholder="tu@email.com"
                />
              </div>

              <div className="form-group">
                <label>Mensaje para el dueño:</label>
                <textarea
                  value={reportData.message}
                  onChange={(e) => setReportData({...reportData, message: e.target.value})}
                  placeholder="Describe dónde encontraste a la mascota, su estado, etc."
                  rows={4}
                  required
                />
              </div>

              {reportData.latitude && reportData.longitude && (
                <div className="location-info">
                  <MapPin size={16} />
                  <span>Ubicación actual detectada</span>
                </div>
              )}

              <div className="modal-actions">
                <button type="submit" className="btn-primary">
                  📤 Enviar Reporte
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowReportForm(false)}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}