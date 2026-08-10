'use client';

import { useState } from 'react';
import { Close, CheckCircle } from '@mui/icons-material';
import { shikshaMitraToast } from 'src/components/toast';
import { LoadingButton } from 'src/components/loading-button';
import {
  AdmissionCrmSeatOfferType,
  AdmissionCrmSeatOfferStatus,
} from 'src/redux/student/admissions-crm/final-admission-contracts';
import {
  Box,
  Chip,
  Alert,
  Paper,
  Stack,
  Divider,
  Checkbox,
  TextField,
  Typography,
  FormControlLabel,
} from '@mui/material';

import { publicAdmissionsActionCopy } from './public-admissions-copy';
import { getAccessibleStatusChipProps } from './public-admissions-styles';
import { formatPublicDateTime, getPublicStatusLabel } from './public-admissions-format';
import {
  createPublicAdmissionSafeError,
  readPublicAdmissionStatusProblem,
  getPublicAdmissionRequestErrorMessage,
} from './public-status-utils';

import type { PublicAdmissionsLanguage } from './public-admissions-copy';

export type PublicAdmissionOffer = {
  offerId: string;
  offerNumber: string;
  offerType: AdmissionCrmSeatOfferType;
  status: AdmissionCrmSeatOfferStatus;
  terms: Record<string, string | null>;
  language: string;
  validFrom: string;
  validUntil: string;
  openedAt?: string | null;
  respondedAt?: string | null;
  responseReason?: string | null;
};

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}/api`;

export default function PublicOffer({
  tenantId,
  token,
  accessSessionToken,
  offer,
  onUpdated,
  language = 'en',
}: {
  tenantId: string;
  token: string;
  accessSessionToken: string;
  offer: PublicAdmissionOffer;
  onUpdated: (offer: PublicAdmissionOffer) => void;
  language?: PublicAdmissionsLanguage;
}) {
  const copy = publicAdmissionsActionCopy[language];
  const [reason, setReason] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [action, setAction] = useState<'accept' | 'decline' | null>(null);
  const isOpen = [AdmissionCrmSeatOfferStatus.Issued, AdmissionCrmSeatOfferStatus.Opened].includes(
    offer.status
  );

  const respond = async (accept: boolean) => {
    if (!accept && !reason.trim()) {
      shikshaMitraToast.error({ message: copy.declineReasonRequired });
      return;
    }
    setAction(accept ? 'accept' : 'decline');
    try {
      const response = await fetch(
        `${API_BASE}/public/student-enrollment/admissions-crm/${tenantId}/status/${token}/offers/${offer.offerId}/respond`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            accessSessionToken,
            accept,
            reason: reason.trim() || null,
            language: offer.language,
            declarations: accept ? { offerTermsAccepted: termsAccepted } : {},
          }),
        }
      );
      if (!response.ok) {
        const problem = await readPublicAdmissionStatusProblem(
          response,
          copy.offerResponseFailed,
          language
        );
        throw createPublicAdmissionSafeError(problem.message);
      }
      const updated = (await response.json()) as PublicAdmissionOffer;
      onUpdated(updated);
      shikshaMitraToast.success({
        message: accept ? copy.offerAccepted : copy.offerDeclined,
      });
    } catch (error) {
      shikshaMitraToast.error({
        message: getPublicAdmissionRequestErrorMessage(error, copy.offerResponseFailed, language),
      });
    } finally {
      setAction(null);
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
      <Stack spacing={1.25}>
        <Stack direction="row" justifyContent="space-between" gap={1} alignItems="center">
          <Box>
            <Typography variant="subtitle1">
              {offer.offerType === AdmissionCrmSeatOfferType.Final
                ? copy.admissionOffer
                : copy.provisionalOffer}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {offer.offerNumber}
            </Typography>
          </Box>
          <Chip
            size="small"
            {...getAccessibleStatusChipProps(
              offer.status === AdmissionCrmSeatOfferStatus.Accepted
                ? 'success'
                : isOpen
                  ? 'warning'
                  : 'default'
            )}
            label={getPublicStatusLabel(AdmissionCrmSeatOfferStatus[offer.status], language)}
          />
        </Stack>
        <Typography variant="body2" color="text.secondary">
          {copy.respondBy} {formatPublicDateTime(offer.validUntil, language)}.
        </Typography>
        <Divider />
        {Object.entries(offer.terms).map(([key, value]) => (
          <Stack key={key} direction={{ xs: 'column', sm: 'row' }} gap={1}>
            <Typography variant="body2" fontWeight={600} sx={{ minWidth: 120 }}>
              {key}
            </Typography>
            <Typography variant="body2">{value || '-'}</Typography>
          </Stack>
        ))}
        {isOpen ? (
          <>
            <FormControlLabel
              control={
                <Checkbox
                  checked={termsAccepted}
                  onChange={(event) => setTermsAccepted(event.target.checked)}
                />
              }
              label={copy.acceptTerms}
            />
            <TextField
              size="small"
              label={copy.declineReason}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              multiline
              minRows={2}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} gap={1}>
              <LoadingButton
                variant="contained"
                color="success"
                startIcon={<CheckCircle />}
                loading={action === 'accept'}
                disabled={action === 'decline' || !termsAccepted}
                onClick={() => respond(true)}
              >
                {copy.acceptOffer}
              </LoadingButton>
              <LoadingButton
                variant="outlined"
                color="error"
                startIcon={<Close />}
                loading={action === 'decline'}
                disabled={action === 'accept' || !reason.trim()}
                onClick={() => respond(false)}
              >
                {copy.declineOffer}
              </LoadingButton>
            </Stack>
          </>
        ) : (
          <Alert
            severity={offer.status === AdmissionCrmSeatOfferStatus.Accepted ? 'success' : 'info'}
          >
            {offer.status === AdmissionCrmSeatOfferStatus.Accepted
              ? copy.accepted
              : offer.responseReason ||
                `${copy.offerStatus}: ${getPublicStatusLabel(
                  AdmissionCrmSeatOfferStatus[offer.status],
                  language
                )}.`}
          </Alert>
        )}
      </Stack>
    </Paper>
  );
}
