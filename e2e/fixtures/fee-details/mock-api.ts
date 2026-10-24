// Test-only download: never calls a finance endpoint or records a transaction.
export const useDownloadReceiptPdfMutation = () => [
  () => ({ unwrap: async () => new Blob(['%PDF-1.4\n% Synthetic receipt fixture'], { type: 'application/pdf' }) }),
];
