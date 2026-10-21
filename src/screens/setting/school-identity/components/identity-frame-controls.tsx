import { useId } from 'react';
import Stack from '@mui/material/Stack';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { DEFAULT_PLACEMENT } from '../identity-image-frame';

import type { ImagePlacement } from '../identity-image-frame';

export function IdentityFrameControls({
  value,
  disabled,
  onChange,
}: {
  value: ImagePlacement;
  disabled: boolean;
  onChange: (value: ImagePlacement) => void;
}) {
  const id = useId();
  return (
    <Stack spacing={2}>
      <TextField
        select
        fullWidth
        size="small"
        label="Image fit"
        value={value.fit}
        disabled={disabled}
        onChange={(event) =>
          onChange({ ...DEFAULT_PLACEMENT, fit: event.target.value as ImagePlacement['fit'] })
        }
      >
        <MenuItem value="contain">Fit entire image</MenuItem>
        <MenuItem value="cover">Fill frame (crop edges)</MenuItem>
      </TextField>
      {(['zoom', 'x', 'y'] as const).map((key) => (
        <Stack key={key}>
          <Typography variant="body2" id={`${id}-${key}`}>
            {{ zoom: 'Zoom', x: 'Horizontal position', y: 'Vertical position' }[key]}
          </Typography>
          <Slider
            aria-labelledby={`${id}-${key}`}
            value={value[key]}
            disabled={disabled}
            min={key === 'zoom' ? 1 : 0}
            max={key === 'zoom' ? 3 : 100}
            step={key === 'zoom' ? 0.05 : 1}
            valueLabelDisplay="auto"
            valueLabelFormat={(number) =>
              key === 'zoom' ? `${Math.round(number * 100)}%` : `${number}%`
            }
            onChange={(_, number) => onChange({ ...value, [key]: number as number })}
          />
        </Stack>
      ))}
      <Button
        disabled={disabled}
        onClick={() => onChange(DEFAULT_PLACEMENT)}
        sx={{ alignSelf: 'flex-start' }}
      >
        Reset image position
      </Button>
    </Stack>
  );
}
