import { useId } from 'react';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomizableTable from 'src/components/customizabaleTable';
import { FormSectionHeader } from 'src/components/form-section-card';
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
      title={`${title} impact`}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      handleClose={onClose}
      titleInfo="Review how this policy affects each fee head. Student eligibility and transactions are checked in their own workflows."
      maxWidth="md"
      hasForm={false}
      guardUnsavedChanges={false}
      paperProps={{ sx: { backgroundImage: 'none' } }}
    >
      <DialogScrollContent>
        <Stack spacing={2} sx={{ minWidth: 0 }}>
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
            <FormSectionHeader title="Fee head coverage" icon={GlobalIcons.assigned} />
            {rows ? (
              rows.length ? (
                <CustomizableTable
                  tableTitle="Policy fee head coverage"
                  tableId={`policy-impact-${title}`}
                  data={rows.map((row) => ({ ...row, _id: row.id }))}
                  showToolbar={false}
                  isPagination={rows.length > 10}
                  isSearch={false}
                  isFilter={false}
                  isShowedDense={false}
                  columns={[
                    {
                      id: 'name',
                      label: 'Fee head',
                      minWidth: 180,
                      isFilter: false,
                      isSort: false,
                      render: (value) => (
                        <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
                          {value}
                        </Typography>
                      ),
                    },
                    {
                      id: 'treatment',
                      label: 'Policy treatment',
                      minWidth: 160,
                      isFilter: false,
                      isSort: false,
                      render: (value) => (
                        <Label color={value === 'Excluded' ? 'default' : 'info'}>
                          {value === 'MonthlyCutoff'
                            ? 'Monthly cutoff'
                            : value === 'FullCharge'
                              ? 'Full charge'
                              : value}
                        </Label>
                      ),
                    },
                  ]}
                />
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
          <Stack spacing={0.75} sx={{ p: 1.5, bgcolor: 'background.neutral', borderRadius: 1 }}>
            <Typography variant="subtitle2">What this policy changes</Typography>
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
        <Button
          variant="outlined"
          size="small"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={onClose}
        >
          Close
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}
