import type { FormikErrors } from 'formik';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Alert, Stack, Button, Typography } from '@mui/material';

import type { IExamFormValues } from '../type';

const validationSteps = [
  {
    title: 'Basic Details',
    fields: ['examName', 'className', 'divisions', 'examType', 'gradingScaleId'],
  },
  { title: 'Schedule', fields: ['subjects'] },
  { title: 'Room Details', fields: ['roomDetails'] },
];

export function ExamValidationSummary({
  errors,
  onEditStep,
}: {
  errors: FormikErrors<IExamFormValues>;
  onEditStep?: (step: number) => void;
}) {
  if (Object.keys(errors).length === 0) return null;

  return (
    <Alert severity="error">
      <Stack spacing={1}>
        <Typography variant="body2">
          Resolve the validation errors before finishing setup.
        </Typography>
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          {validationSteps.map((step, index) =>
            step.fields.some((field) => field in errors) ? (
              <Button
                key={step.title}
                type="button"
                size="small"
                color="inherit"
                variant="outlined"
                startIcon={<Iconify icon={GlobalIcons.edit} />}
                onClick={() => onEditStep?.(index)}
              >
                Edit {step.title}
              </Button>
            ) : null
          )}
        </Stack>
      </Stack>
    </Alert>
  );
}
