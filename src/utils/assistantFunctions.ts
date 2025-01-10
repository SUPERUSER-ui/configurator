import { VoiceAssistantFunctions } from '../types/voice';

export const createAssistantFunctions = (
  setSelectedColor: (color: string) => void,
  setSelectedModel: (modelId: string) => void
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
    window.location.href = path;
    return { success: true, path };
  }
}); 