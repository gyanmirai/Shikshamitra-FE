'use client';

import type { ReactNode } from 'react';
import type { AdmissionWorkflow } from 'src/redux/student/admissions/admission-workflows-api';

import { useId } from 'react';
import { Iconify } from 'src/components/iconify';
import { Card, Stack, Typography } from '@mui/material';
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
  backDisabled?: boolean;
  onBack: () => void;
};

export type WorkflowLifecycleActionsProps = {
  dirty: boolean;
  readOnly: boolean;
  canPublish: boolean;
  saving: boolean;
  validating: boolean;
  publishing: boolean;
  finalStageError?: string;
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
  finalStageError,
  onSave,
  onPublish,
}: WorkflowLifecycleActionsProps) {
  const finalStageHelpId = useId();
  if (readOnly && !canPublish) {
    return null;
  }
  const busy = saving || validating || publishing;
  return (
    <Stack
      role="group"
      aria-label="Workflow Lifecycle Actions"
      direction="row"
      spacing={1}
      useFlexGap
      flexWrap="wrap"
      justifyContent="flex-end"
      alignItems="center"
    >
      {finalStageError && (
        <Typography id={finalStageHelpId} color="text.secondary" variant="caption">
          {finalStageError}
        </Typography>
      )}
      {!readOnly && (
        <LoadingButton
          size="small"
          variant="outlined"
          loading={saving}
          disabled={!dirty || busy || Boolean(finalStageError)}
          aria-describedby={finalStageError ? finalStageHelpId : undefined}
          startIcon={<Iconify icon="mdi:content-save-outline" />}
          onClick={onSave}
        >
          Save Draft
        </LoadingButton>
      )}
      {canPublish && (
        <LoadingButton
          size="small"
          variant="contained"
          loading={publishing || validating}
          disabled={busy || Boolean(finalStageError)}
          aria-describedby={finalStageError ? finalStageHelpId : undefined}
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
  backDisabled,
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
        backDisabled={backDisabled}
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
          aria-label="Workflow Journey Workspace"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            minHeight: 0,
            minWidth: 0,
            gap: 1.5,
            overflow: 'hidden',
          }}
        >
          {afterBreadcrumb}
          <Stack
            spacing={1.5}
            sx={{
              flex: 1,
              minHeight: 0,
              minWidth: 0,
              px: { xs: 1, sm: 2 },
              pb: { xs: 1, sm: 2 },
              pt: afterBreadcrumb ? 0 : { xs: 1, sm: 2 },
              overflow: 'hidden',
            }}
          >
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
          </Stack>
        </Card>
      )}
    </>
  );
}
