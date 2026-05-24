export const clampCardsPerPage = (value: number) => {
  if (!Number.isFinite(value)) return 1;
  return Math.min(10, Math.max(1, Math.trunc(value)));
};

export const isPdfBlob = async (blob: Blob) => {
  if (!blob.size) return false;
  if (blob.type && !blob.type.toLowerCase().includes('pdf')) return false;

  return (await blob.slice(0, 4).text()) === '%PDF';
};
