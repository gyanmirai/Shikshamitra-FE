import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import Switch from '@mui/material/Switch';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import { FormSectionCard } from 'src/components/form-section-card';

import type { FillDirection, GuidedStepProps, AllocationStrategy } from '../types';

export function AllocationStep({ workflow }: GuidedStepProps) {
  const { formik } = workflow;
  const setRule = (field: keyof typeof formik.values, value: string | boolean) => {
    formik.setFieldValue(field, value);
    if (formik.values.allocationMode === 'automatic') workflow.resetPreview();
  };

  return (
    <FormSectionCard
      icon="mdi:tune"
      title="Allocation rules"
      descriptionTooltip="Choose the student order and direction for filling seats. You can mix divisions, leave an empty seat between students, and prioritize accessibility requirements. These rules generate a preview; assignments are saved only when you apply the seating."
    >
      <Stack spacing={1}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
          <FormControl fullWidth size="small">
            <InputLabel id="allocation-strategy-label">Student order</InputLabel>
            <Select
              labelId="allocation-strategy-label"
              label="Student order"
              value={formik.values.strategy}
              onChange={(event) => setRule('strategy', event.target.value as AllocationStrategy)}
            >
              <MenuItem value="roll-number">Roll number</MenuItem>
              <MenuItem value="alphabetical">Alphabetical</MenuItem>
              <MenuItem value="alternate-division">Alternate divisions</MenuItem>
              <MenuItem value="random">Randomized</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel id="fill-direction-label">Fill direction</InputLabel>
            <Select
              labelId="fill-direction-label"
              label="Fill direction"
              value={formik.values.fillDirection}
              onChange={(event) => setRule('fillDirection', event.target.value as FillDirection)}
            >
              <MenuItem value="front-to-back">Front to back</MenuItem>
              <MenuItem value="back-to-front">Back to front</MenuItem>
              <MenuItem value="row-wise">Row-wise</MenuItem>
              <MenuItem value="column-wise">Column-wise</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        <Stack>
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={formik.values.mixDivisions}
                onChange={(_, checked) => setRule('mixDivisions', checked)}
              />
            }
            label="Mix divisions"
          />
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={formik.values.leaveGap}
                onChange={(_, checked) => setRule('leaveGap', checked)}
              />
            }
            label="Leave an empty seat between students"
          />
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={formik.values.specialRequirementPriority}
                onChange={(_, checked) => setRule('specialRequirementPriority', checked)}
              />
            }
            label="Prioritize accessibility requirements"
          />
        </Stack>
      </Stack>
    </FormSectionCard>
  );
}
