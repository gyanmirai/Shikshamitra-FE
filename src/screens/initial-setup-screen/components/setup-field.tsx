import type { ReactNode } from 'react';
import type { FormikProps } from 'formik';
import type { SetupDraft } from 'src/redux/initial-setup/types';

import { getIn } from 'formik';
import TextField from '@mui/material/TextField';

export default function SetupField({
  form,
  name,
  label,
  type,
  optional = false,
  max = 50,
  children,
}: {
  form: FormikProps<SetupDraft>;
  name: string;
  label: string;
  type?: string;
  optional?: boolean;
  max?: number;
  children?: ReactNode;
}) {
  const error = getIn(form.touched, name) && getIn(form.errors, name);
  return (
    <TextField
      name={name}
      id={`setup-${name}`}
      label={label}
      type={type}
      required={!optional}
      fullWidth
      size="small"
      value={getIn(form.values, name) ?? ''}
      onBlur={form.handleBlur}
      onChange={(event) =>
        form.setFieldValue(
          name,
          type === 'number'
            ? event.target.value === ''
              ? null
              : Number(event.target.value)
            : event.target.value
        )
      }
      error={Boolean(error)}
      helperText={error || (optional ? 'Optional' : undefined)}
      select={Boolean(children)}
      slotProps={{ htmlInput: { maxLength: max, min: type === 'number' ? 0 : undefined } }}
    >
      {children}
    </TextField>
  );
}
