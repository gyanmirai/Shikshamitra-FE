'use client';

import type { ReactNode } from 'react';
import type { AdmissionWorkflow } from 'src/redux/student/admissions/admission-workflows-api';

import { Iconify } from 'src/components/iconify';
import { studentPaths } from 'src/constants/student-menu';
import { Card, Alert, Stack, Button } from '@mui/material';
import { LoadingButton } from 'src/components/loading-button';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

export type WorkflowBuilderHeaderProps = {
  workflow: AdmissionWorkflow;
  afterBreadcrumb?: ReactNode;
  children?: ReactNode;
  detailsOpen?: boolean;
  readOnlyReason?: 'permission' | 'status';
  onBack: () => void;
};

export type WorkflowLifecycleActionsProps = {
  dirty: boolean;
  readOnly: boolean;
  canPublish: boolean;
  canSubmit: boolean;
  canApprove: boolean;
  canReject: boolean;
  canRollback: boolean;
  saving: boolean;
  validating: boolean;
  publishing: boolean;
  onSave: () => void;
  onPublish: () => void;
  onSubmit: () => void;
  onApprove: () => void;
  onReject: () => void;
  onRollback: () => void;
};

const primaryActionSx = {
  bgcolor: 'text.primary',
  color: 'background.paper',
  '&:hover': { bgcolor: 'text.secondary' },
} as const;

export function WorkflowLifecycleActions({
  dirty,
  readOnly,
  canPublish,
  canSubmit,
  canApprove,
  canReject,
  canRollback,
  saving,
  validating,
  publishing,
  onSave,
  onPublish,
  onSubmit,
  onApprove,
  onReject,
  onRollback,
}: WorkflowLifecycleActionsProps) {
  if (readOnly && !canPublish && !canSubmit && !canApprove && !canReject && !canRollback) {
    return null;
  }
  const busy = saving || validating || publishing;
  return (
    <Stack
      role="group"
      aria-label="Workflow lifecycle actions"
      direction="row"
      spacing={1}
      useFlexGap
      flexWrap="wrap"
      justifyContent="flex-end"
    >
      {!readOnly && (
        <LoadingButton
          size="small"
          variant="outlined"
          loading={saving}
          disabled={!dirty || busy}
          startIcon={<Iconify icon="mdi:content-save-outline" />}
          onClick={onSave}
        >
          Save draft
        </LoadingButton>
      )}
      {canSubmit && (
        <LoadingButton
          size="small"
          variant="contained"
          loading={publishing || validating}
          disabled={busy}
          startIcon={<Iconify icon="mdi:send-check-outline" />}
          onClick={onSubmit}
          sx={primaryActionSx}
        >
          Submit for approval
        </LoadingButton>
      )}
      {canReject && (
        <Button
          size="small"
          color="warning"
          variant="outlined"
          disabled={busy}
          startIcon={<Iconify icon="mdi:undo-variant" />}
          onClick={onReject}
        >
          Request changes
        </Button>
      )}
      {canApprove && (
        <LoadingButton
          size="small"
          variant="contained"
          loading={publishing}
          disabled={busy}
          startIcon={<Iconify icon="mdi:check-decagram" />}
          onClick={onApprove}
          sx={primaryActionSx}
        >
          Approve
        </LoadingButton>
      )}
      {canRollback && (
        <Button
          size="small"
          color="warning"
          variant="outlined"
          disabled={busy}
          startIcon={<Iconify icon="mdi:restore" />}
          onClick={onRollback}
        >
          Create rollback draft
        </Button>
      )}
      {canPublish && (
        <LoadingButton
          size="small"
          variant="contained"
          loading={publishing || validating}
          disabled={busy}
          startIcon={<Iconify icon="mdi:publish" />}
          onClick={onPublish}
          sx={primaryActionSx}
        >
          Publish
        </LoadingButton>
      )}
    </Stack>
  );
}

export function WorkflowBuilderHeader({
  workflow,
  detailsOpen,
  afterBreadcrumb,
  children,
  readOnlyReason,
  onBack,
}: WorkflowBuilderHeaderProps) {
  return (
    <>
      <CustomBreadcrumbs
        heading="Admission Stage"
        description={
          workflow.description || 'Configure the stages and routes for this admission journey.'
        }
        isBack
        onBack={onBack}
        links={[
          { name: 'Student', href: studentPaths.dashboard },
          { name: 'Admissions', href: studentPaths.enrollment.root },
          { name: 'Settings', href: studentPaths.enrollment.settings.root },
          { name: 'Admission Stage' },
        ]}
        slotProps={{
          action: {},
          moreLink: {},
          heading: {
            whiteSpace: 'nowrap',
            overflowWrap: 'normal',
            textWrap: 'nowrap',
          },
          breadcrumbs: { display: { xs: 'none', sm: 'flex' } },
        }}
      />
      {!detailsOpen && (
        <Card
          component="section"
          aria-label="Workflow journey workspace"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            minHeight: 0,
            minWidth: 0,
            gap: 1.5,
            p: { xs: 1, sm: 2 },
            overflow: 'hidden',
          }}
        >
          {afterBreadcrumb}
          {readOnlyReason === 'permission' && (
            <Alert severity="warning" sx={{ flexShrink: 0 }}>
              You can view this workflow, but Workflow Add permission is required to add stages,
              edit routes, or save this draft.
            </Alert>
          )}
          {readOnlyReason === 'status' && (
            <Alert severity="info" sx={{ flexShrink: 0 }}>
              Submitted, approved, scheduled, published, superseded, and archived versions are
              read-only. Governance actions remain available according to status and permission;
              create a new version or return a submission to Draft to edit it.
            </Alert>
          )}
          {children}
        </Card>
      )}
    </>
  );
}
