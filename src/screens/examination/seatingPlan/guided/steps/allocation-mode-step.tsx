import Stack from '@mui/material/Stack';
import { Iconify } from 'src/components/iconify';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import type { AllocationMode, GuidedStepProps } from '../types';

export function AllocationModeStep({ workflow }: GuidedStepProps) {
  const mode = workflow.formik.values.allocationMode;
  const selectMode = (_event: React.MouseEvent<HTMLElement>, value: AllocationMode | null) => {
    if (!value || value === mode) return;
    workflow.formik.setFieldValue('allocationMode', value);
    workflow.resetPreview();
  };

  return (
    <Stack spacing={1}>
      <Stack spacing={0.5}>
        <Typography variant="h6">Choose how to arrange students</Typography>
        <Typography color="text.secondary">
          Start automatically or work directly on the classroom layout. Both options remain a
          draft until Review.
        </Typography>
      </Stack>
      <ToggleButtonGroup
        exclusive
        fullWidth
        value={mode}
        onChange={selectMode}
        aria-label="Seating allocation method"
        sx={{ maxWidth: 720 }}
      >
        <ToggleButton value="automatic" sx={{ minHeight: 64, gap: 1 }}>
          <Iconify icon="mdi:auto-fix" width={22} />
          <Stack alignItems="flex-start">
            <Typography variant="subtitle2">Automatic</Typography>
            <Typography variant="caption" color="text.secondary">
              Generate a complete proposal from rules
            </Typography>
          </Stack>
        </ToggleButton>
        <ToggleButton value="manual" sx={{ minHeight: 64, gap: 1 }}>
          <Iconify icon="mdi:cursor-move" width={22} />
          <Stack alignItems="flex-start">
            <Typography variant="subtitle2">Manual classroom</Typography>
            <Typography variant="caption" color="text.secondary">
              Drag, select, move and swap students
            </Typography>
          </Stack>
        </ToggleButton>
      </ToggleButtonGroup>
    </Stack>
  );
}
