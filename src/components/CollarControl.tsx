import { useState } from 'react';
import { api, locationAPI } from '../lib/api';
import { useQueryClient } from '@tanstack/react-query';

interface CollarControlProps {
  petId: string;
  petName: string;
}

export default function CollarControl({ petId, petName }: CollarControlProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const queryClient = useQueryClient();

  const sendFindCommand = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      // Send command to collar
      const response = await api.post('/collar/commands', {
        petId,
        command: 'FIND_PET'
      });
      
      setMessage(`✅ ${response.data.message}`);
      
      // Refresh location data
      queryClient.invalidateQueries({ queryKey: ['pet-location', petId] });
      
    } catch (error: any) {
      setMessage(`❌ Error: ${error.response?.data?.message || 'Connection error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="collar-control">
      <h3>🎛️ Collar Control</h3>
      <p>Send remote commands to {petName}'s collar</p>
      
      <button 
        onClick={sendFindCommand}
        disabled={loading}
        className="btn-emergency"
        style={{
          padding: '15px 30px',
          fontSize: '1.1em',
          backgroundColor: '#ff4444',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1
        }}
      >
        {loading ? '⏳ Sending...' : '🚨 FIND MY PET'}
      </button>
      
      {message && (
        <div style={{
          marginTop: '15px',
          padding: '10px',
          borderRadius: '5px',
          backgroundColor: message.includes('✅') ? '#d4edda' : '#f8d7da',
          color: message.includes('✅') ? '#155724' : '#721c24',
          border: `1px solid ${message.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          {message}
        </div>
      )}
      
      <div style={{ marginTop: '15px', fontSize: '0.9em', color: '#666' }}>
        <p>💡 The collar will check for this command every 5 seconds</p>
        <p>🔊 Will activate sound and lights until execution is confirmed</p>
      </div>
    </div>
  );
}