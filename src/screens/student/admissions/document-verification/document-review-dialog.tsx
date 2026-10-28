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
import { DocumentActionDialog } from './document-action-dialog';
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
  const [action, setAction] = useState<Exclude<DocumentAction, 'accept'> | null>(null);
  const [snapshot] = useState({ summary, requirement });
  const current = snapshot.requirement;
  const actions = getDocumentReviewActions(
    current,
    permissions,
    readOnly,
    snapshot.summary.policy?.allowWaivers === true
  );
  const canApprove = actions.includes('accept') && !disabled && !action && permissions.view;
  const { formik, error } = useDocumentActionForm({
    ...snapshot,
    action: 'accept',
    onSuccess: onClose,
    canSubmit: canApprove,
  });
  const file = getDocumentTableFile(current);
  const latest = current.evidence.at(-1);
  const canPreview = Boolean(file?.canDownload && permissions.view && permissions.download);
  const locked = disabled || formik.isSubmitting || Boolean(action);
  const chooseAction = (next: Exclude<DocumentAction, 'accept'>) => {
    if (!locked && actions.includes(next)) setAction(next);
  };

  return (
    <>
      <CustomDialog
        open
        title={`${current.name} · Document Review`}
        titleInfo="Review the latest evidence before approving it. Reject requests a replacement and requires a reason."
        handleClose={onClose}
        hasUnsavedChanges={false}
        disableClose={formik.isSubmitting || Boolean(action)}
        maxWidth="lg"
        hasForm={false}
        paperProps={{ sx: { height: '85dvh' } }}
      >
        <Box
          component="fieldset"
          disabled={formik.isSubmitting || Boolean(action)}
          sx={{ m: 0, p: 0, border: 0, minWidth: 0, minHeight: 0, flex: 1, display: 'flex' }}
        >
          <DialogScrollContent
            scrollBarProps={{
              fillContent: true,
              sx: { flex: 1, minHeight: 0 },
              slotProps: { content: { height: 1, minHeight: 0 } },
            }}
            sx={{
              flex: 1,
              minWidth: 0,
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
            }}
          >
            <Stack direction="row" alignItems="center" useFlexGap flexWrap="wrap" gap={1}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ flex: 1, minWidth: 0, overflowWrap: 'anywhere' }}
              >
                {latest
                  ? `${latest.fileName || (latest.kind === 'original' ? 'Physical original recorded' : 'Requirement waived')} · Version ${latest.versionNumber}`
                  : current.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {current.isRequired ? 'Required' : 'Optional'}
              </Typography>
              <DocumentStatusLabel status={current.status} />
            </Stack>
            {current.description && <Typography variant="body2">{current.description}</Typography>}
            {error && (
              <StudentFeedback
                notificationKey="STU-0320"
                presentation="persistent"
                severity="error"
              >
                {error}
              </StudentFeedback>
            )}
            <Box
              sx={{
                flex: '1 0 300px',
                minWidth: 0,
                minHeight: 300,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {canPreview && file ? (
                <DocumentPreviewContent
                  key={file.id}
                  evidence={file}
                  name={current.name}
                  showFileName={file.id !== latest?.id}
                />
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
            {actions.some((item) => item !== 'accept' && item !== 'reject') && (
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
              <Accordion
                disableGutters
                variant="outlined"
                sx={{ boxShadow: 'none', flexShrink: 0 }}
              >
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
          </DialogScrollContent>
        </Box>
        <DialogActions>
          <Button
            size="small"
            variant="outlined"
            disabled={locked}
            startIcon={<Iconify icon="mdi:close" />}
            onClick={onClose}
            sx={{ mr: 'auto' }}
          >
            Close
          </Button>
          {actions.includes('reject') && (
            <Button
              size="small"
              variant="outlined"
              color="error"
              disabled={locked}
              startIcon={<Iconify icon="mdi:close" />}
              onClick={() => chooseAction('reject')}
            >
              Reject
            </Button>
          )}
          {actions.includes('accept') && (
            <Button
              size="small"
              variant="contained"
              disabled={!canApprove || formik.isSubmitting}
              loading={formik.isSubmitting}
              loadingPosition="start"
              startIcon={<Iconify icon={documentReviewActionIcons.accept} />}
              onClick={() => formik.handleSubmit()}
            >
              Approve
            </Button>
          )}
        </DialogActions>
      </CustomDialog>
      {action && (
        <DocumentActionDialog
          {...snapshot}
          action={action}
          title={action === 'reject' ? 'Reject Document' : undefined}
          submitLabel={action === 'reject' ? 'Reject document' : undefined}
          canSubmit={actions.includes(action) && !disabled && permissions.view}
          onClose={() => setAction(null)}
          onSuccess={onClose}
        />
      )}
    </>
  );
}
