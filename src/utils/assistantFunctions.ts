import { VoiceAssistantFunctions } from '../types/voice';
import { useNavigate } from 'react-router-dom';

export const createAssistantFunctions = (
  setSelectedColor: (color: string) => void,
  setSelectedModel: (modelId: string) => void,
  navigate: ReturnType<typeof useNavigate>
): VoiceAssistantFunctions => ({
  changeVehicleColor: async (args: { color: string }) => {
    const event = new CustomEvent('changeVehicleColor', {
      detail: { color: args.color }
    });
    window.dispatchEvent(event);
    return { success: true, message: `Color cambiado a ${args.color}` };
  },

  changeInteriorColor: async (args: { upholstery: string }) => {
    const event = new CustomEvent('changeInteriorColor', {
      detail: { upholstery: args.upholstery }
    });
    window.dispatchEvent(event);
    return { success: true, message: `Color interior cambiado a ${args.upholstery}` };
  },

  changeTab: async (args: { tab: string }) => {
    const event = new CustomEvent('changeTab', {
      detail: { tab: args.tab }
    });
    window.dispatchEvent(event);
    return { success: true, message: `Vista cambiada a ${args.tab}` };
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