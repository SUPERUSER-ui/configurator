import { VoiceAssistantFunctions } from '../types/voice';

interface WebRTCManagerConfig {
  apiKey: string;
  onTrack?: (event: RTCTrackEvent) => void;
  functions: VoiceAssistantFunctions;
  instructions?: string;
}

interface SessionResponse {
  client_secret: {
    value: string;
    expires_at: number;
  };
}

export class WebRTCManager {
  private peerConnection!: RTCPeerConnection;
  private dataChannel: RTCDataChannel | null = null;
  private clientSecret: string | null = null;

  constructor(private config: WebRTCManagerConfig) {
    if (!this.config.apiKey) {
      throw new Error('API Key is required');
    }
    this.initializePeerConnection();
  }

  private async getClientSecret() {
    if (!this.config.apiKey) {
      throw new Error('API Key is required for getting session token');
    }

    try {
      const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.config.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-realtime-preview-2024-12-17",
          voice: "alloy",
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to get session token: ${response.status} - ${errorData}`);
      }

      const data = await response.json() as SessionResponse;
      if (!data.client_secret?.value) {
        throw new Error('No client secret received from OpenAI');
      }

      return data.client_secret.value;
    } catch (error) {
      console.error('Error getting client secret:', error);
      throw error;
    }
  }

  private initializePeerConnection() {
    this.peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    this.dataChannel = this.peerConnection.createDataChannel('response');
    this.setupDataChannelHandlers();
    this.setupPeerConnectionHandlers();
  }

  private setupDataChannelHandlers() {
    if (!this.dataChannel) return;

    this.dataChannel.onopen = () => {
      this.configureAssistant();
    };

    this.dataChannel.onmessage = async (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'response.function_call_arguments.done') {
          const fn = this.config.functions[msg.name];
          if (fn) {
            const args = JSON.parse(msg.arguments);
            const result = await fn(args);
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
        instructions: this.config.instructions || "You are a virtual sales advisor specializing in BMW vehicles. Talk quickly and concisely. Your goal is to help customers find the ideal BMW model based on their needs, preferences, and budget. Act with professionalism, friendliness, and accuracy. Always highlight the premium features of BMW vehicles, such as advanced technology, elegant design, exceptional performance, and comfort. Additionally, you are familiar with the structure of the website where you are deployed, which includes the following routes: Home page: /, BMW iX Models: /build/ix, BMW iX xDrive50 Customization: /build/ix/xdrive50/customize, BMW iX M60 Customization: /build/ix/m60/customize. If the customer mentions a specific model, provide relevant information. For example, if they mention the 'iX' model, you can direct them to the /build/ix route. Ask the customer about their specific needs, such as the type of vehicle they are looking for (sedan, SUV, electric, sports), desired features (technology, safety, space, performance), and their budget range. Provide clear information about the available models, highlighting those that best suit the customer. Mention the key benefits of each model and answer technical questions simply and accurately. Offer additional options, such as financing plans, current promotions, and test drive programs. If the customer needs more time or wants to schedule an appointment, act as a proactive assistant and arrange the next interaction. Show enthusiasm for BMW vehicles and emphasize the brand's commitment to excellence, but always respond concisely and focused.",
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
                  enum: ['Alpine White', 'Black Sapphire Metallic', 'Dark Graphite Metallic', 'Mineral White Metallic']
                }
              },
              required: ['color']
            }
          },
          {
            type: 'function',
            name: 'changeInteriorColor',
            description: 'Changes the interior upholstery color',
            parameters: {
              type: 'object',
              properties: {
                upholstery: {
                  type: 'string',
                  enum: ['Oyster', 'Mocha', 'Black', 'Stonegray Microfiber/Wool Blend']
                }
              },
              required: ['upholstery']
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
            "type": "function",
            "name": "navigateTo",
            "description": "Navigates to a specific page",
            "parameters": {
              "type": "object",
              "properties": {
                "id": {
                  "type": "string",
                  "enum": ["home", "ixModels", "ixXDrive50Customize", "ixM60Customize"]
                }
              },
              "required": ["id"]
            }
          },
          {
            type: 'function',
            name: 'changeTab',
            description: 'Changes the active tab between exterior and interior',
            parameters: {
              type: 'object',
              properties: {
                tab: {
                  type: 'string',
                  enum: ['exterior', 'interior']
                }
              },
              required: ['tab']
            }
          },
          {
            type: 'function',
            name: 'savePhoneNumber',
            description: 'Guarda el número de teléfono del cliente cuando termine de customizar el vehiculo y muestra un modal de confirmación',
            parameters: {
              type: 'object',
              properties: {
                phoneNumber: {
                  type: 'string',
                  description: 'El número de teléfono del cliente'
                }
              },
              required: ['phoneNumber']
            }
          }
        ]
      }
    };

    this.dataChannel?.send(JSON.stringify(config));
  }

  async connect() {
    try {
      if (!this.config.apiKey) {
        throw new Error('API Key is required for connection');
      }

      // Asegurarse de que la conexión anterior esté cerrada
      if (this.peerConnection.connectionState !== 'new') {
        this.disconnect();
        this.initializePeerConnection();
      }

      // Obtener el client secret
      this.clientSecret = await this.getClientSecret();
      
      if (!this.clientSecret) {
        throw new Error('Failed to obtain client secret');
      }

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

      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true
      });

      // Esperar a que el estado sea stable antes de setLocalDescription
      if (this.peerConnection.signalingState !== 'stable') {
        await new Promise(resolve => {
          const checkState = () => {
            if (this.peerConnection.signalingState === 'stable') {
              resolve(true);
            } else {
              setTimeout(checkState, 100);
            }
          };
          checkState();
        });
      }

      await this.peerConnection.setLocalDescription(offer);

      // Esperar a que se recopilen los candidatos ICE
      await new Promise(resolve => {
        const checkState = () => {
          if (this.peerConnection.iceGatheringState === 'complete') {
            resolve(true);
          } else {
            setTimeout(checkState, 100);
          }
        };
        checkState();
      });

      if (!this.peerConnection.localDescription?.sdp) {
        throw new Error('No SDP available in local description');
      }

      const response = await fetch('https://api.openai.com/v1/realtime', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/sdp',
          'Authorization': `Bearer ${this.clientSecret}`
        },
        body: this.peerConnection.localDescription.sdp
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to connect to OpenAI Realtime: ${response.status} - ${errorData}`);
      }

      const answer = await response.text();
      
      // Verificar el estado antes de setRemoteDescription
      if (this.peerConnection.signalingState !== 'have-local-offer') {
        throw new Error(`Invalid signaling state: ${this.peerConnection.signalingState}`);
      }

      await this.peerConnection.setRemoteDescription({
        type: 'answer',
        sdp: answer
      });

      return stream;
    } catch (error) {
      console.error('Error connecting to WebRTC:', error);
      this.disconnect(); // Limpiar la conexión en caso de error
      throw error;
    }
  }

  disconnect() {
    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }

    if (this.peerConnection) {
      this.peerConnection.close();
    }

    this.clientSecret = null;
    this.initializePeerConnection();
  }
} 