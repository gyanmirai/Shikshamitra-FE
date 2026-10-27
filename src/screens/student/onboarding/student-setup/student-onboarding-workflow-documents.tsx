'use client';

import type {
  DocumentAction,
  DocumentActionValues,
} from 'src/screens/student/admissions/document-verification/document-action-model';
import type {
  AdmissionDocumentRequirement,
  ApplicationDocumentVerification,
} from 'src/redux/student/admissions/admission-document-types';

import { useState } from 'react';
import { useFormik } from 'formik';
import { shikshaMitraToast } from 'src/components/toast';
import { StudentFeedback } from 'src/components/student-feedback';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Stack, Button, Skeleton, Typography, DialogActions } from '@mui/material';
import { DocumentActionFields } from 'src/screens/student/admissions/document-verification/document-action-fields';
import { useDocumentPermissions } from 'src/screens/student/admissions/document-verification/use-document-permissions';
import { DocumentChecklistContent } from 'src/screens/student/admissions/document-verification/document-checklist-content';
import {
  documentActionSchema,
  documentActionLabels,
} from 'src/screens/student/admissions/document-verification/document-action-model';
import {
  useGetStudentOnboardingWorkflowDocumentsQuery,
  useUploadStudentOnboardingWorkflowDocumentMutation,
  useRecordStudentOnboardingWorkflowOriginalMutation,
  useReviewStudentOnboardingWorkflowDocumentMutation,
} from 'src/redux/student/onboarding/student-onboarding-api';

import StudentOnboardingDocuments from './student-onboarding-documents';
import { getOnboardingErrorMessage } from './student-onboarding-messages';
import { StudentOnboardingDocumentWorkspace } from './student-onboarding-document-workspace';

type Selection = {
  action: Exclude<DocumentAction, 'waive'>;
  summary: ApplicationDocumentVerification;
  requirement: AdmissionDocumentRequirement;
};
function WorkflowDocumentAction({
  caseId,
  selection,
  onClose,
}: {
  caseId: string;
  selection: Selection;
  onClose: () => void;
}) {
  const [upload] = useUploadStudentOnboardingWorkflowDocumentMutation();
  const [original] = useRecordStudentOnboardingWorkflowOriginalMutation();
  const [review] = useReviewStudentOnboardingWorkflowDocumentMutation();
  const [snapshot] = useState(selection);
  const { action, summary, requirement } = snapshot;
  const policy = summary.policy?.requirements.find((item) => item.code === requirement.code);
  const extensions = requirement.allowedExtensions ??
    policy?.allowedExtensions ?? ['pdf', 'jpg', 'jpeg', 'png'];
  const maxFileSizeMb = requirement.maxFileSizeMb ?? policy?.maxFileSizeMb ?? 5;
  const form = useFormik<DocumentActionValues>({
    initialValues: { file: null, notes: '' },
    validationSchema: documentActionSchema(action, extensions, maxFileSizeMb),
    onSubmit: async (values) => {
      try {
        const key = { id: caseId, concurrencyStamp: summary.concurrencyStamp };
        if (action === 'upload' && values.file)
          await upload({
            ...key,
            stageId: summary.stageInstanceId,
            code: requirement.code,
            file: values.file,
            notes: values.notes,
          }).unwrap();
        else if (action === 'original')
          await original({
            ...key,
            stageId: summary.stageInstanceId,
            code: requirement.code,
            notes: values.notes,
          }).unwrap();
        else {
          const evidence = requirement.evidence.at(-1);
          if (!evidence) {
            form.setStatus('No evidence is available to review.');
            return;
          }
          await review({
            ...key,
            evidenceId: evidence.id,
            decision: action === 'accept' ? 'accepted' : 'rejected',
            reason: values.notes || undefined,
          }).unwrap();
        }
        shikshaMitraToast.success({ message: 'Document updated.' });
        onClose();
      } catch (error) {
        shikshaMitraToast.error({
          message: getOnboardingErrorMessage(
            error,
            'The document could not be updated. Refresh the checklist and try again.'
          ),
        });
      }
    },
  });
  return (
    <CustomDialog
      open
      title={documentActionLabels[action]}
      handleClose={onClose}
      maxWidth="sm"
      hasUnsavedChanges={form.dirty}
      disableClose={form.isSubmitting}
    >
      <DialogScrollContent>
        {form.status && (
          <StudentFeedback notificationKey="STU-1024" presentation="inline" severity="error">
            {form.status}
          </StudentFeedback>
        )}
        <DocumentActionFields
          action={action}
          requirement={requirement}
          formik={form}
          extensions={extensions}
          maxFileSizeMb={maxFileSizeMb}
        />
        {action === 'upload' && form.values.file && (
          <Typography role="status" variant="body2" sx={{ mt: 1, overflowWrap: 'anywhere' }}>
            Selected file: {form.values.file.name}
          </Typography>
        )}
      </DialogScrollContent>
      <DialogActions sx={{ p: 2 }}>
        <Button variant="outlined" size="small" disabled={form.isSubmitting} onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          size="small"
          loading={form.isSubmitting}
          onClick={() => form.submitForm()}
        >
          Submit
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}

export default function StudentOnboardingWorkflowDocuments({
  caseId,
  canManage,
  hasDocumentRequirementsSnapshot = false,
  presentation = 'checklist',
}: {
  caseId: string;
  canManage: boolean;
  hasDocumentRequirementsSnapshot?: boolean;
  presentation?: 'checklist' | 'workspace';
}) {
  const query = useGetStudentOnboardingWorkflowDocumentsQuery(caseId);
  const permissions = useDocumentPermissions();
  const [selection, setSelection] = useState<Selection | null>(null);
  if (query.isError)
    return (
      <StudentFeedback
        notificationKey="STU-1026"
        presentation="toast"
        severity="error"
        action={
          <Button size="small" onClick={() => query.refetch()}>
            Retry
          </Button>
        }
      >
        Admission documents could not be loaded. Refresh the page.
      </StudentFeedback>
    );
  if (!query.data)
    return (
      <Stack role="status" aria-label="Loading Offering documents">
        <Skeleton height={64} />
        <Skeleton height={64} />
      </Stack>
    );
  return (
    <Stack spacing={1.5}>
      {!query.data.length &&
        (hasDocumentRequirementsSnapshot ? (
          <StudentFeedback notificationKey="STU-1028" presentation="inline" severity="info">
            This Offering has no required documents.
          </StudentFeedback>
        ) : (
          <StudentOnboardingDocuments caseId={caseId} enabled canManage={canManage} />
        ))}
      {query.data.map((summary) =>
        presentation === 'workspace' ? (
          <StudentOnboardingDocumentWorkspace
            key={summary.stageInstanceId}
            summary={{ ...summary, canComplete: false }}
            permissions={{ ...permissions, waive: false }}
            disabled={query.isFetching || !canManage}
            readOnly={!canManage}
            onAction={(action, requirement) => {
              if (action !== 'waive' && canManage) setSelection({ action, summary, requirement });
            }}
          />
        ) : (
          <DocumentChecklistContent
            key={summary.stageInstanceId}
            summary={{ ...summary, canComplete: false }}
            permissions={{ ...permissions, waive: false }}
            disabled={query.isFetching || !canManage}
            readOnly={!canManage}
            onAction={(action, requirement) => {
              if (action !== 'waive' && canManage) setSelection({ action, summary, requirement });
            }}
          />
        )
      )}
      {selection && (
        <WorkflowDocumentAction
          key={`${selection.summary.stageInstanceId}-${selection.requirement.code}-${selection.action}`}
          caseId={caseId}
          selection={selection}
          onClose={() => setSelection(null)}
        />
      )}
    </Stack>
  );
}
