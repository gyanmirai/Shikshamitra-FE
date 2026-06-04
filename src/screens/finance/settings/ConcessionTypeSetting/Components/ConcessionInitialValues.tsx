import type { IConcessionTypeForm } from '../type';

export const getInitialConcessionTypeData = (editData?: any | null): IConcessionTypeForm => ({
  id: editData?.id,
  name: editData?.name || editData?.name || '',
  documents: (editData?.documents || []).map((doc: any) => ({
    id: doc?.id,
    documentName: doc?.documentName || '',
    documentSize: doc?.documentSize ? Math.round(doc.documentSize / (1024 * 1024)) : '',
    acceptedFormat: Array.isArray(doc?.acceptedFormat) ? doc.acceptedFormat : [],
  })),
  description: editData?.description || '',
});
