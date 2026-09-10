import type { AdmissionWorkflow } from 'src/redux/student/admissions/admission-workflows-api';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { LoadingButton } from 'src/components/loading-button';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Chip, Alert, Stack, Button, Typography } from '@mui/material';

import { WORKFLOW_STATUS_COLORS, WORKFLOW_STATUS_LABELS } from '../workflow-builder-types';

import type { WorkflowSidePanel } from '../workflow-builder-types';

type Props = {
  workflow: AdmissionWorkflow;
  dirty: boolean;
  readOnly: boolean;
  canValidate: boolean;
  canPublish: boolean;
  canViewUsage: boolean;
  saving: boolean;
  validating: boolean;
  publishing: boolean;
  onSave: () => void;
  onValidate: () => void;
  onPublish: () => void;
  onOpenPanel: (panel: WorkflowSidePanel) => void;
  onApplyTemplate: () => void;
};

export function WorkflowBuilderHeader({
  workflow,
  dirty,
  readOnly,
  canValidate,
  canPublish,
  canViewUsage,
  saving,
  validating,
  publishing,
  onSave,
  onValidate,
  onPublish,
  onOpenPanel,
  onApplyTemplate,
}: Props) {
  return (
    <>
      <CustomBreadcrumbs
        heading={workflow.name}
        description={
          workflow.description || 'Configure the stages and transitions for this admission journey.'
        }
        links={[
          { name: 'Students', href: '/student/dashboard' },
          { name: 'Admissions', href: '/student/admissions' },
          { name: 'Workflow Builder', href: '/student/admissions/settings/workflows' },
          { name: `Version ${workflow.version}` },
        ]}
        action={
          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            flexWrap="wrap"
            justifyContent="flex-end"
            sx={{ '& .MuiButton-root': { minHeight: 44 } }}
          >
            {!readOnly && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<Iconify icon="mdi:auto-fix" />}
                onClick={onApplyTemplate}
              >
                Apply standard journey
              </Button>
            )}
            <Button
              size="small"
              variant="outlined"
              startIcon={<Iconify icon="mdi:eye-outline" />}
              onClick={() => onOpenPanel('preview')}
            >
              Preview
            </Button>
            {canValidate && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<Iconify icon="mdi:check-decagram-outline" />}
                onClick={onValidate}
              >
                Validate
              </Button>
            )}
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
            {!readOnly && canPublish && (
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
        }
      />
      <Stack direction="row" alignItems="center" spacing={1} useFlexGap flexWrap="wrap">
        <Label color={WORKFLOW_STATUS_COLORS[workflow.status]}>
          {WORKFLOW_STATUS_LABELS[workflow.status]}
        </Label>
        <Typography variant="body2" color="text.secondary">
          {workflow.code} · Version {workflow.version}
        </Typography>
        {dirty && <Chip size="small" color="warning" variant="outlined" label="Unsaved changes" />}
        <Box sx={{ flex: 1 }} />
        <Button
          size="small"
          startIcon={<Iconify icon="mdi:history" />}
          onClick={() => onOpenPanel('versions')}
        >
          Versions
        </Button>
        {canViewUsage && (
          <Button
            size="small"
            startIcon={<Iconify icon="mdi:chart-box-outline" />}
            onClick={() => onOpenPanel('usage')}
          >
            Usage
          </Button>
        )}
      </Stack>
      {readOnly && (
        <Alert severity="info">
          Published and archived versions are read-only. Create a new version to make changes.
        </Alert>
      )}
    </>
  );
}
