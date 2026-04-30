import { useCallback } from 'react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { Block } from './styles';
import { Iconify } from '../../iconify';
import { useFontSize } from '../context';

// ----------------------------------------------------------------------

type Props = {
  value: number;
  min: number;
  max: number;
  defaultValue: number;
  onChange: (value: number) => void;
  onReset: () => void;
};

/**
 * Pure presentational slider used inside the Settings drawer. Logic and
 * persistence live in the `FontSizeContext` / settings provider.
 */
export function FontSizeOptions({ value, min, max, defaultValue, onChange, onReset }: Props) {
  const handleChange = useCallback(
    (_: Event, next: number | number[]) => {
      onChange(typeof next === 'number' ? next : next[0]);
    },
    [onChange]
  );

  return (
    <Block title="Font size">
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mt: 0.5,
        }}
      >
        <Typography
          variant="caption"
          sx={{ color: 'text.secondary', fontWeight: 'fontWeightMedium' }}
        >
          Adjust the global text size
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography
            variant="subtitle2"
            sx={{ minWidth: 24, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}
          >
            {value}
          </Typography>

          {value !== defaultValue && (
            <Tooltip title="Reset">
              <IconButton size="small" onClick={onReset} aria-label="Reset font size">
                <Iconify width={16} icon="solar:restart-bold" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 0.5, mt: 1 }}>
        <Typography component="span" sx={{ fontSize: 11, color: 'text.disabled', minWidth: 16 }}>
          A
        </Typography>

        <Slider
          size="small"
          value={value}
          min={min}
          max={max}
          step={1}
          marks
          valueLabelDisplay="auto"
          onChange={handleChange}
          aria-label="Global font size"
        />

        <Typography component="span" sx={{ fontSize: 16, color: 'text.disabled', minWidth: 16 }}>
          A
        </Typography>
      </Box>
    </Block>
  );
}

// ----------------------------------------------------------------------

/**
 * Connected variant that wires up the slider to the global font size hook.
 * Drop it anywhere inside `SettingsProvider` to expose a font-size control.
 */
export function FontSizeOptionsConnected() {
  const { fontSize, min, max, defaultFontSize, setFontSize, resetFontSize } = useFontSize();

  return (
    <FontSizeOptions
      value={fontSize}
      min={min}
      max={max}
      defaultValue={defaultFontSize}
      onChange={setFontSize}
      onReset={resetFontSize}
    />
  );
}
