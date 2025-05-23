import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { WebRTCManager } from '../utils/webRTCManager';
import { validateApiKey } from '../utils/apiUtils';
import { createAssistantFunctions } from '../utils/assistantFunctions';

const API_KEY = "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";

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

  useEffect(() => {
    const initializeWebRTC = async () => {
      try {
        if (!globalWebRTCManager && hasPermission) {
          const apiKey = validateApiKey(API_KEY);
          
          // Crear las funciones del asistente
          const assistantFunctions = createAssistantFunctions(
            (color) => window.dispatchEvent(new CustomEvent('changeVehicleColor', { detail: { color } })),
            (modelId) => navigate(`/build/${modelId}`),
            navigate
          );

          // Inicializar WebRTCManager si no existe
          globalWebRTCManager = new WebRTCManager({
            apiKey,
            onTrack: (event) => {
              // Crear elemento de audio si no existe
              if (!globalAudioElement) {
                const audioElement = document.createElement('audio');
                audioElement.autoplay = true;
                audioElement.style.display = 'none';
                document.body.appendChild(audioElement);
                globalAudioElement = audioElement;
              }
              
              // Asignar el stream al elemento de audio
              globalAudioElement.srcObject = event.streams[0];
            },
            functions: assistantFunctions
          });

          // Reconectar si estaba activo anteriormente
          if (isMicOn) {
            await globalWebRTCManager.connect();
          }
        }
      } catch (error) {
        console.error('Error initializing voice assistant:', error);
        setError('Error al inicializar el asistente de voz');
        setIsMicOn(false);
      }
    };

    initializeWebRTC();

    return () => {
      if (!isMicOn) {
        globalWebRTCManager?.disconnect();
        globalWebRTCManager = null;
        
        if (globalAudioElement) {
          globalAudioElement.remove();
          globalAudioElement = null;
        }
      }
    };
  }, [navigate, isMicOn, hasPermission]);

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
    <div className={`fixed right-0 top-1/2 -translate-y-1/2 transition-all duration-300 ${
      isOpen ? 'translate-x-0' : 'translate-x-[calc(100%-8px)]'
    }`}>
      {error && (
        <div className="absolute top-0 left-0 transform -translate-y-full bg-red-500 text-white p-2 rounded-t-lg text-sm">
          {error}
        </div>
      )}
      <div 
        className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 bg-blue-600 text-white px-2 py-6 rounded-l-lg cursor-pointer hover:bg-blue-700 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="vertical-text transform -rotate-180" style={{ writingMode: 'vertical-rl' }}>
          Voice Assistant
        </span>
      </div>
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
    </div>
  );
}
