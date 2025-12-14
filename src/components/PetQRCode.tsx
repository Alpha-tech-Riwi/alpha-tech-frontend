import { useState } from 'react';
import { Download, Share2, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface PetQRCodeProps {
  petId: string;
  petName: string;
  onClose: () => void;
}

export default function PetQRCode({ petId, petName, onClose }: PetQRCodeProps) {
  const [downloading, setDownloading] = useState(false);

  const qrCode = `PET${petId.substring(0, 8).toUpperCase()}`;
  const url = `${import.meta.env.VITE_QR_SERVICE_URL || 'http://localhost:3004'}/found/${qrCode}`;

  const downloadQR = async () => {
    setDownloading(true);
    try {
      const qrElement = document.querySelector('.qr-code-wrapper svg') as SVGElement;
      if (qrElement) {
        const svgData = new XMLSerializer().serializeToString(qrElement);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        canvas.width = 240;
        canvas.height = 240;
        
        img.onload = () => {
          if (ctx) {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            const link = document.createElement('a');
            link.download = `${petName}-QR-Code.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
          }
        };
        
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        img.src = url;
      }
    } catch (error) {
      // Error downloading QR
    }
    setDownloading(false);
  };

  const shareQR = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `QR de ${petName}`,
          text: `QR Code for ${petName} - Alpha Tech`,
          url: url
        });
      } catch (error) {
        // Error sharing
      }
    } else {
      navigator.clipboard.writeText(url);
      // URL copied to clipboard
    }
  };

  return (
    <div className="qr-modal-overlay">
      <div className="qr-modal">
        <div className="qr-header">
          <h3>🏷️ QR Code for {petName}</h3>
          <button onClick={onClose} className="close-btn">
            <X size={24} />
          </button>
        </div>

        <div className="qr-content">
          <div className="qr-code-container">
            <div className="qr-code-wrapper">
              <QRCodeSVG 
                value={url}
                size={200}
                level="H"
                includeMargin={true}
                bgColor="#ffffff"
                fgColor="#000000"
              />
              <p className="qr-label">QR Code for {petName}</p>
            </div>
          </div>

          <div className="qr-info">
            <p className="qr-description">
              Print this QR code and attach it to <strong>{petName}</strong>'s collar
            </p>
            <div className="qr-url">
              <small>URL: {url}</small>
            </div>
          </div>

          <div className="qr-instructions">
            <h4>📋 Instrucciones:</h4>
            <ol>
              <li>Download and print the QR code</li>
              <li>Attach it to {petName}'s collar or tag</li>
              <li>If someone finds your pet, they can scan the code</li>
              <li>You'll receive an immediate notification with the location</li>
            </ol>
          </div>

          <div className="qr-actions">
            <button 
              onClick={downloadQR} 
              className="btn-primary"
              disabled={downloading}
            >
              <Download size={20} />
              {downloading ? 'Descargando...' : 'Descargar QR'}
            </button>
            
            <button onClick={shareQR} className="btn-secondary">
              <Share2 size={20} />
              Compartir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}