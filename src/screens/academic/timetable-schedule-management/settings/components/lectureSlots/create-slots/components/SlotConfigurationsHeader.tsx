'use client';

import AddIcon from '@mui/icons-material/Add';
import { Iconify } from 'src/components/iconify';
import { alpha, lighten } from '@mui/material/styles';
import { Box, Stack, Button, Tooltip, Typography } from '@mui/material';

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
      <Stack direction="row" alignItems="center" spacing={1}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: (theme) =>
              alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.22 : 0.12),
            color: (theme) =>
              theme.palette.mode === 'dark'
                ? lighten(theme.palette.primary.main, 0.7)
                : theme.palette.primary.main,
          }}
        >
          <Iconify icon="mdi:clock-time-four-outline" width={18} />
        </Box>
        <Box>
          <Typography variant="subtitle1" fontWeight={700} color="text.primary">
            Slot Configurations
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {groupCount
              ? `${groupCount} group${groupCount > 1 ? 's' : ''} configured`
              : 'Add a group to start configuring slots'}
          </Typography>
        </Box>
      </Stack>

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
