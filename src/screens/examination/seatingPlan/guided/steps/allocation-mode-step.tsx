import { Iconify } from 'src/components/iconify';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { FormSectionCard } from 'src/components/form-section-card';

import type { AllocationMode, GuidedStepProps } from '../types';

export function AllocationModeStep({ workflow }: GuidedStepProps) {
  const mode = workflow.formik.values.allocationMode;
  const selectMode = (_event: React.MouseEvent<HTMLElement>, value: AllocationMode | null) => {
    if (!value || value === mode) return;
    workflow.formik.setFieldValue('allocationMode', value);
    workflow.resetPreview();
  };

  return (
    <FormSectionCard
      icon="mdi:auto-fix"
      title="Arrangement method"
      descriptionTooltip="Automatic generates a seating proposal from your allocation rules. Manual lets you arrange students directly on the classroom layout. Both methods remain a draft until you review and apply the seating."
    >
      <ToggleButtonGroup
        size="small"
        exclusive
        fullWidth
        value={mode}
        onChange={selectMode}
        aria-label="Seating allocation method"
      >
        <ToggleButton value="automatic" sx={{ gap: 1 }}>
          <Iconify icon="mdi:auto-fix" width={18} />
          Automatic
        </ToggleButton>
        <ToggleButton value="manual" sx={{ gap: 1 }}>
          <Iconify icon="mdi:cursor-move" width={18} />
          Manual
        </ToggleButton>
      </ToggleButtonGroup>
    </FormSectionCard>
  );
}
