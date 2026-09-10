'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Stack, Button, MenuItem, TextField, CardContent } from '@mui/material';
import { useGetAdmissionOfferingsQuery } from 'src/redux/student/admissions/admission-offerings-api';
import { useStartAdmissionApplicationMutation } from 'src/redux/student/admissions/admission-applications-api';

export function AdmissionApplicantStartCard({ applicantId }: { applicantId: string }) {
  const router = useRouter();
  const [offeringId, setOfferingId] = useState('');
  const { data: offerings, isFetching } = useGetAdmissionOfferingsQuery({
    availabilityStatus: 2,
    maxResultCount: 100,
    skipCount: 0,
  });
  const [startApplication, startState] = useStartAdmissionApplicationMutation();
  return (
    <Card>
      <CardContent>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }}>
          <TextField
            select
            size="small"
            label="Offering"
            value={offeringId}
            disabled={isFetching}
            onChange={(event) => setOfferingId(event.target.value)}
            sx={{ minWidth: 260 }}
          >
            {(offerings?.items ?? []).map((offering) => (
              <MenuItem key={offering.id} value={offering.id}>
                {offering.code}
              </MenuItem>
            ))}
          </TextField>
          <Button
            variant="contained"
            disabled={!offeringId || startState.isLoading}
            onClick={async () => {
              const application = await startApplication({ applicantId, offeringId }).unwrap();
              router.push(`/student/admissions/applications/${application.id}`);
            }}
          >
            Start application
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
