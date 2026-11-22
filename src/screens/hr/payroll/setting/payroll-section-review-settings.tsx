import type {
  PayrollSectionRoute,
  PayrollApprovalSettings,
} from 'src/redux/runPayroll/payroll-approval-api';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { normalizeHrFailure } from 'src/screens/hr/recovery/hr-failure';
import { Alert, Stack, Button, MenuItem, Skeleton, TextField, Typography } from '@mui/material';
import {
  usePayrollSectionOptionsQuery,
  usePayrollSectionReviewersQuery,
  useConfigurePayrollSectionsMutation,
} from 'src/redux/runPayroll/payroll-approval-api';

type Draft = {
  version: number;
  routes: PayrollSectionRoute[];
  reason: string;
};

type SectionReviewSettingsProps = {
  settings: PayrollApprovalSettings;
  reload: () => Promise<unknown>;
  settingsUnavailable: boolean;
};

function SectionReviewers({ route }: { route: PayrollSectionRoute }) {
  const query = usePayrollSectionReviewersQuery(route, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
  });
  if (query.isFetching) {
    return (
      <Typography variant="body2" color="text.secondary" aria-live="polite">
        Checking eligible reviewers…
      </Typography>
    );
  }
  if (query.isError) {
    return (
      <Alert severity="error" action={<Button onClick={() => query.refetch()}>Retry</Button>}>
        Eligible reviewers could not be loaded.
      </Alert>
    );
  }
  if (!query.currentData?.length) {
    return <Alert severity="warning">No eligible reviewers for this section and role.</Alert>;
  }
  return (
    <Typography variant="body2" color="text.secondary">
      Eligible reviewers: {query.currentData.map((reviewer) => reviewer.name).join(', ')}
    </Typography>
  );
}

export function PayrollSectionReviewSettings({
  settings,
  reload,
  settingsUnavailable,
}: SectionReviewSettingsProps) {
  const router = useRouter();
  const options = usePayrollSectionOptionsQuery();
  const [configure, { isLoading }] = useConfigurePayrollSectionsMutation();
  const [draft, setDraft] = useState<Draft>();
  const [lastSaved, setLastSaved] = useState<PayrollApprovalSettings>();
  const [feedback, setFeedback] = useState<{ error: boolean; text: string }>();
  const saved = lastSaved && lastSaved.version > settings.version ? lastSaved : settings;
  const savedRoutes = saved.sectionRoutes ?? [];
  const current = draft ?? { version: saved.version, routes: savedRoutes, reason: '' };
  const conflict = Boolean(draft && draft.version !== saved.version);
  const changed =
    current.routes.length !== savedRoutes.length ||
    current.routes.some(
      (route) =>
        !savedRoutes.some(
          (previous) => previous.stageId === route.stageId && previous.roleId === route.roleId
        )
    );
  const navigation = useUnsavedNavigation(changed || Boolean(current.reason.trim()), {
    push: router.push,
    blockNavigation: isLoading,
  });
  const stages = options.currentData?.stages ?? [];
  const roles = options.currentData?.roles ?? [];
  const available = !settingsUnavailable && !options.isError && Boolean(options.currentData);
  const disabled = !available || conflict || isLoading;
  const canEditRoutes = !disabled;
  const canAdd = current.routes.length < stages.length && Boolean(roles.length);
  const validRoutes =
    current.routes.every(
      (route) =>
        stages.some((stage) => stage.id === route.stageId) &&
        roles.some((role) => role.id === route.roleId)
    ) && new Set(current.routes.map((route) => route.stageId)).size === current.routes.length;
  const canSave = canEditRoutes && changed && validRoutes && Boolean(current.reason.trim());
  const setCurrent = (updates: Partial<Draft>) => {
    setFeedback(undefined);
    setDraft({ ...current, ...updates });
  };
  const save = async () => {
    if (!canSave) return;
    try {
      setLastSaved(
        await configure({
          expectedVersion: current.version,
          reason: current.reason.trim(),
          sectionRoutes: current.routes,
        }).unwrap()
      );
      setDraft(undefined);
      setFeedback({ error: false, text: 'Payroll workflow updated.' });
    } catch (error) {
      if (parseApiProblemDetail(error).errorCode === 'PAYROLL_SETTINGS_VERSION_CONFLICT') {
        await reload().catch(() => undefined);
      }
      const code = parseApiProblemDetail(error).errorCode;
      setFeedback({
        error: true,
        text:
          code === 'PAYROLL_SECTION_BATCHES_PENDING'
            ? 'Withdraw or resolve pending section review batches before changing the workflow.'
            : code === 'PAYROLL_LEGACY_BATCHES_PENDING'
              ? 'Resolve pending approval batches before switching to section review.'
              : normalizeHrFailure(error).message,
      });
    }
  };
  const sectionMode = saved.mode === 'SectionReview';

  return (
    <FormSectionCard
      title="Section Review"
      icon="mdi:clipboard-check-outline"
      sx={{ width: '100%', maxWidth: 760 }}
      action={
        <Label color={sectionMode ? 'success' : 'default'}>
          {sectionMode ? 'Section review active' : 'Section review inactive'}
        </Label>
      }
    >
      <Stack
        component="form"
        spacing={2}
        noValidate
        onSubmit={async (event) => {
          event.preventDefault();
          await save();
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {saved.mode === 'Legacy'
            ? 'HR finalizes payroll. Assign a review role to each section that should review payroll before HR locks it.'
            : 'Section reviewers check submitted payroll. HR locks payroll and records a reason when overriding an outstanding or returned review.'}
        </Typography>
        {(saved.mode === 'Active' || saved.mode === 'Paused') && (
          <Alert severity="info">
            Saving section review switches the school from the designated approver workflow after
            pending approval batches are resolved.
          </Alert>
        )}
        {options.isLoading && (
          <Skeleton variant="rounded" height={64} aria-label="Loading payroll sections and roles" />
        )}
        {options.isError && (
          <Alert severity="error" action={<Button onClick={() => options.refetch()}>Retry</Button>}>
            Payroll sections and review roles could not be loaded.
          </Alert>
        )}
        {available && (
          <>
            {current.routes.map((route, index) => {
              const choices = stages.filter(
                (stage) =>
                  stage.id === route.stageId ||
                  !current.routes.some((other) => other.stageId === stage.id)
              );
              const stageMissing = Boolean(
                route.stageId && !choices.some((stage) => stage.id === route.stageId)
              );
              const roleMissing = Boolean(
                route.roleId && !roles.some((role) => role.id === route.roleId)
              );
              return (
                <Stack key={index} spacing={1}>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2}
                    alignItems={{ sm: 'flex-start' }}
                  >
                    <ShakingTextField>
                      <TextField
                        select
                        required
                        fullWidth
                        size="small"
                        label="School section"
                        disabled={!canEditRoutes}
                        value={route.stageId}
                        error={stageMissing}
                        helperText={
                          stageMissing ? 'Select an available school section.' : undefined
                        }
                        onChange={(event) =>
                          setCurrent({
                            routes: current.routes.map((item, row) =>
                              row === index ? { ...item, stageId: event.target.value } : item
                            ),
                          })
                        }
                      >
                        {stageMissing && (
                          <MenuItem value={route.stageId} disabled>
                            Unavailable section
                          </MenuItem>
                        )}
                        {choices.map((stage) => (
                          <MenuItem key={stage.id} value={stage.id}>
                            {stage.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    </ShakingTextField>
                    <ShakingTextField>
                      <TextField
                        select
                        required
                        fullWidth
                        size="small"
                        label="Review role"
                        disabled={!canEditRoutes}
                        value={route.roleId}
                        error={roleMissing}
                        helperText={roleMissing ? 'Select an available review role.' : undefined}
                        onChange={(event) =>
                          setCurrent({
                            routes: current.routes.map((item, row) =>
                              row === index ? { ...item, roleId: event.target.value } : item
                            ),
                          })
                        }
                      >
                        {roleMissing && (
                          <MenuItem value={route.roleId} disabled>
                            Unavailable role
                          </MenuItem>
                        )}
                        {roles.map((role) => (
                          <MenuItem key={role.id} value={role.id}>
                            {role.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    </ShakingTextField>
                    <Button
                      size="small"
                      sx={{ minHeight: 44, flexShrink: 0 }}
                      disabled={!canEditRoutes}
                      aria-label={`Remove ${stages.find((stage) => stage.id === route.stageId)?.name ?? 'section'} route`}
                      onClick={() =>
                        setCurrent({ routes: current.routes.filter((_item, row) => row !== index) })
                      }
                    >
                      Remove
                    </Button>
                  </Stack>
                  {route.stageId && route.roleId && !stageMissing && !roleMissing && (
                    <SectionReviewers route={route} />
                  )}
                </Stack>
              );
            })}
            {(!stages.length || !roles.length) && (
              <Alert severity="info">
                Set up school sections and review roles to configure section review.
              </Alert>
            )}
            <Button
              size="small"
              sx={{ alignSelf: 'flex-start', minHeight: 44 }}
              startIcon={<Iconify icon="mdi:plus" />}
              disabled={!canEditRoutes || !canAdd}
              onClick={() =>
                setCurrent({ routes: [...current.routes, { stageId: '', roleId: '' }] })
              }
            >
              Add section
            </Button>
            {sectionMode && !current.routes.length && (
              <Alert severity="warning">
                Saving with no sections returns the school to HR finalization.
              </Alert>
            )}
            {changed && (
              <ShakingTextField>
                <TextField
                  required
                  fullWidth
                  size="small"
                  label="Reason for change"
                  value={current.reason}
                  disabled={!canEditRoutes}
                  onChange={(event) => setCurrent({ reason: event.target.value })}
                  slotProps={{ htmlInput: { maxLength: 500 } }}
                />
              </ShakingTextField>
            )}
            {conflict ? (
              <Alert
                severity="warning"
                action={
                  <Button
                    onClick={() => {
                      setDraft(undefined);
                      setFeedback(undefined);
                    }}
                  >
                    Discard draft
                  </Button>
                }
              >
                Approval settings changed while you were editing. Discard the draft to use the
                latest settings.
              </Alert>
            ) : (
              feedback && (
                <Alert severity={feedback.error ? 'error' : 'success'}>{feedback.text}</Alert>
              )
            )}
            {changed && (
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button
                  size="small"
                  variant="outlined"
                  disabled={isLoading}
                  onClick={() => {
                    setDraft(undefined);
                    setFeedback(undefined);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="small"
                  type="submit"
                  variant="contained"
                  loading={isLoading}
                  disabled={!canSave}
                >
                  Save section review
                </Button>
              </Stack>
            )}
          </>
        )}
      </Stack>
      {navigation.confirmation}
    </FormSectionCard>
  );
}
