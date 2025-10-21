import type { IVehicleDocument } from './type';

export const getVehicleDocumentInitialValues = (editData?: IVehicleDocument | null) => ({
  documentName: editData?.documentName || '',
  documentSize: editData?.documentSize || '5',
  acceptedFormat: editData?.acceptedFormat || [],
  description: editData?.description || '',
  required: editData?.required || true,
});
