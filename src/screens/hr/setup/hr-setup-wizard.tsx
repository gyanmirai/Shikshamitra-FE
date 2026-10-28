'use client';

import type { HrSetupReadiness } from 'src/redux/hr/hr-setup-readiness-api';

import { useDispatch } from 'react-redux';
import { useRouter } from 'src/routes/hooks';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { hrSetupSteps } from 'src/constants/hr-setup';
import CustomStepper from 'src/components/custom-stepper';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { useRef, useState, useEffect, useCallback } from 'react';
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
  useTheme,
  TextField,
  Typography,
  DialogActions,
  useMediaQuery,
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
type Props = {
  readiness?: HrSetupReadiness;
  error: boolean;
  refreshing: boolean;
  refresh: () => Promise<HrSetupReadiness>;
  onClose: () => void;
};

export default function HrSetupWizard({ readiness, error, refreshing, refresh, onClose }: Props) {
  const dispatch = useDispatch();
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
  return (
    <>
      <CustomDialog
        open
        title="Complete HR Setup"
        titleInfo="Saved setup is shared by this school. Staff still need individual salary setup before activation."
        maxWidth="lg"
        fullScreen={mobile}
        hasForm={false}
        guardUnsavedChanges={false}
        disableClose={busy}
        handleClose={() => navigate(onClose)}
        data-testid="hr-setup-wizard"
        paperProps={{ sx: { height: mobile ? '100%' : 'min(90dvh, 960px)', maxHeight: '100dvh' } }}
      >
        <Box sx={{ px: 2, pb: 2, flexShrink: 0 }}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Complete these setup steps before adding staff or processing attendance and payroll. You
            can close this window and continue working.
          </Typography>
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
            <Typography variant="subtitle2" role="status">
              Step {activeStep + 1} of {hrSetupSteps.length}: {step.label}
            </Typography>
          )}
        </Box>
        <DialogScrollContent>
          <Stack spacing={2}>
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
                    <Typography variant="subtitle1">
                      {setupCheckLabels[auxiliary] || 'Required Configuration'}
                    </Typography>
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
                  ? 'HR setup is complete. Individual staff still need salary setup before activation.'
                  : 'Some setup still needs attention. Complete the unresolved steps, then check again.'}
              </Alert>
            ) : (
              checks.map((check) => (
                <Stack key={check.code} spacing={1} data-testid={`hr-setup-check-${check.code}`}>
                  <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                    <Typography variant="subtitle2">
                      {setupCheckLabels[check.code] || check.code}
                    </Typography>
                    <Chip
                      size="small"
                      color={check.state === 'ready' ? 'success' : 'warning'}
                      label={
                        check.state === 'ready'
                          ? 'Complete'
                          : check.state === 'unknown'
                            ? 'Waiting for academic year'
                            : check.state
                      }
                    />
                  </Stack>
                  <Typography variant="body2">{check.reason}</Typography>
                  {check.state !== 'ready' &&
                    !check.canConfigure &&
                    check.code !== 'academic-year' && (
                      <Typography variant="body2">
                        An administrator must complete this step.
                      </Typography>
                    )}
                  {check.canConfigure && check.code !== 'academic-year' && (
                    <Button
                      size="small"
                      variant="outlined"
                      sx={{ alignSelf: 'flex-start' }}
                      disabled={busy || refreshing}
                      startIcon={<Iconify icon={GlobalIcons.edit} />}
                      onClick={() => setTask(setupTaskForCheck(readiness!, check.code))}
                    >
                      {setupTaskForCheck(readiness!, check.code) !== check.code
                        ? 'Set up calendar first'
                        : check.state === 'ready'
                          ? 'Review setup'
                          : 'Set up'}
                    </Button>
                  )}
                </Stack>
              ))
            )}
          </Stack>
        </DialogScrollContent>
        <DialogActions sx={{ px: 2, py: 1.5, flexWrap: 'wrap', gap: 1, flexShrink: 0 }}>
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
              Finish setup
            </Button>
          ) : (
            <Button
              size="small"
              variant="contained"
              disabled={busy || Boolean(task)}
              endIcon={<Iconify icon="mdi:arrow-right" />}
              onClick={() => setActiveStep((value) => value + 1)}
            >
              Next
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
