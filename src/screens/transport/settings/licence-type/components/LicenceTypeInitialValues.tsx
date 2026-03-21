import type { ILicenceType } from './type';

export const getLicenceTypeInitialValues = (editData?: ILicenceType | null) => ({
  typeName: editData?.typeName || '',
  description: editData?.description || '',
});
