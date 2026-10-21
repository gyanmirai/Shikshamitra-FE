import type { FormikProps } from 'formik';

import { Box } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';

import type { ReportOptions, ReportFilters, InstituteReportRequest } from '../types';

export const hierarchyFields = ['academicYearId', 'boardId', 'mediumId', 'stageId', 'standardId', 'divisionId'] as const;
const labels: Record<keyof ReportFilters, string> = {
  academicYearId: 'Academic year', boardId: 'Board', mediumId: 'Medium', stageId: 'Stage', standardId: 'Standard',
  divisionId: 'Division', buildingId: 'Building', floorId: 'Floor', roomTypeId: 'Room type', shiftId: 'Shift', roomAssignment: 'Room assignment',
  documentCategory: 'Document category', identityScope: 'Identity scope',
};
export function changeReportFilter(filters: ReportFilters, key: keyof ReportFilters, value: string): ReportFilters {
  const next = { ...filters, [key]: value || undefined };
  const index = hierarchyFields.indexOf(key as typeof hierarchyFields[number]);
  if (index >= 0) hierarchyFields.slice(index + 1).forEach((field) => { delete next[field]; });
  if (key === 'buildingId') delete next.floorId;
  return next;
}
export function ReportFiltersForm({ form, options }: { form: FormikProps<InstituteReportRequest>; options: ReportOptions }) {
  const { reportType, filters } = form.values;
  const academic = options.reportTypes.find((item) => item.id === reportType)?.academic;
  const identity = reportType.startsWith('school-identity-');
  const fields: (keyof ReportFilters)[] = identity ? ['identityScope', ...hierarchyFields.slice(0, 4)] : reportType.startsWith('school-document-') ? ['documentCategory']
    : academic ? hierarchyFields.filter((field) => reportType !== 'class-division-summary' || field !== 'divisionId')
      : reportType === 'rooms-inventory' ? ['buildingId', 'floorId', 'roomTypeId'] : ['shiftId'];
  if (reportType === 'division-capacity') fields.push('roomAssignment', 'shiftId');
  return <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
    {fields.map((key) => {
      const index = hierarchyFields.indexOf(key as typeof hierarchyFields[number]);
      const parent = index > 0 ? hierarchyFields[index - 1] : key === 'floorId' ? 'buildingId' : undefined;
      const required = key === 'academicYearId' && !identity;
      const error = required && Boolean(form.touched.filters?.academicYearId && form.errors.filters?.academicYearId);
      const choices = options.values?.[key]?.map((item) => ({ id: item.value, name: item.label })) ?? (key === 'roomAssignment' ? [
        { id: 'assigned', name: 'Assigned' }, { id: 'unassigned', name: 'Unassigned' }, { id: 'unresolved', name: 'Unresolved legacy reference' },
      ] : (options.choices[key] ?? []).filter((item) => !parent || !filters[parent] || item.parentId === filters[parent]));
      return <ShakingTextField key={key} error={error}>
        <CustomSelect
          size="small" fullWidth required={required} label={identity && key === 'stageId' ? 'Organization' : labels[key]} value={filters[key] ?? ''}
          disabled={Boolean(parent && !filters[parent])} error={error}
          helperText={error ? String(form.errors.filters?.academicYearId) : undefined}
          options={[{ value: '', label: required ? 'Select academic year' : 'All' }, ...choices.map((item) => ({ value: item.id, label: item.name }))]}
          onBlur={() => form.setFieldTouched(`filters.${key}`, true)}
          onChange={(value) => form.setFieldValue('filters', changeReportFilter(filters, key, String(value)))}
        />
      </ShakingTextField>;
    })}
  </Box>;
}
