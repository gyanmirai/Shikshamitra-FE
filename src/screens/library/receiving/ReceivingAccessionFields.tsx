import { Checkbox, TextField, Typography, FormControlLabel } from '@mui/material';

import { receivingFieldError } from './receiving-field-state';

import type { ReceivingForm } from './receiving-field-state';

export function ReceivingAccessionFields({
  formik,
  index,
  disabled,
}: {
  formik: ReceivingForm;
  index: number;
  disabled: boolean;
}) {
  const prefix = `lines[${index}]`;
  const line = formik.values.lines[index];
  const error = receivingFieldError(formik, `${prefix}.accessions`);
  return (
    <>
      <FormControlLabel
        label="Enter accession numbers"
        control={
          <Checkbox
            disabled={disabled}
            checked={line.manualAccessions}
            onChange={(_, checked) => formik.setFieldValue(`${prefix}.manualAccessions`, checked)}
          />
        }
      />
      {line.manualAccessions ? (
        <TextField
          {...formik.getFieldProps(`${prefix}.accessions`)}
          label="Accession numbers"
          multiline
          minRows={2}
          fullWidth
          size="small"
          disabled={disabled}
          error={Boolean(error)}
          helperText={
            error ||
            'One line per copy. Leave a line blank for automatic allocation. Existing catalogue accessions cannot be reused.'
          }
        />
      ) : (
        <Typography variant="body2" color="text.secondary">
          Unique accession numbers are allocated when these copies are saved.
        </Typography>
      )}
    </>
  );
}
