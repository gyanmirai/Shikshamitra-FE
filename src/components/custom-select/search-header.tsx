import TextField from '@mui/material/TextField';
import ListSubheader from '@mui/material/ListSubheader';

type Props = {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
};

export function SearchHeader({ label, placeholder, value, onChange }: Props) {
  return (
    <ListSubheader
      role="presentation"
      disableGutters
      sx={{ px: 1, py: 0.5, display: 'flex', lineHeight: 'normal' }}
    >
      <TextField
        autoFocus
        fullWidth
        size="small"
        placeholder={
          placeholder ?? (label ? `Search ${label.toLocaleLowerCase()}` : 'Search options')
        }
        inputProps={{ 'aria-label': `Search ${label || 'options'}` }}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            event.stopPropagation();
            const choices = event.currentTarget
              .closest('[role="listbox"]')
              ?.querySelectorAll<HTMLElement>(
                '[role="option"][data-value]:not([aria-disabled="true"])'
              );
            const choice = event.key === 'ArrowDown' ? choices?.[0] : choices?.[choices.length - 1];
            choice?.focus();
            return;
          }
          if (event.key === 'Enter') event.preventDefault();
          if (event.key !== 'Escape' && event.key !== 'Tab') event.stopPropagation();
        }}
      />
    </ListSubheader>
  );
}

// MUI must skip the search control when moving focus between selectable rows.
SearchHeader.muiSkipListHighlight = true;
