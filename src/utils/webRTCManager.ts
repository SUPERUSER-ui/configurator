import { API_CONFIG } from './apiConfig';
import { VoiceAssistantFunctions } from '../types/voice';

interface WebRTCManagerConfig {
  apiKey: string;
  onTrack?: (event: RTCTrackEvent) => void;
  functions: VoiceAssistantFunctions;
}

export class WebRTCManager {
  private peerConnection: RTCPeerConnection;
  private dataChannel: RTCDataChannel | null = null;

  constructor(private config: WebRTCManagerConfig) {
    this.peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    // Configurar el canal de datos
    this.dataChannel = this.peerConnection.createDataChannel('response');
    this.setupDataChannelHandlers();
    this.setupPeerConnectionHandlers();
  }

  private setupDataChannelHandlers() {
    if (!this.dataChannel) return;

    this.dataChannel.onopen = () => {
      console.log('Data channel opened');
      this.configureAssistant();
    };

    this.dataChannel.onmessage = async (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'response.function_call_arguments.done') {
          const fn = this.config.functions[msg.name];
          if (fn) {
            console.log(`Calling function ${msg.name} with args:`, msg.arguments);
            const args = JSON.parse(msg.arguments);
            const result = await fn(args);

            // Enviar resultado de vuelta a OpenAI
            const response = {
              type: 'conversation.item.create',
              item: {
                type: 'function_call_output',
                call_id: msg.call_id,
                output: JSON.stringify(result),
              },
            };
            this.dataChannel?.send(JSON.stringify(response));
          }
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    };
  }

  private setupPeerConnectionHandlers() {
    this.peerConnection.ontrack = (event) => {
      if (this.config.onTrack) {
        this.config.onTrack(event);
      }
    };
  }

  private configureAssistant() {
    const config = {
      type: 'session.update',
      session: {
        modalities: ['text', 'audio'],
        tools: [
          {
            type: 'function',
            name: 'changeVehicleColor',
            description: 'Changes the vehicle color',
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
            type: 'function',
            name: 'selectVehicleModel',
            description: 'Selects a vehicle model',
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
            type: 'function',
            name: 'navigateTo',
            description: 'Navigates to a specific page',
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
      }
    };

    this.dataChannel?.send(JSON.stringify(config));
  }

  async connect() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000
        }
      });

      stream.getTracks().forEach(track => 
        this.peerConnection.addTransceiver(track, { direction: 'sendrecv' })
      );

      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);

      const response = await fetch('/api/rtc-connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/sdp',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: offer.sdp
      });

      if (!response.ok) {
        throw new Error(`Failed to connect to OpenAI Realtime: ${response.status}`);
      }

      const answer = await response.text();
      await this.peerConnection.setRemoteDescription({
        type: 'answer',
        sdp: answer
      });

      return stream;
    } catch (error) {
      console.error('Error connecting to WebRTC:', error);
      throw error;
    }
  }

  disconnect() {
    this.dataChannel?.close();
    this.peerConnection.close();
  }
} 