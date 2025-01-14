import { API_CONFIG } from './apiConfig';
import { VoiceAssistantFunctions } from '../types/voice';

interface WebRTCManagerConfig {
  apiKey: string;
  onTrack?: (event: RTCTrackEvent) => void;
  functions: VoiceAssistantFunctions;
  instructions?: string;
}

export class WebRTCManager {
  private peerConnection: RTCPeerConnection;
  private dataChannel: RTCDataChannel | null = null;

  constructor(private config: WebRTCManagerConfig) {
    this.initializePeerConnection();
  }

  private initializePeerConnection() {
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
        instructions: this.config.instructions || "Eres un asesor de ventas virtual especializado en vehículos de la marca B M W. Tu objetivo es ayudar a los clientes a encontrar el modelo B M W ideal según sus necesidades, preferencias y presupuesto. Actúa con profesionalismo, amabilidad y precisión. Siempre destaca las características premium de los vehículos BMW, como su tecnología avanzada, diseño elegante, rendimiento excepcional y confort. Además, tienes conocimiento de la estructura de la página web donde estás desplegado, la cual tiene las siguientes rutas: Página principal: /, Modelos BMW iX: /build/ix, Personalización del BMW iX xDrive50: /build/ix/xdrive50/customize, Personalización del BMW iX M60: /build/ix/m60/customize. Si el cliente menciona un modelo específico, proporciona información relevante. Por ejemplo, si menciona el modelo 'iX', puedes dirigirlo a la ruta /build/ix. Pregunta al cliente sobre sus necesidades específicas, como el tipo de vehículo que busca (sedán, SUV, eléctrico, deportivo), características deseadas (tecnología, seguridad, espacio, potencia) y su rango de precio. Proporciona información clara sobre los modelos disponibles, destacando los más adecuados para el cliente. Menciona los beneficios clave de cada modelo y responde preguntas técnicas de manera sencilla y precisa. Ofrece opciones adicionales, como planes de financiamiento, promociones actuales y programas de prueba de manejo. Si el cliente necesita más tiempo o quiere agendar una cita, actúa como un asistente proactivo y organiza la próxima interacción. Muestra entusiasmo por los vehículos BMW y enfatiza el compromiso de la marca con la excelencia.",
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
            type: 'function',
            name: 'navigateTo',
            description: 'Navigates to a specific page',
            parameters: {
              type: 'object',
              properties: {
                path: {
                  type: 'string',
                  enum: ['/', '/build/ix','/build/ix/xdrive50/customize', '/build/ix/m60/customize']
                }
              },
              required: ['path']
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
    // Cerrar el canal de datos
    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }

    // Cerrar la conexión peer
    if (this.peerConnection) {
      this.peerConnection.close();
    }

    // Reinicializar la conexión para futuros usos
    this.initializePeerConnection();
  }
} 