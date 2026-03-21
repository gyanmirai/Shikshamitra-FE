import type { ISection } from './type';

export const getSectionInitialValues = (editData?: ISection | null) => ({
  sectionName: editData?.sectionName || '',
  numberOfColumns: editData?.numberOfShelf || null,
  shelfItems: editData?.shelfItems || [],
});
