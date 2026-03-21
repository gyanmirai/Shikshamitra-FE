import type { IVehicleDocument } from './type';

export const getVehicleDocumentInitialValues = (editData?: IVehicleDocument | null) => ({
  documentName: editData?.name || editData?.documentName || '',
  documentSize: editData?.maxSizeMb?.toString() || editData?.documentSize?.toString() || '5',
  acceptedFormat: editData?.acceptedFormats || editData?.acceptedFormat || [],
  description: editData?.description || '',
  required: editData?.isRequired ?? editData?.required ?? true,
});
