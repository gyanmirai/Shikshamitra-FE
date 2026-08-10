'use client';

import { LoadingButton } from 'src/components/loading-button';

import { Add } from '@mui/icons-material';

import { Box, Stack, Button, Divider, MenuItem, TextField, Typography } from '@mui/material';

import { AdmissionCrmSeatOfferType } from 'src/redux/student/admissions-crm/final-admission-contracts';

import { ApplicantSwitchRow, ApplicantActionPanel } from './applicant-workspace-primitives';

import { useApplicantFinalAdmissionWorkspace } from './applicant-final-admission-operations-context';

export function ApplicantOfferPreparationPanel() {
  const { state: controllerState, actions, meta } = useApplicantFinalAdmissionWorkspace();
  const {
    canOverrideSeatCapacity,
    capacityOverride,
    capacityOverrideReason,
    createOffer,
    createOfferState,
    leadId,
    offerLanguage,
    offerPayload,
    offerTerms,
    offerType,
    offersQuery,
    perform,
    pools,
    poolsQuery,
    responseReason,
    seatPoolId,
    setCapacityOverride,
    setCapacityOverrideReason,
    setOfferFormOpen,
    setOfferLanguage,
    setOfferTerms,
    setOfferType,
    setResponseReason,
    setSeatPoolId,
    setValidFrom,
    setValidUntil,
    validFrom,
    validUntil,
  } = { ...controllerState, ...actions, ...meta };

  return (
    <ApplicantActionPanel>
      <Stack spacing={1.25}>
        <TextField
          select
          size="small"
          label="Class Placement Plan"
          value={seatPoolId}
          onChange={(event) => setSeatPoolId(event.target.value)}
        >
          {pools.map((pool) => (
            <MenuItem key={pool.id} value={pool.id}>
              {pool.code} - {pool.name} ({pool.remainingCapacity} remaining)
            </MenuItem>
          ))}
        </TextField>

        <Divider />
        <Typography variant="subtitle2">Offer Preparation</Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(4, minmax(0, 1fr))' },
            gap: 1,
          }}
        >
          <TextField
            select
            size="small"
            label="Offer type"
            value={offerType}
            onChange={(event) => setOfferType(Number(event.target.value))}
          >
            <MenuItem value={AdmissionCrmSeatOfferType.Provisional}>Provisional</MenuItem>
            <MenuItem value={AdmissionCrmSeatOfferType.Final}>Final</MenuItem>
          </TextField>
          <TextField
            size="small"
            label="Language"
            value={offerLanguage}
            onChange={(event) => setOfferLanguage(event.target.value)}
          />
          <TextField
            size="small"
            type="datetime-local"
            label="Valid from"
            value={validFrom}
            onChange={(event) => setValidFrom(event.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            size="small"
            type="datetime-local"
            label="Valid until"
            value={validUntil}
            onChange={(event) => setValidUntil(event.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Box>
        <TextField
          size="small"
          multiline
          minRows={2}
          label="Offer conditions"
          value={offerTerms}
          onChange={(event) => setOfferTerms(event.target.value)}
        />
        <LoadingButton
          variant="contained"
          startIcon={<Add />}
          loading={createOfferState.isLoading}
          disabled={
            poolsQuery.isError ||
            offersQuery.isError ||
            !seatPoolId ||
            !offerTerms.trim() ||
            new Date(validUntil) <= new Date(validFrom)
          }
          onClick={() =>
            perform(
              () => createOffer({ leadId, body: offerPayload() }).unwrap(),
              'Seat offer draft created.'
            )
          }
        >
          Create Offer Draft
        </LoadingButton>

        <Stack direction={{ xs: 'column', md: 'row' }} gap={1} alignItems={{ md: 'center' }}>
          {canOverrideSeatCapacity ? (
            <>
              <ApplicantSwitchRow
                label="Enable capacity override"
                description="Allow this offer to exceed configured seat capacity."
                checked={capacityOverride}
                onChange={setCapacityOverride}
              />
              <TextField
                size="small"
                fullWidth
                label="Capacity override reason"
                value={capacityOverrideReason}
                disabled={!capacityOverride}
                onChange={(event) => setCapacityOverrideReason(event.target.value)}
              />
            </>
          ) : null}
          <TextField
            size="small"
            fullWidth
            label="Response or revocation reason"
            value={responseReason}
            onChange={(event) => setResponseReason(event.target.value)}
          />
        </Stack>
        <Button
          size="small"
          onClick={() => setOfferFormOpen(false)}
          sx={{ alignSelf: 'flex-start' }}
        >
          Cancel offer preparation
        </Button>
      </Stack>
    </ApplicantActionPanel>
  );
}
