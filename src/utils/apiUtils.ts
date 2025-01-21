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

export const sendWhatsAppTemplate = async ({
  userPhone,
  model,
  exteriorColor,
  interiorUpholstery
}: SendTemplateParams): Promise<void> => {
  try {
    const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.sendTemplate}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sender_phone_id: userPhone,
        variables: {
          model,
          name: exteriorColor,
          interior: interiorUpholstery
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Error al enviar el template: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al enviar el template de WhatsApp:', error);
    throw error;
  }
}; 