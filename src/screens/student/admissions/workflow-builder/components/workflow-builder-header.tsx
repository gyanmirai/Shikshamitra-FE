'use client';

import type { AdmissionWorkflow } from 'src/redux/student/admissions/admission-workflows-api';

import Link from 'next/link';
import { Iconify } from 'src/components/iconify';
import { CustomTabs } from 'src/components/custom-tabs';
import { studentPaths } from 'src/constants/student-menu';
import CustomTooltip from 'src/components/custom-tooltip';
import { LoadingButton } from 'src/components/loading-button';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { usePopover, CustomPopover } from 'src/components/custom-popover';
import {
  Box,
  Tab,
  Alert,
  Stack,
  Paper,
  Button,
  Divider,
  MenuItem,
  IconButton,
} from '@mui/material';

import type { WorkflowSidePanel } from '../workflow-builder-types';

type View = 'configure' | 'map';

export type WorkflowBuilderHeaderProps = {
  workflow: AdmissionWorkflow;
  view?: View;
  viewHrefs?: Record<View, string>;
  dirty: boolean;
  readOnly: boolean;
  readOnlyReason?: 'permission' | 'status';
  canValidate: boolean;
  canPublish: boolean;
  canSubmit: boolean;
  canApprove: boolean;
  canReject: boolean;
  canRollback: boolean;
  canViewUsage: boolean;
  saving: boolean;
  validating: boolean;
  publishing: boolean;
  onBack: () => void;
  onSave: () => void;
  onValidate: () => void;
  onPublish: () => void;
  onSubmit: () => void;
  onApprove: () => void;
  onReject: () => void;
  onRollback: () => void;
  onOpenPanel: (panel: WorkflowSidePanel) => void;
  onApplyTemplate: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
};

const WORKFLOW_VIEWS = [
  { value: 'configure' as const, label: 'Configure', icon: 'mdi:tune-variant' },
  { value: 'map' as const, label: 'Journey map', icon: 'mdi:graph-outline' },
];

const primaryActionSx = {
  bgcolor: 'text.primary',
  color: 'background.paper',
  '&:hover': { bgcolor: 'text.secondary' },
} as const;

type LifecycleActionsProps = Pick<
  WorkflowBuilderHeaderProps,
  | 'dirty'
  | 'readOnly'
  | 'canPublish'
  | 'canSubmit'
  | 'canApprove'
  | 'canReject'
  | 'canRollback'
  | 'saving'
  | 'validating'
  | 'publishing'
  | 'onSave'
  | 'onPublish'
  | 'onSubmit'
  | 'onApprove'
  | 'onReject'
  | 'onRollback'
>;

function WorkflowLifecycleActions({
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
}: LifecycleActionsProps) {
  return (
    <Stack
      role="group"
      aria-label="Workflow lifecycle actions"
      direction="row"
      spacing={1}
      sx={{ '& .MuiButton-root': { minHeight: { xs: 44, md: 36 } } }}
    >
      {!readOnly && (
        <LoadingButton
          size="small"
          variant="outlined"
          loading={saving}
          disabled={!dirty}
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

export function WorkflowBuilderMobileActions(props: LifecycleActionsProps) {
  const { readOnly, canPublish, canSubmit, canApprove, canReject, canRollback } = props;
  const hasActions = !readOnly || canPublish || canSubmit || canApprove || canReject || canRollback;

  if (!hasActions) return null;

  return (
    <Paper
      variant="outlined"
      sx={{
        display: { xs: 'block', md: 'none' },
        position: 'sticky',
        bottom: 0,
        zIndex: 5,
        p: 1,
        mx: -0.5,
        boxShadow: (theme) => theme.shadows[8],
        '& [role="group"]': {
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: 1,
        },
        '& .MuiButton-root': { width: 1, minWidth: 0 },
      }}
    >
      <WorkflowLifecycleActions {...props} />
    </Paper>
  );
}

export function WorkflowBuilderHeader(props: WorkflowBuilderHeaderProps) {
  const {
    workflow,
    view = 'configure',
    viewHrefs = { configure: '#', map: '#view=map' },
    readOnly,
    readOnlyReason,
    canValidate,
    canViewUsage,
    validating,
    onBack,
    onValidate,
    onOpenPanel,
    onApplyTemplate,
    canUndo,
    canRedo,
    onUndo,
    onRedo,
  } = props;
  const morePopover = usePopover();

  const closeAndRun = (action: () => void) => {
    morePopover.onClose();
    action();
  };

  return (
    <>
      <CustomBreadcrumbs
        heading="Admission Process"
        description={
          workflow.description || 'Configure the stages and routes for this admission journey.'
        }
        isBack
        onBack={onBack}
        links={[
          { name: 'Students', href: studentPaths.dashboard },
          { name: 'Admissions', href: studentPaths.enrollment.root },
          { name: 'Admission Process' },
        ]}
        action={
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <WorkflowLifecycleActions {...props} />
          </Box>
        }
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

      <Paper
        component="section"
        variant="outlined"
        aria-label="Workflow version controls"
        sx={{ overflow: 'hidden' }}
      >
        <Stack
          direction="row"
          alignItems={{ xs: 'flex-start', md: 'center' }}
          justifyContent="space-between"
          spacing={1}
          sx={{
            minHeight: 52,
            px: { xs: 0.5, sm: 1 },
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) auto',
          }}
        >
          <Box sx={{ minWidth: 0, overflow: 'hidden' }}>
            <CustomTabs
              value={view}
              aria-label="Workflow builder view"
              variant="scrollable"
              scrollButtons={false}
              guardUnsavedChanges={false}
              slotProps={{
                scroller: { p: 0.5 },
                indicator: { display: 'none' },
                tab: {
                  minHeight: { xs: 44, md: 42 },
                  px: { xs: 1.5, sm: 2.5 },
                  borderRadius: 1.5,
                },
                selected: {
                  fontWeight: 700,
                  color: 'text.primary',
                  bgcolor: 'background.neutral',
                },
              }}
              sx={{ width: 1, minWidth: 0, minHeight: { xs: 52, md: 50 } }}
            >
              {WORKFLOW_VIEWS.map((item) => (
                <Tab
                  key={item.value}
                  component={Link}
                  href={viewHrefs[item.value]}
                  prefetch={false}
                  value={item.value}
                  id={`workflow-builder-${item.value}-tab`}
                  aria-controls={`workflow-builder-${item.value}-panel`}
                  icon={<Iconify icon={item.icon} width={18} />}
                  iconPosition="start"
                  label={item.label}
                />
              ))}
            </CustomTabs>
          </Box>

          <Stack
            role="toolbar"
            aria-label="Workflow builder tools"
            direction="row"
            spacing={0.5}
            alignItems="center"
            sx={{
              flexShrink: 0,
              '& .MuiButton-root': { minHeight: { xs: 44, md: 36 } },
            }}
          >
            {!readOnly && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<Iconify icon="mdi:auto-fix" width={18} />}
                onClick={onApplyTemplate}
                sx={{ display: { xs: 'none', lg: 'inline-flex' } }}
              >
                Template
              </Button>
            )}
            <Button
              size="small"
              variant="outlined"
              startIcon={<Iconify icon="mdi:eye-outline" width={18} />}
              onClick={() => onOpenPanel('preview')}
              sx={{ display: { xs: 'none', md: 'inline-flex' } }}
            >
              Preview
            </Button>
            {canValidate && (
              <Button
                size="small"
                variant="outlined"
                disabled={validating}
                startIcon={<Iconify icon="mdi:check-decagram-outline" width={18} />}
                onClick={onValidate}
                sx={{ display: { xs: 'none', lg: 'inline-flex' } }}
              >
                Validate
              </Button>
            )}
            <CustomTooltip title="More workflow actions">
              <IconButton
                size="small"
                aria-label="More workflow actions"
                aria-haspopup="menu"
                aria-expanded={morePopover.open}
                onClick={morePopover.onOpen}
                sx={{
                  width: { xs: 44, md: 36 },
                  height: { xs: 44, md: 36 },
                  display: { xs: 'none', sm: 'inline-flex' },
                }}
              >
                <Iconify icon="mdi:dots-horizontal" />
              </IconButton>
            </CustomTooltip>
            <Button
              size="small"
              variant="outlined"
              aria-label="Workflow actions"
              aria-haspopup="menu"
              aria-expanded={morePopover.open}
              endIcon={<Iconify icon="mdi:chevron-down" />}
              onClick={morePopover.onOpen}
              sx={{ minWidth: 92, minHeight: 44, display: { xs: 'inline-flex', sm: 'none' } }}
            >
              Actions
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <CustomPopover
        open={morePopover.open}
        anchorEl={morePopover.anchorEl}
        onClose={morePopover.onClose}
        slotProps={{ arrow: { placement: 'top-right' }, paper: { sx: { minWidth: 220 } } }}
      >
        {!readOnly && (
          <MenuItem onClick={() => closeAndRun(onApplyTemplate)} sx={{ display: { lg: 'none' } }}>
            <Iconify icon="mdi:auto-fix" /> Choose template
          </MenuItem>
        )}
        <MenuItem
          onClick={() => closeAndRun(() => onOpenPanel('preview'))}
          sx={{ display: { md: 'none' } }}
        >
          <Iconify icon="mdi:eye-outline" /> Preview
        </MenuItem>
        {canValidate && (
          <MenuItem onClick={() => closeAndRun(onValidate)} sx={{ display: { lg: 'none' } }}>
            <Iconify icon="mdi:check-decagram-outline" /> Validate
          </MenuItem>
        )}
        <MenuItem onClick={() => closeAndRun(() => onOpenPanel('simulation'))}>
          <Iconify icon="mdi:flask-outline" /> Test routes
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => closeAndRun(() => onOpenPanel('versions'))}>
          <Iconify icon="mdi:history" /> Versions
        </MenuItem>
        <MenuItem onClick={() => closeAndRun(() => onOpenPanel('governance'))}>
          <Iconify icon="mdi:shield-check-outline" /> Governance
        </MenuItem>
        {canViewUsage && (
          <MenuItem onClick={() => closeAndRun(() => onOpenPanel('usage'))}>
            <Iconify icon="mdi:chart-box-outline" /> Usage
          </MenuItem>
        )}
        {!readOnly && <Divider />}
        {!readOnly && (
          <MenuItem disabled={!canUndo} onClick={() => closeAndRun(onUndo)}>
            <Iconify icon="mdi:undo" /> Undo
          </MenuItem>
        )}
        {!readOnly && (
          <MenuItem disabled={!canRedo} onClick={() => closeAndRun(onRedo)}>
            <Iconify icon="mdi:redo" /> Redo
          </MenuItem>
        )}
      </CustomPopover>

      {readOnlyReason === 'permission' && (
        <Alert severity="warning">
          You can view this workflow, but Workflow Add permission is required to add stages, edit
          routes, or save this draft.
        </Alert>
      )}
      {readOnlyReason === 'status' && (
        <Alert severity="info">
          Submitted, approved, scheduled, published, superseded, and archived versions are
          read-only. Governance actions remain available according to status and permission; create
          a new version or return a submission to Draft to edit it.
        </Alert>
      )}
    </>
  );
}
