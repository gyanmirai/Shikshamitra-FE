import { Fragment } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { Label } from 'src/components/label';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineItem from '@mui/lab/TimelineItem';
import Typography from '@mui/material/Typography';
import { fDateTime } from 'src/utils/format-time';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineSeparator from '@mui/lab/TimelineSeparator';

import { IDENTITY_KINDS } from '../types';

import type { IdentityContext, IdentityRevision } from '../types';

const ASSET_LABELS = {
  logo: 'School logo',
  banner: 'Letterhead',
  signature: 'Principal’s signature',
};

export function IdentityHistoryItem({
  revision,
  context,
  latest,
  last,
}: {
  revision: IdentityRevision;
  context: IdentityContext;
  latest: boolean;
  last: boolean;
}) {
  const validTime = Number.isFinite(Date.parse(revision.creationTime));
  const choices = IDENTITY_KINDS.filter((kind) => revision.choices[kind] != null);
  return (
    <TimelineItem>
      <TimelineSeparator>
        <TimelineDot
          variant={latest ? 'filled' : 'outlined'}
          color={latest ? 'primary' : 'grey'}
          sx={{ mt: 0.75, mb: 1, boxShadow: 'none' }}
        />
        {!last && <TimelineConnector sx={{ bgcolor: 'divider' }} />}
      </TimelineSeparator>
      <TimelineContent sx={{ pt: 0, pr: 0, pl: 1.5, pb: last ? 0 : 3, minWidth: 0 }}>
        <Stack spacing={1.25}>
          <Stack spacing={0.5}>
            <Stack direction="row" alignItems="center" flexWrap="wrap" useFlexGap gap={1}>
              <Typography
                component="time"
                dateTime={validTime ? revision.creationTime : undefined}
                variant="caption"
                color="text.secondary"
              >
                {validTime
                  ? fDateTime(revision.creationTime, 'DD MMM YYYY [at] h:mm:ss a')
                  : 'Time not recorded'}
              </Typography>
              {latest && <Label color="primary">Latest</Label>}
            </Stack>
            <Typography component="h3" variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
              {revision.reason?.trim() || 'School identity updated'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
              Changed by{' '}
              <Box component="span" sx={{ color: 'text.primary', fontWeight: 500 }}>
                {revision.creatorName?.trim() || revision.creatorId || 'Unknown user'}
              </Box>
            </Typography>
          </Stack>
          {choices.length ? (
            <Box
              component="dl"
              aria-label="Saved asset choices"
              sx={{
                m: 0,
                p: 1.5,
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
                columnGap: 1.5,
                rowGap: 1,
                bgcolor: 'background.neutral',
                borderRadius: 1,
              }}
            >
              {choices.map((kind) => {
                const { mode } = revision.choices[kind]!;
                return (
                  <Fragment key={kind}>
                    <Typography component="dt" variant="body2" color="text.secondary">
                      {ASSET_LABELS[kind]}
                    </Typography>
                    <Typography component="dd" variant="body2" fontWeight={600} sx={{ m: 0 }}>
                      {mode === 1
                        ? 'Custom asset'
                        : mode === 2
                          ? 'Do not display'
                          : context.boardId
                            ? 'Inherited'
                            : 'No image configured'}
                    </Typography>
                  </Fragment>
                );
              })}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No asset choices recorded.
            </Typography>
          )}
        </Stack>
      </TimelineContent>
    </TimelineItem>
  );
}
