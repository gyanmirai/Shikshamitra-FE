// Local read-only fixture transport for the actual full-result export hook.
const trigger = (url: string, init?: RequestInit, blob = false) => ({
  unwrap: async () => {
    const response = await fetch(url, init);
    if (!response.ok) throw new Error('Synthetic export failed');
    return blob ? response.blob() : response.json();
  },
});
export const useCreateHrTableExportMutation = () => [
  (body: unknown) =>
    trigger('/synthetic-hr/exports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
];
export const useDownloadHrTableExportMutation = () => [
  (id: string) => trigger(`/synthetic-hr/exports/${id}/download`, undefined, true),
];
export const useLazyHrTableExportStatusQuery = () => [
  (id: string) => trigger(`/synthetic-hr/exports/${id}`),
];
export const useCancelHrTableExportMutation = () => [() => ({ unwrap: async () => undefined })];
