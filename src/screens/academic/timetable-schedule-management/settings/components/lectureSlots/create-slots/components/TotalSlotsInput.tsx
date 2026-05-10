import React from 'react';
import { TextField, Typography } from '@mui/material';

interface ITotalSlotsInputProps {
  value: string;
  disabled?: boolean;
  error?: string;
  /** Array-level timeSlots error (only shown when there is no field-level error). */
  arrayError?: string;
  onChange: (value: string) => void;
}

const blockedKeys = ['e', 'E', '+', '-', '.'];

const TotalSlotsInput: React.FC<ITotalSlotsInputProps> = ({
  value,
  disabled,
  error,
  arrayError,
  onChange,
}) => (
  <>
    <TextField
      fullWidth
      label="Total Slots *"
      type="number"
      inputProps={{ min: 0, max: 20 }}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (blockedKeys.includes(e.key)) e.preventDefault();
      }}
      onWheel={(e) => {
        (e.target as HTMLElement).blur();
      }}
      size="small"
      disabled={disabled}
      error={Boolean(error)}
      helperText={error || 'Ensure this matches the number of slot entries below'}
    />
    {!error && arrayError ? (
      <Typography variant="caption" color="error" sx={{ mt: 1.5, display: 'block' }}>
        {arrayError}
      </Typography>
    ) : null}
  </>
);

export default TotalSlotsInput;
