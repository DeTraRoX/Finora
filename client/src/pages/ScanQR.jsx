import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Badge from '../components/UI/Badge';
import { QrCode, Camera, Upload, AlertCircle, RefreshCw, KeyRound, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const ScanQR = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [useCamera, setUseCamera] = useState(false);
  const [mockPayload, setMockPayload] = useState('');
  const qrReaderRef = useRef(null);
  let html5QrcodeScanner = null;

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const stopScanner = () => {
    if (html5QrcodeScanner) {
      html5QrcodeScanner.clear().catch(err => console.error("Error clearing scanner:", err));
    }
  };

  // Start HTML5 Camera QR Scanner
  const startCameraScanner = () => {
    setError('');
    setUseCamera(true);
    
    // Tiny delay to ensure element is rendered
    setTimeout(() => {
      try {
        html5QrcodeScanner = new Html5QrcodeScanner(
          'qr-reader-container',
          { fps: 10, qrbox: { width: 250, height: 250 } },
          /* verbose= */ false
        );
        
        html5QrcodeScanner.render(
          (decodedText) => {
            handleQrSuccess(decodedText);
          },
          (errorMessage) => {
            // Keep scanning, ignore frame errors
          }
        );
      } catch (err) {
        console.error("Scanner startup failed:", err);
        setError("Could not access camera. Please ensure permissions are granted or use the file upload fallback.");
        setUseCamera(false);
      }
    }, 100);
  };

  // Image Upload Scanner Fallback
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setError('');
    const html5QrCode = new Html5Qrcode('qr-reader-file-dummy');
    
    html5QrCode
      .scanFile(file, true)
      .then((decodedText) => {
        handleQrSuccess(decodedText);
      })
      .catch((err) => {
        setError('Could not decode QR code from image. Please try a clearer picture.');
      });
  };

  // Parse QR Code Payload and redirect
  const handleQrSuccess = (decodedText) => {
    stopScanner();
    try {
      // Expecting JSON: { userId, name, email, phone }
      const recipient = JSON.parse(decodedText);
      
      if (!recipient.userId || !recipient.name || !recipient.phone) {
        throw new Error('Invalid QR payload fields');
      }
      
      // Redirect to SendMoney page with recipient prepopulated
      navigate('/send-money', { state: { recipient: {
        _id: recipient.userId,
        name: recipient.name,
        email: recipient.email,
        phone: recipient.phone,
      } } });
      
    } catch (err) {
      setError('Invalid Finora QR code. Please scan a valid recipient QR code.');
    }
  };

  // Mock Developer Input Submission
  const handleMockSubmit = (e) => {
    e.preventDefault();
    if (!mockPayload.trim()) return;
    handleQrSuccess(mockPayload);
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      
      {/* Title */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs text-dark-400 hover:text-white mb-4 font-semibold transition-colors focus:outline-none"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <h1 className="text-2xl font-extrabold tracking-tight text-white">
          Scan QR Code
        </h1>
        <p className="text-xs text-dark-400 mt-0.5">
          Scan a Finora QR code to initiate an instant money transfer.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-accent-error/10 border border-accent-error/20 text-accent-error text-xs font-semibold">
          <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
          <div className="leading-relaxed">{error}</div>
        </div>
      )}

      {/* Main scanner panel */}
      <Card className="flex flex-col items-center justify-center p-6 text-center">
        
        {useCamera ? (
          /* Live camera viewport */
          <div className="w-full space-y-4">
            <div id="qr-reader-container" className="w-full overflow-hidden rounded-2xl bg-black border border-dark-800" />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                stopScanner();
                setUseCamera(false);
              }}
            >
              Cancel Camera Scan
            </Button>
          </div>
        ) : (
          /* Selection screen */
          <div className="space-y-6 w-full py-6">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-primary-500/10 border border-primary-500/20 text-primary-400 flex items-center justify-center">
              <QrCode className="h-8 w-8 stroke-[1.5]" />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {/* Camera Trigger */}
              <Button
                variant="primary"
                onClick={startCameraScanner}
                icon={Camera}
              >
                Scan with Camera
              </Button>
              
              {/* File Upload Trigger */}
              <label className="inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 outline-none px-5 py-2.5 text-sm gap-2 bg-dark-800 text-dark-100 hover:bg-dark-700 hover:text-white border border-dark-700 cursor-pointer">
                <Upload className="h-4 w-4" />
                <span>Upload QR Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}

        {/* Dummy hidden element for html5-qrcode file scanning */}
        <div id="qr-reader-file-dummy" className="hidden" />
      </Card>

      {/* DEVELOPER TESTING MOCK PANEL */}
      <Card className="bg-dark-950/40 border border-dark-900">
        <span className="text-[10px] font-bold text-accent-warning uppercase tracking-wider block mb-2 text-left">
          Developer Testing Tool (Paste recipient QR payload)
        </span>
        <form onSubmit={handleMockSubmit} className="space-y-3">
          <Input
            placeholder='e.g. {"userId":"[RAHUL_ID]","name":"Rahul Verma","phone":"8765432109","email":"rahul@finora.com"}'
            type="text"
            value={mockPayload}
            onChange={(e) => setMockPayload(e.target.value)}
            className="text-xs font-mono"
          />
          <div className="flex justify-between items-center text-[10px] text-dark-500">
            <span>Tip: Copy a payload from a user profile QR to simulate a physical scan.</span>
            <Button type="submit" variant="secondary" size="sm" className="h-8 py-0">
              Mock Scan
            </Button>
          </div>
        </form>
      </Card>

    </div>
  );
};

export default ScanQR;
