import { DEFAULT_CONCESSION_DOCUMENT_FORMATS, DEFAULT_CONCESSION_DOCUMENT_SIZE_MB } from '../type';

import type { IConcessionTypeForm } from '../type';

export const getInitialConcessionTypeData = (editData?: any | null): IConcessionTypeForm => ({
  id: editData?.id,
  name: editData?.name || '',
  documents: (editData?.documents || []).map((doc: any) => ({
    id: doc?.id,
    documentName: doc?.documentName || '',
    maxFileSizeMb: doc?.maxFileSizeBytes
      ? doc.maxFileSizeBytes / (1024 * 1024)
      : DEFAULT_CONCESSION_DOCUMENT_SIZE_MB,
    acceptedFormats: Array.isArray(doc?.acceptedFormats)
      ? doc.acceptedFormats.map(Number)
      : DEFAULT_CONCESSION_DOCUMENT_FORMATS,
    isRequired: doc?.isRequired ?? true,
  })),
  description: editData?.description || '',
  isActive: editData?.isActive ?? true,
  deactivationReason: editData?.deactivationReason ?? null,
  isUsedInDownstream: editData?.isUsedInDownstream ?? false,
  canDelete: editData?.canDelete,
  usageCount: editData?.usageCount,
  concurrencyStamp: editData?.concurrencyStamp,
});
