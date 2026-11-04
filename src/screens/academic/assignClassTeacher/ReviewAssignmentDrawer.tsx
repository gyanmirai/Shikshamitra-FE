import type { ClassTeacherValidationResult } from 'src/redux/classManagementApi/classTeacherAssignmentApi/classTeacherAssignmentApi';

import dayjs from 'dayjs';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { FormSectionCard } from 'src/components/form-section-card';
import { Box, Alert, Stack, Button, Typography } from '@mui/material';

import { getRowKey } from './classTeacherAssignmentModel';
import { AssignmentDrawerShell } from './AssignmentDrawerShell';

import type { AssignmentTableRow } from './classTeacherAssignmentModel';

type Props = {
  open: boolean;
  validation: ClassTeacherValidationResult | null;
  changedRows: AssignmentTableRow[];
  isSaving: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function ReviewAssignmentDrawer({
  open,
  validation,
  changedRows,
  isSaving,
  onClose,
  onConfirm,
}: Props) {
  return (
    <AssignmentDrawerShell
      open={open}
      title="Review & Confirm"
      busy={isSaving}
      disableBackdropClick
      onClose={onClose}
      help="Check modified assignments, workload warnings, and conflicts before publishing."
      actions={
        <>
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            disabled={isSaving}
            onClick={onClose}
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
          >
            Cancel
          </Button>
          <Button
            size="small"
            variant="contained"
            color="inherit"
            loading={isSaving}
            disabled={isSaving || !validation?.canConfirm || changedRows.length === 0}
            onClick={onConfirm}
            startIcon={<Iconify icon={GlobalIcons.publish} />}
          >
            Confirm & publish
          </Button>
        </>
      }
    >
      <Stack spacing={2}>
        <Alert severity={validation?.canConfirm ? 'success' : 'error'}>
          {validation?.canConfirm
            ? 'You can confirm and publish these assignments.'
            : 'Resolve critical issues before confirming.'}
        </Alert>
        <FormSectionCard
          title={`Pending Changes (${changedRows.length})`}
          icon={GlobalIcons.assigned}
          titleTypographyProps={{ component: 'h3' }}
          descriptionTooltip="Assignments included in this review. Publishing applies this organization’s complete assignment set."
        >
          {changedRows.length === 0 && (
            <Typography variant="body2">No changes to review.</Typography>
          )}
          {changedRows.map((row) => (
            <Box
              key={getRowKey(row)}
              sx={{
                '& + &': { pt: 2, borderTop: 1, borderColor: 'divider' },
                overflowWrap: 'anywhere',
              }}
            >
                <Typography component="p" variant="subtitle2">
                {row.className} {row.divisionName}
              </Typography>
              <Typography variant="body2">
                {row.classTeacherName || 'No teacher assigned'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Assignment type: {row.assignmentTypeDraft}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Effective from:{' '}
                {row.effectiveFromDraft
                  ? dayjs(row.effectiveFromDraft).format('DD/MM/YYYY')
                  : 'Immediate'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Change reason: {row.changeReasonDraft}
              </Typography>
            </Box>
          ))}
        </FormSectionCard>
        <FormSectionCard
          title={`Validation & Warnings (${validation?.issues.length ?? 0})`}
          icon={GlobalIcons.alertIcon}
          titleTypographyProps={{ component: 'h3' }}
          descriptionTooltip="Server checks for workload, availability, conflicts, and unassigned divisions."
        >
          {!validation?.issues.length && (
            <Typography variant="body2">No validation issues found.</Typography>
          )}
          {validation?.issues.map((issue) => (
            <Alert
              key={`${issue.code}-${issue.classId}-${issue.divisionId}-${issue.teacherId}`}
              severity={
                issue.severity === 'Critical'
                  ? 'error'
                  : issue.severity === 'Info'
                    ? 'info'
                    : 'warning'
              }
            >
              {issue.message}
              {issue.suggestedFix && (
                <Typography variant="body2">Suggested fix: {issue.suggestedFix}</Typography>
              )}
            </Alert>
          ))}
        </FormSectionCard>
      </Stack>
    </AssignmentDrawerShell>
  );
}
