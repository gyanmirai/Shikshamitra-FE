export const ROOM_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const ROOM_IMAGE_ACCEPT = { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'] };

export function readRoomImage(file: File): Promise<{ fileName: string; content: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () =>
      reject(new Error('Room image could not be read. Choose the image again.'));
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('Room image could not be read. Choose the image again.'));
        return;
      }
      resolve({ fileName: file.name, content: reader.result.split(',')[1] });
    };
    reader.readAsDataURL(file);
  });
}
