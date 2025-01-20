import { API_CONFIG } from './apiConfig';

export const validateApiKey = (apiKey: string | undefined): string => {
  if (!apiKey) {
    console.error('API key is undefined. Please check your .env file');
    throw new Error('OpenAI API key is not defined');
  }
  
  // Eliminar comillas y espacios
  const cleanKey = apiKey.replace(/["']/g, '').trim();
  
  // Validar formato de API key
  if (!cleanKey.startsWith('sk-')) {
    console.error('Invalid API key format. Key should start with "sk-"');
    throw new Error('Invalid OpenAI API key format');
  }
  
  return cleanKey;
};

// Función auxiliar para verificar la API key al inicio
export const verifyApiKeyOnStartup = () => {
  try {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    validateApiKey(apiKey);
    return true;
  } catch (error) {
    console.error('API Key verification failed:', error);
    return false;
  }
};

interface SendTemplateParams {
  userPhone: string;
  model: string;
  exteriorColor: string;
  interiorUpholstery: string;
}

const isProd = import.meta.env.PROD;

export const sendWhatsAppTemplate = async ({
  userPhone,
  model,
  exteriorColor,
  interiorUpholstery
}: SendTemplateParams): Promise<void> => {
  // Usamos la URL del proxy en el backend local
  const url = 'http://localhost:8080/proxy/send_template';
  const requestBody = {
    sender_phone_id: userPhone,
    variables: {
      model,
      name: exteriorColor,
      interior: interiorUpholstery
    }
  };

  console.log('Enviando petición a:', url);
  console.log('Body de la petición:', requestBody);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    console.log('Status de la respuesta:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Texto del error:', errorText);
      throw new Error(`Error al enviar el template: ${response.status} - ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Respuesta exitosa:', data);
    return data;
  } catch (error) {
    console.error('Error completo:', error);
    if (error instanceof Error) {
      console.error('Mensaje de error:', error.message);
    }
    throw error;
  }
}; 