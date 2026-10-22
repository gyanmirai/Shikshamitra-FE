import type { FormikProps } from 'formik';

import { useId } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import ShakingTextField from 'src/components/shaking-text-field';
import { Box, FormLabel, IconButton, FormHelperText } from '@mui/material';
import ColorPickerCircle from 'src/components/static-color/colorPickerCircle';

import type { SubjectFormValues } from '../initialValues';

export function SubjectColorField({ formik }: { formik: FormikProps<SubjectFormValues> }) {
  const id = useId();
  const error = formik.touched.subjectColor ? formik.errors.subjectColor : undefined;
  return (
    <ShakingTextField error={Boolean(error)}>
      <Box
        component="fieldset"
        aria-label="Subject Color (required)"
        aria-describedby={error ? `${id}-error` : undefined}
        data-subject-color
        tabIndex={-1}
        sx={{ border: 0, m: 0, p: 0, minWidth: 0 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 0.5 }}>
          <FormLabel required error={Boolean(error)}>
            Subject Color
          </FormLabel>
          <CustomTooltip
            arrow
            title="This color identifies the subject throughout academic screens."
          >
            <IconButton size="small" aria-label="Subject Color information" color="info">
              <Iconify icon={GlobalIcons.info} width={16} />
            </IconButton>
          </CustomTooltip>
        </Box>
        <ColorPickerCircle
          onSelect={(color) => {
            formik.setFieldTouched('subjectColor', true, false);
            formik.setFieldValue('subjectColor', color);
          }}
          initialColor={formik.values.subjectColor}
        />
        {error && (
          <FormHelperText id={`${id}-error`} role="alert" error>
            {error}
          </FormHelperText>
        )}
      </Box>
    </ShakingTextField>
  );
}
