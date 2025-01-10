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
  const audioChunksRef = useRef<Blob[]>([]);
  const processingRef = useRef(false);
  const navigate = useNavigate();

  // Función para convertir texto a voz
  const speak = async (text: string) => {
    try {
      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'tts-1-hd',
          voice: 'alloy',
          input: text,
          speed: 1.0,
          response_format: 'mp3',
        }),
      });

      if (!response.ok) throw new Error('Error generating speech');

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.volume = 1.0;
      audio.playbackRate = 1.0;
      
      await new Promise((resolve) => {
        audio.oncanplaythrough = resolve;
        audio.load();
      });

      await audio.play();

      // Limpiar URL después de reproducir
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
      };
    } catch (error) {
      console.error('Error en text-to-speech:', error);
    }
  };

  // Funciones del asistente
  const assistantFunctions = {
    changeVehicleColor: async ({ color }: { color: string }) => {
      window.dispatchEvent(new CustomEvent('changeVehicleColor', { detail: { color } }));
      await speak(`Color cambiado a ${color}`);
      return { success: true, color };
    },
    
    selectVehicleModel: async ({ modelId }: { modelId: string }) => {
      navigate(`/build/${modelId}`);
      await speak(`Mostrando modelo ${modelId}`);
      return { success: true, modelId };
    },
    
    navigateTo: async ({ path }: { path: string }) => {
      navigate(path);
      await speak('Cambiando de página');
      return { success: true, path };
    }
  };

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
          channelCount: 1
        }
      });
      
      streamRef.current = stream;
      
      const mimeType = MediaRecorder.isTypeSupported('audio/wav') 
        ? 'audio/wav' 
        : MediaRecorder.isTypeSupported('audio/mp3')
          ? 'audio/mp3'
          : 'audio/webm';
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 128000
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        if (audioChunksRef.current.length > 0) {
          await processCurrentAudio();
        }
      };

      // Iniciar grabación
      mediaRecorder.start(3000);
      setIsListening(true);
      setIsMicOn(true);
      
      await speak('Hola, ¿en qué puedo ayudarle?');
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setError('Error al acceder al micrófono');
    }
  };

  const processCurrentAudio = async () => {
    if (audioChunksRef.current.length === 0) return;

    try {
      // Convertir los chunks a un único blob de audio
      const audioBlob = new Blob(audioChunksRef.current, { 
        type: mediaRecorderRef.current?.mimeType || 'audio/webm' 
      });

      // Crear un objeto FormData
      const formData = new FormData();
      
      // Agregar el archivo con la extensión correcta basada en el tipo MIME
      const fileExtension = audioBlob.type.includes('wav') 
        ? 'wav' 
        : audioBlob.type.includes('mp3')
          ? 'mp3'
          : 'webm';
          
      formData.append('file', audioBlob, `audio.${fileExtension}`);
      formData.append('model', 'whisper-1');
      formData.append('response_format', 'json');
      formData.append('language', 'es');

      console.log('Sending audio for transcription...', {
        fileType: audioBlob.type,
        fileSize: audioBlob.size,
        fileName: `audio.${fileExtension}`
      });

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`
        },
        body: formData
      });

      const responseText = await response.text();
      console.log('Raw API Response:', responseText);

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} - ${responseText}`);
      }

      try {
        const transcription = JSON.parse(responseText);
        console.log('Transcription received:', transcription);

        if (transcription.text && transcription.text.trim()) {
          await processCommand(transcription.text);
        }
      } catch (parseError) {
        console.error('Error parsing transcription:', parseError);
        throw new Error('Invalid response format from API');
      }

    } catch (error) {
      console.error('Error processing audio:', error);
      setError('Error al procesar el audio');
    } finally {
      audioChunksRef.current = []; // Limpiar el buffer
    }
  };

  const stopListening = async () => {
    try {
      setIsListening(false);
      
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop();
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      setIsMicOn(false);
      await speak('Entendido.');
    } catch (error) {
      console.error('Error stopping recording:', error);
      setError('Error al detener la grabación');
    }
  };

  const processCommand = async (text: string) => {
    try {
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
              content: `Eres un asistente de BMW especializado en personalización de vehículos. 
                IMPORTANTE: Debes responder SIEMPRE en español, usando un tono profesional pero amigable.

                Funciones disponibles:
                - changeVehicleColor(color): Cambia el color del vehículo (opciones: Alpine White, Black Sapphire, Dark Graphite, Mineral White)
                - selectVehicleModel(modelId): Selecciona un modelo (opciones: xdrive50, m60)
                - navigateTo(path): Navega a una página (opciones: /, /build/ix, /build/i4)
                
                Instrucciones adicionales:
                - Usa términos automotrices en español
                - Mantén un tono cordial y profesional
                - Responde de manera concisa y clara
                - Si no entiendes algo, pide aclaraciones en español
                - Usa "usted" para dirigirte al cliente
                
                Ejemplos de respuestas:
                - "Por supuesto, cambiaré el color a Alpine White para que pueda apreciar este elegante acabado."
                - "Le mostraré el modelo xdrive50, conocido por su excepcional rendimiento."
                - "¿Le gustaría que le explique más detalles sobre este modelo en particular?"
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
      
      if (result.choices[0]?.message?.function_call) {
        const { name, arguments: args } = result.choices[0].message.function_call;
        const fn = assistantFunctions[name as keyof typeof assistantFunctions];
        if (fn) {
          await fn(JSON.parse(args));
        }
      } else if (result.choices[0]?.message?.content) {
        // Si no hay una función para llamar, reproducir la respuesta directamente
        await speak(result.choices[0].message.content);
      }

    } catch (error) {
      console.error('Error processing command:', error);
      setError('Error al procesar el comando');
      await speak('Perdón, ¿puede repetirlo?');
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