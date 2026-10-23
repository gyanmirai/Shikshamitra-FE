'use client';

import type {
  AdmissionWorkflow,
  AdmissionWorkflowStage,
  AdmissionWorkflowTransition,
} from 'src/redux/student/admissions/admission-workflows-api';

import { useRouter } from 'next/navigation';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { useMemo, useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { studentPaths } from 'src/constants/student-menu';
import { LoadingButton } from 'src/components/loading-button';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { StudentFeedback } from 'src/components/student-feedback';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useCreateAdmissionWorkflowVersionMutation } from 'src/redux/student/admissions/admission-workflows-api';
import {
  Box,
  Card,
  Chip,
  Stack,
  Button,
  Divider,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';

import { compareWorkflowVersions } from '../workflow-version-comparison';
import { formatWorkflowDateTime } from '../../workflow-list/workflow-list-format';
import { WORKFLOW_STATUS_COLORS, WORKFLOW_STATUS_LABELS } from '../workflow-builder-types';

type Props = {
  workflow: AdmissionWorkflow;
  stages: AdmissionWorkflowStage[];
  transitions: AdmissionWorkflowTransition[];
  versions: AdmissionWorkflow[];
  canCreateVersion: boolean;
};

const changeColors = { added: 'success', removed: 'error', changed: 'warning' } as const;

export function WorkflowVersionHistory({
  workflow,
  stages,
  transitions,
  versions,
  canCreateVersion,
}: Props) {
  const router = useRouter();
  const comparable = versions.filter((version) => version.id !== workflow.id);
  const [selectedId, setSelectedId] = useState('');
  const [restoreSource, setRestoreSource] = useState<AdmissionWorkflow | null>(null);
  const [createVersion, createVersionState] = useCreateAdmissionWorkflowVersionMutation();

  useEffect(() => {
    if (!comparable.some((version) => version.id === selectedId)) {
      setSelectedId(comparable[0]?.id ?? '');
    }
  }, [comparable, selectedId]);

  const selected = comparable.find((version) => version.id === selectedId);
  const current = useMemo(
    () => ({ ...workflow, stages, transitions }),
    [stages, transitions, workflow]
  );
  const comparison = useMemo(
    () => (selected?.stages.length ? compareWorkflowVersions(selected, current) : null),
    [current, selected]
  );
  const existingDraft = versions.find((version) => version.status === 0);

  if (versions.length === 0) {
    return (
      <StudentFeedback notificationKey="STU-0595" presentation="inline" severity="info">
        No workflow versions are available.
      </StudentFeedback>
    );
  }

  return (
    <Stack spacing={2}>
      {comparable.length > 0 ? (
        <>
          <TextField
            select
            fullWidth
            size="small"
            label={`Compare with version ${workflow.version}`}
            value={selectedId}
            onChange={(event) => setSelectedId(event.target.value)}
          >
            {comparable.map((version) => (
              <MenuItem key={version.id} value={version.id}>
                Version {version.version} · {WORKFLOW_STATUS_LABELS[version.status]}
              </MenuItem>
            ))}
          </TextField>
          {selected && selected.stages.length === 0 && (
            <StudentFeedback
              notificationKey="STU-0596"
              presentation="persistent"
              severity="warning"
            >
              Detailed comparison is unavailable until the updated Workflow API is running.
            </StudentFeedback>
          )}
          {selected && comparison && (
            <Card variant="outlined" sx={{ p: 1.5 }}>
              <Stack spacing={1.5}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  divider={<Divider flexItem orientation="vertical" />}
                  spacing={1.5}
                >
                  <VersionSummary label="Selected version" version={selected} />
                  <VersionSummary label="Open version" version={current} />
                </Stack>
                <Divider />
                {!comparison.hasChanges ? (
                  <StudentFeedback
                    notificationKey="STU-0597"
                    presentation="inline"
                    severity="success"
                  >
                    No stage or route differences found.
                  </StudentFeedback>
                ) : (
                  <>
                    <ChangeList title="Stage changes" changes={comparison.stageChanges} />
                    <ChangeList title="Route changes" changes={comparison.routeChanges} />
                  </>
                )}
                {canCreateVersion && selected.status !== 0 && (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Iconify icon="mdi:restore" />}
                    disabled={Boolean(existingDraft)}
                    onClick={() => setRestoreSource(selected)}
                  >
                    Use version {selected.version} as new draft
                  </Button>
                )}
                {existingDraft && (
                  <Typography variant="caption" color="text.secondary">
                    Version {existingDraft.version} is already the editable draft. Publish or remove
                    it before creating another draft.
                  </Typography>
                )}
              </Stack>
            </Card>
          )}
        </>
      ) : (
        <StudentFeedback notificationKey="STU-0598" presentation="inline" severity="info">
          Create another version to enable comparison.
        </StudentFeedback>
      )}

      <Typography variant="subtitle2">All versions</Typography>
      {versions.map((version) => (
        <Card key={version.id} variant="outlined" sx={{ p: 1.5 }}>
          <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography fontWeight={600}>Version {version.version}</Typography>
                  {version.id === workflow.id && <Chip size="small" label="Open" />}
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  {version.code}
                </Typography>
              </Box>
              <Label color={WORKFLOW_STATUS_COLORS[version.status]}>
                {WORKFLOW_STATUS_LABELS[version.status]}
              </Label>
            </Stack>
            <Typography variant="caption" color="text.secondary">
              {version.publishedAt
                ? `Published ${formatWorkflowDateTime(version.publishedAt)}`
                : `Updated ${formatWorkflowDateTime(version.lastModificationTime || version.creationTime)}`}
              {' · '}
              {version.offeringCount} offering(s) ·{' '}
              {(version.campusCount ?? 0) > 0
                ? `${version.campusCount} campus(es)`
                : 'school-wide scope'}{' '}
              · {version.applicationCount} application(s)
            </Typography>
            {version.id !== workflow.id && (
              <Button
                href={`${studentPaths.enrollment.settings.workflows}/${version.id}`}
                size="small"
                variant="outlined"
                startIcon={<Iconify icon="mdi:eye-outline" />}
              >
                View this version
              </Button>
            )}
          </Stack>
        </Card>
      ))}

      <ConfirmDialog
        open={Boolean(restoreSource)}
        onClose={() => setRestoreSource(null)}
        icon="warning"
        title={`Use version ${restoreSource?.version ?? ''} as a new draft?`}
        content="A new editable version will be copied from this historical version. Published versions and applications already using them will not change."
        action={
          <LoadingButton
            variant="contained"
            loading={createVersionState.isLoading}
            startIcon={<Iconify icon="mdi:restore" />}
            onClick={async () => {
              if (!restoreSource) return;
              try {
                const draft = await createVersion(restoreSource.id).unwrap();
                shikshaMitraToast.success({ message: `Version ${draft.version} draft created` });
                setRestoreSource(null);
                router.push(`${studentPaths.enrollment.settings.workflows}/${draft.id}`);
              } catch (error) {
                shikshaMitraToast.error({
                  message:
                    parseApiProblemDetail(error).detail || 'Unable to create the workflow draft.',
                });
              }
            }}
          >
            Create draft
          </LoadingButton>
        }
      />
    </Stack>
  );
}

function VersionSummary({ label, version }: { label: string; version: AdmissionWorkflow }) {
  return (
    <Stack sx={{ flex: 1 }}>
      <Typography variant="overline" color="text.secondary">
        {label}
      </Typography>
      <Typography fontWeight={600}>Version {version.version}</Typography>
      <Typography variant="caption" color="text.secondary">
        {version.stages.length} stages · {version.transitions.length} routes
      </Typography>
    </Stack>
  );
}

function ChangeList({
  title,
  changes,
}: {
  title: string;
  changes: ReturnType<typeof compareWorkflowVersions>['stageChanges'];
}) {
  if (changes.length === 0) return null;
  return (
    <Stack spacing={0.75}>
      <Typography variant="subtitle2">{title}</Typography>
      {changes.map((change, index) => (
        <Stack
          key={`${change.kind}-${change.label}-${index}`}
          direction="row"
          spacing={1}
          alignItems="flex-start"
        >
          <Chip size="small" color={changeColors[change.kind]} label={change.kind} />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600}>
              {change.label}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {change.detail}
            </Typography>
          </Box>
        </Stack>
      ))}
    </Stack>
  );
}
