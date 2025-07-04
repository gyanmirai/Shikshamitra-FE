function base64ToFile(base64String: string, filenameWithoutExt: string = 'file') {
  const matches = base64String.match(/^data:(.+);base64,(.+)$/);
  if (!matches) throw new Error('Invalid Base64 string');

  const mimeType = matches[1];
  const base64Data = matches[2];

  const extension = mimeType.split('/')[1];
  const binaryString = atob(base64Data);
  const byteArray = Uint8Array.from(binaryString, (char) => char.charCodeAt(0));

  const file = new File([byteArray], `${filenameWithoutExt}.${extension}`, {
    type: mimeType,
  });

  return file;
}

export default base64ToFile;
