import Box from '@mui/material/Box';

import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomizableTable from 'src/components/customizabaleTable';
import { FormSectionHeader } from 'src/components/form-section-card';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Stack, Button, Skeleton, Typography, DialogActions } from '@mui/material';

import type { PolicyImpactRow } from '../policyImpactModel';

interface Props {
  title: string;
  policyLabel: string;
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
  rows,
  loading,
  error,
  canRead,
  saved,
  onClose,
}: Props) {
  return (
    <CustomDialog
      open
      title={policyLabel}
      handleClose={onClose}
      maxWidth="md"
      hasForm={false}
      guardUnsavedChanges={false}
      paperProps={{ sx: { backgroundImage: 'none' } }}
    >
      <DialogScrollContent>
        <Stack spacing={2} sx={{ minWidth: 0 }}>
          {saved && <Label sx={{ alignSelf: 'flex-start' }}>Saved publication review</Label>}
          <Stack spacing={1}>
            <FormSectionHeader
              title="Fee Head Coverage"
              icon={GlobalIcons.assigned}
              titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
            />
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
                <Box>No fee heads have been added to this structure.</Box>
              )
            ) : loading ? (
              <Stack aria-label="Loading fee head impact" role="status" spacing={1}>
                <Skeleton height={40} />
                <Skeleton height={40} />
              </Stack>
            ) : (
              <Box>
                {!canRead
                  ? 'Policy details are unavailable with your current access.'
                  : error
                    ? 'Policy details could not be loaded. Close this dialog and retry.'
                    : 'Fee head details for this selected version are not available here.'}
              </Box>
            )}
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
