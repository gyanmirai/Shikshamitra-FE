import React from 'react';
import { OTPInput } from 'input-otp';
import { Box, FormLabel, FormHelperText } from '@mui/material';

// ── Slot: single character box ────────────────────────────────────────────────
const Slot: React.FC<{
  char: string | null;
  isActive: boolean;
  hasFakeCaret: boolean;
  error?: boolean;
  disabled?: boolean;
}> = ({ char, isActive, hasFakeCaret, error = false, disabled = false }) => (
  <Box
    sx={{
      width: 25,
      height: 30,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.875rem',
      fontWeight: 400,
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      border: '1px solid',
      borderColor: isActive
        ? error
          ? 'error.main'
          : 'primary.main'
        : error
          ? 'error.main'
          : 'grey.400',
      borderRadius: '8px',
      bgcolor: disabled ? 'action.disabledBackground' : 'background.paper',
      color: 'text.primary',
      boxShadow: isActive ? (error ? '0 0 0 2px #d32f2f33' : '0 0 0 2px #1976d233') : 'none',
      transition: 'border-color 0.15s, box-shadow 0.15s',
      position: 'relative',
      userSelect: 'none',
    }}
  >
    {char}
    {hasFakeCaret && (
      <Box
        sx={{
          position: 'absolute',
          width: '1px',
          height: '55%',
          bgcolor: 'text.primary',
          animation: 'blink 1s step-end infinite',
          '@keyframes blink': { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0 } },
        }}
      />
    )}
  </Box>
);

// ── Separator ─────────────────────────────────────────────────────────────────
const Sep = () => (
  <Box sx={{ width: 8, height: 1, bgcolor: 'text.disabled', flexShrink: 0, alignSelf: 'center' }} />
);

// ── OtpInputField: label + boxes + helper text ────────────────────────────────
export interface OtpInputFieldProps {
  label: string;
  value: string;
  maxLength: number;
  pattern?: string;
  /** Insert a separator every N chars (e.g. 4 for Aadhaar groups) */
  groupBy?: number;
  onChange: (val: string) => void;
  onBlur?: () => void;
  error?: boolean;
  helperText?: React.ReactNode;
  disabled?: boolean;
  pasteTransformer?: (pasted: string) => string;
}

const OtpInputField: React.FC<OtpInputFieldProps> = ({
  label,
  value,
  maxLength,
  pattern,
  groupBy,
  onChange,
  onBlur,
  error = false,
  helperText,
  disabled = false,
  pasteTransformer,
}) => (
  <Box sx={{ position: 'relative' }}>
    <FormLabel
      error={error}
      sx={{
        fontSize: '0.75rem',
        display: 'block',
        mb: 0.5,
        color: error ? 'error.main' : 'text.secondary',
      }}
    >
      {label}
    </FormLabel>
    <OTPInput
      maxLength={maxLength}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      pattern={pattern}
      disabled={disabled}
      pasteTransformer={pasteTransformer}
      containerClassName=""
      render={({ slots }) => (
        <Box display="flex" gap={0.75} alignItems="center" flexWrap="nowrap">
          {slots.map((slot, i) => (
            <React.Fragment key={i}>
              <Slot {...slot} error={error} disabled={disabled} />
              {groupBy && i < maxLength - 1 && (i + 1) % groupBy === 0 && <Sep />}
            </React.Fragment>
          ))}
        </Box>
      )}
    />
    {helperText && (
      <FormHelperText error={error} sx={{ mx: '14px', mt: '3px' }}>
        {helperText}
      </FormHelperText>
    )}
  </Box>
);

export default OtpInputField;
