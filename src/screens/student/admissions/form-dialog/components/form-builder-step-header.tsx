import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { Iconify } from 'src/components/iconify';
import Typography from '@mui/material/Typography';

import { FormBuilderDeleteUnit } from './form-builder-delete-unit';

import type { AdmissionFormStepGroup } from '../form-step-groups';

type Props = {
  step: AdmissionFormStepGroup;
  stepIndex: number;
  canDelete: boolean;
  settingsOpen: boolean;
  onToggleSettings: () => void;
  onDelete: () => void;
};

export function FormBuilderStepHeader({
  step,
  stepIndex,
  canDelete,
  settingsOpen,
  onToggleSettings,
  onDelete,
}: Props) {
  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 1.5, py: 1 }}>
      <Box
        sx={{
          width: 32,
          height: 32,
          flexShrink: 0,
          display: 'grid',
          placeItems: 'center',
          borderRadius: 1,
          bgcolor: 'action.selected',
          color: 'primary.main',
          typography: 'subtitle2',
        }}
      >
        {stepIndex + 1}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="subtitle1" sx={{ overflowWrap: 'anywhere' }}>
          {step.name || `Step ${stepIndex + 1}`}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Step {stepIndex + 1} · {step.sections.length}{' '}
          {step.sections.length === 1 ? 'section' : 'sections'}
          {step.visibilityRuleJson ? ' · Conditional' : ''}
        </Typography>
      </Box>
      <Button
        size="small"
        color="inherit"
        aria-expanded={settingsOpen}
        aria-controls={`step-settings-${step.id}`}
        startIcon={
          <Iconify icon={settingsOpen ? 'mdi:chevron-up' : 'mdi:pencil-outline'} width={18} />
        }
        onClick={onToggleSettings}
        sx={{ minHeight: 44, flexShrink: 0 }}
      >
        {settingsOpen ? 'Done' : 'Edit step'}
      </Button>
      <FormBuilderDeleteUnit
        name={step.name || `Step ${stepIndex + 1}`}
        unit="step"
        canDelete={canDelete}
        onDelete={onDelete}
      />
    </Stack>
  );
}
