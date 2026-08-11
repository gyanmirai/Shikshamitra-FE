'use client';

import { useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { LoadingButton } from 'src/components/loading-button';
import EventAvailableRounded from '@mui/icons-material/EventAvailableRounded';
import { Box, Chip, Alert, Paper, Stack, Button, Divider, Typography } from '@mui/material';

import { formatPublicNumber, formatPublicDateTime } from './public-admissions-format';
import {
  createPublicAdmissionSafeError,
  readPublicAdmissionStatusProblem,
  getPublicAdmissionRequestErrorMessage,
} from './public-status-utils';

import type { PublicAdmissionsLanguage } from './public-admissions-copy';

type PublicEvent = {
  id: string;
  title: string;
  eventType: number;
  startsAt: string;
  endsAt: string;
  location: string;
  instructions?: string | null;
  availableCount: number;
  registrationId?: string | null;
  registrationStatus?: number | null;
};

type Props = {
  tenantId: string;
  token: string;
  accessSessionToken: string;
  language?: PublicAdmissionsLanguage;
};

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}/api`;
const copy = {
  en: {
    title: 'Visits and events',
    hint: 'Reserve a place for this applicant. Availability updates as families book.',
    available: 'places available',
    reserve: 'Reserve place',
    reserved: 'Reserved',
    cancel: 'Cancel reservation',
    confirm: 'Confirm cancellation',
    keep: 'Keep reservation',
    booked: 'Your place is reserved.',
    cancelled: 'The reservation was cancelled.',
    failed: 'The event reservation could not be updated.',
    full: 'Fully booked',
  },
  gu: {
    title: 'મુલાકાત અને કાર્યક્રમો',
    hint: 'આ અરજદાર માટે જગ્યા અનામત કરો. પરિવારો બુક કરે તેમ ઉપલબ્ધતા બદલાય છે.',
    available: 'જગ્યા ઉપલબ્ધ',
    reserve: 'જગ્યા અનામત કરો',
    reserved: 'અનામત',
    cancel: 'અનામત રદ કરો',
    confirm: 'રદ કરવાની પુષ્ટિ કરો',
    keep: 'અનામત રાખો',
    booked: 'તમારી જગ્યા અનામત થઈ ગઈ છે.',
    cancelled: 'અનામત રદ કરવામાં આવી.',
    failed: 'કાર્યક્રમની અનામત અપડેટ થઈ શકી નથી.',
    full: 'બધી જગ્યાઓ ભરાઈ ગઈ',
  },
  hi: {
    title: 'भ्रमण और कार्यक्रम',
    hint: 'इस आवेदक के लिए स्थान आरक्षित करें। परिवारों की बुकिंग के साथ उपलब्धता बदलती है।',
    available: 'स्थान उपलब्ध',
    reserve: 'स्थान आरक्षित करें',
    reserved: 'आरक्षित',
    cancel: 'आरक्षण रद्द करें',
    confirm: 'रद्द करने की पुष्टि करें',
    keep: 'आरक्षण रखें',
    booked: 'आपका स्थान आरक्षित है।',
    cancelled: 'आरक्षण रद्द कर दिया गया।',
    failed: 'कार्यक्रम आरक्षण अपडेट नहीं हो सका।',
    full: 'सभी स्थान भर गए',
  },
} satisfies Record<PublicAdmissionsLanguage, Record<string, string>>;

export default function PublicEvents({
  tenantId,
  token,
  accessSessionToken,
  language = 'en',
}: Props) {
  const labels = copy[language];
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [loadingEventId, setLoadingEventId] = useState<string | null>(null);
  const [confirmingEventId, setConfirmingEventId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await fetch(
          `${API_BASE}/public/student-enrollment/admissions-crm/${tenantId}/status/${token}/events`,
          { headers: { 'X-Admission-Access-Session': accessSessionToken } }
        );
        if (!response.ok || !active) return;
        const payload = (await response.json()) as { events?: PublicEvent[] };
        if (active) setEvents(payload.events || []);
      } catch {
        if (active) setEvents([]);
      }
    };
    load().catch(() => undefined);
    return () => {
      active = false;
    };
  }, [accessSessionToken, tenantId, token]);

  const updateReservation = async (admissionEvent: PublicEvent, cancel: boolean) => {
    setLoadingEventId(admissionEvent.id);
    try {
      const action = cancel ? 'cancel' : 'reserve';
      const response = await fetch(
        `${API_BASE}/public/student-enrollment/admissions-crm/${tenantId}/status/${token}/events/${admissionEvent.id}/${action}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Admission-Access-Session': accessSessionToken,
          },
          body: JSON.stringify({
            ...(cancel ? { reason: 'Cancelled from the family admissions center.' } : {}),
          }),
        }
      );
      if (!response.ok) {
        const problem = await readPublicAdmissionStatusProblem(response, labels.failed, language);
        throw createPublicAdmissionSafeError(problem.message);
      }
      const updated = (await response.json()) as PublicEvent;
      setEvents((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setConfirmingEventId(null);
      shikshaMitraToast.success({ message: cancel ? labels.cancelled : labels.booked });
    } catch (error) {
      shikshaMitraToast.error({
        message: getPublicAdmissionRequestErrorMessage(error, labels.failed, language),
      });
    } finally {
      setLoadingEventId(null);
    }
  };

  if (!events.length) return null;

  return (
    <Stack spacing={1.25}>
      <Divider />
      <Box>
        <Typography variant="subtitle1">{labels.title}</Typography>
        <Typography variant="caption" color="text.secondary">
          {labels.hint}
        </Typography>
      </Box>
      {events.map((admissionEvent) => {
        const isReserved = admissionEvent.registrationStatus === 0;
        const isFull = admissionEvent.availableCount < 1 && !isReserved;
        const confirming = confirmingEventId === admissionEvent.id;
        return (
          <Paper key={admissionEvent.id} variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between" gap={1} alignItems="start">
                <Box>
                  <Typography variant="subtitle2">{admissionEvent.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatPublicDateTime(admissionEvent.startsAt, language)} ·{' '}
                    {admissionEvent.location}
                  </Typography>
                </Box>
                {isReserved ? <Chip size="small" color="success" label={labels.reserved} /> : null}
              </Stack>
              {admissionEvent.instructions ? (
                <Typography variant="body2">{admissionEvent.instructions}</Typography>
              ) : null}
              <Typography variant="caption" color="text.secondary">
                {isFull
                  ? labels.full
                  : `${formatPublicNumber(admissionEvent.availableCount, language)} ${labels.available}`}
              </Typography>
              {confirming ? (
                <Alert
                  severity="warning"
                  action={
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={0.5}>
                      <Button size="small" onClick={() => setConfirmingEventId(null)}>
                        {labels.keep}
                      </Button>
                      <LoadingButton
                        size="small"
                        color="warning"
                        loading={loadingEventId === admissionEvent.id}
                        onClick={() => updateReservation(admissionEvent, true)}
                      >
                        {labels.confirm}
                      </LoadingButton>
                    </Stack>
                  }
                >
                  {labels.cancel}
                </Alert>
              ) : isReserved ? (
                <Button
                  size="small"
                  color="inherit"
                  sx={{ alignSelf: 'flex-start' }}
                  onClick={() => setConfirmingEventId(admissionEvent.id)}
                >
                  {labels.cancel}
                </Button>
              ) : (
                <LoadingButton
                  size="small"
                  variant="outlined"
                  loading={loadingEventId === admissionEvent.id}
                  disabled={isFull}
                  startIcon={<EventAvailableRounded />}
                  sx={{ alignSelf: 'flex-start' }}
                  onClick={() => updateReservation(admissionEvent, false)}
                >
                  {labels.reserve}
                </LoadingButton>
              )}
            </Stack>
          </Paper>
        );
      })}
    </Stack>
  );
}
