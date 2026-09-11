import { useId } from 'react';
import { Label } from 'src/components/label';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Box, Stack, Alert, Button, Skeleton, Typography, DialogActions } from '@mui/material';

import type { PolicyImpactRow } from '../policyImpactModel';

interface Props {
  title: string;
  policyLabel: string;
  description: string;
  summary: string;
  rows?: PolicyImpactRow[];
  loading: boolean;
  error: boolean;
  canRead: boolean;
  saved: boolean;
  onClose: () => void;
}

export default function PolicyImpactDialog({
  title,
  policyLabel,
  description,
  summary,
  rows,
  loading,
  error,
  canRead,
  saved,
  onClose,
}: Props) {
  const descriptionId = useId();
  const titleId = useId();
  return (
    <CustomDialog
      open
      title={<span id={titleId}>{title} impact</span>}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      handleClose={onClose}
      maxWidth="sm"
      hasForm={false}
      guardUnsavedChanges={false}
      paperProps={{ sx: { backgroundImage: 'none' } }}
    >
      <DialogScrollContent>
        <Stack spacing={2.5} sx={{ minWidth: 0 }}>
          <Stack spacing={1}>
            <Typography variant="subtitle1" sx={{ overflowWrap: 'anywhere' }}>
              {policyLabel}
            </Typography>
            {saved && (
              <Box>
                <Label>Saved publication review</Label>
              </Box>
            )}
            <Typography id={descriptionId} variant="body2" color="text.secondary">
              {description}
            </Typography>
          </Stack>
          <Stack spacing={1}>
            <Typography variant="subtitle2">Fee head impact</Typography>
            {rows ? (
              rows.length ? (
                <Stack component="ul" spacing={0} sx={{ m: 0, p: 0, listStyle: 'none' }}>
                  {rows.map((row) => (
                    <Stack
                      component="li"
                      key={row.id}
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={0.5}
                      sx={{ py: 1.25, borderBottom: 1, borderColor: 'divider', minWidth: 0 }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ flex: 1, fontWeight: 600, overflowWrap: 'anywhere' }}
                      >
                        {row.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ flex: 1, overflowWrap: 'anywhere' }}
                      >
                        {row.treatment === 'MonthlyCutoff'
                          ? 'Monthly cutoff'
                          : row.treatment === 'FullCharge'
                            ? 'Full charge'
                            : row.treatment}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              ) : (
                <Alert severity="info">No fee heads have been added to this structure.</Alert>
              )
            ) : loading ? (
              <Stack aria-label="Loading fee head impact" role="status" spacing={1}>
                <Skeleton height={40} />
                <Skeleton height={40} />
              </Stack>
            ) : (
              <Alert severity={error ? 'warning' : 'info'}>
                {!canRead
                  ? 'Policy details are unavailable with your current access.'
                  : error
                    ? 'Policy details could not be loaded. Close this dialog and refresh the policy list.'
                    : 'Fee head details for this selected version are not available here. The selected version is unchanged; use the configuration review to check its coverage.'}
              </Alert>
            )}
          </Stack>
          <Stack spacing={0.75}>
            <Typography variant="subtitle2">Impact summary</Typography>
            <Typography variant="body2" color="text.secondary">
              {summary}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              This shows configuration only. Student eligibility and transactions are checked in
              their own workflows.
            </Typography>
          </Stack>
        </Stack>
      </DialogScrollContent>
      <DialogActions>
        <Button variant="outlined" size="small" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}
