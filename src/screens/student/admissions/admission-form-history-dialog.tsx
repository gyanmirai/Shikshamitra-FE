import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { LoadingButton } from '@mui/lab';
import { useState, useEffect } from 'react';
import { Iconify } from 'src/components/iconify';
import { fDateTime } from 'src/utils/format-time';
import CustomSelect from 'src/components/custom-select';
import { StudentFeedback } from 'src/components/student-feedback';
import { FormSectionCard } from 'src/components/form-section-card';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  List,
  Stack,
  Button,
  Skeleton,
  ListItem,
  Typography,
  ListItemText,
  DialogActions,
} from '@mui/material';
import {
  useGetAdmissionFormAuditQuery,
  useGetAdmissionFormVersionsQuery,
  useLazyCompareAdmissionFormVersionsQuery,
} from 'src/redux/student/admissions/admission-forms-api';

type Props = {
  form: AdmissionForm | null;
  canRestore: boolean;
  onClose: () => void;
  onRestoreVersion: (id: string) => Promise<unknown>;
};

export function AdmissionFormHistoryDialog({ form, canRestore, onClose, onRestoreVersion }: Props) {
  const audit = useGetAdmissionFormAuditQuery(form?.id ?? '', { skip: !form });
  const versions = useGetAdmissionFormVersionsQuery(form?.id ?? '', { skip: !form });
  const [compare, comparison] = useLazyCompareAdmissionFormVersionsQuery();
  const [selectedVersion, setSelectedVersion] = useState('');
  const [restoring, setRestoring] = useState(false);
  const [restoreError, setRestoreError] = useState<string | null>(null);

  useEffect(() => {
    setSelectedVersion('');
    setRestoreError(null);
  }, [form?.id]);

  const restoreVersion = async () => {
    if (!canRestore || !selectedVersion || restoring) return;
    setRestoring(true);
    setRestoreError(null);
    try {
      const restored = await onRestoreVersion(selectedVersion);
      if (restored === false) {
        setRestoreError('Unable to restore this version. Please try again.');
      }
    } catch (error) {
      setRestoreError(
        parseApiProblemDetail(error).detail || 'Unable to restore this version. Please try again.'
      );
    } finally {
      setRestoring(false);
    }
  };

  const versionsLoading = versions.isLoading || (versions.isFetching && !versions.currentData);
  const auditLoading = audit.isLoading || (audit.isFetching && !audit.currentData);
  const comparableVersions = (versions.currentData ?? []).filter(
    (version) => version.id !== form?.id
  );
  const comparisonMatchesSelection =
    comparison.originalArgs?.id === form?.id &&
    comparison.originalArgs?.otherId === selectedVersion;
  return (
    <CustomDialog
      open={Boolean(form)}
      handleClose={onClose}
      title={`History & Versions · ${form?.name ?? ''}`}
      titleInfo="Compare form versions and review their history. Restoring creates a new draft; saved inquiries and applications keep their original versions."
      hasForm={false}
      guardUnsavedChanges={false}
      disableClose={restoring}
      maxWidth="md"
      paperProps={{ sx: { '& .MuiTypography-h6': { overflowWrap: 'anywhere' } } }}
    >
      <DialogScrollContent sx={{ bgcolor: 'background.neutral' }}>
        <Stack spacing={2}>
          <FormSectionCard
            icon="mdi:compare"
            title="Compare Versions"
            description={
              canRestore
                ? 'Review structural changes or restore an older version as a new editable draft.'
                : 'Review structural changes between saved versions.'
            }
          >
            {versionsLoading ? (
              <Skeleton variant="rounded" height={40} aria-label="Loading Form Versions" />
            ) : versions.isError ? (
              <StudentFeedback
                notificationKey="STU-0062"
                presentation="toast"
                severity="error"
                toastAction={
                  <Button size="small" onClick={() => versions.refetch()}>
                    Retry
                  </Button>
                }
              >
                Unable to load form versions. Please try again.
              </StudentFeedback>
            ) : comparableVersions.length ? (
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                alignItems={{ sm: 'center' }}
              >
                <CustomSelect
                  label="Compare With"
                  value={selectedVersion}
                  options={comparableVersions.map((version) => ({
                    value: version.id,
                    label: `Version ${version.version}`,
                  }))}
                  onChange={(value) => setSelectedVersion(String(value))}
                  size="small"
                  disabled={restoring}
                  sx={{ flex: 1, minWidth: 0 }}
                />
                <LoadingButton
                  variant="outlined"
                  size="small"
                  startIcon={<Iconify icon="mdi:compare" />}
                  loading={comparisonMatchesSelection && comparison.isFetching}
                  disabled={!selectedVersion || comparison.isFetching || restoring}
                  onClick={() =>
                    form &&
                    compare(
                      { id: form.id, otherId: selectedVersion },
                      !(comparisonMatchesSelection && comparison.isError)
                    )
                  }
                  sx={{
                    alignSelf: { xs: 'flex-start', sm: 'auto' },
                    flexShrink: 0,
                    whiteSpace: 'nowrap',
                  }}
                >
                  Compare
                </LoadingButton>
                {canRestore && (
                  <LoadingButton
                    variant="outlined"
                    size="small"
                    startIcon={<Iconify icon="mdi:restore" />}
                    disabled={!selectedVersion || comparison.isFetching}
                    loading={restoring}
                    onClick={restoreVersion}
                    sx={{
                      alignSelf: { xs: 'flex-start', sm: 'auto' },
                      flexShrink: 0,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Restore as New Draft
                  </LoadingButton>
                )}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No other versions are available yet.
              </Typography>
            )}
            {restoreError && (
              <StudentFeedback
                notificationKey="STU-0063"
                presentation="persistent"
                severity="error"
              >
                {restoreError}
              </StudentFeedback>
            )}
            {comparisonMatchesSelection && comparison.isError && (
              <StudentFeedback notificationKey="STU-0064" presentation="toast" severity="error">
                Unable to compare these versions. Select Compare to try again.
              </StudentFeedback>
            )}
            {comparisonMatchesSelection &&
              !comparison.isFetching &&
              !comparison.isError &&
              comparison.data &&
              (comparison.data.changes.length ? (
                <List dense disablePadding>
                  {comparison.data.changes.map((change, index) => (
                    <ListItem key={`${index}:${change}`} disableGutters>
                      <ListItemText primary={change} />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No structural changes between these versions.
                </Typography>
              ))}
          </FormSectionCard>
          <FormSectionCard icon="mdi:history" title="Activity">
            {auditLoading ? (
              <Stack spacing={1} aria-label="Loading Form Activity">
                <Skeleton variant="rounded" height={48} />
                <Skeleton variant="rounded" height={48} />
                <Skeleton variant="rounded" height={48} />
              </Stack>
            ) : audit.isError ? (
              <StudentFeedback
                notificationKey="STU-0065"
                presentation="toast"
                severity="error"
                toastAction={
                  <Button size="small" onClick={() => audit.refetch()}>
                    Retry
                  </Button>
                }
              >
                Unable to load form activity. Please try again.
              </StudentFeedback>
            ) : audit.currentData?.length ? (
              <List dense disablePadding>
                {audit.currentData.map((entry) => (
                  <ListItem key={entry.id} disableGutters divider sx={{ overflowWrap: 'anywhere' }}>
                    <ListItemText
                      primary={entry.action.replace(/([a-z])([A-Z])/g, '$1 $2')}
                      primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                      secondary={`${fDateTime(entry.occurredAt)} · version ${entry.version}${entry.comment ? ` · ${entry.comment}` : ''}`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No recorded form activity is available.
              </Typography>
            )}
          </FormSectionCard>
        </Stack>
      </DialogScrollContent>
      <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<Iconify icon="mdi:close" />}
          disabled={restoring}
          onClick={onClose}
        >
          Close
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}
