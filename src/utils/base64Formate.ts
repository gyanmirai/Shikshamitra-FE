export function getMimeTypeFromBase64(base64: string) {
  // Decode the base64 string to binary data
  const binaryString = atob(base64);

  // Convert the first few bytes to their char code equivalents
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i += 1) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Define magic numbers for different file types
  const signatures: { [key: string]: string } = {
    '89504E47': 'image/png',
    '47494638': 'image/gif',
    FFD8FF: 'image/jpeg',
    '25504446': 'application/pdf',
    '504B0304': 'application/zip',
  };

  // Get the first 4 bytes in hexadecimal
  const hexSignature = bytes
    .subarray(0, 4)
    .reduce((acc, byte) => acc + byte.toString(16).toUpperCase(), '');

  // Match the hexSignature with known signatures
  const matchedSignature = Object.keys(signatures).find((signature) =>
    hexSignature.startsWith(signature)
  );
  return matchedSignature ? signatures[matchedSignature] : null;
}
export const convertBase64Format = (base64: string) => {
  const mimeType = getMimeTypeFromBase64(base64);
  if (!mimeType) {
    throw new Error('Invalid base64 format');
  }
  return `data:${mimeType};base64,${base64}`;
};
