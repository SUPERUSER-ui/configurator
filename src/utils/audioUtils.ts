export const convertAudioToBlob = async (stream: MediaStream): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const mediaRecorder = new MediaRecorder(stream);
    const audioChunks: Blob[] = [];

    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      resolve(audioBlob);
    };

    mediaRecorder.onerror = (error) => {
      reject(error);
    };

    // Grabar durante 5 segundos
    mediaRecorder.start();
    setTimeout(() => mediaRecorder.stop(), 5000);
  });
}; 