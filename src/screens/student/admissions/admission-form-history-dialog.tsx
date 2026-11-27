import type {
  AdmissionForm,
  AdmissionFormVersionSummary,
} from 'src/redux/student/admissions/admission-forms-api';

import { useState, useEffect } from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { fDateTime } from 'src/utils/format-time';
import CustomSelect from 'src/components/custom-select';
import { StudentFeedback } from 'src/components/student-feedback';
import { FormSectionCard } from 'src/components/form-section-card';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  Box,
  List,
  Stack,
  Alert,
  Button,
  Divider,
  Skeleton,
  ListItem,
  TextField,
  Typography,
  InputAdornment,
} from '@mui/material';
import {
  useGetAdmissionFormAuditQuery,
  useGetAdmissionFormVersionsQuery,
  useLazyCompareAdmissionFormVersionsQuery,
} from 'src/redux/student/admissions/admission-forms-api';

import { ADMISSION_DATE_TIME_FORMAT } from './admission-date-formats';
import { AdmissionFormComparisonResults } from './admission-form-comparison-results';

type Props = {
  form: AdmissionForm | null;
  canRestore: boolean;
  onClose: () => void;
  onRestoreVersion: (id: string) => Promise<unknown>;
  onOpenExistingDraft: (id: string) => void;
};

const restoreErrorMessage = 'Unable to restore this version. Please try again.';

const versionStatuses = [
  { name: 'Draft', color: 'default' },
  { name: 'Published', color: 'success' },
  { name: 'Archived', color: 'error' },
] as const;

function VersionStatus({ status }: { status: AdmissionFormVersionSummary['status'] }) {
  const item = versionStatuses[status];
  return item && <Label color={item.color}>{item.name}</Label>;
}

function readExistingDraftId(error: unknown) {
  type DraftData = { DraftId?: unknown; draftId?: unknown };
  type ErrorBody = { data?: DraftData; error?: { data?: DraftData } };
  const value = error as { data?: ErrorBody; response?: { data?: ErrorBody } } | null;
  const body = value?.response?.data ?? value?.data;
  const data = body?.error?.data ?? body?.data;
  const id = data?.DraftId ?? data?.draftId;
  return typeof id === 'string' && id.trim() ? id : undefined;
}

export function AdmissionFormHistoryDialog({
  form,
  canRestore,
  onClose,
  onRestoreVersion,
  onOpenExistingDraft,
}: Props) {
  const audit = useGetAdmissionFormAuditQuery(form?.id ?? '', { skip: !form });
  const versions = useGetAdmissionFormVersionsQuery(form?.id ?? '', {
    skip: !form,
    refetchOnMountOrArgChange: true,
  });
  const [compare, comparison] = useLazyCompareAdmissionFormVersionsQuery();
  const [selectedVersion, setSelectedVersion] = useState('');
  const [restoring, setRestoring] = useState(false);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [draftConflict, setDraftConflict] = useState<{ id?: string } | null>(null);
  const familyVersions = versions.currentData ?? [];
  const knownDraft =
    !versions.isFetching && !versions.isError
      ? familyVersions.find((version) => version.status === 0)
      : undefined;
  const existingDraftId = draftConflict?.id ?? knownDraft?.id;
  const existingVersion = familyVersions.find((version) => version.id === existingDraftId)?.version;
  const hasExistingDraft = canRestore && Boolean(draftConflict || knownDraft);

  useEffect(() => {
    setSelectedVersion('');
    setRestoreError(null);
    setDraftConflict(null);
  }, [form?.id]);

  const restoreVersion = async () => {
    if (!canRestore || !selectedVersion || restoring || hasExistingDraft || versions.isFetching)
      return;
    setRestoring(true);
    setRestoreError(null);
    try {
      const restored = await onRestoreVersion(selectedVersion);
      if (restored === false) {
        setRestoreError(restoreErrorMessage);
      }
    } catch (error) {
      const problem = parseApiProblemDetail(error);
      if (problem.errorCode === 'Admissions.FormDraftAlreadyExists')
        setDraftConflict({ id: readExistingDraftId(error) });
      else setRestoreError(problem.detail || restoreErrorMessage);
    } finally {
      setRestoring(false);
    }
  };

  const versionsLoading = versions.isLoading || (versions.isFetching && !versions.currentData);
  const auditLoading = audit.isLoading || (audit.isFetching && !audit.currentData);
  const auditEntries = audit.currentData ?? [];
  const comparableVersions = familyVersions.filter((version) => version.id !== form?.id);
  const selected = comparableVersions.find((version) => version.id === selectedVersion);
  const compareToCurrent =
    form &&
    (selected
      ? selected.version < form.version
      : comparableVersions.some((version) => version.version < form.version));
  const comparisonArgs =
    form && selected
      ? {
          id: compareToCurrent ? selected.id : form.id,
          otherId: compareToCurrent ? form.id : selected.id,
        }
      : undefined;
  const comparisonMatchesSelection =
    Boolean(comparisonArgs) &&
    comparison.originalArgs?.id === comparisonArgs?.id &&
    comparison.originalArgs?.otherId === comparisonArgs?.otherId;
  const isComparing = comparisonMatchesSelection && comparison.isFetching;
  const displayComparison =
    comparisonMatchesSelection &&
    comparison.data?.fromId === comparisonArgs?.id &&
    comparison.data?.toId === comparisonArgs?.otherId
      ? comparison.data
      : undefined;

  const versionSelector = (
    <CustomSelect
      key="select"
      label={compareToCurrent ? 'From' : 'To'}
      value={selected?.id ?? ''}
      options={comparableVersions.map((version) => ({
        value: version.id,
        label: `Version ${version.version}`,
        status: versionStatuses[version.status]?.name ?? '',
      }))}
      optionEndLabelKey="status"
      renderValue={() =>
        selected && (
          <Stack direction="row" gap={1} alignItems="center">
            Version {selected.version}
            <VersionStatus status={selected.status} />
          </Stack>
        )
      }
      onChange={(value) => setSelectedVersion(String(value))}
      size="small"
      disabled={restoring}
    />
  );
  const currentVersion = form && (
    <TextField
      key="current"
      size="small"
      fullWidth
      label={compareToCurrent ? 'To' : 'From'}
      value={`Version ${form.version}`}
      slotProps={{
        input: {
          readOnly: true,
          endAdornment: (
            <InputAdornment position="end">
              <VersionStatus
                status={
                  familyVersions.find((version) => version.id === form.id)?.status ?? form.status
                }
              />
            </InputAdornment>
          ),
        },
      }}
      sx={{ minWidth: 0, '& .MuiInputBase-root': { minHeight: 40 } }}
    />
  );
  const direction = (
    <Box key="direction" sx={{ display: { xs: 'none', sm: 'flex' }, color: 'text.secondary' }}>
      <Iconify icon="mdi:arrow-right" width={18} aria-hidden />
    </Box>
  );
  return (
    <CustomDialog
      open={Boolean(form)}
      handleClose={onClose}
      title={`History & Versions · ${form?.name ?? ''}`}
      titleInfo="Compare form versions and review their history. Restoring creates a new draft; saved inquiries and applications keep their original versions."
      titleInfoPlacement="right"
      hasForm={false}
      guardUnsavedChanges={false}
      disableClose={restoring}
      closeOnBackdropClick
      maxWidth="md"
      paperProps={{ sx: { '& .MuiTypography-h6': { overflowWrap: 'anywhere' } } }}
    >
      <DialogScrollContent scrollBarProps={{ sx: { bgcolor: 'background.neutral' } }}>
        <Stack spacing={2}>
          <FormSectionCard icon="mdi:compare" title="Compare versions">
            {versionsLoading ? (
              <Skeleton variant="rounded" height={40} aria-label="Loading Form Versions" />
            ) : versions.isError ? (
              <>
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
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Iconify icon="mdi:refresh" />}
                  onClick={() => versions.refetch()}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  Retry loading versions
                </Button>
              </>
            ) : comparableVersions.length ? (
              <Stack spacing={1}>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: 'minmax(0, 1fr)',
                      sm: 'minmax(0, 1fr) auto minmax(0, 1fr) auto',
                    },
                    gap: 1.5,
                    alignItems: 'center',
                  }}
                >
                  {compareToCurrent
                    ? [versionSelector, direction, currentVersion]
                    : [currentVersion, direction, versionSelector]}
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Iconify icon="mdi:compare" />}
                    loading={isComparing}
                    disabled={!comparisonArgs || comparison.isFetching || restoring}
                    sx={{ whiteSpace: 'nowrap' }}
                    onClick={() =>
                      comparisonArgs &&
                      compare(comparisonArgs, !(comparisonMatchesSelection && comparison.isError))
                    }
                  >
                    Compare
                  </Button>
                </Box>
                {canRestore && !hasExistingDraft && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Iconify icon="mdi:restore" />}
                    disabled={!selected || comparison.isFetching || versions.isFetching}
                    loading={restoring}
                    onClick={restoreVersion}
                    sx={{ alignSelf: { xs: 'flex-start', sm: 'flex-end' } }}
                  >
                    Restore as New Draft
                  </Button>
                )}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No other versions are available yet.
              </Typography>
            )}
            {hasExistingDraft && (
              <Alert
                severity="info"
                variant="outlined"
                sx={{
                  alignItems: 'center',
                  bgcolor: 'background.paper',
                  borderColor: 'divider',
                  color: 'text.primary',
                  '& .MuiAlert-icon': { color: 'text.secondary' },
                  '& .MuiAlert-message': { flex: 1, minWidth: 0 },
                }}
              >
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  gap={1}
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  justifyContent="space-between"
                >
                  <Typography variant="body2">
                    {existingVersion
                      ? `Version ${existingVersion} is already a draft.`
                      : existingDraftId
                        ? 'A draft already exists for this form.'
                        : 'A draft already exists for this form. Refresh versions to find it.'}
                  </Typography>
                  {existingDraftId ? (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Iconify icon="mdi:pencil-outline" />}
                      onClick={() => onOpenExistingDraft(existingDraftId)}
                    >
                      Open existing draft
                    </Button>
                  ) : (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Iconify icon="mdi:refresh" />}
                      loading={versions.isFetching}
                      onClick={() => versions.refetch()}
                    >
                      Refresh versions
                    </Button>
                  )}
                </Stack>
              </Alert>
            )}
            {restoreError && (
              <StudentFeedback notificationKey="STU-0063" presentation="toast" severity="error">
                {restoreError}
              </StudentFeedback>
            )}
            {comparisonMatchesSelection && comparison.isError && (
              <StudentFeedback notificationKey="STU-0064" presentation="toast" severity="error">
                Unable to compare these versions. Select Compare to try again.
              </StudentFeedback>
            )}
            {isComparing ? (
              <>
                <Divider />
                <Stack spacing={1} role="status" aria-label="Comparing form versions">
                  <Skeleton variant="rounded" width={120} height={20} />
                  <Skeleton variant="rounded" height={112} />
                </Stack>
              </>
            ) : (
              !comparison.isError &&
              displayComparison && (
                <>
                  <Divider />
                  <AdmissionFormComparisonResults comparison={displayComparison} />
                </>
              )
            )}
          </FormSectionCard>
          <FormSectionCard icon="mdi:history" title="Activity">
            {auditLoading ? (
              <Stack spacing={1} aria-label="Loading Form Activity">
                <Skeleton variant="rounded" height={48} />
                <Skeleton variant="rounded" height={48} />
                <Skeleton variant="rounded" height={48} />
              </Stack>
            ) : audit.isError ? (
              <>
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
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Iconify icon="mdi:refresh" />}
                  onClick={() => audit.refetch()}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  Retry loading activity
                </Button>
              </>
            ) : auditEntries.length ? (
              <List
                component="ol"
                aria-label="Form activity, newest first"
                disablePadding
                sx={{ maxHeight: 'none' }}
              >
                {auditEntries.map((entry) => (
                  <ListItem
                    key={entry.id}
                    disableGutters
                    sx={{
                      alignItems: 'flex-start',
                      gap: 1.5,
                      py: 1.25,
                      '&:first-of-type': { pt: 0 },
                      '&:last-of-type': { pb: 0 },
                      '& + &': { borderTop: 1, borderColor: 'divider' },
                    }}
                  >
                    <Box sx={{ color: 'text.secondary', display: 'flex', mt: 0.25, flexShrink: 0 }}>
                      <Iconify icon="mdi:history" width={16} aria-hidden />
                    </Box>
                    <Stack spacing={0.5} sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
                      <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
                        <Typography component="h3" variant="subtitle2">
                          {entry.action.replace(/([a-z0-9])([A-Z])/g, '$1 $2')}
                        </Typography>
                        <Label>Version {entry.version}</Label>
                      </Stack>
                      <Stack direction="row" columnGap={1.5} rowGap={0.25} flexWrap="wrap">
                        <Typography
                          component="time"
                          dateTime={entry.occurredAt}
                          variant="caption"
                          color="text.secondary"
                        >
                          {fDateTime(entry.occurredAt, ADMISSION_DATE_TIME_FORMAT)}
                        </Typography>
                        {entry.actorName && (
                          <Typography variant="caption" color="text.secondary">
                            {entry.actorName}
                          </Typography>
                        )}
                      </Stack>
                      {entry.comment && <Typography variant="body2">{entry.comment}</Typography>}
                    </Stack>
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
    </CustomDialog>
  );
}
