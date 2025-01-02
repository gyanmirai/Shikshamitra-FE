const toBase64 = (file: File) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });

export async function fileToBase64(file: File): Promise<string> {
  const result = await toBase64(file);
  return result as string;
}
