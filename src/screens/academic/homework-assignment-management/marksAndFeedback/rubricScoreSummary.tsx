import { Box, Paper, Stack, Divider, TextField, Typography } from '@mui/material';

type Props = {
  totalMarks: number;
  maxMarks: number;
  remarks: string;
  onRemarksChange: (remarks: string) => void;
  readOnly?: boolean;
  compact?: boolean;
};

export default function RubricScoreSummary({
  totalMarks,
  maxMarks,
  remarks,
  onRemarksChange,
  readOnly,
  compact,
}: Props) {
  return (
    <Paper
      component="section"
      aria-labelledby="rubric-score-summary"
      variant="outlined"
      sx={{ p: 2, borderRadius: 2, bgcolor: 'background.neutral' }}
    >
      <Stack spacing={1.5}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={0.5}
        >
          <Box>
            <Typography id="rubric-score-summary" component="h3" variant="subtitle2">
              Score summary
            </Typography>
            {!compact ? (
              <Typography variant="caption" color="text.secondary">
                Updates automatically as criteria are scored.
              </Typography>
            ) : null}
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontVariantNumeric: 'tabular-nums',
              color: compact ? 'primary.main' : 'text.primary',
            }}
          >
            {totalMarks}
            <Typography component="span" variant="body2" color="text.secondary">
              {' '}
              / {maxMarks}
            </Typography>
          </Typography>
        </Stack>

        <Divider />

        <TextField
          fullWidth
          size="small"
          label="Overall rubric feedback (optional)"
          value={remarks}
          onChange={(event) => onRemarksChange(event.target.value)}
          placeholder="Summarize the student's overall performance"
          multiline
          rows={3}
          disabled={readOnly}
          helperText={compact ? undefined : 'This note applies to the complete rubric assessment.'}
        />
      </Stack>
    </Paper>
  );
}
