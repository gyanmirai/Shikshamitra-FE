import TextField from '@mui/material/TextField';
import ShakingTextField from 'src/components/shaking-text-field';

type Props = {
  id: string;
  unit: 'Step' | 'Section';
  name: string;
  nameError?: string;
  onNameBlur?: () => void;
  onNameChange: (value: string) => void;
  onDone: () => void;
};

// Edit the title in its heading position; internal identifiers and saved rules stay untouched.
export function FormBuilderUnitSettings({
  id,
  unit,
  name,
  nameError,
  onNameBlur,
  onNameChange,
  onDone,
}: Props) {
  return (
    <ShakingTextField error={Boolean(nameError)} sx={{ flex: 1, minWidth: 0 }}>
      <TextField
        id={id}
        fullWidth
        size="small"
        autoFocus
        value={name}
        error={Boolean(nameError)}
        helperText={nameError}
        slotProps={{ htmlInput: { 'aria-label': `${unit} heading` } }}
        onBlur={onNameBlur}
        onChange={(event) => onNameChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            onNameBlur?.();
            if (name.trim()) onDone();
          }
        }}
      />
    </ShakingTextField>
  );
}
