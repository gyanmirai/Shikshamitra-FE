import React, { useId } from 'react';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShakingTextField from 'src/components/shaking-text-field';
import { Box, Stack, Tooltip, IconButton, Typography } from '@mui/material';

interface ISlotCounterControlProps {
  value: number;
  disabled?: boolean;
  error?: string;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  label?: string;
  fieldName?: string;
}

export default function SlotCounterControl({
  value,
  label = 'lecture slot group',
  disabled,
  error,
  min = 1,
  max = 20,
  onChange,
  fieldName,
}: ISlotCounterControlProps) {
  const errorId = useId();
  return (
    <ShakingTextField error={Boolean(error)}>
      <Box
        component="fieldset"
        name={fieldName}
        tabIndex={-1}
        role="group"
        aria-label={`Slots per day for ${label} (required)`}
        aria-describedby={error ? errorId : undefined}
        sx={{
          m: 0,
          p: 0,
          border: 0,
          minWidth: 0,
          '&:focus-visible': {
            outline: '2px solid',
            outlineColor: 'primary.main',
            outlineOffset: 2,
          },
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          spacing={1}
        >
          <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
            Slots per day *
          </Typography>
          <Stack
            direction="row"
            alignItems="center"
            sx={{ border: 1, borderColor: error ? 'error.main' : 'divider', borderRadius: 1 }}
          >
            <Tooltip title={value <= min ? `Minimum ${min} slot` : 'Remove slot'}>
              <span>
                <IconButton
                  aria-label={`Decrease slots for ${label}`}
                  size="small"
                  disabled={disabled || value <= min}
                  onClick={() => onChange(value - 1)}
                  sx={{
                    width: 44,
                    height: 44,
                    color: 'text.secondary',
                    borderRadius: 0,
                  }}
                >
                  <RemoveIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Typography
              variant="subtitle2"
              sx={{
                minWidth: 36,
                flex: { xs: 1, sm: 'initial' },
                height: 44,
                display: 'grid',
                placeItems: 'center',
                borderLeft: 1,
                borderRight: 1,
                borderColor: 'divider',
              }}
            >
              {value}
            </Typography>
            <Tooltip title={value >= max ? `Maximum ${max} slots` : 'Add slot'}>
              <span>
                <IconButton
                  aria-label={`Increase slots for ${label}`}
                  size="small"
                  disabled={disabled || value >= max}
                  onClick={() => onChange(value + 1)}
                  sx={{
                    width: 44,
                    height: 44,
                    color: 'text.secondary',
                    borderRadius: 0,
                  }}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        </Stack>
        {error && (
          <Typography data-slot-error id={errorId} variant="caption" color="error" display="block">
            {error}
          </Typography>
        )}
      </Box>
    </ShakingTextField>
  );
}
