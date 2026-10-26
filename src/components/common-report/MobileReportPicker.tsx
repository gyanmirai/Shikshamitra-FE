import { Stack } from '@mui/material';
import CustomSelect from 'src/components/custom-select';

import type { ReportCategory, ReportSubCategory } from './types';

type MobileReportPickerProps = {
  categories: ReportCategory[];
  reports: ReportSubCategory[];
  selectedCategory: string;
  selectedReport: ReportSubCategory | null;
  onSelectCategory: (id: string) => void;
  onSelectReport: (report: ReportSubCategory | null) => void;
};

export function MobileReportPicker({
  categories,
  reports,
  selectedCategory,
  selectedReport,
  onSelectCategory,
  onSelectReport,
}: MobileReportPickerProps) {
  const categoryReports = reports.filter((report) => report.categoryId === selectedCategory);

  return (
    <Stack spacing={2} sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
      <CustomSelect
        name="reportCategory"
        label="Report category"
        value={selectedCategory}
        options={categories.map((category) => ({ label: category.name, value: category.id }))}
        onChange={(value) => onSelectCategory(String(value))}
        isSearch
        noOptionsMessage="No categories match your search."
      />
      <CustomSelect
        name="reportChoice"
        label="Report"
        value={selectedReport?.id ?? ''}
        options={categoryReports.map((report) => ({ label: report.name, value: report.id }))}
        onChange={(value) =>
          onSelectReport(categoryReports.find((report) => report.id === value) ?? null)
        }
        isSearch
        noOptionsMessage="No reports match your search."
      />
    </Stack>
  );
}
