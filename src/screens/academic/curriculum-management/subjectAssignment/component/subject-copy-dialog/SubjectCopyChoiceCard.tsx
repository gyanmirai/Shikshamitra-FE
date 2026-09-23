import { Box, Radio, Paper, Typography } from '@mui/material';

type Props = {
  selected: boolean;
  label: string;
  description: string;
  badge?: string;
  onSelect: () => void;
};

export function SubjectCopyChoiceCard(props: Props) {
  const { selected, label, description, badge, onSelect } = props;

  return (
    <Paper
      component="label"
      variant="outlined"
      sx={{
        minHeight: 72,
        p: 1.5,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1,
        cursor: 'pointer',
        borderRadius: 2,
        borderColor: selected ? 'text.primary' : 'divider',
        bgcolor: selected ? 'action.selected' : 'background.paper',
        transition: (theme) => theme.transitions.create(['background-color', 'border-color']),
        '&:hover': { borderColor: 'text.secondary' },
        '&:focus-within': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 },
      }}
    >
      <Radio checked={selected} onChange={onSelect} size="small" sx={{ p: 0.25, mt: 0.125 }} />
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" fontWeight={600}>
          {label}
          {badge && (
            <Typography component="span" variant="caption" color="text.secondary">
              {' '}
              · {badge}
            </Typography>
          )}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.25 }}>
          {description}
        </Typography>
      </Box>
    </Paper>
  );
}
