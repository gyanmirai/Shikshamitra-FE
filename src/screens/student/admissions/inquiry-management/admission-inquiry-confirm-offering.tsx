'use client';

import type { AdmissionInquiry } from 'src/redux/student/admissions/admission-inquiries-api';
import type { AdmissionOfferingListItem } from 'src/redux/student/admissions/admission-offerings-api';

import { useState } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { LoadingButton } from 'src/components/loading-button';
import { StudentFeedback } from 'src/components/student-feedback';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { Box, Card, Stack, Button, TextField, Typography, Autocomplete } from '@mui/material';
import { useGetAdmissionOfferingsQuery } from 'src/redux/student/admissions/admission-offerings-api';
import { useConfirmAdmissionInquiryOfferingMutation } from 'src/redux/student/admissions/admission-inquiries-api';

import { admissionTrackLabels } from '../admission-offering-model';

export function AdmissionInquiryConfirmOffering({
  inquiry,
  onConfirmed,
}: {
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
      await confirm({
        id: inquiry.id,
        offeringId: selected.id,
        concurrencyStamp: inquiry.concurrencyStamp,
      }).unwrap();
      shikshaMitraToast.success({
        message: 'Offering confirmed. The counsellor assignment is ready.',
      });
      onConfirmed();
    } catch (error) {
      shikshaMitraToast.error({
        message: parseApiProblemDetail(error).detail || 'Unable to confirm offering.',
      });
    }
  };

  return (
    <Card component="section" variant="outlined" sx={{ p: 2, minWidth: 0 }}>
      <Stack spacing={2}>
        <Box>
          <Typography variant="subtitle1" component="h3">
            Confirm the admission offering
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Choose the class and admission track agreed with the family. This applies the inquiry
            rules and assigns a counsellor.
          </Typography>
        </Box>
        <Autocomplete
          fullWidth
          options={inquiryOfferings}
          loading={offerings.isFetching}
          getOptionLabel={(option) =>
            `${option.standardName} · ${admissionTrackLabels[option.track]} · ${option.name}`
          }
          isOptionEqualToValue={(left, right) => left.id === right.id}
          value={selected}
          onChange={(_, next) => setSelected(next)}
          inputValue={search}
          onInputChange={(_, next) => setSearch(next)}
          renderInput={(params) => (
            <TextField
              {...params}
              size="small"
              label="Class offering"
              placeholder="Search by class or offering code"
            />
          )}
        />
        {offerings.isError && (
          <StudentFeedback
            notificationKey="STU-0398"
            presentation="toast"
            severity="error"
            action={
              <Button size="small" onClick={() => offerings.refetch()}>
                Retry
              </Button>
            }
          >
            Offerings could not be loaded.
          </StudentFeedback>
        )}
        {!offerings.isFetching && !offerings.isError && inquiryOfferings.length === 0 && (
          <StudentFeedback notificationKey="STU-0399" presentation="inline" severity="info">
            No ready inquiry offerings are available for this cycle. Check Admission Form, Admission
            Stage, and Admission Offering settings.
          </StudentFeedback>
        )}
        <Stack direction="row" justifyContent="flex-end">
          <LoadingButton
            size="small"
            variant="contained"
            loading={mutation.isLoading}
            disabled={!selected}
            onClick={save}
          >
            Confirm offering
          </LoadingButton>
        </Stack>
      </Stack>
    </Card>
  );
}
