import { TextField } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';

export function ScanField({
  value,
  onChange,
  onBlur,
  disabled,
  readOnly,
  error,
  name = 'accessionNumber',
}: {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  disabled: boolean;
  readOnly?: boolean;
  error?: string | false;
  name?: string;
}) {
  return (
    <ShakingTextField error={Boolean(error)}>
      <TextField
        label="Accession or scan token"
        name={name}
        required
        fullWidth
        size="small"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        onKeyDown={(event) => {
          if (event.key === 'Enter') event.preventDefault();
        }}
        disabled={disabled}
        error={Boolean(error)}
        InputProps={{ readOnly }}
        helperText={error || 'Scan the saved copy label, or enter its exact accession number.'}
      />
    </ShakingTextField>
  );
}
