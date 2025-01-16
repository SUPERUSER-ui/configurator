export interface VoiceAssistantFunctions {
  changeVehicleColor: (args: { color: string }) => Promise<{ success: boolean; message: string }>;
  changeInteriorColor: (args: { upholstery: string }) => Promise<{ success: boolean; message: string }>;
  changeTab: (args: { tab: string }) => Promise<{ success: boolean; message: string }>;
  selectVehicleModel: (args: { modelId: string }) => Promise<{ success: boolean; modelId: string }>;
  navigateTo: (args: { id: "home" | "ixModels" | "ixXDrive50Customize" | "ixM60Customize" }) => Promise<{ success: boolean; path?: string; error?: string }>;
  savePhoneNumber: (args: { phoneNumber: string }) => Promise<{ success: boolean; message?: string; error?: string }>;
}

export interface AssistantCommand {
  type: string;
  name: string;
  arguments: string;
  call_id: string;
} 