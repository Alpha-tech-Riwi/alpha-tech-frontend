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
  const url = `https://prefers-cheapest-blues-parental.trycloudflare.com/qr/found/${qrCode}`;

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
      console.error('Error downloading QR:', error);
    }
    setDownloading(false);
  };

  const shareQR = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `QR de ${petName}`,
          text: `Código QR para ${petName} - Alpha Tech`,
          url: url
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(url);
      alert('URL copiada al portapapeles');
    }
  };

  return (
    <div className="qr-modal-overlay">
      <div className="qr-modal">
        <div className="qr-header">
          <h3>🏷️ Código QR de {petName}</h3>
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
              <p className="qr-label">Código QR para {petName}</p>
            </div>
          </div>

          <div className="qr-info">
            <p className="qr-description">
              Imprime este código QR y pégalo en el collar de <strong>{petName}</strong>
            </p>
            <div className="qr-url">
              <small>URL: {url}</small>
            </div>
          </div>

          <div className="qr-instructions">
            <h4>📋 Instrucciones:</h4>
            <ol>
              <li>Descarga e imprime el código QR</li>
              <li>Pégalo en el collar o placa de {petName}</li>
              <li>Si alguien encuentra a tu mascota, podrá escanear el código</li>
              <li>Recibirás una notificación inmediata con la ubicación</li>
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