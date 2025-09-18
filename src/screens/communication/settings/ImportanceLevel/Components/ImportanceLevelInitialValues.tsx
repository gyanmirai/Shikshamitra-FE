import type { IImportanceLevel } from '../type';

// Initial Values
export const getImportanceLevelInitialValues = (editData: IImportanceLevel | null) => ({
  levelName: editData?.levelName || '',
  description: editData?.description || '',
});
