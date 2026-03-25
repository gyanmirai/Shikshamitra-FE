import type { IConcessionTypeForm } from '../type';

export const getInitialConcessionTypeData = (editData?: any | null): IConcessionTypeForm => ({
  id: editData?.id,
  name: editData?.name || editData?.name || '',
  documents: (editData?.documents || []).map((doc: any) => ({
    ...doc,
    documentSize: doc.documentSize
      ? Math.round(doc.documentSize / (1024 * 1024))
      : doc.documentSize,
  })),
  description: editData?.description || '',
});
