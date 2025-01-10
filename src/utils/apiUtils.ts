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