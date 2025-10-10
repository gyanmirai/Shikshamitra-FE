import type { ISection } from './type';

export const getSectionInitialValues = (editData?: ISection | null) => ({
  sectionName: editData?.sectionName || '',
  numberOfColumns: editData?.numberOfColumns || null,
});
