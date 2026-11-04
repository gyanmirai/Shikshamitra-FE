'use client';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
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
              variant="outlined"
              color="inherit"
              size="small"
              startIcon={<Iconify icon={GlobalIcons.addIcon} width={18} />}
              onClick={onAdd}
              disabled={!canAdd}
            >
              Add slot group
            </Button>
          </span>
        </Tooltip>
      )}
    </Stack>
  );
}
