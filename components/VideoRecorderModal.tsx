import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CVData } from '../types.ts';
import { generateVideoScript } from '../services/geminiService.ts';
import { MagicWandIcon, CameraIcon } from './icons.tsx';

interface VideoRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (videoBlob: Blob) => void;
  cvData: CVData;
  language: string;
}

const filterGroups = {
  'Standard': [
    { id: 'none', name: 'None' },
    { id: 'grayscale(1)', name: 'Grayscale' },
    { id: 'sepia(1)', name: 'Sepia' },
  ],
  'Beauty & Retouch': [
    { id: 'contrast(1.1) saturate(1.1)', name: 'Enhance' },
    { id: 'brightness(1.1) contrast(0.95)', name: 'Brighten' },
    { id: 'sepia(0.2) saturate(1.2)', name: 'Warm Glow' },
  ],
};

const overlays = [
    { id: 'none', name: 'None' },
    { id: 'vignette', name: 'Vignette' },
    { id: 'light-leak', name: 'Light Leak' },
    { id: 'cinematic-bars', name: 'Cinematic' },
];

const scrollSpeeds = [
    { label: 'Slow', speed: 0.75 },
    { label: 'Normal', speed: 1 },
    { label: 'Fast', speed: 1.25 },
];

export const VideoRecorderModal: React.FC<VideoRecorderModalProps> = ({ isOpen, onClose, onSave, cvData, language }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [countdown, setCountdown] = useState(60);
  const [selectedFilter, setSelectedFilter] = useState('none');
  const [selectedOverlay, setSelectedOverlay] = useState('none');
  const [script, setScript] = useState<string | null>(null);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scrollSpeed, setScrollSpeed] = useState(1);
  const [activeTab, setActiveTab] = useState<'filters' | 'overlays'>('filters');
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const countdownIntervalRef = useRef<number | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const teleprompterRef = useRef<HTMLDivElement>(null);
  const scrollAnimationRef = useRef<number | null>(null);
  
  const selectedFilterRef = useRef(selectedFilter);

  useEffect(() => {
    selectedFilterRef.current = selectedFilter;
  }, [selectedFilter]);

  const drawVideoOnCanvas = useCallback(() => {
    if (videoRef.current && canvasRef.current && videoRef.current.readyState >= 3) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.filter = selectedFilterRef.current;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
    }
    animationFrameIdRef.current = requestAnimationFrame(drawVideoOnCanvas);
  }, []);

  const stopScroll = useCallback(() => {
    if (scrollAnimationRef.current) {
      cancelAnimationFrame(scrollAnimationRef.current);
      scrollAnimationRef.current = null;
    }
    if (teleprompterRef.current) {
      teleprompterRef.current.scrollTop = 0; // Reset scroll
    }
  }, []);

  const startMedia = useCallback(async () => {
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(mediaStream);
      setPermissionsGranted(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
            if (animationFrameIdRef.current) {
                cancelAnimationFrame(animationFrameIdRef.current);
            }
            animationFrameIdRef.current = requestAnimationFrame(drawVideoOnCanvas);
        };
      }
    } catch (err) {
      console.error("Error accessing camera and microphone:", err);
      let message = "Could not access camera and microphone. Please ensure you have given permissions for both devices.";
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
            message = "Camera and microphone access was denied. Please enable permissions in your browser settings and try again.";
        } else if (err.name === 'NotFoundError') {
            message = "No camera or microphone found. Please ensure they are connected and enabled.";
        }
      }
      setError(message);
      setPermissionsGranted(false);
    }
  }, [drawVideoOnCanvas]);

  const stopMedia = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
    setPermissionsGranted(false);
  }, [stream]);

  const resetComponentState = useCallback(() => {
    stopMedia();
    setIsRecording(false);
    setRecordedBlob(null);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setCountdown(60);
    setScript(null);
    setSelectedFilter('none');
    setSelectedOverlay('none');
    setError(null);
    stopScroll();
    setPermissionsGranted(false);
  }, [stopMedia, stopScroll]);

  useEffect(() => {
    if (!isOpen) {
      resetComponentState();
    }
  }, [isOpen, resetComponentState]);
  

  const startScroll = useCallback(() => {
    if (script && teleprompterRef.current) {
        const element = teleprompterRef.current;
        requestAnimationFrame(() => {
            const scrollHeight = element.scrollHeight;
            const clientHeight = element.clientHeight;
            const totalScrollDistance = scrollHeight - clientHeight;
            
            if (totalScrollDistance > 0) {
                const baseDuration = 60000;
                const duration = baseDuration / scrollSpeed;
                let startTime: number | null = null;
                
                const animateScroll = (timestamp: number) => {
                    if (!startTime) startTime = timestamp;
                    const elapsedTime = timestamp - startTime;
                    const progress = Math.min(elapsedTime / duration, 1);
                    
                    element.scrollTop = totalScrollDistance * progress;
                    
                    if (progress < 1) {
                        scrollAnimationRef.current = requestAnimationFrame(animateScroll);
                    } else {
                        scrollAnimationRef.current = null;
                    }
                };
                scrollAnimationRef.current = requestAnimationFrame(animateScroll);
            }
        });
    }
  }, [script, scrollSpeed]);

  const handleStartRecording = () => {
    if (!canvasRef.current || !stream) return;
    
    const canvasStream = canvasRef.current.captureStream(30);
    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length > 0) {
        canvasStream.addTrack(audioTracks[0]);
    }

    setRecordedBlob(null);
    chunksRef.current = [];
    mediaRecorderRef.current = new MediaRecorder(canvasStream, { mimeType: 'video/webm' });
    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };
    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      setRecordedBlob(blob);
    };
    mediaRecorderRef.current.start();
    setIsRecording(true);
    startScroll();

    setCountdown(60);
    countdownIntervalRef.current = window.setInterval(() => {
        setCountdown(prev => prev - 1);
    }, 1000);

    setTimeout(() => {
        if(mediaRecorderRef.current?.state === 'recording') {
            handleStopRecording();
        }
    }, 60000);
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      stopScroll();
    }
  };

  const handleRetake = () => {
    setRecordedBlob(null);
    setCountdown(60);
    stopScroll();
  };
  
  const handleSave = () => {
    if (recordedBlob) {
      onSave(recordedBlob);
    }
  };

  const handleGenerateScript = async () => {
    setIsGeneratingScript(true);
    setError(null);
    try {
      const generatedScript = await generateVideoScript(cvData, language);
      setScript(generatedScript);
    } catch (e) {
      console.error(e);
      setError("Failed to generate script. Please check your connection and try again.");
    } finally {
      setIsGeneratingScript(false);
    }
  };

  if (!isOpen) {
    return null;
  }
  
  const videoSrc = recordedBlob ? URL.createObjectURL(recordedBlob) : undefined;

  const renderPermissionsRequest = () => (
    <div className="absolute inset-0 bg-stone-800 flex flex-col items-center justify-center text-white p-8 text-center z-20">
        <CameraIcon className="w-16 h-16 text-teal-400 mb-4" />
        <h3 className="text-xl font-bold mb-2">Enable Camera & Microphone</h3>
        <p className="text-stone-300 mb-6 max-w-sm">This application will allow you to take videos and photos to enrich your resume. For this, I ask you to grant access to the camera and microphone.</p>
        <button 
            onClick={startMedia}
            className="px-6 py-3 border border-transparent rounded-md text-base font-medium text-white bg-teal-600 hover:bg-teal-700"
        >
            Grant Access
        </button>
         {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale">
        <header className="p-4 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold text-stone-800">Record Video Presentation</h2>
            <button onClick={onClose} className="text-stone-400 hover:text-stone-600">&times;</button>
        </header>
        <main className="p-6">
            <div className="relative w-full aspect-video bg-black rounded-md overflow-hidden shadow-inner">
                 {!permissionsGranted && renderPermissionsRequest()}
                 {permissionsGranted && error && (
                    <div className="absolute inset-0 bg-stone-800 flex flex-col items-center justify-center text-white p-8 text-center z-10">
                        <p className="text-lg font-semibold mb-2 text-red-400">An Error Occurred</p>
                        <p className="text-sm">{error}</p>
                    </div>
                 )}
                 <video ref={videoRef} autoPlay muted playsInline className="absolute w-full h-full object-cover opacity-0 pointer-events-none"></video>
                 <canvas ref={canvasRef} className={`w-full h-full object-cover transition-opacity duration-300 ${recordedBlob || !permissionsGranted ? 'opacity-0' : 'opacity-100'}`}></canvas>
                 <div className={`absolute inset-0 pointer-events-none overlay-${selectedOverlay}`}></div>
                 {recordedBlob && <video key={videoSrc} src={videoSrc} controls autoPlay playsInline className="w-full h-full object-cover"></video>}
                 {isRecording && <div className="absolute top-4 right-4 text-white bg-red-600 rounded-full px-3 py-1 text-sm font-bold animate-pulse">REC</div>}
                 {isRecording && <div className="absolute bottom-4 left-4 text-white bg-black/50 rounded-md px-2 py-1 text-sm">0:{String(countdown).padStart(2, '0')}</div>}
                 
                 {isRecording && script && script.trim() !== '' && (
                    <div className="absolute inset-0 bg-black/60 p-8 flex justify-center overflow-hidden pointer-events-none">
                        <div ref={teleprompterRef} className="w-full max-w-lg h-full overflow-y-scroll scrollbar-hide">
                            <div className="h-1/2"></div>
                            <p className="text-white text-2xl leading-relaxed font-semibold whitespace-pre-wrap text-center">
                                {script}
                            </p>
                            <div className="h-1/2"></div>
                        </div>
                    </div>
                )}
            </div>
        </main>

        {permissionsGranted && !recordedBlob && (
        <div className="px-6 pb-4 border-b space-y-4">
            <div>
                <h4 className="text-sm font-medium text-stone-700 mb-2">Video Effects</h4>
                <div className="p-3 bg-stone-50 rounded-md border">
                    <div className="flex border-b mb-3 -mx-3 px-3">
                        <button
                            onClick={() => setActiveTab('filters')}
                            className={`-mb-px px-3 py-2 text-sm font-semibold transition-colors ${
                                activeTab === 'filters'
                                    ? 'border-b-2 border-teal-500 text-teal-600'
                                    : 'text-stone-500 hover:text-stone-700 border-b-2 border-transparent'
                            }`}
                        >
                            Filters
                        </button>
                        <button
                            onClick={() => setActiveTab('overlays')}
                            className={`-mb-px px-3 py-2 text-sm font-semibold transition-colors ${
                                activeTab === 'overlays'
                                    ? 'border-b-2 border-teal-500 text-teal-600'
                                    : 'text-stone-500 hover:text-stone-700 border-b-2 border-transparent'
                            }`}
                        >
                            Overlays
                        </button>
                    </div>
                    
                    {activeTab === 'filters' && (
                        <div className="space-y-3">
                            {Object.entries(filterGroups).map(([groupName, filters]) => (
                                <div key={groupName}>
                                    <label className="text-xs font-medium text-stone-600 mb-1.5 block">{groupName}</label>
                                    <div className="flex flex-wrap gap-2">
                                        {filters.map(f => (
                                            <button key={f.id} onClick={() => setSelectedFilter(f.id)}
                                                className={`px-3 py-1 border rounded-md text-sm font-medium transition-colors ${selectedFilter === f.id ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-stone-700 hover:bg-stone-100'}`}
                                            >
                                                {f.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'overlays' && (
                         <div className="flex flex-wrap gap-2">
                            {overlays.map(o => (
                                <button key={o.id} onClick={() => setSelectedOverlay(o.id)}
                                    className={`px-3 py-1 border rounded-md text-sm font-medium transition-colors ${selectedOverlay === o.id ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-stone-700 hover:bg-stone-100'}`}
                                >
                                    {o.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
             <div>
                <h4 className="text-sm font-medium text-stone-700 mb-2">AI Script & Teleprompter</h4>
                <div className="space-y-3 p-3 bg-stone-50 rounded-md border">
                    <p className="text-xs text-stone-600 -mt-1 mb-2">
                        Generate or paste a script below. It will become a scrolling teleprompter over your video during recording.
                    </p>
                    <textarea
                        value={script || ''}
                        onChange={(e) => setScript(e.target.value)}
                        rows={4}
                        placeholder="Paste your script here, or generate one with AI to get started."
                        className="w-full text-sm px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                        disabled={isRecording}
                    />
                    <div className='grid grid-cols-2 gap-3'>
                        <div>
                            <label className="text-xs font-medium text-stone-600 mb-1 block">Scroll Speed</label>
                            <div className="flex space-x-1 rounded-md bg-stone-200 p-1">
                                {scrollSpeeds.map(item => (
                                    <button
                                        key={item.label}
                                        onClick={() => setScrollSpeed(item.speed)}
                                        className={`w-full rounded py-1 text-xs font-semibold transition-colors ${
                                            scrollSpeed === item.speed
                                                ? 'bg-white shadow-sm text-teal-600'
                                                : 'text-stone-600 hover:bg-stone-300'
                                        }`}
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className='self-end'>
                             <button 
                                onClick={handleGenerateScript}
                                disabled={isGeneratingScript || isRecording}
                                className="w-full h-full flex items-center justify-center px-4 py-2 border border-stone-300 text-sm font-medium rounded-md shadow-sm text-stone-700 bg-white hover:bg-stone-50 disabled:bg-stone-200 disabled:cursor-not-allowed"
                            >
                                {isGeneratingScript ? (
                                    <>
                                     <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-stone-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                     Generating...
                                    </>
                                ) : (
                                   <>
                                    <MagicWandIcon className="w-5 h-5 mr-2" /> Generate Script
                                   </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        )}

         <footer className="p-4 bg-stone-50 flex justify-between items-center">
          <div>
            {!isRecording && !recordedBlob && permissionsGranted && <span className="text-sm text-stone-500">Max 60 seconds.</span>}
          </div>
          <div className="flex space-x-4">
            {isRecording ? (
                <button onClick={handleStopRecording} className="px-6 py-2 border rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700">Stop</button>
            ) : recordedBlob ? (
                <>
                    <button onClick={handleRetake} className="px-4 py-2 border border-stone-300 rounded-md text-sm font-medium text-stone-700 hover:bg-stone-100">Retake</button>
                    <button onClick={handleSave} className="px-6 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-teal-600 hover:bg-teal-700">Save</button>
                </>
            ) : (
                <>
                    <button onClick={onClose} className="px-4 py-2 border border-stone-300 rounded-md text-sm font-medium text-stone-700 hover:bg-stone-100">Cancel</button>
                    {permissionsGranted && (
                        <button 
                            onClick={handleStartRecording} 
                            disabled={!stream || !!error}
                            className="px-6 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 disabled:cursor-not-allowed"
                        >Record</button>
                    )}
                </>
            )}
          </div>
        </footer>
      </div>
       <style>{`
        @keyframes fade-in-scale {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-fade-in-scale {
          animation: fade-in-scale 0.3s ease-out forwards;
        }
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
        .overlay-none { display: none; }
        .overlay-vignette { box-shadow: inset 0 0 5vw 2vw rgba(0,0,0,0.6); }
        .overlay-cinematic-bars {
            border-top: 12.5% solid black;
            border-bottom: 12.5% solid black;
            box-sizing: border-box;
        }
        @keyframes lightLeakAnimation {
            0% { opacity: 0; transform: translateX(-20%) translateY(-20%); }
            25% { opacity: 0.3; }
            50% { opacity: 0.1; transform: translateX(20%) translateY(20%); }
            75% { opacity: 0.4; }
            100% { opacity: 0; transform: translateX(-20%) translateY(-20%); }
        }
        .overlay-light-leak::after {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: radial-gradient(circle at 10% 10%, rgba(255, 82, 82, 0.4) 0%, rgba(255, 82, 82, 0) 40%),
                        radial-gradient(circle at 90% 80%, rgba(82, 255, 224, 0.4) 0%, rgba(82, 255, 224, 0) 50%);
            animation: lightLeakAnimation 10s infinite alternate;
            mix-blend-mode: screen;
        }
      `}</style>
    </div>
  );
};