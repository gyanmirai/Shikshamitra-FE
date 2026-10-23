'use client';

import AddIcon from '@mui/icons-material/Add';
import { GlobalIcons } from 'src/utils/icons';
import { Stack, Button, Tooltip } from '@mui/material';
import { FormSectionHeader } from 'src/components/form-section-card';

interface SlotConfigurationsHeaderProps {
  canAdd: boolean;
  disabled?: boolean;
  groupCount: number;
  isLoading?: boolean;
  onAdd: () => void;
}

export default function SlotConfigurationsHeader({
  canAdd,
  disabled,
  groupCount,
  isLoading,
  onAdd,
}: SlotConfigurationsHeaderProps) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      alignItems={{ xs: 'flex-start', sm: 'center' }}
      justifyContent="space-between"
      spacing={1}
      sx={{ mt: 0.5 }}
    >
      <FormSectionHeader
        icon={GlobalIcons.clock}
        title={`Slot Configurations (${groupCount})`}
        titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
        descriptionTooltip="Create slot groups for the selected class shift, then configure their active days and lecture times."
      />

      {!disabled && (
        <Tooltip
          title={
            canAdd
              ? 'Add new slot group'
              : isLoading
                ? 'Wait for class timing to finish loading'
                : 'Select a class with an assigned school shift first'
          }
        >
          <span>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon fontSize="small" />}
              onClick={onAdd}
              disabled={!canAdd}
            >
              Add Slot Group
            </Button>
          </span>
        </Tooltip>
      )}
    </Stack>
  );
}
