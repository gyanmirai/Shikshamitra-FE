export function getBase64String(base64String: string): string {
  return base64String.replace(/^data:.*?;base64,/, '');
}
