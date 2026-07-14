export type InquirySourceOption = {
  id: string;
  displayName?: string;
  preferenceName: string;
  displayOrder?: number | null;
  isActive?: boolean;
  [key: string]: unknown;
};

export const resolveInquirySourceAcademicYearId = (
  selectedAcademicYearId?: string | null,
  fallbackAcademicYearId?: string | null
) => selectedAcademicYearId || fallbackAcademicYearId || undefined;

export const buildInquirySourceOptions = (
  activeItems: InquirySourceOption[] = [],
  selectedInquirySourceId?: string | null,
  selectedInquirySourceName?: string | null
) => {
  const hasSelectedOption = activeItems.some((item) => item.id === selectedInquirySourceId);

  if (!selectedInquirySourceId || hasSelectedOption || !selectedInquirySourceName) {
    return activeItems;
  }

  return [
    ...activeItems,
    {
      id: selectedInquirySourceId,
      displayName: `${selectedInquirySourceName} (Inactive)`,
      preferenceName: `${selectedInquirySourceName} (Inactive)`,
      isActive: false,
    },
  ];
};

export const sortInquirySourcesForSelection = (items: InquirySourceOption[] = []) =>
  [...items].sort((left, right) => {
    const leftOrder = left.displayOrder ?? Number.MAX_SAFE_INTEGER;
    const rightOrder = right.displayOrder ?? Number.MAX_SAFE_INTEGER;

    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }

    return (left.displayName || left.preferenceName || '').localeCompare(
      right.displayName || right.preferenceName || ''
    );
  });

export const buildInquirySourceSelectOptions = (
  items: InquirySourceOption[] = [],
  selectedInquirySourceIds: Array<string | null | undefined> = []
) => {
  const sortedItems = sortInquirySourcesForSelection(items);
  const existingIds = new Set(sortedItems.map((item) => item.id));
  const missingSelectedItems = selectedInquirySourceIds
    .filter((id): id is string => Boolean(id && !existingIds.has(id)))
    .filter((id, index, ids) => ids.indexOf(id) === index)
    .map((id) => ({
      id,
      displayName: `Unknown source (${id.slice(0, 8)})`,
      preferenceName: `Unknown source (${id.slice(0, 8)})`,
      displayOrder: Number.MAX_SAFE_INTEGER,
      isActive: false,
    }));

  return [...sortedItems, ...missingSelectedItems];
};
