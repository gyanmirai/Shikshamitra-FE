import CustomSelect from 'src/components/custom-select';
import { Stack, Alert, Button, TextField, Typography } from '@mui/material';

export type RollAssignmentMode = 'manual' | 'automatic';
export type SchoolRollAssignmentMode = RollAssignmentMode | 'both';

export default function RollAssignmentControl({
  schoolMode,
  mode,
  number,
  proposal,
  disabled,
  error,
  numberError,
  onModeChange,
  onNumberChange,
}: {
  schoolMode?: SchoolRollAssignmentMode;
  mode?: RollAssignmentMode;
  number?: number | null;
  proposal?: number | null;
  disabled: boolean;
  error?: string;
  numberError?: string;
  onModeChange: (mode: RollAssignmentMode) => void;
  onNumberChange: (number: number | null) => void;
}) {
  const mismatch = Boolean(schoolMode && schoolMode !== 'both' && mode && mode !== schoolMode);
  const automatic = (mode ?? (schoolMode === 'automatic' ? 'automatic' : 'manual')) === 'automatic';
  return (
    <Stack spacing={1.5}>
      {!schoolMode ? (
        <Typography variant="body2">
          Choose a target academic year to load school numbering rules.
        </Typography>
      ) : (
        <>
          <Typography variant="body2">
            School numbering:{' '}
            {schoolMode === 'both'
              ? 'Manual or automatic'
              : schoolMode === 'automatic'
                ? 'Automatic'
                : 'Manual'}
            .
          </Typography>
          {mismatch ? (
            <Alert
              severity="warning"
              action={
                <Button
                  disabled={disabled}
                  onClick={() => onModeChange(schoolMode as RollAssignmentMode)}
                >
                  Use school numbering
                </Button>
              }
            >
              School numbering rules changed. Review the assignment method and preview again.
            </Alert>
          ) : (
            <>
              {schoolMode === 'both' && (
                <CustomSelect
                  label="Roll number assignment"
                  value={mode ?? ''}
                  required
                  error={Boolean(error)}
                  helperText={error}
                  options={[
                    { value: 'manual', label: 'Manual — enter a roll number' },
                    { value: 'automatic', label: 'Automatic — use school numbering' },
                  ]}
                  onChange={(value) => onModeChange(value as RollAssignmentMode)}
                  disabled={disabled}
                />
              )}
              {schoolMode === 'both' && !mode ? (
                <Typography variant="body2">
                  Choose manual or automatic numbering before previewing.
                </Typography>
              ) : automatic ? (
                <TextField
                  fullWidth
                  label="Proposed roll number"
                  value={proposal ?? ''}
                  slotProps={{ input: { readOnly: true } }}
                  helperText="Preview to review the proposed number. It is checked again when you submit."
                />
              ) : (
                <TextField
                  fullWidth
                  type="number"
                  label="Target roll number"
                  required
                  error={Boolean(numberError)}
                  helperText={numberError}
                  value={number ?? ''}
                  disabled={disabled}
                  onChange={(event) =>
                    onNumberChange(event.target.value ? Number(event.target.value) : null)
                  }
                  inputProps={{ min: 1 }}
                />
              )}
            </>
          )}
        </>
      )}
    </Stack>
  );
}
