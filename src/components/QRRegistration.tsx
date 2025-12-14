import React, { useState } from 'react';
import { qrServiceAPI, fileServiceAPI } from '../lib/api';

export const QRRegistration: React.FC = () => {
  const [formData, setFormData] = useState({
    petName: '',
    ownerName: '',
    phone: ''
  });
  const [qrResult, setQrResult] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleQRRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await qrServiceAPI.registerQR(formData);
      setQrResult(response.data);
    } catch (error) {
      console.error('QR Registration failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'pet_profile');
      formData.append('ownerId', '550e8400-e29b-41d4-a716-446655440000');
      
      const response = await fileServiceAPI.uploadFile(formData);
      setUploadResult(response.data);
    } catch (error) {
      console.error('File upload failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>🧪 Microservices Integration Test</h2>
      
      {/* QR Registration */}
      <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h3>📱 QR Service Test</h3>
        <form onSubmit={handleQRRegister}>
          <input
            type="text"
            placeholder="Pet Name"
            value={formData.petName}
            onChange={(e) => setFormData({...formData, petName: e.target.value})}
            style={{ width: '100%', padding: '8px', margin: '5px 0' }}
          />
          <input
            type="text"
            placeholder="Owner Name"
            value={formData.ownerName}
            onChange={(e) => setFormData({...formData, ownerName: e.target.value})}
            style={{ width: '100%', padding: '8px', margin: '5px 0' }}
          />
          <input
            type="text"
            placeholder="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            style={{ width: '100%', padding: '8px', margin: '5px 0' }}
          />
          <button type="submit" disabled={loading} style={{ padding: '10px 20px', margin: '10px 0' }}>
            {loading ? 'Registering...' : 'Register QR'}
          </button>
        </form>
        
        {qrResult && (
          <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#e8f5e8', borderRadius: '4px' }}>
            <strong>✅ QR Registered:</strong><br/>
            Code: {qrResult.qrCode}<br/>
            URL: <a href={qrResult.url} target="_blank" rel="noopener noreferrer">{qrResult.url}</a>
          </div>
        )}
      </div>

      {/* File Upload */}
      <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h3>📁 File Service Test</h3>
        <form onSubmit={handleFileUpload}>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            style={{ width: '100%', padding: '8px', margin: '5px 0' }}
          />
          <button type="submit" disabled={loading || !file} style={{ padding: '10px 20px', margin: '10px 0' }}>
            {loading ? 'Uploading...' : 'Upload File'}
          </button>
        </form>
        
        {uploadResult && (
          <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#e8f5e8', borderRadius: '4px' }}>
            <strong>✅ File Uploaded:</strong><br/>
            ID: {uploadResult.data.file.id}<br/>
            URL: <a href={uploadResult.data.file.publicUrl} target="_blank" rel="noopener noreferrer">View File</a><br/>
            Thumbnail: <a href={uploadResult.data.file.thumbnailUrl} target="_blank" rel="noopener noreferrer">View Thumbnail</a>
          </div>
        )}
      </div>
    </div>
  );
};