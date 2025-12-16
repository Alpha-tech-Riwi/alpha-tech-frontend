import { useState } from 'react';
import { api } from '../lib/api';

interface CollarAssignmentProps {
  petId: string;
  petName: string;
  currentCollarId?: string;
}

export default function CollarAssignment({ petId, petName, currentCollarId }: CollarAssignmentProps) {
  const [collarId, setCollarId] = useState(currentCollarId || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const assignCollar = async () => {
    if (!collarId.trim()) {
      setMessage('❌ Por favor ingresa un Collar ID');
      return;
    }

    setLoading(true);
    setMessage('');
    
    try {
      const response = await api.post('/collar/assign', {
        petId,
        collarId: collarId.trim()
      });
      
      setMessage(`✅ ${response.data.message}`);
    } catch (error: any) {
      setMessage(`❌ Error: ${error.response?.data?.message || 'Error de conexión'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="collar-assignment" style={{
      padding: '20px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      marginBottom: '20px',
      backgroundColor: '#f9f9f9'
    }}>
      <h3>🔗 Asignar Collar ESP32</h3>
      <p>Conecta el collar físico con {petName}</p>
      
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '15px' }}>
        <input
          type="text"
          placeholder="Ej: ESP32_001, 123, ABC123..."
          value={collarId}
          onChange={(e) => setCollarId(e.target.value)}
          style={{
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            flex: 1
          }}
        />
        <button 
          onClick={assignCollar}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? '⏳ Asignando...' : '🔗 Asignar'}
        </button>
      </div>
      
      {message && (
        <div style={{
          padding: '10px',
          borderRadius: '5px',
          backgroundColor: message.includes('✅') ? '#d4edda' : '#f8d7da',
          color: message.includes('✅') ? '#155724' : '#721c24',
          border: `1px solid ${message.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          {message}
        </div>
      )}
      
      <div style={{ marginTop: '10px', fontSize: '0.9em', color: '#666' }}>
        <p>💡 El Collar ID es el identificador único del hardware ESP32</p>
        <p>🔄 Una vez asignado, el collar podrá recibir comandos remotos</p>
      </div>
    </div>
  );
}