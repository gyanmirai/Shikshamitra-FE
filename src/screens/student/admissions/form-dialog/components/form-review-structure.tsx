import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import { Iconify } from 'src/components/iconify';
import Typography from '@mui/material/Typography';

import { getAdmissionFormStepGroups } from '../form-step-groups';

type Props = { form: CreateUpdateAdmissionForm; onEditFields: () => void };

export function FormReviewStructure({ form, onEditFields }: Props) {
  const isStepper = form.layoutType === 1;
  const groups = isStepper
    ? getAdmissionFormStepGroups(form.sections)
    : [
        {
          id: 'single-page',
          name: '',
          sections: [...form.sections]
            .sort((left, right) => left.displayOrder - right.displayOrder)
            .map((section) => ({ section })),
        },
      ];
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
      <Stack
        direction="row"
        spacing={1.5}
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Box>
          <Typography variant="subtitle1">Form structure</Typography>
          <Typography variant="body2" color="text.secondary">
            Sections and fields in applicant order.
          </Typography>
        </Box>
        <Button
          size="small"
          variant="outlined"
          onClick={onEditFields}
          startIcon={<Iconify icon="mdi:pencil-outline" />}
          sx={{ flexShrink: 0, minHeight: 44 }}
        >
          Edit fields
        </Button>
      </Stack>
      <Stack spacing={2}>
        {groups.map((group, stepIndex) => (
          <Stack key={group.id} spacing={1.25}>
            {isStepper && (
              <Typography
                variant="subtitle2"
                sx={{ p: 1, borderRadius: 1, bgcolor: 'action.hover', overflowWrap: 'anywhere' }}
              >
                Step {stepIndex + 1}: {group.name || 'Untitled step'}
              </Typography>
            )}
            <Stack divider={<Divider />} spacing={1.25}>
              {group.sections.map(({ section }) => (
                <Box key={section.id} sx={{ pl: isStepper ? 1 : 0 }}>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={0.5}
                    justifyContent="space-between"
                  >
                    <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
                      {section.name || 'Untitled section'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                      {section.fields.length} {section.fields.length === 1 ? 'field' : 'fields'} ·{' '}
                      {section.fields.filter((field) => field.required).length} required
                    </Typography>
                  </Stack>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5, overflowWrap: 'anywhere' }}
                  >
                    {section.fields.length
                      ? [...section.fields]
                          .sort((left, right) => left.displayOrder - right.displayOrder)
                          .map((field) => field.label || 'Untitled field')
                          .join(', ')
                      : 'No fields added yet.'}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Stack>
        ))}
        {!form.sections.length && (
          <Typography variant="body2" color="text.secondary">
            No sections added yet.
          </Typography>
        )}
      </Stack>
    </Paper>
  );
}
