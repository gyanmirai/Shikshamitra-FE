import type { ISection, SectionValues } from './type';

export function getSectionInitialValues(editData?: ISection | null): SectionValues {
  const count = editData?.numberOfShelf ?? 0;
  const names =
    editData?.shelfDetails?.map((shelf) => shelf.shelfName) ??
    editData?.shelfNames ??
    editData?.shelfItems ??
    [];
  return {
    sectionName: editData?.sectionName ?? '',
    numberOfColumns: count ? String(count) : '',
    shelfNames: Array.from({ length: count }, (_, index) => names[index] ?? ''),
  };
}
