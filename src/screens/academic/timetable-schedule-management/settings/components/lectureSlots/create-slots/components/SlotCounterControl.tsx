import React from 'react';
import { alpha } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { Box, Stack, Tooltip, IconButton, Typography } from '@mui/material';

interface ISlotCounterControlProps {
  value: number;
  disabled?: boolean;
  error?: string;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  label?: string;
}

const SlotCounterControl: React.FC<ISlotCounterControlProps> = ({
  value,
  label = 'lecture slot group',
  disabled,
  error,
  min = 1,
  max = 20,
  onChange,
}) => {
  const canDecrement = !disabled && value > min;
  const canIncrement = !disabled && value < max;

  const handleDecrement = () => canDecrement && onChange(value - 1);
  const handleIncrement = () => canIncrement && onChange(value + 1);

  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <Tooltip title={disabled ? 'Select a class first' : 'Remove slot'} arrow>
        <span>
          <IconButton
            size="small"
            aria-label={`Decrease slots for ${label}`}
            onClick={handleDecrement}
            disabled={!canDecrement}
            sx={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              border: '1px solid',
              borderColor: (theme) =>
                disabled
                  ? theme.palette.action.disabledBackground
                  : alpha(theme.palette.error.main, 0.5),
              color: (theme) =>
                disabled ? theme.palette.action.disabled : theme.palette.error.main,
              bgcolor: (theme) =>
                disabled ? 'transparent' : alpha(theme.palette.error.main, 0.04),
              transition: 'all 150ms ease',
              '&:hover:not(:disabled)': {
                bgcolor: (theme) => alpha(theme.palette.error.main, 0.12),
                borderColor: 'error.main',
              },
              '&.Mui-disabled': {
                opacity: 0.5,
              },
            }}
          >
            <RemoveIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>

      <Box
        sx={{
          minWidth: 36,
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 1.5,
          bgcolor: (theme) =>
            error ? alpha(theme.palette.error.main, 0.08) : alpha(theme.palette.primary.main, 0.08),
          border: '1px solid',
          borderColor: (theme) =>
            error ? alpha(theme.palette.error.main, 0.3) : alpha(theme.palette.primary.main, 0.2),
        }}
      >
        <Typography
          variant="subtitle2"
          fontWeight={700}
          color={error ? 'error.main' : disabled ? 'text.disabled' : 'text.primary'}
        >
          {value}
        </Typography>
      </Box>

      <Tooltip title={disabled ? 'Select a class first' : 'Add slot'} arrow>
        <span>
          <IconButton
            size="small"
            aria-label={`Increase slots for ${label}`}
            onClick={handleIncrement}
            disabled={!canIncrement}
            sx={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              border: '1px solid',
              borderColor: (theme) =>
                disabled
                  ? theme.palette.action.disabledBackground
                  : alpha(theme.palette.primary.main, 0.5),
              color: (theme) =>
                disabled ? theme.palette.action.disabled : theme.palette.primary.main,
              bgcolor: (theme) =>
                disabled ? 'transparent' : alpha(theme.palette.primary.main, 0.04),
              transition: 'all 150ms ease',
              '&:hover:not(:disabled)': {
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
                borderColor: 'primary.main',
              },
              '&.Mui-disabled': {
                opacity: 0.5,
              },
            }}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>

      {error && (
        <Typography variant="caption" color="error.main" sx={{ ml: 1 }}>
          {error}
        </Typography>
      )}
    </Stack>
  );
};

export default SlotCounterControl;
