import type { FormikProps } from 'formik';

import { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';

import { LoginField } from './login-field';

type Props<T extends Record<string, string>> = {
  formik: FormikProps<T>;
  name: Extract<keyof T, string>;
  label: string;
  placeholder: string;
  autoComplete: string;
};

export function AuthPasswordField<T extends Record<string, string>>({
  formik,
  label,
  ...props
}: Props<T>) {
  const [visible, setVisible] = useState(false);
  return (
    <LoginField
      {...props}
      label={label}
      formik={formik}
      type={visible ? 'text' : 'password'}
      endAdornment={
        <InputAdornment position="end">
          <IconButton
            onClick={() => setVisible((value) => !value)}
            onMouseDown={(event) => event.preventDefault()}
            disabled={formik.isSubmitting}
            aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
            aria-pressed={visible}
            edge="end"
            sx={{
              width: 44,
              height: 44,
              color: 'text.secondary',
              '&:focus-visible': { outline: '2px solid currentColor', outlineOffset: -2 },
            }}
          >
            <Iconify icon={visible ? 'mdi:eye-off-outline' : 'mdi:eye-outline'} />
          </IconButton>
        </InputAdornment>
      }
    />
  );
}
