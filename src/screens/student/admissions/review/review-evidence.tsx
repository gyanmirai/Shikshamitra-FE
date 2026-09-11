import type { ReviewEvidence as Evidence } from 'src/redux/student/admissions/admission-review-types';

import { Chip, Stack, Typography } from '@mui/material';

export function ReviewEvidence({ items }: { items: Evidence[] }) {
  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2">Evidence for this review</Typography>
      {!items.length && (
        <Typography variant="body2" color="text.secondary">
          No prior stage requirements were configured.
        </Typography>
      )}
      {items.map((item) => (
        <Stack
          key={`${item.kind}:${item.sourceStageCode}`}
          spacing={0.5}
          sx={{
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            p: 1.5,
            overflowWrap: 'anywhere',
          }}
        >
          <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
            <Typography variant="subtitle2">
              {item.sourceStageName || item.sourceStageCode}
            </Typography>
            <Chip
              size="small"
              color={item.isStale ? 'warning' : item.passed ? 'success' : 'default'}
              label={
                item.isStale
                  ? 'Changed · recheck needed'
                  : item.passed
                    ? 'Requirement met'
                    : 'Needs attention'
              }
            />
          </Stack>
          <Typography variant="body2">{item.summary}</Typography>
        </Stack>
      ))}
    </Stack>
  );
}
