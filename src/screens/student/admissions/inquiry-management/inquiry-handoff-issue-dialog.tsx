import { useId } from 'react';
import { Iconify } from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import { studentPaths } from 'src/constants/student-menu';
import { Stack, Button, Typography, DialogActions } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

import { formatAdmissionReference } from '../admission-reference';
import { getAdmissionFormPreviewUrl } from '../form-preview/form-preview-navigation';

import type { getAdmissionFormAccess } from '../form-access';
import type { InquiryHandoffIssue } from './inquiry-handoff-issue';

type Props = {
  issue: InquiryHandoffIssue | null;
  access: Pick<ReturnType<typeof getAdmissionFormAccess>, 'canView' | 'canManage'>;
  onClose: () => void;
};

export function InquiryHandoffIssueDialog({ issue, access, onClose }: Props) {
  const descriptionId = useId();
  if (!issue) return null;
  // The Forms route requires View, even when a write grant exists independently.
  const canRestore = access.canView && access.canManage;
  const formsUrl = studentPaths.enrollment.settings.forms;
  const recoveryUrl = issue.formDefinitionId
    ? canRestore
      ? `${formsUrl}?${new URLSearchParams({ restoreForm: issue.formDefinitionId, search: issue.formName || '' })}`
      : getAdmissionFormPreviewUrl(issue.formDefinitionId)
    : formsUrl;
  const actionLabel = issue.formDefinitionId
    ? canRestore
      ? 'Restore form'
      : 'View form'
    : 'Open admission forms';

  return (
    <CustomDialog
      open
      maxWidth="sm"
      hasForm={false}
      guardUnsavedChanges={false}
      aria-describedby={descriptionId}
      title={
        <Stack direction="row" alignItems="center" spacing={1} component="span">
          <Iconify icon="mdi:alert-outline" sx={{ color: 'warning.main' }} />
          <span>Inquiry Form Archived</span>
        </Stack>
      }
      handleClose={onClose}
    >
      <DialogScrollContent>
        <Stack spacing={2} sx={{ overflowWrap: 'anywhere' }}>
          <Typography variant="subtitle2">
            {issue.inquiry.applicantName} · {formatAdmissionReference(issue.inquiry.inquiryNumber)}
          </Typography>
          <Typography id={descriptionId} variant="body2">
            {issue.formName
              ? `“${issue.formName}” is archived.`
              : 'This inquiry’s form is archived.'}
          </Typography>
          <Typography variant="body2">
            {canRestore
              ? 'Restore the form to move this inquiry to Pipeline.'
              : 'Ask your admission administrator to restore this form so you can move the inquiry to Pipeline.'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {canRestore
              ? 'Restoring also makes this form available for new inquiries.'
              : 'You do not have access to restore admission forms.'}
          </Typography>
        </Stack>
      </DialogScrollContent>
      <DialogActions sx={{ flexWrap: 'wrap', gap: 1 }}>
        <Button
          variant={access.canView ? 'outlined' : 'contained'}
          color="inherit"
          size="small"
          startIcon={<Iconify icon="mdi:arrow-left" />}
          onClick={onClose}
        >
          Back to inquiries
        </Button>
        {access.canView && (
          <Button
            component={RouterLink}
            href={recoveryUrl}
            variant="contained"
            color="inherit"
            size="small"
            startIcon={
              <Iconify
                icon={canRestore && issue.formDefinitionId ? 'mdi:restore' : 'mdi:open-in-new'}
              />
            }
          >
            {actionLabel}
          </Button>
        )}
      </DialogActions>
    </CustomDialog>
  );
}
