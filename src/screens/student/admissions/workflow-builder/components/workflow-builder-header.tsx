'use client';

import type { ReactNode } from 'react';
import type { AdmissionWorkflow } from 'src/redux/student/admissions/admission-workflows-api';

import { Card, Stack } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { studentPaths } from 'src/constants/student-menu';
import { LoadingButton } from 'src/components/loading-button';
import { StudentFeedback } from 'src/components/student-feedback';
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
  saving: boolean;
  validating: boolean;
  publishing: boolean;
  onSave: () => void;
  onPublish: () => void;
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
  saving,
  validating,
  publishing,
  onSave,
  onPublish,
}: WorkflowLifecycleActionsProps) {
  if (readOnly && !canPublish) {
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
            <StudentFeedback
              notificationKey="STU-0541"
              presentation="inline"
              severity="warning"
              sx={{ flexShrink: 0 }}
            >
              You can view this workflow, but Workflow Add permission is required to add stages,
              edit routes, or save this draft.
            </StudentFeedback>
          )}
          {readOnlyReason === 'status' && (
            <StudentFeedback
              notificationKey="STU-0542"
              presentation="inline"
              severity="info"
              sx={{ flexShrink: 0 }}
            >
              Published and historical versions are read-only. Create a new version to edit the
              journey; publishing remains available for eligible existing drafts.
            </StudentFeedback>
          )}
          {children}
        </Card>
      )}
    </>
  );
}
