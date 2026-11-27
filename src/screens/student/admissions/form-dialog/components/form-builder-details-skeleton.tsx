import type { AdmissionFormPurpose } from 'src/redux/student/admissions/admission-forms-api';

import { GlobalIcons } from 'src/utils/icons';
import { Scrollbar } from 'src/components/scrollbar';
import CustomStepper from 'src/components/custom-stepper';
import { Box, Grid, Stack, Skeleton } from '@mui/material';
import { FormSectionCard } from 'src/components/form-section-card';

import { getFormWizardLayout } from '../form-wizard-layout';
import { getAdmissionWizardSteps } from '../form-wizard-model';

export function FormBuilderDetailsSkeleton({ purpose }: { purpose: AdmissionFormPurpose }) {
  const compact = purpose === 1;

  return (
    <Box sx={getFormWizardLayout(0, compact)}>
      <Stack sx={{ height: 1, minHeight: 0 }}>
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            minHeight: compact ? 44 : 64,
            px: compact ? 1 : 2,
          }}
        >
          <CustomStepper
            steps={getAdmissionWizardSteps(purpose)}
            activeStep={0}
            density={compact ? 'compact' : 'standard'}
            ariaLabel="Form progress"
          />
        </Box>
        <Scrollbar sx={{ flex: '1 1 auto', minHeight: 0 }}>
          <Stack
            role="status"
            aria-label="Loading form details"
            aria-busy="true"
            spacing={2}
            sx={{ width: 1, maxWidth: 1120, mx: 'auto', p: { xs: 1.5, sm: 2 } }}
          >
            <FormSectionCard icon={GlobalIcons.doc} title="Form Type" contentSpacing={1.5}>
              <Grid container spacing={1.5} aria-hidden="true">
                {[1, 2].map((option) => (
                  <Grid key={option} size={{ xs: 12, sm: 6 }}>
                    <Skeleton variant="rounded" sx={{ height: { xs: 64, sm: 72, lg: 64 } }} />
                  </Grid>
                ))}
              </Grid>
            </FormSectionCard>
            <FormSectionCard icon={GlobalIcons.admissionDetails} title="Form Details">
              <Grid container spacing={1.5} aria-hidden="true">
                {[1, 2, 3, 4].map((field) => (
                  <Grid key={field} size={{ xs: 12, sm: 6 }}>
                    <Skeleton variant="rounded" height={40} />
                  </Grid>
                ))}
                <Grid size={12}>
                  <Skeleton variant="rounded" height={84} />
                </Grid>
              </Grid>
            </FormSectionCard>
          </Stack>
        </Scrollbar>
        <Stack
          aria-hidden="true"
          direction="row"
          justifyContent="space-between"
          sx={{
            flexShrink: 0,
            borderTop: 1,
            borderColor: 'divider',
            px: { xs: 1.5, sm: 3 },
            py: 1,
          }}
        >
          <Skeleton variant="rounded" width={70} height={30} />
          <Stack direction="row" spacing={1}>
            <Skeleton variant="rounded" width={70} height={30} />
            <Skeleton variant="rounded" width={88} height={30} />
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
}
