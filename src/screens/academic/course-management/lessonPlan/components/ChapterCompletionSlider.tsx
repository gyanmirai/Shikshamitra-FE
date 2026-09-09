import { Label } from 'src/components/label';
import { Box, Stack, Alert, Button, Slider, Typography, LinearProgress } from '@mui/material';

type Props = {
  value: number;
  minimum: number;
  disabled?: boolean;
  loading?: boolean;
  error?: string;
  onRetry: () => void;
  onChange: (value: number) => void;
};

export function ChapterCompletionSlider({
  value,
  minimum,
  disabled,
  loading,
  error,
  onRetry,
  onChange,
}: Props) {
  const target = Math.min(100, Math.max(minimum, value));
  const marks = [minimum, ...(minimum < 50 ? [50] : []), 100].map((percentage) => ({
    value: percentage,
    label: `${percentage}%`,
  }));
  return (
    <Box
      sx={{
        flex: 1,
        width: '100%',
        p: 1.5,
        borderRadius: 1.5,
        bgcolor: 'background.neutral',
        border: 1,
        borderColor: 'divider',
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="body2" color="text.secondary" fontWeight={600}>
          Target Chapter Completion
        </Typography>
        <Label color="primary" variant="soft">
          {target}%
        </Label>
      </Stack>
      {loading && <LinearProgress aria-label="Loading recorded chapter progress" sx={{ my: 1 }} />}
      {error && (
        <Alert severity="error" action={<Button onClick={onRetry}>Retry</Button>}>
          {error}
        </Alert>
      )}
      {minimum === 100 ? (
        <LinearProgress
          variant="determinate"
          value={100}
          aria-label="Chapter completed"
          sx={{ my: 2 }}
        />
      ) : (
        <Slider
          aria-label="Target Chapter Completion"
          aria-describedby="chapter-completion-guidance"
          min={minimum}
          max={100}
          step={5}
          size="small"
          value={target}
          disabled={disabled || loading || !!error}
          onChange={(_, next) => onChange(Math.max(minimum, next as number))}
          valueLabelDisplay="auto"
          marks={marks}
          sx={{ mt: 1 }}
        />
      )}
      <Typography id="chapter-completion-guidance" variant="caption" color="text.secondary">
        {minimum > 0
          ? `Recorded chapter progress: ${minimum}%. The target cannot be lower.`
          : 'Percentage of this chapter to complete by the end of the lesson.'}
      </Typography>
    </Box>
  );
}
