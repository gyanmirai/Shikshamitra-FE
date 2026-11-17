export async function readStudioImage(file: File): Promise<string> {
  if (!['image/png', 'image/jpeg'].includes(file.type) || file.size > 8 * 1024 * 1024)
    throw new Error('Choose a PNG or JPEG image smaller than 8 MB.');
  const bitmap = await createImageBitmap(file);
  try {
    let ratio = Math.min(1, 2048 / Math.max(bitmap.width, bitmap.height));
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(bitmap.width * ratio));
      canvas.height = Math.max(1, Math.round(bitmap.height * ratio));
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Image processing is unavailable.');
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const data = canvas.toDataURL('image/png');
      if ((data.length - data.indexOf(',') - 1) * 0.75 <= 512 * 1024) return data;
      ratio *= 0.75;
    }
    throw new Error('This image could not be reduced to the card image limit.');
  } finally {
    bitmap.close();
  }
}
