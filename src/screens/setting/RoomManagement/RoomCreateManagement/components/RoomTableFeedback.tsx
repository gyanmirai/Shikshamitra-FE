import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

interface Props {
  error?: boolean;
  filtered?: boolean;
  busy?: boolean;
  onAction: () => void;
}

export default function RoomTableFeedback({ error, filtered, busy, onAction }: Props) {
  const title = error
    ? 'Rooms could not be loaded'
    : filtered
      ? 'No rooms match the selected filters'
      : 'No rooms have been added yet';
  return (
    <Box
      component={error ? 'div' : 'span'}
      role={error ? 'alert' : undefined}
      sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}
    >
      <Typography component="span" variant="subtitle1">
        {title}
      </Typography>
      {error || !filtered ? (
        <Typography component="span" variant="body2" color="text.secondary">
          {error ? 'Retry to load the room list.' : 'Use Add Room to create your first room.'}
        </Typography>
      ) : null}
      {(error || filtered) && (
        <Button size="small" variant="outlined" color="inherit" disabled={busy} onClick={onAction}>
          {error ? 'Retry' : 'Clear filters'}
        </Button>
      )}
    </Box>
  );
}
