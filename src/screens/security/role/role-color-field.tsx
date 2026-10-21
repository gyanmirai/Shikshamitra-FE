import { useId } from 'react';
import { Box, Typography, FormHelperText } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';
import ColorPickerCircle from 'src/components/static-color/colorPickerCircle';

type Props = {
  value: string;
  error?: string;
  disabled: boolean;
  onChange: (value: string) => void;
};

export default function RoleColorField({ value, error, disabled, onChange }: Props) {
  const id = useId();
  return (
    <ShakingTextField error={Boolean(error)}>
      <Typography
        id={`${id}-label`}
        variant="subtitle2"
        sx={{ mb: 1 }}
        color={error ? 'error.main' : 'text.primary'}
      >
        Color *
      </Typography>
      <Box
        role="group"
        aria-label="Color (required)"
        data-color-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        tabIndex={-1}
      >
        <ColorPickerCircle initialColor={value} onSelect={onChange} disabled={disabled} />
      </Box>
      {error && (
        <FormHelperText id={`${id}-error`} error>
          {error}
        </FormHelperText>
      )}
    </ShakingTextField>
  );
}
