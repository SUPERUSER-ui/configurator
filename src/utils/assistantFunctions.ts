import { VoiceAssistantFunctions } from '../types/voice';
import { useNavigate } from 'react-router-dom';

// Mapeo de IDs a rutas
const ID_TO_PATH_MAP = {
  home: "/",
  ixModels: "/build/ix",
  ixXDrive50Customize: "/build/ix/xdrive50/customize",
  ixM60Customize: "/build/ix/m60/customize"
} as const;

export const createAssistantFunctions = (
  setSelectedColor: (color: string) => void,
  setSelectedModel: (modelId: string) => void,
  navigate: ReturnType<typeof useNavigate>,
  setShowPhoneModal?: (show: boolean) => void,
  setUserPhone?: (phone: string) => void
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

  navigateTo: async ({ id }: { id: keyof typeof ID_TO_PATH_MAP }) => {
    const path = ID_TO_PATH_MAP[id];
    if (!path) {
      return { success: false, error: `Ruta no encontrada para el ID: ${id}` };
    }
    navigate(path);
    return { success: true, path };
  },

  savePhoneNumber: async ({ phoneNumber }: { phoneNumber: string }) => {
    const event = new CustomEvent('savePhoneNumber', {
      detail: { phoneNumber }
    });
    window.dispatchEvent(event);
    return { success: true, message: `Número de teléfono guardado: ${phoneNumber}` };
  }
}); 