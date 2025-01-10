import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { AssistantCommand } from '../types/voice';
import { validateApiKey } from '../utils/apiUtils';
import { useNavigate } from 'react-router-dom';

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export function VoiceAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const navigate = useNavigate();

  // Funciones del asistente
  const assistantFunctions = {
    changeVehicleColor: async ({ color }: { color: string }) => {
      // Emitir un evento personalizado para cambiar el color
      window.dispatchEvent(new CustomEvent('changeVehicleColor', { detail: { color } }));
      return { success: true, color };
    },
    
    selectVehicleModel: async ({ modelId }: { modelId: string }) => {
      navigate(`/build/${modelId}`);
      return { success: true, modelId };
    },
    
    navigateTo: async ({ path }: { path: string }) => {
      navigate(path);
      return { success: true, path };
    }
  };

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const audioChunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
        
        if (mediaRecorder.state === 'inactive') {
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          await processAudio(audioBlob);
          audioChunks.length = 0; // Limpiar el array
        }
      };

      mediaRecorder.onstop = () => {
        if (isListening) {
          // Si aún estamos escuchando, iniciar una nueva grabación
          startNewRecording();
        }
      };

      startNewRecording();
      setIsListening(true);
      setIsMicOn(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setError('Error al acceder al micrófono');
    }
  };

  const startNewRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive') {
      mediaRecorderRef.current.start();
      // Detener la grabación después de 5 segundos
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      }, 5000);
    }
  };

  const stopListening = () => {
    setIsListening(false);
    setIsMicOn(false);
    
    if (mediaRecorderRef.current) {
      if (mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('model', 'whisper-1');
      formData.append('response_format', 'json');

      const response = await fetch('/api/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const transcription = await response.json();
      console.log('Transcription:', transcription);

      // Procesar el comando de voz
      await processCommand(transcription.text);

    } catch (error) {
      console.error('Error processing audio:', error);
      setError('Error al procesar el audio');
    }
  };

  const processCommand = async (text: string) => {
    try {
      // Enviar el texto a GPT para interpretación
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo-0125',
          messages: [
            {
              role: 'system',
              content: `You are a BMW vehicle customization assistant. Available functions:
                - changeVehicleColor(color): Changes vehicle color (options: Alpine White, Black Sapphire, Dark Graphite, Mineral White)
                - selectVehicleModel(modelId): Selects a vehicle model (options: xdrive50, m60)
                - navigateTo(path): Navigates to a page (options: /, /build/ix, /build/i4)
              `
            },
            {
              role: 'user',
              content: text
            }
          ],
          functions: [
            {
              name: 'changeVehicleColor',
              parameters: {
                type: 'object',
                properties: {
                  color: {
                    type: 'string',
                    enum: ['Alpine White', 'Black Sapphire', 'Dark Graphite', 'Mineral White']
                  }
                },
                required: ['color']
              }
            },
            {
              name: 'selectVehicleModel',
              parameters: {
                type: 'object',
                properties: {
                  modelId: {
                    type: 'string',
                    enum: ['xdrive50', 'm60']
                  }
                },
                required: ['modelId']
              }
            },
            {
              name: 'navigateTo',
              parameters: {
                type: 'object',
                properties: {
                  path: {
                    type: 'string',
                    enum: ['/', '/build/ix', '/build/i4']
                  }
                },
                required: ['path']
              }
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error('Error calling GPT API');
      }

      const result = await response.json();
      
      // Ejecutar la función si GPT la identificó
      if (result.choices[0]?.message?.function_call) {
        const { name, arguments: args } = result.choices[0].message.function_call;
        const fn = assistantFunctions[name as keyof typeof assistantFunctions];
        if (fn) {
          await fn(JSON.parse(args));
        }
      }

    } catch (error) {
      console.error('Error processing command:', error);
      setError('Error al procesar el comando');
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
          onClick={() => isListening ? stopListening() : startListening()}
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