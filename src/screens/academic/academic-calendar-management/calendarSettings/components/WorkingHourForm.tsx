import type { FormikProps } from 'formik';

import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import { FormSectionCard } from 'src/components/form-section-card';
import { SCHOOL_SHIFT_TYPE_OPTIONS } from 'src/enums/academic-calendar';
import {
  Box,
  Stack,
  Switch,
  MenuItem,
  TextField,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

import type { WorkingHourValues } from './working-hour-types';

type Props = {
  formik: FormikProps<WorkingHourValues>;
  classes: Array<{ id: string; name: string }>;
  editing: boolean;
  busy: boolean;
  onClose: () => void;
};

export function WorkingHourForm({ formik, classes, editing, busy, onClose }: Props) {
  const error = (name: keyof WorkingHourValues) =>
    Boolean((formik.touched[name] || formik.submitCount > 0) && formik.errors[name]);
  const helper = (name: keyof WorkingHourValues) => (error(name) ? formik.errors[name] : undefined);
  return (
    <>
      <DialogScrollContent>
        <Box component="fieldset" disabled={busy} sx={{ border: 0, p: 0, m: 0, minWidth: 0 }}>
          <FormSectionCard
            title="Working Hours"
            icon="mdi:clock-outline"
            descriptionTooltip="Assign a class shift and its teaching and recess times."
          >
            <Stack spacing={2}>
              <ShakingTextField error={error('standardId')}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  required
                  label="Class"
                  name="standardId"
                  value={formik.values.standardId}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={editing}
                  error={error('standardId')}
                  helperText={helper('standardId')}
                >
                  {classes.map((cls) => (
                    <MenuItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </MenuItem>
                  ))}
                </TextField>
              </ShakingTextField>
              <ShakingTextField error={error('shiftType')}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  required
                  label="Shift type"
                  name="shiftType"
                  value={formik.values.shiftType}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={error('shiftType')}
                  helperText={helper('shiftType')}
                >
                  {SCHOOL_SHIFT_TYPE_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </TextField>
              </ShakingTextField>
              <Stack direction="row" spacing={2}>
                {(['startTime', 'endTime'] as const).map((name) => (
                  <ShakingTextField key={name} error={error(name)}>
                    <TextField
                      fullWidth
                      size="small"
                      required
                      type="time"
                      name={name}
                      label={name === 'startTime' ? 'Start time' : 'End time'}
                      value={formik.values[name]}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      slotProps={{ inputLabel: { shrink: true } }}
                      error={error(name)}
                      helperText={helper(name)}
                    />
                  </ShakingTextField>
                ))}
              </Stack>
              <Stack direction="row" spacing={2}>
                {(['recessStartTime', 'recessEndTime'] as const).map((name) => (
                  <TextField
                    key={name}
                    fullWidth
                    size="small"
                    type="time"
                    name={name}
                    label={name === 'recessStartTime' ? 'Recess start' : 'Recess end'}
                    value={formik.values[name]}
                    onChange={formik.handleChange}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                ))}
              </Stack>
              <FormControlLabel
                label="Set as default working hour"
                control={
                  <Switch
                    size="small"
                    checked={formik.values.isDefault}
                    onChange={(event) => formik.setFieldValue('isDefault', event.target.checked)}
                  />
                }
              />
            </Stack>
          </FormSectionCard>
        </Box>
      </DialogScrollContent>
      <DialogActions>
        <LoadingButton
          size="small"
          variant="outlined"
          color="inherit"
          onClick={onClose}
          disabled={busy}
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
        >
          Cancel
        </LoadingButton>
        <LoadingButton
          size="small"
          type="submit"
          variant="contained"
          color="inherit"
          loading={busy}
          startIcon={<Iconify icon={GlobalIcons.submit} />}
        >
          Submit
        </LoadingButton>
      </DialogActions>
    </>
  );
}
