import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Mic, MicOff, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { WebRTCManager } from '../utils/webRTCManager';
import { validateApiKey } from '../utils/apiUtils';
import { createAssistantFunctions } from '../utils/assistantFunctions';
import { VoiceAssistantFunctions } from '../types/voice';

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

// Mantener una única instancia de WebRTCManager
let globalWebRTCManager: WebRTCManager | null = null;
let globalAudioElement: HTMLAudioElement | null = null;

export function VoiceAssistant() {
  const [isOpen, setIsOpen] = useState(() => {
    return localStorage.getItem('voiceAssistant.isOpen') === 'true'
  });
  const [isMicOn, setIsMicOn] = useState(() => {
    return localStorage.getItem('voiceAssistant.isMicOn') === 'true'
  });
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const [isConnecting, setIsConnecting] = useState(false);
  const lastClickTime = useRef<number>(0);
  const DEBOUNCE_TIME = 1000; // 1 segundo entre clics
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const audioRef = useRef<HTMLAudioElement>(null);
  const webRTCManagerRef = useRef<WebRTCManager | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const functions = useMemo(
    () => createAssistantFunctions(
      setSelectedColor,
      setSelectedModel,
      navigate
    ),
    [navigate]
  );

  useEffect(() => {
    localStorage.setItem('voiceAssistant.isOpen', isOpen.toString());
  }, [isOpen]);

  useEffect(() => {
    localStorage.setItem('voiceAssistant.isMicOn', isMicOn.toString());
  }, [isMicOn]);

  // Verificar permisos del micrófono
  const checkMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setHasPermission(true);
      setError(null);
      return true;
    } catch (error) {
      console.error('Error checking microphone permission:', error);
      setHasPermission(false);
      if ((error as Error).name === 'NotAllowedError') {
        setError('Por favor, permite el acceso al micrófono para usar el asistente de voz');
      } else {
        setError('Error al acceder al micrófono');
      }
      return false;
    }
  };

  useEffect(() => {
    // Verificar permisos iniciales
    checkMicrophonePermission();
  }, []);

  const connect = async () => {
    try {
      if (!webRTCManagerRef.current) {
        throw new Error('WebRTCManager not initialized');
      }

      await webRTCManagerRef.current.connect();
      setIsConnected(true);
    } catch (error) {
      console.error('Error connecting to voice assistant:', error);
      setIsConnected(false);
    }
  };

  useEffect(() => {
    const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
    
    try {
      const validatedApiKey = validateApiKey(API_KEY);
      
      const assistantFunctions: VoiceAssistantFunctions = {
        changeVehicleColor: (color: string) => {
          setSelectedColor(color);
        },
        changeInteriorColor: (color: string) => {
          // Implementar si es necesario
        },
        changeTab: (tab: string) => {
          navigate(tab);
        },
        selectVehicleModel: (model: string) => {
          setSelectedModel(model);
        },
        sendConfiguration: () => {
          // Implementar si es necesario
        },
        resetConfiguration: () => {
          setSelectedColor('');
          setSelectedModel('');
        }
      };

      webRTCManagerRef.current = new WebRTCManager({
        apiKey: validatedApiKey,
        onTrack: (event) => {
          if (audioRef.current) {
            audioRef.current.srcObject = event.streams[0];
          }
        },
        functions: assistantFunctions,
      });

      connect();
    } catch (error) {
      console.error('Error initializing WebRTCManager:', error);
    }

    return () => {
      if (webRTCManagerRef.current) {
        webRTCManagerRef.current.disconnect();
      }
    };
  }, [navigate]);

  const startListening = async () => {
    // Prevenir clics rápidos
    const now = Date.now();
    if (now - lastClickTime.current < DEBOUNCE_TIME) {
      return;
    }
    lastClickTime.current = now;

    try {
      setIsConnecting(true);
      // Verificar permisos antes de iniciar
      const permitted = await checkMicrophonePermission();
      if (!permitted) {
        setIsConnecting(false);
        return;
      }

      if (!globalWebRTCManager) {
        throw new Error('WebRTC manager not initialized');
      }

      await globalWebRTCManager.connect();
      setIsMicOn(true);
      setError(null);
    } catch (error) {
      console.error('Error starting voice assistant:', error);
      setError('Error al acceder al micrófono');
      setIsMicOn(false);
    } finally {
      setIsConnecting(false);
    }
  };

  const stopListening = async () => {
    // Prevenir clics rápidos
    const now = Date.now();
    if (now - lastClickTime.current < DEBOUNCE_TIME) {
      return;
    }
    lastClickTime.current = now;

    try {
      setIsConnecting(true);
      globalWebRTCManager?.disconnect();
      setIsMicOn(false);
      setError(null);
    } catch (error) {
      console.error('Error stopping voice assistant:', error);
      setError('Error al detener el asistente de voz');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50">
      <div className={`flex items-center transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : 'translate-x-[calc(100%-2rem)]'
      }`}>
        {/* Botón de expansión */}
        <button 
          className="bg-blue-600 text-white px-2 py-6 rounded-l-lg cursor-pointer hover:bg-blue-700 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="vertical-text transform -rotate-180" style={{ writingMode: 'vertical-rl' }}>
            Voice Assistant
          </span>
        </button>

        {/* Panel principal */}
        <div className="bg-white shadow-lg rounded-l-lg w-16 h-48 flex items-center justify-center">
          <button
            onClick={() => isMicOn ? stopListening() : startListening()}
            className={`p-4 rounded-full transition-colors ${
              isMicOn ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
            } hover:bg-opacity-80 ${isConnecting ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={hasPermission === false || isConnecting}
          >
            {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="absolute top-0 left-0 transform -translate-y-full bg-red-500 text-white p-2 rounded-t-lg text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
} 