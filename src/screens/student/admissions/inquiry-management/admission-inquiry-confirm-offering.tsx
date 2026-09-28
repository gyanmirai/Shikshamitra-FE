'use client';

import type { AdmissionInquiry } from 'src/redux/student/admissions/admission-inquiries-api';
import type { AdmissionOfferingListItem } from 'src/redux/student/admissions/admission-offerings-api';

import { useState } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { LoadingButton } from 'src/components/loading-button';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { Box, Card, Stack, Alert, TextField, Typography, Autocomplete } from '@mui/material';
import { useGetAdmissionOfferingsQuery } from 'src/redux/student/admissions/admission-offerings-api';
import { useConfirmAdmissionInquiryOfferingMutation } from 'src/redux/student/admissions/admission-inquiries-api';

export function AdmissionInquiryConfirmOffering({ inquiry, onConfirmed }: {
  inquiry: AdmissionInquiry;
  onConfirmed: () => void;
}) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<AdmissionOfferingListItem | null>(null);
  const [confirm, mutation] = useConfirmAdmissionInquiryOfferingMutation();
  const offerings = useGetAdmissionOfferingsQuery({
    admissionCycleId: inquiry.admissionCycleId,
    availabilityStatus: 2,
    search: search.trim() || undefined,
    skipCount: 0,
    maxResultCount: 50,
  });
  const inquiryOfferings = (offerings.data?.items ?? []).filter((item) => item.entryMode !== 1);

  const save = async () => {
    if (!selected) return;
    try {
      await confirm({ id: inquiry.id, offeringId: selected.id,
        concurrencyStamp: inquiry.concurrencyStamp }).unwrap();
      shikshaMitraToast.success({ message: 'Offering confirmed. The counsellor assignment is ready.' });
      onConfirmed();
    } catch (error) {
      shikshaMitraToast.error({
        message: parseApiProblemDetail(error).detail || 'Unable to confirm offering.',
      });
    }
  };

  return (
    <Card variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={1.5}>
        <Box>
          <Typography variant="subtitle1">Confirm the admission offering</Typography>
          <Typography variant="body2" color="text.secondary">
            Ask the family which class and admission track they want. The chosen offering sets the inquiry rules and assigns a counsellor.
          </Typography>
        </Box>
        <Autocomplete options={inquiryOfferings}
          loading={offerings.isFetching}
          getOptionLabel={(option) => `${option.standardName} · ${option.name}`}
          isOptionEqualToValue={(left, right) => left.id === right.id}
          value={selected} onChange={(_, next) => setSelected(next)}
          inputValue={search} onInputChange={(_, next) => setSearch(next)}
          renderInput={(params) => <TextField {...params} size="small" label="Class offering" placeholder="Search by class or offering code" />} />
        {offerings.isError && <Alert severity="error">Offerings could not be loaded.</Alert>}
        {!offerings.isFetching && !offerings.isError && inquiryOfferings.length === 0 && (
          <Alert severity="info">
            No ready inquiry offerings are available for this cycle. Check the form and workflow settings in Admission Setup.
          </Alert>
        )}
        <LoadingButton size="small" variant="contained" loading={mutation.isLoading}
          disabled={!selected} onClick={save}>Confirm offering</LoadingButton>
      </Stack>
    </Card>
  );
}
