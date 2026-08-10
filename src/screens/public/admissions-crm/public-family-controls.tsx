'use client';

import { useRef, useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { LoadingButton } from 'src/components/loading-button';
import {
  Box,
  Alert,
  Stack,
  Button,
  Switch,
  Divider,
  TextField,
  FormGroup,
  Typography,
  FormControlLabel,
} from '@mui/material';

import {
  createPublicAdmissionSafeError,
  readPublicAdmissionStatusProblem,
  getPublicAdmissionRequestErrorMessage,
} from './public-status-utils';

import type { PublicAdmissionsLanguage } from './public-admissions-copy';

export type PublicAdmissionCommunicationPreferences = {
  whatsApp: boolean;
  sms: boolean;
  email: boolean;
  hasPhoneContact: boolean;
  hasEmailContact: boolean;
};

type UpdatedApplicantStatus = {
  communicationPreferences: PublicAdmissionCommunicationPreferences;
  canWithdrawApplication: boolean;
  [key: string]: unknown;
};

const copy = {
  en: {
    title: 'Communication preferences',
    description: 'Choose how the admissions team may contact your family about this application.',
    whatsApp: 'WhatsApp updates',
    sms: 'SMS updates',
    email: 'Email updates',
    unavailable: 'Add this contact method to the application before enabling it.',
    save: 'Save preferences',
    saved: 'Communication preferences saved.',
    saveError: 'We could not save your communication preferences. Please try again.',
    withdrawTitle: 'Withdraw this application',
    withdrawDescription:
      'Use this only if your family no longer wants this application considered. The admissions team can help if you are unsure.',
    startWithdraw: 'Start withdrawal',
    cancel: 'Keep application',
    reason: 'Reason for withdrawal',
    reasonHelp: 'Briefly tell the admissions team why you are withdrawing.',
    reasonRequired: 'Enter a reason before withdrawing the application.',
    confirm: 'Confirm withdrawal',
    warning:
      'This closes the application and releases any reserved seat or active waitlist place. Contact the admissions office if you later want to reapply.',
    withdrawn: 'The application has been withdrawn.',
    withdrawError: 'We could not withdraw the application. Please contact the admissions office.',
  },
  gu: {
    title: 'સંદેશાવ્યવહારની પસંદગીઓ',
    description: 'આ અરજી વિશે પ્રવેશ ટીમ તમારા પરિવારનો કેવી રીતે સંપર્ક કરી શકે તે પસંદ કરો.',
    whatsApp: 'WhatsApp અપડેટ્સ',
    sms: 'SMS અપડેટ્સ',
    email: 'ઇમેઇલ અપડેટ્સ',
    unavailable: 'આ વિકલ્પ ચાલુ કરતાં પહેલાં અરજીમાં આ સંપર્ક વિગત ઉમેરો.',
    save: 'પસંદગીઓ સાચવો',
    saved: 'સંદેશાવ્યવહારની પસંદગીઓ સાચવાઈ.',
    saveError: 'પસંદગીઓ સાચવી શકાઈ નથી. કૃપા કરીને ફરી પ્રયાસ કરો.',
    withdrawTitle: 'આ અરજી પાછી ખેંચો',
    withdrawDescription:
      'તમારો પરિવાર હવે આ અરજી પર વિચાર ન કરાવવા માગતો હોય ત્યારે જ આ વિકલ્પ વાપરો.',
    startWithdraw: 'અરજી પાછી ખેંચવાનું શરૂ કરો',
    cancel: 'અરજી ચાલુ રાખો',
    reason: 'અરજી પાછી ખેંચવાનું કારણ',
    reasonHelp: 'પ્રવેશ ટીમ માટે ટૂંકું કારણ લખો.',
    reasonRequired: 'અરજી પાછી ખેંચતા પહેલાં કારણ લખો.',
    confirm: 'અરજી પાછી ખેંચવાની પુષ્ટિ કરો',
    warning: 'આ અરજી બંધ કરશે અને આરક્ષિત બેઠક અથવા સક્રિય પ્રતીક્ષા સ્થાન મુક્ત કરશે.',
    withdrawn: 'અરજી પાછી ખેંચાઈ ગઈ છે.',
    withdrawError: 'અરજી પાછી ખેંચી શકાઈ નથી. કૃપા કરીને પ્રવેશ કચેરીનો સંપર્ક કરો.',
  },
  hi: {
    title: 'संचार प्राथमिकताएँ',
    description: 'चुनें कि प्रवेश टीम इस आवेदन के बारे में आपके परिवार से कैसे संपर्क कर सकती है।',
    whatsApp: 'WhatsApp अपडेट',
    sms: 'SMS अपडेट',
    email: 'ईमेल अपडेट',
    unavailable: 'इसे चालू करने से पहले आवेदन में यह संपर्क विवरण जोड़ें।',
    save: 'प्राथमिकताएँ सहेजें',
    saved: 'संचार प्राथमिकताएँ सहेज दी गई हैं।',
    saveError: 'प्राथमिकताएँ सहेजी नहीं जा सकीं। कृपया फिर से प्रयास करें।',
    withdrawTitle: 'यह आवेदन वापस लें',
    withdrawDescription: 'इसका उपयोग तभी करें जब आपका परिवार इस आवेदन पर आगे विचार नहीं चाहता हो।',
    startWithdraw: 'आवेदन वापसी शुरू करें',
    cancel: 'आवेदन जारी रखें',
    reason: 'आवेदन वापस लेने का कारण',
    reasonHelp: 'प्रवेश टीम के लिए संक्षिप्त कारण लिखें।',
    reasonRequired: 'आवेदन वापस लेने से पहले कारण दर्ज करें।',
    confirm: 'आवेदन वापसी की पुष्टि करें',
    warning: 'इससे आवेदन बंद होगा और आरक्षित सीट या सक्रिय प्रतीक्षा सूची स्थान मुक्त हो जाएगा।',
    withdrawn: 'आवेदन वापस ले लिया गया है।',
    withdrawError: 'आवेदन वापस नहीं लिया जा सका। कृपया प्रवेश कार्यालय से संपर्क करें।',
  },
} satisfies Record<PublicAdmissionsLanguage, Record<string, string>>;

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}/api`;

export default function PublicFamilyControls({
  tenantId,
  token,
  accessSessionToken,
  language,
  preferences,
  canWithdrawApplication,
  onUpdated,
}: {
  tenantId: string;
  token: string;
  accessSessionToken: string;
  language: PublicAdmissionsLanguage;
  preferences: PublicAdmissionCommunicationPreferences;
  canWithdrawApplication: boolean;
  onUpdated: (status: UpdatedApplicantStatus) => void;
}) {
  const labels = copy[language];
  const [draft, setDraft] = useState(preferences);
  const [isSaving, setIsSaving] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawReason, setWithdrawReason] = useState('');
  const [withdrawReasonError, setWithdrawReasonError] = useState(false);
  const withdrawReasonInputRef = useRef<HTMLInputElement | null>(null);
  const [feedback, setFeedback] = useState<
    { severity: 'success' | 'error'; message: string } | undefined
  >();

  useEffect(() => setDraft(preferences), [preferences]);

  const savePreferences = async () => {
    setIsSaving(true);
    setFeedback(undefined);
    try {
      const response = await fetch(
        `${API_BASE}/public/student-enrollment/admissions-crm/${tenantId}/status/${token}/communication-preferences`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessSessionToken, ...draft }),
        }
      );
      if (!response.ok) {
        const problem = await readPublicAdmissionStatusProblem(
          response,
          labels.saveError,
          language
        );
        throw createPublicAdmissionSafeError(problem.message);
      }
      const updated = (await response.json()) as UpdatedApplicantStatus;
      onUpdated(updated);
      setFeedback({ severity: 'success', message: labels.saved });
    } catch (error) {
      const message = getPublicAdmissionRequestErrorMessage(error, labels.saveError, language);
      setFeedback({ severity: 'error', message });
      shikshaMitraToast.error({ message });
    } finally {
      setIsSaving(false);
    }
  };

  const withdraw = async () => {
    if (!withdrawReason.trim()) {
      setWithdrawReasonError(true);
      setFeedback({ severity: 'error', message: labels.reasonRequired });
      withdrawReasonInputRef.current?.focus();
      return;
    }
    setIsWithdrawing(true);
    setFeedback(undefined);
    try {
      const response = await fetch(
        `${API_BASE}/public/student-enrollment/admissions-crm/${tenantId}/status/${token}/withdraw`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessSessionToken, reason: withdrawReason.trim() }),
        }
      );
      if (!response.ok) {
        const problem = await readPublicAdmissionStatusProblem(
          response,
          labels.withdrawError,
          language
        );
        throw createPublicAdmissionSafeError(problem.message);
      }
      const updated = (await response.json()) as UpdatedApplicantStatus;
      onUpdated(updated);
      setWithdrawOpen(false);
      setWithdrawReason('');
      setWithdrawReasonError(false);
      setFeedback({ severity: 'success', message: labels.withdrawn });
    } catch (error) {
      const message = getPublicAdmissionRequestErrorMessage(error, labels.withdrawError, language);
      setFeedback({ severity: 'error', message });
      shikshaMitraToast.error({ message });
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <Stack spacing={2}>
      <Divider />
      <Box>
        <Typography variant="subtitle2">{labels.title}</Typography>
        <Typography variant="body2" color="text.secondary">
          {labels.description}
        </Typography>
      </Box>
      {feedback ? <Alert severity={feedback.severity}>{feedback.message}</Alert> : null}
      <FormGroup>
        <FormControlLabel
          control={
            <Switch
              checked={draft.whatsApp}
              disabled={!draft.hasPhoneContact || isSaving}
              onChange={(event) =>
                setDraft((current) => ({ ...current, whatsApp: event.target.checked }))
              }
            />
          }
          label={labels.whatsApp}
        />
        <FormControlLabel
          control={
            <Switch
              checked={draft.sms}
              disabled={!draft.hasPhoneContact || isSaving}
              onChange={(event) =>
                setDraft((current) => ({ ...current, sms: event.target.checked }))
              }
            />
          }
          label={labels.sms}
        />
        <FormControlLabel
          control={
            <Switch
              checked={draft.email}
              disabled={!draft.hasEmailContact || isSaving}
              onChange={(event) =>
                setDraft((current) => ({ ...current, email: event.target.checked }))
              }
            />
          }
          label={labels.email}
        />
      </FormGroup>
      {!draft.hasPhoneContact || !draft.hasEmailContact ? (
        <Typography variant="caption" color="text.secondary">
          {labels.unavailable}
        </Typography>
      ) : null}
      <LoadingButton
        variant="outlined"
        loading={isSaving}
        onClick={savePreferences}
        sx={{ alignSelf: 'flex-start' }}
      >
        {labels.save}
      </LoadingButton>

      {canWithdrawApplication ? (
        <Stack spacing={1.5}>
          <Divider />
          <Box>
            <Typography variant="subtitle2">{labels.withdrawTitle}</Typography>
            <Typography variant="body2" color="text.secondary">
              {labels.withdrawDescription}
            </Typography>
          </Box>
          {!withdrawOpen ? (
            <Button
              color="error"
              variant="text"
              onClick={() => setWithdrawOpen(true)}
              sx={{ alignSelf: 'flex-start' }}
            >
              {labels.startWithdraw}
            </Button>
          ) : (
            <Stack spacing={1.5}>
              <Alert severity="warning">{labels.warning}</Alert>
              <TextField
                label={labels.reason}
                value={withdrawReason}
                onChange={(event) => {
                  setWithdrawReason(event.target.value);
                  if (event.target.value.trim()) setWithdrawReasonError(false);
                }}
                inputRef={withdrawReasonInputRef}
                error={withdrawReasonError}
                helperText={withdrawReasonError ? labels.reasonRequired : labels.reasonHelp}
                required
                multiline
                minRows={2}
                fullWidth
              />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <LoadingButton
                  color="error"
                  variant="contained"
                  loading={isWithdrawing}
                  onClick={withdraw}
                >
                  {labels.confirm}
                </LoadingButton>
                <Button
                  variant="outlined"
                  disabled={isWithdrawing}
                  onClick={() => {
                    setWithdrawOpen(false);
                    setWithdrawReason('');
                    setWithdrawReasonError(false);
                  }}
                >
                  {labels.cancel}
                </Button>
              </Stack>
            </Stack>
          )}
        </Stack>
      ) : null}
    </Stack>
  );
}
