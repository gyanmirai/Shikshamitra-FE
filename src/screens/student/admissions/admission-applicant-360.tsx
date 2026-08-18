'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useGetAdmissionOfferingsQuery } from 'src/redux/student/admissions/admission-offerings-api';
import { useGetAdmissionApplicant360Query } from 'src/redux/student/admissions/admission-applicants-api';
import { useStartAdmissionApplicationMutation } from 'src/redux/student/admissions/admission-applications-api';
import {
  Box,
  Card,
  Chip,
  Alert,
  Stack,
  Button,
  Divider,
  MenuItem,
  TextField,
  Typography,
  CardContent,
} from '@mui/material';

import AdmissionApplicantNotes from './admission-applicant-notes';

export default function AdmissionApplicant360Screen() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading, isError } = useGetAdmissionApplicant360Query(id);
  const { data: offerings } = useGetAdmissionOfferingsQuery({
    availabilityStatus: 2,
    maxResultCount: 100,
    skipCount: 0,
  });
  const [offeringId, setOfferingId] = useState('');
  const [startApplication, startState] = useStartAdmissionApplicationMutation();
  if (isLoading) return <Box sx={{ p: 3 }}>Loading applicant…</Box>;
  if (isError || !data)
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Unable to load applicant.</Alert>
      </Box>
    );
  const name = [data.applicant.firstName, data.applicant.middleName, data.applicant.lastName]
    .filter(Boolean)
    .join(' ');
  return (
    <Box>
      <CustomBreadcrumbs
        heading={name}
        links={[
          { name: 'Students', href: '/student' },
          { name: 'Admissions', href: '/student/admissions' },
          { name: 'Applicant 360' },
        ]}
        sx={{ mb: 3 }}
      />
      <Stack spacing={2}>
        <Card>
          <CardContent>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              alignItems={{ sm: 'center' }}
            >
              <TextField
                select
                size="small"
                label="Offering"
                value={offeringId}
                onChange={(event) => setOfferingId(event.target.value)}
                sx={{ minWidth: 260 }}
              >
                {offerings?.items.map((offering) => (
                  <MenuItem key={offering.id} value={offering.id}>
                    {offering.code}
                  </MenuItem>
                ))}
              </TextField>
              <Button
                variant="contained"
                disabled={!offeringId || startState.isLoading}
                onClick={async () => {
                  const application = await startApplication({
                    applicantId: id,
                    offeringId,
                  }).unwrap();
                  router.push(`/student/admissions/applications/${application.id}`);
                }}
              >
                Start application
              </Button>
            </Stack>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="h6">{name}</Typography>
            <Typography color="text.secondary">
              {data.primaryGuardian?.firstName} {data.primaryGuardian?.lastName} ·{' '}
              {data.primaryGuardian?.mobile}
            </Typography>
            <Typography color="text.secondary">
              Family {data.family?.familyNumber ?? '—'}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Applications
            </Typography>
            {data.applications.length ? (
              data.applications.map((application) => (
                <Box key={application.id} sx={{ mb: 2 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="subtitle1">{application.applicationNumber}</Typography>
                    <Chip size="small" label={application.status === 1 ? 'Submitted' : 'Draft'} />
                  </Stack>
                  <Stack spacing={0.5} sx={{ mt: 1 }}>
                    {application.stages.map((stage) => (
                      <Stack key={stage.code} direction="row" spacing={1} alignItems="center">
                        <Chip
                          size="small"
                          color={
                            stage.status === 1
                              ? 'primary'
                              : stage.status === 2
                                ? 'success'
                                : 'default'
                          }
                          label={stage.status === 2 ? '✓' : stage.status === 1 ? '●' : '○'}
                        />
                        <Typography variant="body2">{stage.name}</Typography>
                        {stage.status === 1 && (
                          <Typography variant="caption" color="text.secondary">
                            NEXT
                          </Typography>
                        )}
                      </Stack>
                    ))}
                  </Stack>
                </Box>
              ))
            ) : (
              <Typography color="text.secondary">No applications yet.</Typography>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Activity timeline
            </Typography>
            <Stack spacing={1}>
              {data.activities.map((activity) => (
                <Box key={activity.id}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip size="small" label={activity.activityType} />
                    <Typography>{activity.description}</Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(activity.occurredAt).toLocaleString()}
                  </Typography>
                  <Divider sx={{ mt: 1 }} />
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
        <AdmissionApplicantNotes applicantId={id} notes={data.notes} />
      </Stack>
    </Box>
  );
}
