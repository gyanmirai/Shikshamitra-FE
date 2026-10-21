import type { RootState } from 'src/redux/store';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { Stack, Typography } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import SubmitButton from 'src/components/submit-button';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';

import { newReportRequest } from '../types';
import { ReportFiltersForm } from './report-filters';

import type { ReportOptions, ReportDefinition, InstituteReportRequest } from '../types';

export function ReportForm({ definition, options, onPreview }: {
  definition: ReportDefinition; options: ReportOptions; onPreview: (request: InstituteReportRequest) => void;
}) {
  const currentYear = useSelector((state: RootState) => state.globalState.currentYear);
  const year = options.choices.academicYearId?.some((item) => item.id === currentYear?.id) ? currentYear?.id : undefined;
  const form = useFormik({
    initialValues: newReportRequest(definition.id, definition.academic ? { academicYearId: year } : {}),
    validationSchema: Yup.object({
      format: Yup.string().oneOf(['pdf', 'excel', 'csv']).required('Select an output format.'),
      filters: Yup.object({ academicYearId: definition.academic ? Yup.string().required('Select an academic year.') : Yup.string().optional() }),
    }),
    onSubmit: onPreview,
  });
  return <Stack component="form" onSubmit={form.handleSubmit} spacing={2} sx={{ p: { xs: 1, sm: 2 }, minWidth: 0, minHeight: 0, overflowY: 'auto', height: 1 }}>
    <FormSectionCard icon="mdi:filter-outline" title="Report Scope" descriptionTooltip="Limit this report to permitted setup data. Capacity means configured capacity, not student enrolment.">
      <Typography variant="body2" color="text.secondary">
        {definition.id.startsWith('school-identity-') ? 'Reports include permitted configured identity profiles. Academic filters are optional; selecting a year excludes school defaults.'
          : definition.academic ? 'Choose an academic year and optional hierarchy filters.' : 'This report uses the school-wide catalogue and does not require academic context.'}
      </Typography>
      {definition.id === 'class-division-summary' && <Typography variant="body2" color="text.secondary">Division counts include only divisions you are permitted to view.</Typography>}
      <ReportFiltersForm form={form} options={options} />
    </FormSectionCard>
    <FormSectionCard icon="mdi:file-document-outline" title="Output" descriptionTooltip="The preview is paginated. The generated file contains every matching row.">
      <ShakingTextField error={Boolean(form.touched.format && form.errors.format)}>
        <CustomSelect required size="small" fullWidth label="Format" value={form.values.format}
          options={[{ value: 'pdf', label: 'PDF' }, { value: 'excel', label: 'Excel' }, { value: 'csv', label: 'CSV' }]}
          onChange={(value) => form.setFieldValue('format', value)} />
      </ShakingTextField>
    </FormSectionCard>
    <SubmitButton buttonText="Preview report" startIcon={undefined} sx={{ alignSelf: 'flex-end' }} />
  </Stack>;
}
