export type InquirySourceOption = {
  id: string;
  preferenceName: string;
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
      preferenceName: `${selectedInquirySourceName} (Inactive)`,
      isActive: false,
    },
  ];
};
