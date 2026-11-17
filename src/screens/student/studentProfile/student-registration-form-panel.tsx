import type { RootState } from 'src/redux/store';
import type { AdmissionFormSection } from 'src/redux/student/admissions/admission-forms-api';
import type { StudentRecordDetails } from 'src/redux/student/records/student-record-details-api';

import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { EmptyContent } from 'src/components/empty-content';
import { hasGrantedPermission } from 'src/utils/permissions';
import { StudentFeedback } from 'src/components/student-feedback';
import { useId, useRef, useMemo, useState, useEffect } from 'react';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { Box, Paper, Stack, Alert, Button, LinearProgress } from '@mui/material';
import { InfoTooltipIcon } from 'src/components/custom-tooltip/info-tooltip-icon';
import { useGetStudentRecordFormSnapshotQuery } from 'src/redux/student/records/student-record-details-api';

import { profileRuleValues } from './student-record-profile-model';
import { CustomRecordChangeForm } from './custom-record-change-form';
import { isAdmissionRuleVisible } from '../admissions/admission-visibility-rules';
import { StudentRegistrationFormFields } from './student-registration-form-fields';
import { studentRegistrationSectionScope } from './student-registration-section-scope';
import { getAdmissionFormStepGroups } from '../admissions/form-dialog/form-step-groups';
import { StudentRegistrationSectionActions } from './student-registration-section-actions';

export function StudentRegistrationFormPanel({
  details,
  onSaved,
  onEditingChange,
  onNavigationGuardChange,
  requestEdit = false,
}: {
  details: StudentRecordDetails;
  onSaved: () => void;
  onEditingChange?: (editing: boolean) => void;
  onNavigationGuardChange?: (requestNavigation: ((proceed: () => void) => void) | null) => void;
  requestEdit?: boolean;
}) {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const formId = useId();
  const [editingTarget, setEditingTarget] = useState<{
    instanceId: string;
    sectionId: string;
  } | null>(null);
  const editing = Boolean(editingTarget);
  const [lastTarget, setLastTarget] = useState<typeof editingTarget>(null);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [canSubmit, setCanSubmit] = useState(false);
  const [editingAccess, setEditingAccess] = useState('');
  const editRequestHandled = useRef(false);
  const permissions = useSelector((root: RootState) => root.auth.permissions);
  const sources = useMemo(() => details.formSources ?? [], [details.formSources]);
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
    hasGrantedPermission(permissions, 'Students.Records.Changes.Add') &&
    sources.some((source) => (source.formEditableFieldCodes?.length ?? 0) > 0);
  useEffect(() => {
    if (!requestEdit || editRequestHandled.current || !canEdit) return;
    const first = sources
      .flatMap((source) =>
        getAdmissionFormStepGroups(source.definition?.sections ?? []).flatMap((step) =>
          step.sections.map(({ section }) => ({ source, section }))
        )
      )
      .find(
        ({ source, section }) =>
          section.fields.some(
            (field) => !field.readOnly && source.formEditableFieldCodes?.includes(field.code)
          ) &&
          isAdmissionRuleVisible(
            section.stepVisibilityRuleJson,
            profileRuleValues(source.currentValues)
          ) &&
          isAdmissionRuleVisible(
            section.visibilityRuleJson,
            profileRuleValues(source.currentValues)
          )
      );
    if (!first) return;
    editRequestHandled.current = true;
    setEditingAccess(accessKey);
    const target = { instanceId: first.source.formInstanceId, sectionId: first.section.id };
    setLastTarget(target);
    setEditingTarget(target);
  }, [requestEdit, canEdit, accessKey, sources]);
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
  const preparing = editing && (snapshot.isLoading || (snapshot.isFetching && !ready));
  const endEditing = () => {
    setEditingTarget(null);
    setDirty(false);
    setReady(false);
    setCanSubmit(false);
  };
  const formDetails: StudentRecordDetails = {
    ...details,
    registrationSources: sources.map((source) => {
      const editable =
        source.formInstanceId === editingTarget?.instanceId
          ? studentRegistrationSectionScope(source, editingTarget.sectionId).codes
          : [];
      return {
        ...source,
        editableFieldCodes: editable,
        formEditableFieldCodes: editable,
        capturedFieldCodes:
          source.definition?.sections.flatMap((section) =>
            section.fields.map((field) => field.code)
          ) ?? [],
      };
    }),
  };
  const sectionActions = (instanceId: string, section: AdmissionFormSection) => {
    const source = sources.find((item) => item.formInstanceId === instanceId);
    if (
      !canEdit ||
      !section.fields.some(
        (field) => !field.readOnly && source?.formEditableFieldCodes?.includes(field.code)
      )
    )
      return null;
    const active =
      editingTarget?.instanceId === instanceId &&
      Boolean(
        source &&
        studentRegistrationSectionScope(source, editingTarget.sectionId).sectionIds.includes(
          section.id
        )
      );
    return (
      <StudentRegistrationSectionActions
        name={section.name}
        editing={active && !preparing}
        pending={active && preparing}
        disabled={editing}
        busy={busy}
        canSave={canSubmit && !denied}
        formId={formId}
        onEdit={() => {
          setEditingAccess(accessKey);
          const target = { instanceId, sectionId: section.id };
          setLastTarget(target);
          setEditingTarget(target);
        }}
        onCancel={() => guard.requestNavigation(endEditing)}
      />
    );
  };
  const activeSource = sources.find(
    (source) => source.formInstanceId === editingTarget?.instanceId
  );
  const linkedNames =
    activeSource && editingTarget
      ? (activeSource.definition?.sections
          .filter(
            (section) =>
              section.id !== editingTarget.sectionId &&
              studentRegistrationSectionScope(
                activeSource,
                editingTarget.sectionId
              ).sectionIds.includes(section.id)
          )
          .map((section) => section.name) ?? [])
      : [];
  const readOnlyForms = sources.length ? (
    sources.map((source) => (
      <Box key={source.formInstanceId}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <InfoTooltipIcon
            title="Saved responses from this registration form, with restricted fields controlled by your current record access."
            label={`${source.formName} information`}
          />
        </Box>
        {source.definition ? (
          <StudentRegistrationFormFields
            studentId={details.studentId}
            source={source}
            values={source.currentValues}
            initialSectionId={
              lastTarget?.instanceId === source.formInstanceId ? lastTarget.sectionId : undefined
            }
            sectionAction={(section) => sectionActions(source.formInstanceId, section)}
          />
        ) : (
          <StudentFeedback notificationKey="STU-0780" presentation="inline" severity="info">
            This form is restricted by school policy.
          </StudentFeedback>
        )}
      </Box>
    ))
  ) : (
    <EmptyContent
      title="No Registration form available"
      description="No retained offering form is available with your current access."
    />
  );
  return (
    <>
      <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 }, minWidth: 0, borderRadius: 1 }}>
        <Stack spacing={2}>
          {editing && linkedNames.length > 0 && (
            <Alert severity="info">
              Linked fields in {linkedNames.join(', ')} are included in this edit and saved
              together.
            </Alert>
          )}
          {editing ? (
            denied ? (
              <StudentFeedback
                notificationKey="STU-0778"
                presentation="inline"
                severity="info"
                action={
                  <Button size="small" onClick={endEditing}>
                    Close Editor
                  </Button>
                }
              >
                These details are no longer editable with your current access.
              </StudentFeedback>
            ) : preparing ? (
              <Box
                aria-busy
                aria-label="Loading editable student form"
                sx={{ position: 'relative' }}
              >
                <LinearProgress
                  aria-label="Loading editable section"
                  sx={{ position: 'absolute', top: 0, left: 0, right: 0 }}
                />
                {readOnlyForms}
              </Box>
            ) : snapshot.isError && !ready ? (
              <StudentFeedback
                notificationKey="STU-0779"
                presentation="toast"
                severity="error"
                toastAction={
                  <Button size="small" onClick={() => snapshot.refetch()}>
                    Retry
                  </Button>
                }
              >
                The current student form could not be loaded. Your profile has been kept.
              </StudentFeedback>
            ) : snapshot.currentData ? (
              <motion.div
                initial={{ opacity: reducedMotion ? 1 : 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: reducedMotion ? 0 : 0.2 }}
              >
                <CustomRecordChangeForm
                  key={`${details.studentId}:${editingTarget?.instanceId}:${editingTarget?.sectionId}`}
                  studentId={details.studentId}
                  snapshot={snapshot.currentData}
                  details={formDetails}
                  direct
                  formId={formId}
                  hideSubmit
                  sectionTarget={editingTarget ?? undefined}
                  renderSectionAction={sectionActions}
                  onDirtyChange={setDirty}
                  onBusyChange={setBusy}
                  onReady={() => setReady(true)}
                  onCanSubmitChange={setCanSubmit}
                  onSubmitted={() => {
                    endEditing();
                    onSaved();
                  }}
                />
              </motion.div>
            ) : null
          ) : (
            readOnlyForms
          )}
        </Stack>
        {editing && !ready && (
          <Button size="small" disabled={busy} onClick={() => guard.requestNavigation(endEditing)}>
            Cancel
          </Button>
        )}
      </Paper>
      {guard.confirmation}
    </>
  );
}
