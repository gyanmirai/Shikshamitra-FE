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
          if (event.key === 'Enter') event.preventDefault();
          if (event.key !== 'Escape' && event.key !== 'Tab') event.stopPropagation();
        }}
      />
    </ListSubheader>
  );
}

// MUI must skip the search control when moving focus between selectable rows.
SearchHeader.muiSkipListHighlight = true;
