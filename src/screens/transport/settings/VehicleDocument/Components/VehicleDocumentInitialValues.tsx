import type { IVehicleDocument } from './type';

export const getVehicleDocumentInitialValues = (editData?: IVehicleDocument | null) => ({
  documentName: editData?.documentName || '',
  documentSize: editData?.documentSize || '',
  acceptedFormat: editData?.acceptedFormat || '',
  description: editData?.description || '',
});
