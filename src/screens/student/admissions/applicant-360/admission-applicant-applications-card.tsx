import type { AdmissionApplicant360 } from 'src/redux/student/admissions/admission-applicants-api';

import NextLink from 'next/link';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { fDateTime } from 'src/utils/format-time';
import { useResponsive } from 'src/hooks/use-responsive';
import { studentPaths } from 'src/constants/student-menu';
import { EmptyContent } from 'src/components/empty-content';
import {
  Box,
  Card,
  Step,
  Paper,
  Stack,
  Button,
  Stepper,
  StepLabel,
  Typography,
  CardContent,
} from '@mui/material';

import { getCurrentStage } from './admission-applicant-360-model';
import {
  getAdmissionApplicationStatusColor,
  getAdmissionApplicationStatusLabel,
} from '../application-status';

type Application = AdmissionApplicant360['applications'][number];

export function AdmissionApplicantApplicationsCard({
  applications,
}: {
  applications: Application[];
}) {
  const horizontalJourney = useResponsive('up', 'md');

  return (
    <Card>
      <CardContent>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="h6">Admission journey</Typography>
            <Typography variant="body2" color="text.secondary">
              Follow every application and see exactly which workflow stage needs attention.
            </Typography>
          </Box>
          {applications.length > 0 && <Label color="default">{applications.length}</Label>}
        </Stack>

        {applications.length ? (
          <Stack spacing={2} sx={{ mt: 2 }}>
            {applications.map((application) => {
              const currentStage = getCurrentStage(application);
              const activeStep = Math.max(
                0,
                application.stages.findIndex((stage) => stage.code === currentStage?.code)
              );
              return (
                <Paper key={application.id} variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
                  <Stack spacing={2}>
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={1.5}
                      alignItems={{ sm: 'center' }}
                      justifyContent="space-between"
                    >
                      <Box>
                        <Stack
                          direction="row"
                          spacing={1}
                          useFlexGap
                          flexWrap="wrap"
                          alignItems="center"
                        >
                          <Typography variant="subtitle1">
                            {application.applicationNumber}
                          </Typography>
                          <Label color={getAdmissionApplicationStatusColor(application.status)}>
                            {getAdmissionApplicationStatusLabel(application.status)}
                          </Label>
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          Started {fDateTime(application.creationTime) || 'date not recorded'}
                        </Typography>
                      </Box>
                      <Button
                        component={NextLink}
                        href={`${studentPaths.enrollment.applications}/${application.id}`}
                        variant="outlined"
                        size="small"
                        endIcon={<Iconify icon="mdi:arrow-right" />}
                      >
                        Open application
                      </Button>
                    </Stack>

                    {currentStage && (
                      <Stack
                        direction="row"
                        spacing={1.25}
                        alignItems="flex-start"
                        sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 1.5 }}
                      >
                        <Iconify
                          icon="mdi:progress-clock"
                          sx={{ mt: 0.25, color: 'primary.main' }}
                        />
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Current stage
                          </Typography>
                          <Typography variant="subtitle2">{currentStage.name}</Typography>
                          {currentStage.enteredAt && (
                            <Typography variant="caption" color="text.secondary">
                              Entered {fDateTime(currentStage.enteredAt)}
                            </Typography>
                          )}
                        </Box>
                      </Stack>
                    )}

                    {application.stages.length > 0 && (
                      <Box sx={{ overflowX: 'auto', pb: 0.5 }}>
                        <Stepper
                          activeStep={activeStep}
                          orientation={horizontalJourney ? 'horizontal' : 'vertical'}
                          sx={{ minWidth: horizontalJourney ? 620 : 0 }}
                        >
                          {application.stages.map((stage) => (
                            <Step key={stage.code} completed={stage.status === 2}>
                              <StepLabel
                                optional={
                                  <Typography variant="caption" color="text.secondary">
                                    {stage.status === 2
                                      ? 'Completed'
                                      : stage.status === 1
                                        ? 'Current'
                                        : 'Not started'}
                                  </Typography>
                                }
                              >
                                {stage.name}
                              </StepLabel>
                            </Step>
                          ))}
                        </Stepper>
                      </Box>
                    )}
                  </Stack>
                </Paper>
              );
            })}
          </Stack>
        ) : (
          <EmptyContent
            filled
            title="No application started"
            description="Use Next action above to choose an open offering and begin this family’s application."
            action={
              <Button
                component="a"
                href="#next-action"
                size="small"
                startIcon={<Iconify icon="mdi:arrow-up" />}
                sx={{ mt: 1.5 }}
              >
                Go to next action
              </Button>
            }
            sx={{ minHeight: 220, mt: 2 }}
            slotProps={{ img: { maxWidth: 96 } }}
          />
        )}
      </CardContent>
    </Card>
  );
}
