import { useRef } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { Iconify } from 'src/components/iconify';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CustomTooltip from 'src/components/custom-tooltip';

import { FormBuilderDeleteUnit } from './form-builder-delete-unit';
import { FormBuilderUnitSettings } from './form-builder-unit-settings';

import type { AdmissionFormStepGroup } from '../form-step-groups';

type Props = {
  step: AdmissionFormStepGroup;
  stepIndex: number;
  settingsOpen: boolean;
  nameError?: string;
  onNameChange: (name: string) => void;
  onNameBlur: () => void;
  onToggleSettings: () => void;
  onDelete: () => void;
};

export function FormBuilderStepHeader({
  step,
  stepIndex,
  settingsOpen,
  nameError,
  onNameChange,
  onNameBlur,
  onToggleSettings,
  onDelete,
}: Props) {
  const name = step.name || `Step ${stepIndex + 1}`;
  const editButtonRef = useRef<HTMLButtonElement>(null);
  const finishEditing = () => {
    onToggleSettings();
    editButtonRef.current?.focus();
  };
  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ pb: 1 }}>
      {settingsOpen ? (
        <FormBuilderUnitSettings
          id={`step-heading-${step.id}`}
          unit="Step"
          name={step.name}
          nameError={nameError}
          onNameChange={onNameChange}
          onNameBlur={onNameBlur}
          onDone={finishEditing}
        />
      ) : (
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography component="h2" variant="h6" sx={{ overflowWrap: 'anywhere' }}>
            {name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {step.sections.length} {step.sections.length === 1 ? 'section' : 'sections'}
            {step.visibilityRuleJson ? ' · Conditional' : ''}
          </Typography>
        </Box>
      )}
      <CustomTooltip title={settingsOpen ? 'Finish editing heading' : 'Edit step heading'}>
        <IconButton
          size="small"
          ref={editButtonRef}
          aria-label={`Edit ${name} step`}
          aria-expanded={settingsOpen}
          aria-controls={settingsOpen ? `step-heading-${step.id}` : undefined}
          onClick={() => {
            if (settingsOpen) onNameBlur();
            if (!settingsOpen || step.name.trim()) onToggleSettings();
          }}
          sx={{ width: 44, height: 44, flexShrink: 0 }}
        >
          <Iconify icon={settingsOpen ? 'mdi:check' : 'mdi:pencil-outline'} width={18} />
        </IconButton>
      </CustomTooltip>
      <FormBuilderDeleteUnit name={name} unit="step" onDelete={onDelete} />
    </Stack>
  );
}
