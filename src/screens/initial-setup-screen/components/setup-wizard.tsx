import type { InitialSetup } from 'src/redux/initial-setup/types';

import { useRef, useEffect } from 'react';
import { Box, Stack, Alert, Button, Typography } from '@mui/material';

import YearStep from './year-step';
import UsersStep from './users-step';
import SetupShell from './setup-shell';
import ReviewStep from './review-step';
import SetupFooter from './setup-footer';
import WelcomeStep from './welcome-step';
import ProfileStep from './profile-step';
import StructureStep from './structure-step';
import SetupCompleted from './setup-completed';
import { setupSteps } from '../services/setup-model';
import { useSetupWizard } from '../hooks/use-setup-wizard';

export default function SetupWizard({
  initial,
  onReload,
}: {
  initial: InitialSetup;
  onReload: () => Promise<InitialSetup>;
}) {
  const {
    progress,
    blocking,
    saving,
    error,
    conflict,
    command,
    form,
    step,
    navigate,
    reload,
    exit,
    next,
    savedDraft,
  } = useSetupWizard(initial, onReload);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus();
  }, [step]);
  if (progress.isCompleted) return <SetupCompleted progress={progress} />;
  const active = setupSteps[step];
  const disabled = blocking || form.isSubmitting;
  const dirty = JSON.stringify(form.values) !== savedDraft.current;
  return (
    <SetupShell
      step={step}
      furthest={progress.furthestStep}
      pendingSteps={progress.pendingSteps}
      schoolCode={progress.schoolCode}
      disabled={disabled || conflict}
      onStep={(target) => {
        navigate(target);
      }}
      footer={
        <SetupFooter
          step={step}
          disabled={disabled}
          conflict={conflict}
          saving={saving}
          error={error}
          dirty={dirty}
          navigate={(target) => navigate(target)}
          next={() => next()}
          onExit={() => exit()}
        />
      }
    >
      <Stack spacing={2.5}>
        <Box data-setup-heading>
          <Typography
            variant="overline"
            sx={(theme) => ({
              color: 'primary.dark',
              ...theme.applyStyles('dark', { color: 'primary.light' }),
            })}
          >
            {active.title}
          </Typography>
          <Typography
            ref={heading}
            tabIndex={-1}
            component="h1"
            variant="h4"
            sx={{
              mb: 0.75,
              '&:focus-visible': {
                outline: '2px solid',
                outlineColor: 'primary.main',
                outlineOffset: 4,
              },
            }}
          >
            {active.heading}
          </Typography>
          <Typography color="text.secondary">{active.description}</Typography>
        </Box>
        {error && (
          <Alert
            severity="error"
            action={
              conflict ? (
                <Button color="inherit" onClick={() => reload()}>
                  Reload
                </Button>
              ) : (
                <Button color="inherit" onClick={() => navigate(step)}>
                  Retry
                </Button>
              )
            }
          >
            {error}
          </Alert>
        )}
        <Box inert={disabled} sx={{ opacity: disabled ? 0.65 : 1 }}>
          {step === 0 && <WelcomeStep />}
          {step === 1 && <ProfileStep form={form} schoolCode={progress.schoolCode} />}
          {step === 2 && <YearStep form={form} />}
          {step === 3 && <StructureStep form={form} />}
          {step === 4 && (
            <UsersStep
              progress={progress}
              onCreate={async (input) => {
                await command('users', input, form.values);
              }}
            />
          )}
          {step === 5 && (
            <ReviewStep
              progress={progress}
              onEdit={(target) => {
                navigate(target);
              }}
            />
          )}
        </Box>
      </Stack>
    </SetupShell>
  );
}
