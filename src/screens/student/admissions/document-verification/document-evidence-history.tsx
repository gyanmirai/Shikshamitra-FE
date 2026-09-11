import type { AdmissionDocumentEvidence } from 'src/redux/student/admissions/admission-document-types';

import { fDateTime } from 'src/utils/format-time';
import { Stack, Paper, Divider, Typography } from '@mui/material';

import { DocumentStatusLabel } from './document-status';
import { DocumentDownloadButton } from './document-download-button';

export function DocumentEvidenceHistory({
  evidence,
  allowDownload,
  studentId,
}: {
  evidence: AdmissionDocumentEvidence[];
  allowDownload: boolean;
  studentId?: string;
}) {
  return (
    <Stack spacing={1}>
      {[...evidence].reverse().map((version, index) => (
        <Paper key={version.id} variant="outlined" sx={{ p: 1.5 }}>
          <Stack spacing={0.75}>
            <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
              <Typography variant="subtitle2">
                Version {version.versionNumber}
                {index === 0 ? ' · Latest' : ''}
              </Typography>
              <DocumentStatusLabel status={version.status} />
            </Stack>
            <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
              {version.kind === 'waiver'
                ? 'Requirement waived'
                : version.fileName || 'Physical original recorded'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Recorded {fDateTime(version.submittedAt)}
            </Typography>
            {version.originalSeen && (
              <Typography variant="body2">
                Original sighted
                {version.originalSeenAt ? ` · ${fDateTime(version.originalSeenAt)}` : ''}
              </Typography>
            )}
            {version.notes && (
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
                {version.notes}
              </Typography>
            )}
            {version.canDownload && version.fileName && allowDownload && (
              <Stack direction="row">
                <DocumentDownloadButton
                  evidenceId={version.id}
                  fileName={version.fileName}
                  studentId={studentId}
                />
              </Stack>
            )}
            {version.reviews.map((review) => (
              <Stack key={review.id} spacing={0.5}>
                <Divider />
                <Typography variant="caption" color="text.secondary">
                  {review.decision === 'accepted' ? 'Accepted' : 'Replacement requested'} ·{' '}
                  {fDateTime(review.reviewedAt)}
                </Typography>
                {review.reason && (
                  <Typography
                    variant="body2"
                    sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}
                  >
                    {review.reason}
                  </Typography>
                )}
              </Stack>
            ))}
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
}
