import type { AdmissionWorkflow } from 'src/redux/student/admissions/admission-workflows-api';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { studentPaths } from 'src/constants/student-menu';
import CustomTooltip from 'src/components/custom-tooltip';
import { LoadingButton } from 'src/components/loading-button';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  Box,
  Chip,
  Alert,
  Stack,
  Paper,
  Button,
  Divider,
  IconButton,
  Typography,
} from '@mui/material';

import { WORKFLOW_STATUS_COLORS, WORKFLOW_STATUS_LABELS } from '../workflow-builder-types';

import type { WorkflowSidePanel } from '../workflow-builder-types';

type Props = {
  workflow: AdmissionWorkflow;
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

export function WorkflowBuilderHeader({
  workflow,
  dirty,
  readOnly,
  readOnlyReason,
  canValidate,
  canPublish,
  canSubmit,
  canApprove,
  canReject,
  canRollback,
  canViewUsage,
  saving,
  validating,
  publishing,
  onSave,
  onValidate,
  onPublish,
  onSubmit,
  onApprove,
  onReject,
  onRollback,
  onOpenPanel,
  onApplyTemplate,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}: Props) {
  return (
    <>
      <CustomBreadcrumbs
        heading={workflow.name}
        description={
          workflow.description || 'Configure the stages and transitions for this admission journey.'
        }
        links={[
          { name: 'Students', href: studentPaths.dashboard },
          { name: 'Admissions', href: studentPaths.enrollment.root },
          { name: 'Workflow Builder', href: studentPaths.enrollment.settings.workflows },
          { name: `Version ${workflow.version}` },
        ]}
      />
      <Paper
        component="section"
        variant="outlined"
        aria-label="Workflow version controls"
        sx={{ overflow: 'hidden' }}
      >
        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          alignItems={{ xs: 'stretch', lg: 'center' }}
          justifyContent="space-between"
          spacing={1}
          sx={{ px: 2, py: 1.25, minHeight: 68 }}
        >
          <Stack direction="row" alignItems="center" spacing={1} useFlexGap flexWrap="wrap">
            <Label color={WORKFLOW_STATUS_COLORS[workflow.status]}>
              {WORKFLOW_STATUS_LABELS[workflow.status]}
            </Label>
            <Typography variant="body2" color="text.secondary">
              {workflow.code} · Version {workflow.version}
            </Typography>
            {dirty && (
              <Chip size="small" color="warning" variant="outlined" label="Unsaved changes" />
            )}
          </Stack>
          <Stack
            role="group"
            aria-label="Workflow lifecycle actions"
            direction="row"
            spacing={1}
            useFlexGap
            flexWrap="wrap"
            justifyContent={{ xs: 'flex-start', lg: 'flex-end' }}
            sx={{ '& .MuiButton-root': { minHeight: 44 } }}
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
              >
                Publish
              </LoadingButton>
            )}
          </Stack>
        </Stack>

        <Divider />

        <Box sx={{ overflowX: 'auto', bgcolor: 'background.neutral' }}>
          <Stack
            direction="row"
            alignItems="center"
            spacing={0.75}
            sx={{ px: 1, py: 0.5, minWidth: 'max-content' }}
          >
            <Stack
              role="group"
              aria-label="Workflow information actions"
              direction="row"
              spacing={0.25}
              sx={{ '& .MuiButton-root': { minHeight: 44 } }}
            >
              <Button
                size="small"
                startIcon={<Iconify icon="mdi:history" width={18} />}
                onClick={() => onOpenPanel('versions')}
              >
                Versions
              </Button>
              <Button
                size="small"
                startIcon={<Iconify icon="mdi:shield-check-outline" width={18} />}
                onClick={() => onOpenPanel('governance')}
              >
                Governance
              </Button>
              {canViewUsage && (
                <Button
                  size="small"
                  startIcon={<Iconify icon="mdi:chart-box-outline" width={18} />}
                  onClick={() => onOpenPanel('usage')}
                >
                  Usage
                </Button>
              )}
            </Stack>

            <Divider orientation="vertical" flexItem sx={{ my: 0.75 }} />

            <Stack
              role="group"
              aria-label="Workflow editing actions"
              direction="row"
              spacing={0.25}
              sx={{ '& .MuiButton-root': { minHeight: 44 } }}
            >
              {!readOnly && (
                <>
                  <CustomTooltip title="Undo last builder change">
                    <span>
                      <IconButton
                        size="small"
                        aria-label="Undo last builder change"
                        disabled={!canUndo}
                        onClick={onUndo}
                        sx={{ width: 44, height: 44 }}
                      >
                        <Iconify icon="mdi:undo" />
                      </IconButton>
                    </span>
                  </CustomTooltip>
                  <CustomTooltip title="Redo builder change">
                    <span>
                      <IconButton
                        size="small"
                        aria-label="Redo builder change"
                        disabled={!canRedo}
                        onClick={onRedo}
                        sx={{ width: 44, height: 44 }}
                      >
                        <Iconify icon="mdi:redo" />
                      </IconButton>
                    </span>
                  </CustomTooltip>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Iconify icon="mdi:auto-fix" width={18} />}
                    onClick={onApplyTemplate}
                  >
                    Choose template
                  </Button>
                </>
              )}
            </Stack>

            <Divider orientation="vertical" flexItem sx={{ my: 0.75 }} />

            <Stack
              role="toolbar"
              aria-label="Workflow builder tools"
              direction="row"
              spacing={0.25}
              sx={{ '& .MuiButton-root': { minHeight: 44 } }}
            >
              <Button
                size="small"
                startIcon={<Iconify icon="mdi:eye-outline" width={18} />}
                onClick={() => onOpenPanel('preview')}
              >
                Preview
              </Button>
              <Button
                size="small"
                startIcon={<Iconify icon="mdi:flask-outline" width={18} />}
                onClick={() => onOpenPanel('simulation')}
              >
                Test routes
              </Button>
              {canValidate && (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Iconify icon="mdi:check-decagram-outline" width={18} />}
                  onClick={onValidate}
                >
                  Validate
                </Button>
              )}
            </Stack>
          </Stack>
        </Box>
      </Paper>
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
