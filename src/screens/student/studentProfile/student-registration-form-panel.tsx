import type { RootState } from 'src/redux/store';
import type { StudentRecordDetails } from 'src/redux/student/records/student-record-details-api';

import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useId, useState, useEffect } from 'react';
import { EmptyContent } from 'src/components/empty-content';
import { hasGrantedPermission } from 'src/utils/permissions';
import { FormSectionHeader } from 'src/components/form-section-card';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { Box, Paper, Stack, Alert, Button, Divider, Skeleton } from '@mui/material';
import { useGetStudentRecordFormSnapshotQuery } from 'src/redux/student/records/student-record-details-api';

import { CustomRecordChangeForm } from './custom-record-change-form';
import { StudentRegistrationFormFields } from './student-registration-form-fields';

export function StudentRegistrationFormPanel({
  details,
  onSaved,
  onEditingChange,
  onNavigationGuardChange,
}: {
  details: StudentRecordDetails;
  onSaved: () => void;
  onEditingChange?: (editing: boolean) => void;
  onNavigationGuardChange?: (requestNavigation: ((proceed: () => void) => void) | null) => void;
}) {
  const router = useRouter();
  const formId = useId();
  const [editing, setEditing] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [canSubmit, setCanSubmit] = useState(false);
  const [editingAccess, setEditingAccess] = useState('');
  const permissions = useSelector((root: RootState) => root.auth.permissions);
  const sources = details.formSources ?? [];
  const accessKey = JSON.stringify(
    sources.map((source) => [
      source.submissionId,
      source.formEditableFieldCodes,
      source.formMaskedFieldCodes,
    ])
  );
  const canEdit =
    details.recordsAccess === 'Full' &&
    hasGrantedPermission(permissions, 'Students.Records.Changes.View') &&
    hasGrantedPermission(permissions, 'Students.Records.Changes.Create') &&
    sources.some((source) => (source.formEditableFieldCodes?.length ?? 0) > 0);
  const guard = useUnsavedNavigation(editing && dirty, {
    push: router.push,
    blockNavigation: busy,
    description: 'Your unsaved student form changes will be discarded.',
  });
  useEffect(() => {
    onNavigationGuardChange?.(guard.requestNavigation);
    return () => onNavigationGuardChange?.(null);
  }, [guard.requestNavigation, onNavigationGuardChange]);
  useEffect(() => {
    onEditingChange?.(editing);
  }, [editing, onEditingChange]);
  useEffect(() => () => onEditingChange?.(false), [onEditingChange]);
  const snapshot = useGetStudentRecordFormSnapshotQuery(details.studentId, {
    skip: !editing,
    refetchOnMountOrArgChange: true,
  });
  const status =
    snapshot.error && typeof snapshot.error === 'object' && 'status' in snapshot.error
      ? snapshot.error.status
      : undefined;
  const denied = !canEdit || status === 401 || status === 403 || editingAccess !== accessKey;
  const endEditing = () => {
    setEditing(false);
    setDirty(false);
    setReady(false);
    setCanSubmit(false);
  };
  const formDetails: StudentRecordDetails = {
    ...details,
    registrationSources: sources.map((source) => ({
      ...source,
      editableFieldCodes: source.formEditableFieldCodes ?? [],
      capturedFieldCodes:
        source.definition?.sections.flatMap((section) =>
          section.fields.map((field) => field.code)
        ) ?? [],
    })),
  };
  return (
    <>
      <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 }, minWidth: 0 }}>
        <Stack spacing={2}>
          {!editing && canEdit && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                size="small"
                variant="contained"
                onClick={() => {
                  setEditingAccess(accessKey);
                  setEditing(true);
                }}
              >
                Edit Details
              </Button>
            </Box>
          )}
          {editing ? (
            denied ? (
              <Alert
                severity="info"
                action={
                  <Button size="small" onClick={endEditing}>
                    Close Editor
                  </Button>
                }
              >
                These details are no longer editable with your current access.
              </Alert>
            ) : snapshot.isLoading || (snapshot.isFetching && !ready) ? (
              <Stack spacing={2} aria-label="Loading editable student form">
                <Skeleton height={48} />
                <Skeleton variant="rounded" height={160} />
              </Stack>
            ) : snapshot.isError && !ready ? (
              <Alert
                severity="error"
                action={
                  <Button size="small" onClick={() => snapshot.refetch()}>
                    Retry
                  </Button>
                }
              >
                The current student form could not be loaded. Your profile has been kept.
              </Alert>
            ) : snapshot.currentData ? (
              <CustomRecordChangeForm
                key={details.studentId}
                studentId={details.studentId}
                snapshot={snapshot.currentData}
                details={formDetails}
                direct
                formId={formId}
                hideSubmit
                onDirtyChange={setDirty}
                onBusyChange={setBusy}
                onReady={() => setReady(true)}
                onCanSubmitChange={setCanSubmit}
                onSubmitted={() => {
                  endEditing();
                  onSaved();
                }}
              />
            ) : null
          ) : sources.length ? (
            sources.map((source) => (
              <Box key={source.formInstanceId}>
                <FormSectionHeader
                  icon="mdi:form-select"
                  title={source.formName}
                  description={`Version ${source.formVersion}`}
                />
                <Divider sx={{ my: 2 }} />
                {source.definition ? (
                  <StudentRegistrationFormFields
                    studentId={details.studentId}
                    source={source}
                    values={source.currentValues}
                  />
                ) : (
                  <Alert severity="info">This form is restricted by school policy.</Alert>
                )}
              </Box>
            ))
          ) : (
            <EmptyContent
              title="No Registration form available"
              description="No retained offering form is available with your current access."
            />
          )}
        </Stack>
        {editing && (
          <Box
            sx={{
              position: 'sticky',
              bottom: 0,
              bgcolor: 'background.paper',
              pt: 2,
              pb: 0.5,
              mt: 2,
              zIndex: 1,
            }}
          >
            <Divider sx={{ mb: 1.5 }} />
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button
                size="small"
                variant="outlined"
                disabled={busy}
                onClick={() => guard.requestNavigation(endEditing)}
              >
                Cancel
              </Button>
              <Button
                size="small"
                variant="contained"
                type="submit"
                form={formId}
                loading={busy}
                disabled={!canSubmit || denied}
              >
                Save
              </Button>
            </Stack>
          </Box>
        )}
      </Paper>
      {guard.confirmation}
    </>
  );
}
