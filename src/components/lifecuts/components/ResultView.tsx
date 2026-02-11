import React, { useState, useEffect, useRef } from 'react';
import { PhotoFrameConfig, FRAME_COLORS, Sticker, STICKER_LIST, FilterType } from '../types';
import { generatePhotoCaption } from '../services/geminiService';
import { audioService } from '../services/audioService';

interface ResultViewProps {
  photos: string[];
  onRetake: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({ photos, onRetake }) => {
  const [selectedFrame, setSelectedFrame] = useState<PhotoFrameConfig>(FRAME_COLORS[0]);
  const [caption, setCaption] = useState<string>('오늘을 기억하며');
  const [loadingCaption, setLoadingCaption] = useState(false);
  const [filter, setFilter] = useState<FilterType>('none');
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [activeTab, setActiveTab] = useState<'frame' | 'filter' | 'sticker' | 'text' | 'share'>('frame');
  
  // Dragging state
  const [draggingId, setDraggingId] = useState<number | null>(null);
  
  // Sharing state
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [qrUrl, setQrUrl] = useState<string | null>(null);

  const previewRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const fetchCaption = async () => {
    setLoadingCaption(true);
    audioService.playBeep(); 
    const text = await generatePhotoCaption();
    setCaption(text);
    setLoadingCaption(false);
  };

  const addSticker = (emoji: string) => {
    audioService.playPop();
    const newSticker: Sticker = {
      id: Date.now(),
      emoji,
      x: 100 + Math.random() * 50, // Randomish center pos
      y: 200 + Math.random() * 50,
    };
    setStickers([...stickers, newSticker]);
  };

  const removeSticker = (id: number) => {
    audioService.playBeep();
    setStickers(stickers.filter(s => s.id !== id));
  };

  // Sticker Drag Logic
  const handlePointerDown = (e: React.PointerEvent, id: number) => {
    e.stopPropagation();
    setDraggingId(id);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (draggingId === null || !previewRef.current) return;
    
    const rect = previewRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setStickers(prev => prev.map(s => {
      if (s.id === draggingId) {
        return { ...s, x, y };
      }
      return s;
    }));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setDraggingId(null);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const getCanvasBlob = async (): Promise<Blob | null> => {
    if (!canvasRef.current) return null;
    return new Promise(resolve => {
        canvasRef.current?.toBlob(resolve, 'image/png');
    });
  };

  const downloadImage = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `life4cuts-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  const handleWebShare = async () => {
    const blob = await getCanvasBlob();
    if (!blob) return;

    const file = new File([blob], `life4cuts-${Date.now()}.png`, { type: 'image/png' });

    if (navigator.share) {
        try {
            await navigator.share({
                title: '나의 인생네컷',
                text: '오늘 찍은 인생네컷이야! 어때?',
                files: [file],
            });
            audioService.playSuccess();
        } catch (error) {
            console.log('Error sharing:', error);
        }
    } else {
        alert("이 브라우저에서는 공유 기능을 지원하지 않습니다. 😢\n저장하기를 이용해주세요!");
    }
  };

  const handleGenerateQR = () => {
    if (isUploading || qrUrl) return;
    setIsUploading(true);
    setUploadProgress(0);

    // Simulation of upload
    const interval = setInterval(() => {
        setUploadProgress(prev => {
            if (prev >= 100) {
                clearInterval(interval);
                setIsUploading(false);
                // Demo QR Code pointing to current URL
                setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.href)}`);
                audioService.playSuccess();
                return 100;
            }
            return prev + 5; // increment
        });
    }, 100);
  };

  // Draw the composite image on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const photoCount = photos.length;
    const imgWidth = 400;
    const imgHeight = 533; 
    const padding = 30;
    const bottomSpace = 120;
    
    // Dynamic Height Calculation
    const totalWidth = imgWidth + (padding * 2);
    const totalHeight = (imgHeight * photoCount) + (padding * (photoCount + 1)) + bottomSpace;

    // Preview area width used for coordinate scaling
    const previewWidth = 320; 
    const scaleFactor = totalWidth / previewWidth;

    canvas.width = totalWidth;
    canvas.height = totalHeight;

    // 1. Draw Frame Background
    ctx.fillStyle = selectedFrame.color;
    ctx.fillRect(0, 0, totalWidth, totalHeight);

    // 2. Draw Photos with Filter
    photos.forEach((photoSrc, index) => {
      const img = new Image();
      img.src = photoSrc;
      img.onload = () => {
        const yPos = padding + (index * (imgHeight + padding));
        
        ctx.save();
        ctx.filter = filter; // Apply selected filter
        ctx.drawImage(img, padding, yPos, imgWidth, imgHeight);
        ctx.restore(); // Restore to avoid affecting frame/text
        
        // Border
        ctx.strokeStyle = 'rgba(0,0,0,0.1)';
        ctx.lineWidth = 1;
        ctx.strokeRect(padding, yPos, imgWidth, imgHeight);
      };
    });

    setTimeout(() => {
        // 3. Draw Text (Date & Caption)
        ctx.fillStyle = selectedFrame.textColor;
        ctx.textAlign = 'center';
        
        ctx.font = 'bold 24px "Noto Sans KR"';
        const dateStr = new Date().toLocaleDateString('ko-KR', { 
            year: 'numeric', month: 'long', day: 'numeric' 
        });
        ctx.fillText(dateStr, totalWidth / 2, totalHeight - bottomSpace + 40);

        ctx.font = '30px "Gaegu"';
        ctx.fillText(caption, totalWidth / 2, totalHeight - bottomSpace + 85);

        ctx.font = '14px "Noto Sans KR"';
        ctx.globalAlpha = 0.6;
        ctx.fillText("인생네컷 Web", totalWidth / 2, totalHeight - 15);
        ctx.globalAlpha = 1.0;

        // 4. Draw Stickers
        ctx.font = '40px serif'; // Emoji font size
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        stickers.forEach(sticker => {
            const realX = sticker.x * scaleFactor;
            const realY = sticker.y * scaleFactor;
            ctx.fillText(sticker.emoji, realX, realY);
        });

    }, 500);

  }, [photos, selectedFrame, caption, filter, stickers]);

  return (
    <div className="flex flex-col md:flex-row items-start justify-center min-h-screen p-4 gap-8 bg-gray-50">
      
      {/* Left: Preview Area */}
      <div className="flex flex-col items-center sticky top-4 max-h-[90vh] overflow-y-auto no-scrollbar">
        <div 
            ref={previewRef}
            className="shadow-2xl relative select-none touch-none"
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
        >
             {/* Hidden Canvas for High Res Generation */}
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Visual HTML Representation */}
            <div 
                style={{ backgroundColor: selectedFrame.color }}
                className="w-[320px] p-4 flex flex-col gap-4 items-center transition-colors duration-500"
            >
                {photos.map((src, i) => (
                    <img 
                        key={i} 
                        src={src} 
                        alt={`Cut ${i}`} 
                        style={{ filter: filter }}
                        className="w-full aspect-[3/4] object-cover bg-gray-200 transition-all duration-300" 
                    />
                ))}
                <div className="h-24 w-full flex flex-col items-center justify-center text-center">
                    <p style={{ color: selectedFrame.textColor }} className="font-bold text-sm opacity-80 mb-1">
                        {new Date().toLocaleDateString('ko-KR')}
                    </p>
                    <p style={{ color: selectedFrame.textColor }} className="handwriting text-xl font-bold">
                        {caption}
                    </p>
                </div>
            </div>

            {/* Sticker Layer */}
            {stickers.map((sticker) => (
                <div
                    key={sticker.id}
                    onPointerDown={(e) => handlePointerDown(e, sticker.id)}
                    onDoubleClick={() => removeSticker(sticker.id)}
                    style={{ 
                        left: sticker.x, 
                        top: sticker.y, 
                        transform: 'translate(-50%, -50%)',
                        cursor: 'move'
                    }}
                    className="absolute text-4xl hover:scale-125 transition-transform active:scale-110 select-none"
                >
                    {sticker.emoji}
                </div>
            ))}
        </div>
        <p className="text-gray-400 text-xs mt-4">스티커를 더블 클릭하면 삭제돼요!</p>
      </div>

      {/* Right: Controls */}
      <div className="flex flex-col w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden sticky top-4">
        
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-100 overflow-x-auto">
            {['frame', 'filter', 'sticker', 'text', 'share'].map((tab) => (
                <button
                    key={tab}
                    onClick={() => {
                        audioService.playBeep();
                        setActiveTab(tab as any);
                    }}
                    className={`flex-1 min-w-[60px] py-4 text-sm font-bold transition-colors whitespace-nowrap px-2 ${
                        activeTab === tab 
                        ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50' 
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                    }`}
                >
                    {tab === 'frame' && '프레임'}
                    {tab === 'filter' && '필터'}
                    {tab === 'sticker' && '스티커'}
                    {tab === 'text' && '문구'}
                    {tab === 'share' && '공유'}
                </button>
            ))}
        </div>

        {/* Tab Content */}
        <div className="p-6 min-h-[300px]">
            
            {activeTab === 'frame' && (
                <div className="animate-fade-in">
                    <h3 className="text-lg font-bold mb-4 text-gray-800">프레임 색상을 골라보세요</h3>
                    <div className="grid grid-cols-3 gap-4">
                        {FRAME_COLORS.map((frame) => (
                            <button
                                key={frame.name}
                                onClick={() => setSelectedFrame(frame)}
                                className={`aspect-square rounded-xl border-2 shadow-sm flex flex-col items-center justify-center gap-2 transition-all hover:-translate-y-1 ${selectedFrame.name === frame.name ? 'ring-2 ring-purple-500 border-transparent' : 'border-gray-200'}`}
                                style={{ backgroundColor: frame.color }}
                            >
                                <span 
                                    className="text-xs font-bold bg-white/80 px-2 py-1 rounded-full"
                                    style={{ color: '#000' }}
                                >
                                    {frame.name}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'filter' && (
                <div className="animate-fade-in">
                     <h3 className="text-lg font-bold mb-4 text-gray-800">사진 분위기를 바꿔보세요</h3>
                     <div className="grid grid-cols-2 gap-3">
                        <button 
                            onClick={() => setFilter('none')}
                            className={`p-4 rounded-xl border text-sm font-bold ${filter === 'none' ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                        >
                            원본
                        </button>
                        <button 
                            onClick={() => setFilter('grayscale(100%)')}
                            className={`p-4 rounded-xl border text-sm font-bold ${filter === 'grayscale(100%)' ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                        >
                            흑백
                        </button>
                        <button 
                            onClick={() => setFilter('sepia(60%)')}
                            className={`p-4 rounded-xl border text-sm font-bold ${filter === 'sepia(60%)' ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                        >
                            빈티지
                        </button>
                        <button 
                            onClick={() => setFilter('brightness(110%) saturate(120%)')}
                            className={`p-4 rounded-xl border text-sm font-bold ${filter === 'brightness(110%) saturate(120%)' ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                        >
                            화사하게
                        </button>
                     </div>
                </div>
            )}

            {activeTab === 'sticker' && (
                <div className="animate-fade-in">
                    <h3 className="text-lg font-bold mb-4 text-gray-800">원하는 스티커를 클릭하세요</h3>
                    <div className="grid grid-cols-5 gap-3">
                        {STICKER_LIST.map((emoji) => (
                            <button
                                key={emoji}
                                onClick={() => addSticker(emoji)}
                                className="text-3xl hover:scale-125 transition-transform p-2"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                    <p className="text-center text-xs text-gray-400 mt-6">화면의 스티커를 드래그해서 옮길 수 있어요!</p>
                </div>
            )}

            {activeTab === 'text' && (
                <div className="animate-fade-in">
                    <h3 className="text-lg font-bold mb-4 text-gray-800">오늘의 감성을 기록하세요</h3>
                    <div className="flex gap-2 mb-4">
                        <input 
                            type="text" 
                            value={caption} 
                            onChange={(e) => setCaption(e.target.value)}
                            className="flex-1 bg-white text-gray-800 border border-gray-300 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-['Gaegu']"
                        />
                    </div>
                    <button 
                        onClick={fetchCaption}
                        disabled={loadingCaption}
                        className="w-full bg-purple-100 text-purple-700 px-4 py-3 rounded-xl text-sm font-bold hover:bg-purple-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        <span>🪄 AI 추천 문구 받기</span>
                    </button>
                </div>
            )}

            {activeTab === 'share' && (
                <div className="animate-fade-in">
                    <h3 className="text-lg font-bold mb-4 text-gray-800">친구들과 공유해보세요</h3>
                    
                    {!qrUrl && !isUploading && (
                        <div className="flex flex-col gap-3">
                             <button 
                                onClick={handleWebShare}
                                className="w-full bg-yellow-400 text-black py-4 rounded-xl text-lg font-bold shadow-sm hover:bg-yellow-300 transition-all flex items-center justify-center gap-2"
                            >
                                <span>📤 친구에게 바로 보내기</span>
                            </button>
                            
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-500">또는</span>
                                </div>
                            </div>

                            <button 
                                onClick={handleGenerateQR}
                                className="w-full bg-gray-100 text-gray-700 py-4 rounded-xl text-lg font-bold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                            >
                                <span>📱 QR 코드 만들기</span>
                            </button>
                            <p className="text-xs text-center text-gray-400">사진이 클라우드 서버에 임시 저장됩니다.</p>
                        </div>
                    )}

                    {isUploading && (
                        <div className="flex flex-col items-center justify-center py-8">
                            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
                            <p className="font-bold text-gray-600 mb-2">클라우드 업로드 중...</p>
                            <div className="w-full bg-gray-100 rounded-full h-2.5 max-w-[200px]">
                                <div 
                                    className="bg-purple-600 h-2.5 rounded-full transition-all duration-300" 
                                    style={{ width: `${uploadProgress}%` }}
                                ></div>
                            </div>
                        </div>
                    )}

                    {qrUrl && (
                        <div className="flex flex-col items-center animate-scale-in">
                            <div className="bg-white p-4 rounded-2xl border-2 border-dashed border-gray-300 mb-4">
                                <img src={qrUrl} alt="QR Code" className="w-40 h-40" />
                            </div>
                            <p className="text-lg font-bold text-gray-800 mb-1">스캔해서 다운로드!</p>
                            <p className="text-xs text-gray-500 mb-4">(데모 환경: 이 사이트 링크가 공유됩니다)</p>
                            <button 
                                onClick={() => {
                                    setQrUrl(null);
                                    setUploadProgress(0);
                                }}
                                className="text-sm text-gray-500 underline hover:text-purple-600"
                            >
                                다시 만들기
                            </button>
                        </div>
                    )}
                </div>
            )}

        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex flex-col gap-3">
             <button 
                onClick={downloadImage}
                className="w-full bg-black text-white py-4 rounded-xl text-lg font-bold shadow-lg hover:bg-gray-800 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
                <span>💾 저장하기</span>
            </button>
            <button 
                onClick={onRetake}
                className="w-full bg-white text-gray-700 border border-gray-300 py-3 rounded-xl text-lg font-bold hover:bg-gray-50 transition-colors"
            >
                처음으로
            </button>
        </div>

      </div>
    </div>
  );
};