import type { ReactNode } from 'react';
import type { AdmissionFormSection } from 'src/redux/student/admissions/admission-forms-api';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useRef, useState, useEffect } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import CustomStepper from 'src/components/custom-stepper';
import { EmptyContent } from 'src/components/empty-content';
import { Box, Stack, Button, Typography } from '@mui/material';

import {
  getSectionStepId,
  getAdmissionFormStepGroups,
} from '../admissions/form-dialog/form-step-groups';

// The profile keeps its existing form owner and audited Save. Step navigation never saves.
export function StudentRegistrationFormLayout({
  stepper,
  sections,
  busy,
  errors = {},
  validationAttempt = 0,
  validationPending = false,
  onValidateStep,
  children,
  initialSectionId,
}: {
  stepper: boolean;
  sections: AdmissionFormSection[];
  busy?: boolean;
  errors?: Record<string, string | undefined>;
  validationAttempt?: number;
  validationPending?: boolean;
  onValidateStep?: (sectionIds: string[]) => Promise<boolean | string>;
  children: (sectionIds?: Set<string>) => ReactNode;
  initialSectionId?: string;
}) {
  const [activeId, setActiveId] = useState<string | undefined>(() => {
    const initialSection = sections.find((section) => section.id === initialSectionId);
    return initialSection ? getSectionStepId(initialSection) : undefined;
  });
  const [checking, setChecking] = useState(false);
  const checkingRef = useRef(false);
  const handledValidation = useRef(0);
  const formRoot = useRef<HTMLDivElement>(null);
  const focusRequested = useRef(false);
  const focusStepId = useRef<string | undefined>(undefined);
  const steps = getAdmissionFormStepGroups(sections);
  const activeIndex = Math.max(
    0,
    steps.findIndex((step) => step.id === activeId)
  );
  const active = steps[activeIndex];
  const previousStep = useRef(active?.id);
  useEffect(() => {
    if (previousStep.current !== active?.id && stepper && !focusRequested.current) {
      formRoot.current
        ?.querySelector<HTMLElement>('[aria-current="step"]')
        ?.scrollIntoView?.({ block: 'start', inline: 'nearest' });
    }
    previousStep.current = active?.id;
  }, [active?.id, stepper]);
  const invalidSteps = steps.map((step) =>
    step.sections.some(({ section }) =>
      Object.entries(errors).some(
        ([key, message]) =>
          Boolean(message) &&
          (key === section.code ||
            section.fields.some((field) => key === field.code || key.startsWith(`${field.code}[`)))
      )
    )
  );
  const firstInvalid = invalidSteps.indexOf(true);
  const firstInvalidId = firstInvalid < 0 ? undefined : steps[firstInvalid].id;
  useEffect(() => {
    if (validationPending || handledValidation.current === validationAttempt) return;
    handledValidation.current = validationAttempt;
    if (firstInvalidId) {
      focusRequested.current = true;
      focusStepId.current = firstInvalidId;
      if (stepper) setActiveId(firstInvalidId);
    }
  }, [validationAttempt, validationPending, firstInvalidId, stepper]);
  useEffect(() => {
    if (!focusRequested.current) return undefined;
    if (stepper && focusStepId.current && active?.id !== focusStepId.current) return undefined;
    const frame = requestAnimationFrame(() => {
      focusRequested.current = false;
      const invalid = formRoot.current?.querySelector<HTMLElement>(
        '[aria-invalid="true"]:not([type="hidden"]):not([aria-hidden="true"]):not(:disabled):not([aria-disabled="true"])'
      );
      const target = invalid?.matches('[role="group"]')
        ? (invalid.querySelector<HTMLElement>(
            '[role="spinbutton"], input:not([aria-hidden="true"]), [tabindex="0"]'
          ) ?? invalid)
        : invalid;
      target?.focus();
      target?.scrollIntoView?.({ block: 'nearest' });
    });
    return () => cancelAnimationFrame(frame);
  }, [active?.id, errors, firstInvalidId, stepper, validationAttempt, checking]);
  const changeStep = async (index: number) => {
    if (busy || checkingRef.current || !active || !steps[index]) return;
    if (index > activeIndex && onValidateStep) {
      checkingRef.current = true;
      setChecking(true);
      try {
        const result = await onValidateStep(
          steps
            .slice(activeIndex, index)
            .flatMap((step) => step.sections.map(({ section }) => section.id))
        );
        if (result !== true) {
          focusRequested.current = true;
          focusStepId.current = active.id;
          if (typeof result === 'string') {
            const invalidStep = steps.find((step) =>
              step.sections.some(({ section }) => section.id === result)
            );
            if (invalidStep) {
              focusStepId.current = invalidStep.id;
              setActiveId(invalidStep.id);
            }
          }
          return;
        }
      } finally {
        checkingRef.current = false;
        setChecking(false);
      }
    }
    setActiveId(steps[index].id);
  };
  if (!sections.length) return <EmptyContent title="No visible form fields" />;
  if (!stepper) return <Box ref={formRoot}>{children()}</Box>;
  return (
    <Stack ref={formRoot} spacing={2} sx={{ minWidth: 0 }}>
      <Box
        component="nav"
        aria-label="Form Steps"
        sx={{
          minWidth: 0,
          py: 1,
          borderBottom: 1,
          borderColor: 'divider',
          '& .MuiStepper-root': { minWidth: steps.length * 100 },
          '& .MuiStepLabel-label': { typography: 'caption' },
          '& .MuiStepIcon-root.Mui-active': { color: 'primary.main' },
        }}
      >
        <Scrollbar sx={{ flexGrow: 0 }}>
          <CustomStepper
            ariaLabel="Student registration form steps"
            steps={steps.map((step) => step.name)}
            activeStep={activeIndex}
            stepStates={steps.map((_, index) => (invalidSteps[index] ? 'error' : 'pending'))}
            disabled={busy || checking}
            onStepClick={changeStep}
          />
        </Scrollbar>
      </Box>
      {children(new Set(active?.sections.map(({ section }) => section.id)))}
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        justifyContent="space-between"
        sx={{ borderTop: 1, borderColor: 'divider', pt: 2 }}
      >
        <Button
          type="button"
          color="inherit"
          variant="outlined"
          disabled={busy || checking || activeIndex === 0}
          startIcon={<Iconify icon={GlobalIcons.back} />}
          onClick={() => changeStep(activeIndex - 1)}
        >
          Back
        </Button>
        <Typography variant="caption" color="text.secondary" aria-live="polite">
          Step {activeIndex + 1} of {steps.length}
        </Typography>
        <Button
          type="button"
          color="inherit"
          variant="outlined"
          disabled={busy || checking || activeIndex === steps.length - 1}
          endIcon={<Iconify icon={GlobalIcons.back} sx={{ transform: 'rotate(180deg)' }} />}
          onClick={() => changeStep(activeIndex + 1)}
        >
          Next
        </Button>
      </Stack>
    </Stack>
  );
}
