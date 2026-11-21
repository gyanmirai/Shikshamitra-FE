import type { FormikProps } from 'formik';

import { GlobalIcons } from 'src/utils/icons';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';
import {
  Stack,
  Radio,
  FormLabel,
  Typography,
  RadioGroup,
  FormControl,
  FormHelperText,
  FormControlLabel,
} from '@mui/material';

import { inboxRoutingChoices } from './setup-model';

import type { SetupValues } from './setup-model';

export function StudentInboxRoutingField({
  formik,
  disabled,
}: {
  formik: FormikProps<SetupValues>;
  disabled: boolean;
}) {
  const error = Boolean(formik.touched.studentInboxRouting && formik.errors.studentInboxRouting);
  return (
    <FormSectionCard
      title="Student Inbox Routing"
      icon={GlobalIcons.family}
      descriptionTooltip="This changes which verified accounts can receive and read student inbox items. It does not change email contacts or consent."
    >
      <ShakingTextField error={error}>
        <FormControl component="fieldset" required error={error} disabled={disabled}>
          <FormLabel component="legend">Student inbox routing</FormLabel>
          <RadioGroup
            name="studentInboxRouting"
            aria-label="Student inbox routing"
            aria-required
            value={formik.values.studentInboxRouting}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          >
            {inboxRoutingChoices.map((choice) => (
              <FormControlLabel
                key={choice.value}
                value={choice.value}
                control={<Radio />}
                label={
                  <Stack>
                    <Typography variant="body2">{choice.label}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {choice.detail}
                    </Typography>
                  </Stack>
                }
              />
            ))}
          </RadioGroup>
          <Typography variant="caption" color="text.secondary">
            Changing this also changes which linked accounts can read existing student inbox
            messages.
          </Typography>
          {error && <FormHelperText>{formik.errors.studentInboxRouting}</FormHelperText>}
        </FormControl>
      </ShakingTextField>
    </FormSectionCard>
  );
}
