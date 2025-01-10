import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';

// Definir tipos para nuestras funciones interactivas
interface VoiceAssistantFunctions {
  [key: string]: (args: any) => Promise<any>;
}

export function VoiceAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);

  // Definir las funciones que el asistente puede usar
  const assistantFunctions: VoiceAssistantFunctions = {
    changeVehicleColor: async ({ color }: { color: string }) => {
      // Implementar la lógica para cambiar el color del vehículo
      console.log(`Changing vehicle color to ${color}`);
      return { success: true, color };
    },
    selectVehicleModel: async ({ modelId }: { modelId: string }) => {
      // Implementar la lógica para seleccionar un modelo
      console.log(`Selecting vehicle model ${modelId}`);
      return { success: true, modelId };
    },
    // Puedes agregar más funciones aquí
  };

  const setupDataChannelEvents = () => {
    if (!dataChannelRef.current) return;

    dataChannelRef.current.addEventListener('open', () => {
      if (!dataChannelRef.current) return;

      // Configurar las modalidades y herramientas disponibles
      const event = {
        type: 'session.update',
        session: {
          modalities: ['text', 'audio'],
          tools: [
            {
              type: 'function',
              name: 'changeVehicleColor',
              description: 'Changes the color of the currently selected vehicle',
              parameters: {
                type: 'object',
                properties: {
                  color: { type: 'string', description: 'The color to change to (e.g., "Alpine White", "Black Sapphire")' },
                },
              },
            },
            {
              type: 'function',
              name: 'selectVehicleModel',
              description: 'Selects a specific BMW vehicle model',
              parameters: {
                type: 'object',
                properties: {
                  modelId: { type: 'string', description: 'The ID of the vehicle model to select' },
                },
              },
            },
          ],
        },
      };
      
      dataChannelRef.current.send(JSON.stringify(event));
    });

    dataChannelRef.current.addEventListener('message', async (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg.type === 'response.function_call_arguments.done') {
          const fn = assistantFunctions[msg.name];
          if (fn) {
            console.log(`Executing function ${msg.name} with args:`, msg.arguments);
            const args = JSON.parse(msg.arguments);
            const result = await fn(args);

            // Enviar el resultado de vuelta a OpenAI
            const event = {
              type: 'conversation.item.create',
              item: {
                type: 'function_call_output',
                call_id: msg.call_id,
                output: JSON.stringify(result),
              },
            };
            dataChannelRef.current?.send(JSON.stringify(event));
          }
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    });
  };

  const startVoiceChat = async () => {
    try {
      console.log('Starting voice chat...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('Got microphone access');
      
      stream.getTracks().forEach(track => {
        if (peerConnectionRef.current) {
          peerConnectionRef.current.addTransceiver(track, { direction: 'sendrecv' });
        }
      });
      console.log('Added audio tracks to peer connection');

      if (peerConnectionRef.current) {
        const offer = await peerConnectionRef.current.createOffer();
        console.log('Created offer:', offer);
        
        await peerConnectionRef.current.setLocalDescription(offer);
        console.log('Set local description');

        // Construir la URL con los parámetros necesarios
        const url = new URL('https://api.openai.com/v1/audio/speech');
        // Modificar los parámetros según la documentación actual de OpenAI
        url.searchParams.set('model', 'whisper-1');
        url.searchParams.set('response_format', 'json');

        const response = await fetch(url.toString(), {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            input: offer.sdp,
            voice: 'alloy',
            model: 'tts-1'
          })
        });
        console.log('Got server response:', response.status);

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.status}`);
        }

        const answer = await response.text();
        console.log('Server answer:', answer);
        
        await peerConnectionRef.current.setRemoteDescription({
          sdp: answer,
          type: 'answer',
        });
        console.log('Set remote description');
      }

      setIsMicOn(true);
    } catch (error) {
      console.error('Error starting voice chat:', error);
      setIsMicOn(false);
    }
  };

  const stopVoiceChat = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.getSenders().forEach(sender => {
        if (sender.track) {
          sender.track.stop();
        }
      });
    }
    setIsMicOn(false);
  };

  useEffect(() => {
    peerConnectionRef.current = new RTCPeerConnection();

    peerConnectionRef.current.ontrack = (event) => {
      const el = document.createElement('audio');
      el.srcObject = event.streams[0];
      el.autoplay = el.controls = true;
      document.body.appendChild(el);
    };

    dataChannelRef.current = peerConnectionRef.current.createDataChannel('response');
    setupDataChannelEvents();

    return () => {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, []);

  return (
    <div 
      className={`fixed right-0 top-1/2 -translate-y-1/2 transition-all duration-300 ${
        isOpen ? 'translate-x-0' : 'translate-x-[calc(100%-8px)]'
      }`}
    >
      {/* Tab */}
      <div 
        className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 bg-blue-600 text-white px-2 py-6 rounded-l-lg cursor-pointer hover:bg-blue-700 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="vertical-text transform -rotate-180" style={{ writingMode: 'vertical-rl' }}>
          Voice Assistant
        </span>
      </div>

      {/* Main Panel */}
      <div className="bg-white shadow-lg rounded-l-lg w-16 h-48 flex items-center justify-center">
        <button
          onClick={() => isMicOn ? stopVoiceChat() : startVoiceChat()}
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