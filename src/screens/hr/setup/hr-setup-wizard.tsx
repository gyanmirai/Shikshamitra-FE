'use client';

import type { RootState } from 'src/redux/store';
import type { HrSetupCheck, HrSetupReadiness } from 'src/redux/hr/hr-setup-readiness-api';

import { useRouter } from 'src/routes/hooks';
import { GlobalIcons } from 'src/utils/icons';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { hrSetupSteps } from 'src/constants/hr-setup';
import { useDispatch, useSelector } from 'react-redux';
import { hrPermissions } from 'src/constants/hr-menus';
import CustomStepper from 'src/components/custom-stepper';
import { hasGrantedPermission } from 'src/utils/permissions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { useRef, useState, useEffect, useCallback } from 'react';
import { FormSectionCard } from 'src/components/form-section-card';
import { setCurrentYear } from 'src/redux/globalState/globalSlice';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  Box,
  Chip,
  Alert,
  Stack,
  Button,
  MenuItem,
  TextField,
  Typography,
  DialogActions,
  useMediaQuery,
  LinearProgress,
} from '@mui/material';

import { HrSetupEditor } from './hr-setup-editor';
import {
  HrSetupTaskContext,
  HrSetupEditorContext,
  HrSetupNavigationContext,
} from './hr-setup-editor-context';
import {
  setupCheckLabels,
  setupTaskForCheck,
  setupStepComplete,
  firstIncompleteSetupStep,
} from './hr-setup-model';

import type { SetupEditorState } from './hr-setup-editor-context';

const emptyEditor: SetupEditorState = { dirty: false, busy: false, save: null };
const stepDescriptions: Record<string, string> = {
  staff: 'Prepare the academic year, shifts and staff roles for your school.',
  policies: 'Review the calendar and default policies used for attendance, leave and payroll.',
  earnings: 'Configure the earning components used in salary templates.',
  salary: 'Confirm school PF coverage and review the salary template for new salary setups.',
  completion: 'Review the saved setup before finishing. Unresolved checks still need attention.',
};
const checkStatusLabels = {
  ready: 'Complete',
  missing: 'Needs setup',
  inactive: 'Inactive',
  invalid: 'Needs review',
  conflicting: 'Conflicting setup',
  unknown: 'Waiting for academic year',
};
type Props = {
  readiness?: HrSetupReadiness;
  error: boolean;
  refreshing: boolean;
  refresh: () => Promise<HrSetupReadiness>;
  onClose: () => void;
};

export default function HrSetupWizard({ readiness, error, refreshing, refresh, onClose }: Props) {
  const dispatch = useDispatch();
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canCreateDeduction = ['View', 'Add'].every((action) =>
    hasGrantedPermission(
      permissions,
      `${hrPermissions.payroll.settings.deductionComponents}.${action}`
    )
  );
  const router = useRouter();
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeStep, setActiveStep] = useState(() =>
    readiness ? firstIncompleteSetupStep(readiness) : 0
  );
  const initialized = useRef(Boolean(readiness));
  useEffect(() => {
    if (readiness && !initialized.current) {
      initialized.current = true;
      setActiveStep(firstIncompleteSetupStep(readiness));
    }
  }, [readiness]);
  const [task, setTask] = useState<string | null>(null);
  const [auxiliary, setAuxiliary] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  const [editor, setEditor] = useState<SetupEditorState>(emptyEditor);
  const [auxiliaryEditor, setAuxiliaryEditor] = useState<SetupEditorState>(emptyEditor);
  const [pending, setPending] = useState<(() => void) | null>(null);
  const [failure, setFailure] = useState('');
  const [checking, setChecking] = useState(false);
  const currentEditor = auxiliary ? auxiliaryEditor : editor;
  const busy = editor.busy || auxiliaryEditor.busy || checking;
  const dirty = editor.dirty || auxiliaryEditor.dirty;
  const register = useCallback((state: SetupEditorState) => setEditor(state), []);
  const registerAuxiliary = useCallback((state: SetupEditorState) => setAuxiliaryEditor(state), []);
  const navigation = useUnsavedNavigation(dirty, {
    push: router.push,
    blockNavigation: busy || Boolean(pending),
    title: 'Discard Unsaved Changes?',
    keepEditingLabel: 'Keep Editing',
    discardLabel: 'Discard Changes',
    description:
      'Your unsaved changes to this setup step will be lost. Saved setup will remain available.',
  });
  const navigate = useCallback(
    (action: () => void, onlyAuxiliary = false) => {
      if (busy) return;
      if (onlyAuxiliary ? auxiliaryEditor.dirty : dirty) setPending(() => action);
      else action();
    },
    [busy, auxiliaryEditor.dirty, dirty]
  );
  const navigateEditor = useCallback(
    (action: () => void) => navigate(action, Boolean(auxiliary)),
    [navigate, auxiliary]
  );
  const refreshChecks = async () => {
    setFailure('');
    setChecking(true);
    try {
      return await refresh();
    } catch {
      setFailure('Unable to check HR setup. Retry to confirm the saved configuration.');
      return undefined;
    } finally {
      setChecking(false);
    }
  };
  const saved = async () => {
    if (auxiliary) {
      setAuxiliary(null);
      setAuxiliaryEditor(emptyEditor);
      setRevision((value) => value + 1);
      await refreshChecks();
      return;
    }
    const result = await refreshChecks();
    setTask(null);
    setEditor(emptyEditor);
    if (result) setActiveStep(firstIncompleteSetupStep(result));
  };
  const step = hrSetupSteps[activeStep];
  const checks = readiness?.checks.filter((check) => check.step === step.id) || [];
  const completedChecks = checks.filter((check) => check.state === 'ready').length;
  const totalChecks = readiness?.checks.length ?? 0;
  const totalCompletedChecks =
    readiness?.checks.filter((check) => check.state === 'ready').length ?? 0;
  const editorTitle = setupCheckLabels[auxiliary || task || ''] || 'Required Configuration';
  const renderCheck = (check: HrSetupCheck) => (
    <Box key={check.code} data-testid={`hr-setup-check-${check.code}`}>
      <FormSectionCard
        title={setupCheckLabels[check.code] || check.code}
        titleTypographyProps={{ component: 'h3' }}
        icon={
          check.step === 'policies'
            ? GlobalIcons.calendar
            : check.step === 'staff'
              ? GlobalIcons.family
              : GlobalIcons.documentIcon
        }
        descriptionTooltip="Status reflects the saved school configuration. Opening a setup does not mark it complete."
        action={
          <Chip
            size="small"
            variant="soft"
            color={check.state === 'ready' ? 'success' : 'warning'}
            label={checkStatusLabels[check.state]}
          />
        }
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" color="text.secondary">
              {check.code === 'pf-coverage' && check.state === 'missing'
                ? 'Confirm whether PF applies to your school.'
                : check.reason}
            </Typography>
            {check.state !== 'ready' && !check.canConfigure && check.code !== 'academic-year' && (
              <Typography variant="body2">An administrator must complete this step.</Typography>
            )}
          </Box>
          {check.canConfigure && check.code !== 'academic-year' && (
            <Button
              size="small"
              variant="outlined"
              sx={{ flexShrink: 0 }}
              disabled={busy || refreshing}
              startIcon={<Iconify icon={GlobalIcons.edit} />}
              onClick={() => setTask(setupTaskForCheck(readiness!, check.code))}
            >
              {setupTaskForCheck(readiness!, check.code) !== check.code
                ? 'Set up calendar first'
                : check.state === 'ready'
                  ? `Review ${setupCheckLabels[check.code] || 'configuration'}`
                  : `Configure ${setupCheckLabels[check.code] || 'configuration'}`}
            </Button>
          )}
        </Stack>
      </FormSectionCard>
    </Box>
  );
  return (
    <>
      <CustomDialog
        open
        title="Let’s Complete Your HR Setup"
        titleInfo="Saved setup is shared by this school. Staff still need individual salary setup before activation."
        maxWidth="lg"
        fullScreen={mobile}
        hasForm={false}
        guardUnsavedChanges={false}
        disableClose={busy}
        handleClose={() => navigate(onClose)}
        data-testid="hr-setup-wizard"
        paperProps={{
          sx: {
            height: mobile ? '100dvh' : 'min(88dvh, 820px)',
            maxHeight: mobile ? '100dvh' : 'calc(100dvh - 64px)',
            ...(mobile && { borderRadius: 0 }),
          },
        }}
      >
        <Box sx={{ p: 2, flexShrink: 0, borderBottom: 1, borderColor: 'divider' }}>
          <Stack spacing={1.5} sx={{ mb: 2 }}>
            <Box
              component="ul"
              sx={{ m: 0, pl: 2.5, typography: 'body2', color: 'text.secondary' }}
            >
              <li>Finish setup for attendance, leave and payroll.</li>
              <li>Close anytime to explore HR.</li>
              <li>Saved setup is kept.</li>
            </Box>
            {readiness && !error && totalChecks > 0 && (
              <Stack spacing={0.75}>
                <Stack direction="row" spacing={1} justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">
                    {totalCompletedChecks} of {totalChecks} setup items complete
                  </Typography>
                  <Typography variant="subtitle2">
                    {totalChecks === totalCompletedChecks
                      ? 'Ready to finish'
                      : `${totalChecks - totalCompletedChecks} ${totalChecks - totalCompletedChecks === 1 ? 'item' : 'items'} remaining`}
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={(totalCompletedChecks / totalChecks) * 100}
                  aria-label="Saved HR setup completion"
                  aria-valuetext={`${totalCompletedChecks} of ${totalChecks} setup items complete`}
                  sx={{ height: 6, borderRadius: 1 }}
                />
              </Stack>
            )}
          </Stack>
          {!mobile && (
            <CustomStepper
              steps={hrSetupSteps.map((item) => item.label)}
              activeStep={activeStep}
              ariaLabel="HR setup steps"
              disabled={busy}
              stepStates={hrSetupSteps.map((_, index) =>
                readiness && setupStepComplete(readiness, index)
                  ? 'completed'
                  : index === activeStep
                    ? 'active'
                    : 'pending'
              )}
              onStepClick={(index) =>
                navigate(() => {
                  setTask(null);
                  setAuxiliary(null);
                  setActiveStep(index);
                })
              }
            />
          )}
          {mobile && (
            <Stack spacing={1}>
              <Typography variant="subtitle2" role="status">
                Step {activeStep + 1} of {hrSetupSteps.length}: {step.label}
              </Typography>
            </Stack>
          )}
        </Box>
        <DialogScrollContent>
          <Stack spacing={2}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', sm: 'center' }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h6" component="h2">
                  {task ? `Configure ${editorTitle}` : step.label}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {task ? `Part of ${step.label}` : stepDescriptions[step.id]}
                </Typography>
              </Box>
              {!task && checks.length > 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
                  {completedChecks} of {checks.length} complete
                </Typography>
              )}
            </Stack>
            {(error || failure) && (
              <Alert
                severity="error"
                action={
                  <Button size="small" disabled={busy || refreshing} onClick={refreshChecks}>
                    Retry
                  </Button>
                }
              >
                {failure ||
                  'Unable to check HR setup. Retry or close this window and continue working.'}
              </Alert>
            )}
            {readiness && !readiness.academicYearId && (
              <Stack spacing={1}>
                {readiness.availableYears.length ? (
                  <TextField
                    select
                    size="small"
                    fullWidth
                    label="Academic year"
                    value=""
                    disabled={busy}
                    onChange={(event) =>
                      navigate(() =>
                        dispatch(
                          setCurrentYear(
                            readiness.availableYears.find((year) => year.id === event.target.value)
                          )
                        )
                      )
                    }
                  >
                    {readiness.availableYears.map((year) => (
                      <MenuItem key={year.id} value={year.id}>
                        {year.name}
                      </MenuItem>
                    ))}
                  </TextField>
                ) : (
                  <Alert severity="warning">
                    An administrator must create an academic year in Institute Setup.
                  </Alert>
                )}
              </Stack>
            )}
            {task ? (
              <HrSetupNavigationContext.Provider value={navigateEditor}>
                <Box sx={{ display: auxiliary ? 'none' : 'block' }}>
                  <HrSetupEditorContext.Provider value={register}>
                    <HrSetupTaskContext.Provider value={setAuxiliary}>
                      <HrSetupEditor
                        task={task}
                        readiness={readiness!}
                        onSaved={saved}
                        revision={revision}
                      />
                    </HrSetupTaskContext.Provider>
                  </HrSetupEditorContext.Provider>
                </Box>
                {auxiliary && (
                  <HrSetupEditorContext.Provider value={registerAuxiliary}>
                    <HrSetupEditor
                      task={auxiliary}
                      readiness={readiness!}
                      onSaved={saved}
                      revision={revision}
                    />
                  </HrSetupEditorContext.Provider>
                )}
              </HrSetupNavigationContext.Provider>
            ) : step.id === 'completion' ? (
              <Alert severity={readiness?.isReady ? 'success' : 'warning'}>
                {readiness?.isReady
                  ? 'Your school’s HR setup is ready. Set up salary for each staff member before activation.'
                  : 'Some setup still needs attention. Complete the unresolved steps, then check again.'}
              </Alert>
            ) : (
              <>
                {checks.filter((check) => check.state !== 'ready').map(renderCheck)}
                {completedChecks > 0 && (
                  <Box component="details" key={step.id}>
                    <Typography component="summary" variant="subtitle2" sx={{ cursor: 'pointer' }}>
                      View completed setup ({completedChecks})
                    </Typography>
                    <Stack spacing={2} sx={{ mt: 1.5 }}>
                      {checks.filter((check) => check.state === 'ready').map(renderCheck)}
                    </Stack>
                  </Box>
                )}
              </>
            )}
            {!task && step.id === 'earnings' && (
              <FormSectionCard
                title="Deduction Components"
                titleTypographyProps={{ component: 'h3' }}
                icon={GlobalIcons.documentIcon}
                descriptionTooltip="Deductions are optional and do not count toward required HR setup completion."
                action={<Chip size="small" variant="soft" label="Optional" />}
              >
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={2}
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                >
                  <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                    Optional: create deductions your school needs before adding them to a salary
                    template.
                  </Typography>
                  {canCreateDeduction ? (
                    <Button
                      size="small"
                      variant="outlined"
                      sx={{ flexShrink: 0 }}
                      disabled={busy || refreshing}
                      startIcon={<Iconify icon={GlobalIcons.addIcon} />}
                      onClick={() => setTask('deductions')}
                    >
                      Set up deductions
                    </Button>
                  ) : (
                    <Typography variant="body2">
                      Ask your HR administrator to create deduction components if needed.
                    </Typography>
                  )}
                </Stack>
              </FormSectionCard>
            )}
          </Stack>
        </DialogScrollContent>
        <DialogActions
          sx={{
            px: 2,
            py: 1.5,
            flexWrap: 'wrap',
            gap: 1,
            flexShrink: 0,
            borderTop: 1,
            borderColor: 'divider',
          }}
        >
          <Button
            size="small"
            variant="outlined"
            disabled={busy}
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
            onClick={() => navigate(onClose)}
          >
            Close for now
          </Button>
          <Box sx={{ flex: 1 }} />
          <Button
            size="small"
            variant="outlined"
            disabled={busy || (!task && activeStep === 0)}
            startIcon={<Iconify icon="mdi:arrow-left" />}
            onClick={() =>
              navigate(
                () =>
                  auxiliary
                    ? setAuxiliary(null)
                    : task
                      ? setTask(null)
                      : setActiveStep((value) => Math.max(0, value - 1)),
                Boolean(auxiliary)
              )
            }
          >
            Back
          </Button>
          {task && currentEditor.save ? (
            <Button
              size="small"
              variant="contained"
              loading={busy}
              disabled={busy || currentEditor.disabled}
              startIcon={<Iconify icon={GlobalIcons.submit} />}
              onClick={async () => {
                try {
                  await currentEditor.save?.();
                } catch {
                  setFailure('Could not save this step. Review the fields and retry.');
                }
              }}
            >
              Save and next
            </Button>
          ) : activeStep === hrSetupSteps.length - 1 ? (
            <Button
              size="small"
              variant="contained"
              disabled={busy || refreshing || !readiness}
              startIcon={<Iconify icon={GlobalIcons.submit} />}
              onClick={async () => {
                const result = await refreshChecks();
                if (result?.isReady) onClose();
                else if (result) setActiveStep(firstIncompleteSetupStep(result));
              }}
            >
              {readiness?.isReady ? 'Explore HR' : 'Return to remaining setup'}
            </Button>
          ) : (
            <Button
              size="small"
              variant="contained"
              disabled={busy || Boolean(task)}
              endIcon={<Iconify icon="mdi:arrow-right" />}
              data-testid="hr-setup-next"
              onClick={() => setActiveStep((value) => value + 1)}
            >
              {activeStep === hrSetupSteps.length - 2
                ? 'Review progress'
                : `Continue to ${hrSetupSteps[activeStep + 1].label.toLowerCase()}`}
            </Button>
          )}
        </DialogActions>
      </CustomDialog>
      {navigation.confirmation}
      <ConfirmDialog
        open={Boolean(pending)}
        title="Discard Unsaved Changes?"
        content="Your unsaved changes to this setup step will be lost. Saved setup will remain available."
        onClose={() => setPending(null)}
        cancelText="Keep Editing"
        action={
          <Button
            size="small"
            variant="contained"
            color="error"
            startIcon={<Iconify icon={GlobalIcons.delete} />}
            onClick={() => {
              const action = pending;
              setPending(null);
              action?.();
            }}
          >
            Discard Changes
          </Button>
        }
      />
    </>
  );
}
