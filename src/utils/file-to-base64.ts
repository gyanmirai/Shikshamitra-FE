const toBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    if (!(file instanceof Blob)) {
      reject(new Error('Input is not a valid File or Blob'));
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });

export async function fileToBase64(file: File): Promise<string> {
  return toBase64(file);
}
