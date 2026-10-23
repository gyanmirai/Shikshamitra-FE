import type {
  AdmissionDocumentRequirement,
  ApplicationDocumentVerification,
} from 'src/redux/student/admissions/admission-document-types';

import { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { StudentFeedback } from 'src/components/student-feedback';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  Box,
  Stack,
  Button,
  Accordion,
  Typography,
  DialogActions,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import { DocumentStatusLabel } from './document-status';
import { getDocumentTableFile } from './document-table-model';
import { DocumentActionFields } from './document-action-fields';
import { useDocumentActionForm } from './use-document-action-form';
import { DocumentPreviewContent } from './document-preview-content';
import { DocumentEvidenceHistory } from './document-evidence-history';
import {
  getDocumentReviewActions,
  documentReviewActionIcons,
  documentReviewActionLabels,
} from './document-review-model';

import type { DocumentAction } from './document-action-model';
import type { useDocumentPermissions } from './use-document-permissions';

export function DocumentReviewDialog({
  summary,
  requirement,
  permissions,
  disabled,
  readOnly,
  onClose,
}: {
  summary: ApplicationDocumentVerification;
  requirement: AdmissionDocumentRequirement;
  permissions: ReturnType<typeof useDocumentPermissions>;
  disabled: boolean;
  readOnly: boolean;
  onClose: () => void;
}) {
  const [action, setAction] = useState<DocumentAction | null>(null);
  const [snapshot] = useState({ summary, requirement });
  const current = snapshot.requirement;
  const actions = getDocumentReviewActions(
    current,
    permissions,
    readOnly,
    snapshot.summary.policy?.allowWaivers === true
  );
  const canSubmit = Boolean(action && actions.includes(action) && !disabled && permissions.view);
  const { formik, error, clearError, extensions, maxFileSizeMb } = useDocumentActionForm({
    ...snapshot,
    action: action ?? 'accept',
    onSuccess: onClose,
    canSubmit,
  });
  const file = getDocumentTableFile(current);
  const latest = current.evidence.at(-1);
  const canPreview = Boolean(file?.canDownload && permissions.view && permissions.download);
  const locked = disabled || formik.isSubmitting;
  const chooseAction = (next: DocumentAction) => {
    if (locked || !actions.includes(next)) return;
    formik.resetForm();
    clearError();
    setAction(next);
  };
  const cancelAction = () => {
    if (formik.isSubmitting) return;
    if (formik.dirty && !window.confirm('You have unsaved changes. Do you want to discard them?'))
      return;
    formik.resetForm();
    clearError();
    setAction(null);
  };
  return (
    <CustomDialog
      open
      title={`${current.name} · Document Review`}
      titleInfo="Review the document and its latest evidence before recording a decision. Rejection requires a reason and requests a replacement."
      handleClose={onClose}
      hasUnsavedChanges={formik.dirty}
      disableClose={formik.isSubmitting}
      maxWidth="lg"
      hasForm={false}
      paperProps={{ sx: { height: '85dvh' } }}
    >
      <Box
        component="fieldset"
        disabled={formik.isSubmitting}
        sx={{ m: 0, p: 0, border: 0, minWidth: 0, minHeight: 0, flex: 1, display: 'flex' }}
      >
        <DialogScrollContent
          scrollBarProps={{
            fillContent: true,
            sx: { flex: 1, minHeight: 0 },
            slotProps: { content: { height: 1, minHeight: 0 } },
          }}
          sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) minmax(0, 300px)' },
              gap: 2,
              flex: 1,
              minWidth: 0,
              minHeight: 0,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                minWidth: 0,
                minHeight: { xs: 300, md: 0 },
              }}
            >
              {canPreview && file ? (
                <DocumentPreviewContent key={file.id} evidence={file} name={current.name} />
              ) : (
                <EmptyContent
                  title={file ? 'Preview unavailable' : 'No document uploaded'}
                  description={
                    file
                      ? 'File access is unavailable for this evidence.'
                      : latest?.kind === 'original'
                        ? 'The physical original is recorded in the evidence history.'
                        : latest?.kind === 'waiver'
                          ? 'This requirement has a recorded waiver.'
                          : 'Upload a document or record the required original.'
                  }
                />
              )}
            </Box>
            <Stack spacing={1.5} sx={{ minWidth: 0 }}>
              <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
                <DocumentStatusLabel status={current.status} />
                <Typography variant="caption" color="text.secondary">
                  {current.isRequired ? 'Required' : 'Optional'}
                </Typography>
              </Stack>
              {current.description && (
                <Typography variant="body2">{current.description}</Typography>
              )}
              {latest && (
                <Stack spacing={0.5}>
                  <Typography variant="subtitle2">
                    Latest evidence · Version {latest.versionNumber}
                  </Typography>
                  <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                    {latest.fileName ||
                      (latest.kind === 'original'
                        ? 'Physical original recorded'
                        : 'Requirement waived')}
                  </Typography>
                  {latest.notes && (
                    <Typography variant="body2" color="text.secondary">
                      {latest.notes}
                    </Typography>
                  )}
                </Stack>
              )}
              {error && (
                <StudentFeedback
                  notificationKey="STU-0320"
                  presentation="persistent"
                  severity="error"
                >
                  {error}
                </StudentFeedback>
              )}
              {action ? (
                <Box
                  component="fieldset"
                  disabled={locked}
                  sx={{ m: 0, p: 0, border: 0, minWidth: 0 }}
                >
                  <DocumentActionFields
                    action={action}
                    requirement={current}
                    formik={formik}
                    extensions={extensions}
                    maxFileSizeMb={maxFileSizeMb}
                  />
                </Box>
              ) : (
                <Stack direction="row" gap={1} useFlexGap flexWrap="wrap">
                  {actions
                    .filter((item) => item !== 'accept' && item !== 'reject')
                    .map((item) => (
                      <Button
                        key={item}
                        size="small"
                        variant="outlined"
                        disabled={locked}
                        startIcon={<Iconify icon={documentReviewActionIcons[item]} />}
                        onClick={() => chooseAction(item)}
                      >
                        {item === 'upload' && file
                          ? 'Upload replacement'
                          : documentReviewActionLabels[item]}
                      </Button>
                    ))}
                </Stack>
              )}
              {snapshot.summary.policy?.requireIndependentReview && (
                <Typography variant="caption" color="text.secondary">
                  A different authorized reviewer must check collected evidence.
                </Typography>
              )}
              {current.evidence.length > 0 && (
                <Accordion disableGutters variant="outlined" sx={{ boxShadow: 'none' }}>
                  <AccordionSummary expandIcon={<Iconify icon="mdi:chevron-down" />}>
                    <Typography variant="subtitle2">
                      Evidence history ({current.evidence.length})
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <DocumentEvidenceHistory
                      evidence={current.evidence}
                      allowDownload={permissions.download}
                    />
                  </AccordionDetails>
                </Accordion>
              )}
            </Stack>
          </Box>
        </DialogScrollContent>
      </Box>
      <DialogActions sx={{ p: 2, gap: 1, flexWrap: 'wrap', borderTop: 1, borderColor: 'divider' }}>
        <Button
          size="small"
          variant="outlined"
          disabled={formik.isSubmitting}
          startIcon={<Iconify icon="mdi:close" />}
          onClick={action ? cancelAction : onClose}
          sx={{ mr: 'auto' }}
        >
          {action ? 'Cancel' : 'Close'}
        </Button>
        {action ? (
          <Button
            type="button"
            size="small"
            variant="contained"
            loading={formik.isSubmitting}
            loadingPosition="start"
            disabled={!canSubmit || formik.isSubmitting}
            onClick={() => formik.handleSubmit()}
            startIcon={<Iconify icon={documentReviewActionIcons[action]} />}
          >
            {documentReviewActionLabels[action]}
          </Button>
        ) : (
          <>
            {actions.includes('reject') && (
              <Button
                size="small"
                variant="outlined"
                disabled={locked}
                startIcon={<Iconify icon={documentReviewActionIcons.reject} />}
                onClick={() => chooseAction('reject')}
              >
                Reject
              </Button>
            )}
            {actions.includes('accept') && (
              <Button
                size="small"
                variant="contained"
                disabled={locked}
                startIcon={<Iconify icon={documentReviewActionIcons.accept} />}
                onClick={() => chooseAction('accept')}
              >
                Approve
              </Button>
            )}
          </>
        )}
      </DialogActions>
    </CustomDialog>
  );
}
