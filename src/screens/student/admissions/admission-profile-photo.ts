export const ADMISSION_PHOTO_MAX_BYTES = 2 * 1024 * 1024;

export function getAdmissionPhotoError(value: string): string | undefined {
  if (!value) return undefined;
  const match = /^data:image\/(png|jpeg);base64,([A-Za-z0-9+/]+={0,2})$/.exec(value);
  if (!match || match[2].length % 4 !== 0) return 'Choose a valid JPG or PNG photo.';
  const padding = match[2].endsWith('==') ? 2 : match[2].endsWith('=') ? 1 : 0;
  if ((match[2].length / 4) * 3 - padding > ADMISSION_PHOTO_MAX_BYTES)
    return 'Photo must be 2 MB or smaller.';
  try {
    const bytes = atob(match[2]);
    const signature = Array.from(bytes.slice(0, 8), (character) => character.charCodeAt(0));
    const valid =
      match[1] === 'png'
        ? [137, 80, 78, 71, 13, 10, 26, 10].every((byte, index) => signature[index] === byte)
        : signature[0] === 255 && signature[1] === 216 && signature[2] === 255;
    return valid ? undefined : 'Choose a valid JPG or PNG photo.';
  } catch {
    return 'Choose a valid JPG or PNG photo.';
  }
}
