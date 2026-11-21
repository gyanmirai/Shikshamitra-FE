import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Stack, Button, TextField, IconButton, Typography } from '@mui/material';

type PrintInstructionsListEditorProps = {
  value?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
};

export function PrintInstructionsListEditor({
  value,
  disabled = false,
  onChange,
}: PrintInstructionsListEditorProps) {
  const items = value === undefined ? [''] : value.split(/\r?\n/);
  return (
    <Stack spacing={1}>
      <Typography variant="caption" color="text.secondary">
        Add each instruction separately. They print as a bulleted list.
      </Typography>
      {items.map((item, index) => {
        const otherCharacters = items.reduce(
          (total, current, itemIndex) => total + (itemIndex === index ? 0 : current.length),
          0
        );
        const maxLength = Math.max(0, 2000 - otherCharacters - Math.max(0, items.length - 1));
        return (
          <Stack key={index} direction="row" spacing={1} alignItems="center">
            <TextField
              fullWidth
              size="small"
              label={`Instruction ${index + 1}`}
              value={item}
              disabled={disabled}
              slotProps={{ htmlInput: { maxLength } }}
              onChange={(event) =>
                onChange(
                  items
                    .map((entry, itemIndex) => (itemIndex === index ? event.target.value : entry))
                    .join('\n')
                )
              }
            />
            <IconButton
              type="button"
              size="small"
              aria-label={`Remove instruction ${index + 1}`}
              disabled={disabled}
              onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index).join('\n'))}
            >
              <Iconify icon={GlobalIcons.delete} />
            </IconButton>
          </Stack>
        );
      })}
      <Button
        type="button"
        size="small"
        variant="outlined"
        startIcon={<Iconify icon={GlobalIcons.addIcon} />}
        sx={{ alignSelf: 'flex-start' }}
        disabled={disabled || items.at(-1) === '' || items.join('\n').length >= 2000}
        onClick={() => onChange([...items, ''].join('\n'))}
      >
        Add instruction
      </Button>
    </Stack>
  );
}
