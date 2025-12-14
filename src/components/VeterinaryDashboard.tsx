import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import './VeterinaryDashboard.css';

interface MedicalRecord {
  id: string;
  type: string;
  title: string;
  description: string;
  veterinarianName: string;
  clinicName: string;
  recordDate: string;
  nextDueDate?: string;
  status: string;
  cost?: number;
}

interface HealthSummary {
  totalRecords: number;
  lastCheckup: string | null;
  vaccinationsCompleted: number;
  upcomingVaccinations: number;
  healthScore: number;
}

interface VeterinaryDashboardProps {
  petId: string;
  petName: string;
}

export default function VeterinaryDashboard({ petId, petName }: VeterinaryDashboardProps) {
  const [medicalHistory, setMedicalHistory] = useState<MedicalRecord[]>([]);
  const [upcomingVaccinations, setUpcomingVaccinations] = useState<MedicalRecord[]>([]);
  const [healthSummary, setHealthSummary] = useState<HealthSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddRecord, setShowAddRecord] = useState(false);

  useEffect(() => {
    loadVeterinaryData();
  }, [petId]);

  const loadVeterinaryData = async () => {
    try {
      setLoading(true);
      const [historyRes, vaccinationsRes, summaryRes] = await Promise.all([
        api.get(`/veterinary/pets/${petId}/history`),
        api.get(`/veterinary/pets/${petId}/vaccinations/upcoming`),
        api.get(`/veterinary/pets/${petId}/health-summary`)
      ]);

      setMedicalHistory(historyRes.data.data);
      setUpcomingVaccinations(vaccinationsRes.data.data);
      setHealthSummary(summaryRes.data.data);
    } catch (error) {
      console.error('Error loading veterinary data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return '#10b981'; // Green
    if (score >= 60) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getRecordTypeIcon = (type: string) => {
    const icons = {
      vaccination: '💉',
      checkup: '🩺',
      treatment: '💊',
      surgery: '🏥',
      emergency: '🚨',
      medication: '💊'
    };
    return icons[type as keyof typeof icons] || '📋';
  };

  if (loading) {
    return (
      <div className="veterinary-loading">
        <div className="loading-spinner"></div>
        <p>Cargando información veterinaria...</p>
      </div>
    );
  }

  return (
    <div className="veterinary-dashboard">
      <div className="veterinary-header">
        <h2>🏥 Historial Veterinario - {petName}</h2>
        <button 
          className="add-record-btn"
          onClick={() => setShowAddRecord(true)}
        >
          + Agregar Registro
        </button>
      </div>

      {/* Health Summary */}
      {healthSummary && (
        <div className="health-summary">
          <div className="health-score">
            <div 
              className="score-circle"
              style={{ borderColor: getHealthScoreColor(healthSummary.healthScore) }}
            >
              <span style={{ color: getHealthScoreColor(healthSummary.healthScore) }}>
                {healthSummary.healthScore}
              </span>
            </div>
            <h3>Puntuación de Salud</h3>
          </div>
          
          <div className="health-stats">
            <div className="stat-card">
              <div className="stat-icon">📋</div>
              <div className="stat-info">
                <span className="stat-number">{healthSummary.totalRecords}</span>
                <span className="stat-label">Registros Totales</span>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">💉</div>
              <div className="stat-info">
                <span className="stat-number">{healthSummary.vaccinationsCompleted}</span>
                <span className="stat-label">Vacunas Completadas</span>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">⏰</div>
              <div className="stat-info">
                <span className="stat-number">{healthSummary.upcomingVaccinations}</span>
                <span className="stat-label">Vacunas Pendientes</span>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">🩺</div>
              <div className="stat-info">
                <span className="stat-number">
                  {healthSummary.lastCheckup ? formatDate(healthSummary.lastCheckup) : 'N/A'}
                </span>
                <span className="stat-label">Último Chequeo</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Vaccinations */}
      {upcomingVaccinations.length > 0 && (
        <div className="upcoming-vaccinations">
          <h3>⏰ Vacunas Próximas</h3>
          <div className="vaccination-list">
            {upcomingVaccinations.map((vaccination) => (
              <div key={vaccination.id} className="vaccination-card urgent">
                <div className="vaccination-info">
                  <span className="vaccination-icon">💉</span>
                  <div>
                    <h4>{vaccination.title}</h4>
                    <p>Vence: {formatDate(vaccination.nextDueDate!)}</p>
                  </div>
                </div>
                <button className="mark-complete-btn">
                  Marcar Completa
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Medical History */}
      <div className="medical-history">
        <h3>📋 Historial Médico</h3>
        {medicalHistory.length === 0 ? (
          <div className="no-records">
            <p>No hay registros médicos disponibles</p>
          </div>
        ) : (
          <div className="records-timeline">
            {medicalHistory.map((record) => (
              <div key={record.id} className="record-card">
                <div className="record-icon">
                  {getRecordTypeIcon(record.type)}
                </div>
                <div className="record-content">
                  <div className="record-header">
                    <h4>{record.title}</h4>
                    <span className="record-date">{formatDate(record.recordDate)}</span>
                  </div>
                  <p className="record-description">{record.description}</p>
                  {record.veterinarianName && (
                    <div className="record-details">
                      <span>👨‍⚕️ {record.veterinarianName}</span>
                      {record.clinicName && <span>🏥 {record.clinicName}</span>}
                      {record.cost && <span>💰 ${record.cost}</span>}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}