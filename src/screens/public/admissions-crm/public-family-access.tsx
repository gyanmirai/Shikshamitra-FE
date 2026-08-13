'use client';

import { useRef, useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { LoadingButton } from 'src/components/loading-button';
import {
  Box,
  Alert,
  Stack,
  Paper,
  Select,
  MenuItem,
  TextField,
  InputLabel,
  Typography,
  FormControl,
} from '@mui/material';

import { PublicAdmissionsShell } from './public-admissions-shell';
import { getFamilyStatusStorageKey } from './public-family-session';
import { usePublicAdmissionsPortal } from './use-public-admissions-portal';
import { publicAdmissionsCopy, publicAdmissionsStatusCopy } from './public-admissions-copy';
import {
  createPublicAdmissionSafeError,
  readPublicAdmissionStatusProblem,
  getPublicAdmissionRequestErrorMessage,
} from './public-status-utils';
import {
  getPublicAdmissionsCoreLanguage,
  getPublicAdmissionsLanguageLabel,
  getPublicAdmissionsLanguageOptions,
} from './public-admissions-portal';

import type { PublicAdmissionsLanguage } from './public-admissions-copy';

type FamilyChallenge = {
  challengeId: string;
  maskedDestination: string;
  deliveryStatus: string;
};

type VerifiedFamilyStatus = {
  leadId: string;
  accessSessionExpiresAt?: string | null;
  familyApplications?: Array<{ leadId: string; statusToken: string }>;
};

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}/api`;

const familyCopy = {
  en: {
    title: 'Family Enrollment Center',
    description: 'Return to active applications for every child using one verified family contact.',
    contact: 'Mobile number or email',
    continue: 'Continue securely',
    sent: 'If active applications match this contact, an OTP has been sent.',
    contactRequired: 'Enter the mobile number or email used for the application.',
    otpRequired: 'Enter the OTP sent to your verified contact.',
  },
  gu: {
    title: 'પરિવાર પ્રવેશ કેન્દ્ર',
    description: 'એક ચકાસાયેલ પરિવાર સંપર્કથી દરેક બાળકની સક્રિય અરજી પર પાછા ફરો.',
    contact: 'મોબાઇલ નંબર અથવા ઇમેઇલ',
    continue: 'સુરક્ષિત રીતે આગળ વધો',
    sent: 'જો આ સંપર્ક સાથે સક્રિય અરજીઓ મળે, તો OTP મોકલવામાં આવ્યો છે.',
    contactRequired: 'અરજી માટે ઉપયોગમાં લેવાયેલ મોબાઇલ નંબર અથવા ઇમેઇલ દાખલ કરો.',
    otpRequired: 'તમારા ચકાસાયેલ સંપર્ક પર મોકલાયેલ OTP દાખલ કરો.',
  },
  hi: {
    title: 'परिवार नामांकन केंद्र',
    description: 'एक सत्यापित पारिवारिक संपर्क से प्रत्येक बच्चे के सक्रिय आवेदन पर लौटें।',
    contact: 'मोबाइल नंबर या ईमेल',
    continue: 'सुरक्षित रूप से आगे बढ़ें',
    sent: 'यदि इस संपर्क से सक्रिय आवेदन मिलते हैं, तो OTP भेजा गया है।',
    contactRequired: 'आवेदन में उपयोग किया गया मोबाइल नंबर या ईमेल दर्ज करें।',
    otpRequired: 'अपने सत्यापित संपर्क पर भेजा गया OTP दर्ज करें।',
  },
} satisfies Record<PublicAdmissionsLanguage, Record<string, string>>;

export default function PublicFamilyAccessScreen({ tenantId }: { tenantId: string }) {
  const [language, setLanguage] = useState('en');
  const [contact, setContact] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [challenge, setChallenge] = useState<FamilyChallenge | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [otpSubmitted, setOtpSubmitted] = useState(false);
  const contactInputRef = useRef<HTMLInputElement | null>(null);
  const otpInputRef = useRef<HTMLInputElement | null>(null);
  const portal = usePublicAdmissionsPortal(tenantId);
  const copyLanguage = getPublicAdmissionsCoreLanguage(language);
  const copy = publicAdmissionsCopy[copyLanguage];
  const statusCopy = publicAdmissionsStatusCopy[copyLanguage];
  const pageCopy = familyCopy[copyLanguage];
  const languageOptions = getPublicAdmissionsLanguageOptions(portal?.supportedLanguages);

  useEffect(() => {
    if (portal?.defaultLanguage && language === 'en') setLanguage(portal.defaultLanguage);
  }, [language, portal?.defaultLanguage]);

  const startAccess = async () => {
    setContactSubmitted(true);
    if (!contact.trim()) {
      contactInputRef.current?.focus();
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_BASE}/public/student-enrollment/admissions-crm/${tenantId}/family/otp`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contact: contact.trim() }),
        }
      );
      if (!response.ok) {
        const problem = await readPublicAdmissionStatusProblem(
          response,
          statusCopy.unableIssueOtp,
          copyLanguage
        );
        throw createPublicAdmissionSafeError(problem.message);
      }
      setChallenge((await response.json()) as FamilyChallenge);
      setOtpCode('');
      setOtpSubmitted(false);
    } catch (error) {
      shikshaMitraToast.error({
        message: getPublicAdmissionRequestErrorMessage(
          error,
          statusCopy.unableIssueOtp,
          copyLanguage
        ),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyAccess = async () => {
    setOtpSubmitted(true);
    if (!challenge || !otpCode.trim()) {
      otpInputRef.current?.focus();
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_BASE}/public/student-enrollment/admissions-crm/${tenantId}/family/verify`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ challengeId: challenge.challengeId, otpCode, language }),
        }
      );
      if (!response.ok) {
        const problem = await readPublicAdmissionStatusProblem(
          response,
          statusCopy.unableVerifyOtp,
          copyLanguage
        );
        throw createPublicAdmissionSafeError(problem.message);
      }

      const status = (await response.json()) as VerifiedFamilyStatus;
      const currentApplication = status.familyApplications?.find(
        (application) => application.leadId === status.leadId
      );
      if (!currentApplication) {
        throw createPublicAdmissionSafeError(statusCopy.unableVerifyOtp);
      }
      window.sessionStorage.setItem(
        getFamilyStatusStorageKey(tenantId, currentApplication.statusToken),
        JSON.stringify(status)
      );
      window.location.assign(
        `/student/admissions/status/${tenantId}/${currentApplication.statusToken}`
      );
    } catch (error) {
      shikshaMitraToast.error({
        message: getPublicAdmissionRequestErrorMessage(
          error,
          statusCopy.unableVerifyOtp,
          copyLanguage
        ),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PublicAdmissionsShell
      title={pageCopy.title}
      description={pageCopy.description}
      language={copyLanguage}
      portal={portal}
    >
      <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, width: '100%', maxWidth: 560 }}>
        <Stack spacing={2}>
          <FormControl size="small" sx={{ alignSelf: 'flex-end', minWidth: 140 }}>
            <InputLabel id="family-access-language">{copy.language}</InputLabel>
            <Select
              labelId="family-access-language"
              label={copy.language}
              value={language}
              inputProps={{ name: 'family-access-language' }}
              onChange={(event) => setLanguage(event.target.value)}
            >
              {languageOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {getPublicAdmissionsLanguageLabel(option, copyLanguage)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {!challenge ? (
            <Box
              component="form"
              onSubmit={(event) => {
                event.preventDefault();
                startAccess();
              }}
              sx={{ display: 'grid', gap: 2 }}
            >
              <TextField
                label={pageCopy.contact}
                name="familyContact"
                inputRef={contactInputRef}
                value={contact}
                onChange={(event) => setContact(event.target.value)}
                error={contactSubmitted && !contact.trim()}
                helperText={
                  contactSubmitted && !contact.trim() ? pageCopy.contactRequired : undefined
                }
                autoComplete="username"
                fullWidth
              />
              <LoadingButton type="submit" variant="contained" loading={isLoading}>
                {pageCopy.continue}
              </LoadingButton>
            </Box>
          ) : (
            <Box
              component="form"
              onSubmit={(event) => {
                event.preventDefault();
                verifyAccess();
              }}
              sx={{ display: 'grid', gap: 2 }}
            >
              <Alert severity="info">{pageCopy.sent}</Alert>
              <Typography variant="body2" color="text.secondary">
                {copy.destination}: {challenge.maskedDestination}
              </Typography>
              <TextField
                label={copy.otpCode}
                name="oneTimeCode"
                inputRef={otpInputRef}
                value={otpCode}
                onChange={(event) => setOtpCode(event.target.value)}
                error={otpSubmitted && !otpCode.trim()}
                helperText={otpSubmitted && !otpCode.trim() ? pageCopy.otpRequired : undefined}
                autoComplete="one-time-code"
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                fullWidth
              />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <LoadingButton type="submit" variant="contained" loading={isLoading}>
                  {copy.verify}
                </LoadingButton>
                <LoadingButton
                  type="button"
                  variant="outlined"
                  loading={isLoading}
                  onClick={startAccess}
                >
                  {copy.resendOtp}
                </LoadingButton>
              </Stack>
            </Box>
          )}
        </Stack>
      </Paper>
    </PublicAdmissionsShell>
  );
}
