import { varAlpha } from 'src/theme/styles';
import { Box, Paper, Checkbox, Typography } from '@mui/material';

/** One native label owns the entire hit area; only the checkbox changes the draft. */
export function AcademicPermissionCard({
  name,
  detail,
  checked,
  disabled = false,
  onChange,
}: {
  name: string;
  detail?: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <Paper
      component="label"
      variant="outlined"
      sx={{
        display: 'flex',
        alignItems: 'center',
        height: '100%',
        px: 1.5,
        py: 1,
        borderRadius: 1.5,
        borderColor: checked ? 'primary.main' : 'divider',
        bgcolor: (theme) =>
          checked ? varAlpha(theme.vars.palette.primary.mainChannel, 0.08) : 'background.paper',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.48 : 1,
        '&:focus-within': {
          outline: '2px solid',
          outlineColor: 'primary.main',
          outlineOffset: 2,
        },
        ...(!disabled && { '&:hover': { borderColor: 'primary.main' } }),
      }}
    >
      <Checkbox
        size="small"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !disabled) {
            event.preventDefault();
            if (!event.repeat) onChange(!checked);
          }
        }}
      />
      <Box component="span" sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
        <Typography
          component="span"
          display="block"
          variant="body2"
          fontWeight={checked ? 600 : 400}
        >
          {name}
        </Typography>
        {detail && (
          <Typography component="span" display="block" variant="caption" color="text.secondary">
            {detail}
          </Typography>
        )}
      </Box>
    </Paper>
  );
}
