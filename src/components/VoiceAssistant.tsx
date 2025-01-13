import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { WebRTCManager } from '../utils/webRTCManager';
import { validateApiKey } from '../utils/apiUtils';
import { createAssistantFunctions } from '../utils/assistantFunctions';

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export function VoiceAssistant() {
  const [isOpen, setIsOpen] = useState(() => {
    return localStorage.getItem('voiceAssistant.isOpen') === 'true'
  });
  const [isMicOn, setIsMicOn] = useState(() => {
    return localStorage.getItem('voiceAssistant.isMicOn') === 'true'
  });
  const [error, setError] = useState<string | null>(null);
  const webRTCManagerRef = useRef<WebRTCManager | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('voiceAssistant.isOpen', isOpen.toString());
  }, [isOpen]);

  useEffect(() => {
    localStorage.setItem('voiceAssistant.isMicOn', isMicOn.toString());
  }, [isMicOn]);

  useEffect(() => {
    try {
      const apiKey = validateApiKey(API_KEY);
      
      // Crear las funciones del asistente
      const assistantFunctions = createAssistantFunctions(
        (color) => window.dispatchEvent(new CustomEvent('changeVehicleColor', { detail: { color } })),
        (modelId) => navigate(`/build/${modelId}`)
      );

      // Inicializar WebRTCManager
      webRTCManagerRef.current = new WebRTCManager({
        apiKey,
        onTrack: (event) => {
          // Crear elemento de audio si no existe
          if (!audioElementRef.current) {
            const audioElement = document.createElement('audio');
            audioElement.autoplay = true;
            audioElement.style.display = 'none';
            document.body.appendChild(audioElement);
            audioElementRef.current = audioElement;
          }
          
          // Asignar el stream al elemento de audio
          audioElementRef.current.srcObject = event.streams[0];
        },
        functions: assistantFunctions
      });

      // Reconectar si estaba activo anteriormente
      if (isMicOn && webRTCManagerRef.current) {
        webRTCManagerRef.current.connect();
      }

    } catch (error) {
      console.error('Error initializing voice assistant:', error);
      setError('Error initializing voice assistant');
    }

    // Modificar el cleanup para no desconectar al navegar
    return () => {
      if (!isMicOn && webRTCManagerRef.current) {
        webRTCManagerRef.current.disconnect();
      }
      if (audioElementRef.current) {
        audioElementRef.current.remove();
        audioElementRef.current = null;
      }
    };
  }, [navigate, isMicOn]);

  const startListening = async () => {
    try {
      if (!webRTCManagerRef.current) {
        throw new Error('WebRTC manager not initialized');
      }

      await webRTCManagerRef.current.connect();
      setIsMicOn(true);
      setError(null);

    } catch (error) {
      console.error('Error starting voice assistant:', error);
      setError('Error accessing microphone');
      setIsMicOn(false);
    }
  };

  const stopListening = async () => {
    try {
      webRTCManagerRef.current?.disconnect();
      setIsMicOn(false);
      setError(null);
    } catch (error) {
      console.error('Error stopping voice assistant:', error);
      setError('Error stopping voice assistant');
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
          } hover:bg-opacity-80`}
        >
          {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
        </button>
      </div>
    </div>
  );
} 