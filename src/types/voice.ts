export interface VoiceAssistantFunctions {
  [key: string]: (args: any) => Promise<any>;
}

export interface AssistantCommand {
  type: string;
  name: string;
  arguments: string;
  call_id: string;
} 