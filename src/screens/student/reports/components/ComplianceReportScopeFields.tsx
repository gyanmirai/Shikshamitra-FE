import { Grid, TextField } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';

import type { useComplianceReportForm } from '../hooks/use-compliance-report-form';

export default function ComplianceReportScopeFields({
  editor,
}: {
  editor: ReturnType<typeof useComplianceReportForm>;
}) {
  const fields = [
    { key: 'boardId', label: 'Board', options: editor.boards },
    { key: 'mediumId', label: 'Medium', options: editor.mediums },
    { key: 'standardId', label: 'Class', options: editor.standards },
    { key: 'divisionId', label: 'Division', options: editor.divisions },
  ] as const;
  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12 }}>
        <ShakingTextField
          error={Boolean(editor.form.submitCount && editor.form.errors.academicYearId)}
        >
          <TextField
            fullWidth
            size="small"
            label="Report academic year"
            value={editor.year?.name ?? ''}
            slotProps={{ input: { readOnly: true } }}
            error={Boolean(editor.form.submitCount && editor.form.errors.academicYearId)}
            helperText={
              editor.form.submitCount
                ? editor.form.errors.academicYearId
                : 'Uses this academic year and the saved current placement. Reopen the report to use another year.'
            }
          />
        </ShakingTextField>
      </Grid>
      {fields.map((field) => (
        <Grid key={field.key} size={{ xs: 12, sm: 6 }}>
          <CustomSelect
            fullWidth
            size="small"
            name={field.key}
            label={field.label}
            value={editor.form.values[field.key]}
            options={[
              {
                value: '',
                label: `All available ${field.label === 'Class' ? 'classes' : `${field.label.toLowerCase()}s`}`,
              },
              ...field.options.map((item) => ({ value: item.id, label: item.name })),
            ]}
            disabled={
              !editor.canRead ||
              editor.options.isFetching ||
              editor.options.isError ||
              !editor.year?.id
            }
            onChange={(value) => editor.change(field.key, String(value))}
          />
        </Grid>
      ))}
    </Grid>
  );
}
