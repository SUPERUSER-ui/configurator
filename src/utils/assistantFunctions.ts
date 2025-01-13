import { VoiceAssistantFunctions } from '../types/voice';
import { useNavigate } from 'react-router-dom';

export const createAssistantFunctions = (
  setSelectedColor: (color: string) => void,
  setSelectedModel: (modelId: string) => void,
  navigate: ReturnType<typeof useNavigate>
): VoiceAssistantFunctions => ({
  changeVehicleColor: async ({ color }: { color: string }) => {
    setSelectedColor(color);
    return { success: true, color };
  },
  
  selectVehicleModel: async ({ modelId }: { modelId: string }) => {
    setSelectedModel(modelId);
    return { success: true, modelId };
  },

  navigateTo: async ({ path }: { path: string }) => {
    navigate(path);
    return { success: true, path };
  }
}); 