import React, { useRef, useState, useEffect, useCallback } from 'react';
import { audioService } from '../services/audioService';

interface PhotoBoothProps {
  timerDuration: number;
  totalPhotos: number;
  onPhotosTaken: (photos: string[]) => void;
  onCancel: () => void;
}

export const PhotoBooth: React.FC<PhotoBoothProps> = ({ timerDuration, totalPhotos, onPhotosTaken, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [flash, setFlash] = useState(false);

  // Initialize Camera
  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: 720, height: 960 }, // Portrait aspect preferred
          audio: false,
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        alert("카메라 권한이 필요합니다.");
        onCancel();
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Mirror the image horizontally
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
      
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const photoData = canvas.toDataURL('image/jpeg');
      setCapturedPhotos(prev => [...prev, photoData]);
      
      // FX
      audioService.playShutter();
      setFlash(true);
      setTimeout(() => setFlash(false), 200);
    }
  }, []);

  // Countdown Logic
  useEffect(() => {
    if (capturedPhotos.length >= totalPhotos) {
        // Delay slightly to show the last flash before finishing
        setTimeout(() => {
            onPhotosTaken(capturedPhotos);
        }, 1000);
        return;
    }

    // Use the passed timerDuration prop
    let count = timerDuration;
    setCountdown(count);
    
    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
        audioService.playBeep();
      } else {
        clearInterval(interval);
        setCountdown(null);
        capturePhoto();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [capturedPhotos.length, capturePhoto, onPhotosTaken, timerDuration, totalPhotos]);

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
      <div className="relative w-full max-w-md aspect-[3/4] bg-gray-900 rounded-lg overflow-hidden shadow-2xl">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover transform scale-x-[-1]" // CSS mirroring for preview
        />
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Flash Effect */}
        {flash && <div className="absolute inset-0 bg-white opacity-80 transition-opacity duration-200" />}
        
        {/* Countdown Overlay */}
        {countdown !== null && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-9xl font-bold text-white drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] animate-bounce">
              {countdown}
            </span>
          </div>
        )}

        {/* Status Indicators */}
        <div className="absolute top-4 right-4 flex space-x-2 flex-wrap max-w-[200px] justify-end gap-y-2">
            {[...Array(totalPhotos)].map((_, i) => (
                <div 
                    key={i} 
                    className={`w-3 h-3 rounded-full transition-colors ${i < capturedPhotos.length ? 'bg-pink-500' : 'bg-gray-600'}`}
                />
            ))}
        </div>
      </div>
      
      <p className="text-white mt-4 text-lg handwriting">
        {capturedPhotos.length + 1}번째 사진 찍는 중... (총 {totalPhotos}장)
      </p>
    </div>
  );
};