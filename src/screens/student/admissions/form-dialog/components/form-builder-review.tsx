import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import { Iconify } from 'src/components/iconify';
import Typography from '@mui/material/Typography';

import { FormReviewChecks } from './form-review-checks';
import { FormReviewStructure } from './form-review-structure';
import { getAdmissionFormStepGroups } from '../form-step-groups';

type Props = {
  form: CreateUpdateAdmissionForm;
  onEditDetails: () => void;
  onEditFields: () => void;
};

export function FormBuilderReview({ form, onEditDetails, onEditFields }: Props) {
  const fields = form.sections.flatMap((section) => section.fields);
  const summary = [
    { label: 'Layout', value: form.layoutType === 1 ? 'Step by step' : 'Single page' },
    { label: 'Fields per row on desktop', value: form.fieldsPerRow },
    ...(form.layoutType === 1
      ? [{ label: 'Steps', value: getAdmissionFormStepGroups(form.sections).length }]
      : []),
    { label: 'Sections', value: form.sections.length },
    { label: 'Fields', value: fields.length },
    { label: 'Required fields', value: fields.filter((field) => field.required).length },
  ];
  return (
    <Stack
      spacing={2}
      sx={{ width: 1, minWidth: 0, maxWidth: 1120, mx: 'auto', p: { xs: 1.5, sm: 2 } }}
    >
      <Alert severity="info" icon={<Iconify icon="mdi:content-save-outline" />}>
        Save this form as a draft to keep your progress. You can edit it again before publishing.
        Applicants will see it only after you publish it.
      </Alert>
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Stack direction="row" spacing={1.5} justifyContent="space-between" alignItems="flex-start">
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="overline" color="text.secondary">
              Form details
            </Typography>
            <Typography variant="h6" sx={{ overflowWrap: 'anywhere' }}>
              {form.name || 'Untitled form'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
              Form code: {form.code || 'Not entered'}
            </Typography>
          </Box>
          <Button
            size="small"
            variant="outlined"
            onClick={onEditDetails}
            startIcon={<Iconify icon="mdi:pencil-outline" />}
            sx={{ flexShrink: 0, minHeight: 44 }}
          >
            Edit details
          </Button>
        </Stack>
        <Chip label="Draft" size="small" variant="outlined" sx={{ mt: 1.25 }} />
        {form.description && (
          <Typography
            variant="body2"
            sx={{ mt: 1.5, overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }}
          >
            {form.description}
          </Typography>
        )}
        <Divider sx={{ my: 2 }} />
        <Box
          component="dl"
          sx={{
            m: 0,
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, minmax(0, 1fr))',
              sm: 'repeat(3, minmax(0, 1fr))',
            },
            gap: 2,
          }}
        >
          {summary.map((item) => (
            <Box key={item.label}>
              <Typography component="dt" variant="caption" color="text.secondary">
                {item.label}
              </Typography>
              <Typography component="dd" variant="subtitle2" sx={{ m: 0 }}>
                {item.value}
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>
      <FormReviewStructure form={form} onEditFields={onEditFields} />
      <FormReviewChecks form={form} onEditFields={onEditFields} />
    </Stack>
  );
}
