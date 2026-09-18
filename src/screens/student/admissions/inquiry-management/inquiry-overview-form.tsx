import type { AdmissionInquiry } from 'src/redux/student/admissions/admission-inquiries-api';

import { useEffect, useState } from 'react';
import { Stack, MenuItem, TextField, Typography } from '@mui/material';
import { LoadingButton } from 'src/components/loading-button';
import { shikshaMitraToast } from 'src/components/toast';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useUpdateAdmissionInquiryMutation } from 'src/redux/student/admissions/admission-inquiries-api';

import {
  admissionInquirySourceOptions,
  admissionInquiryLanguageOptions,
} from '../admission-inquiry-model';

export function InquiryOverviewForm({
  inquiry,
  readOnly,
}: {
  inquiry: AdmissionInquiry;
  readOnly: boolean;
}) {
  const [current, setCurrent] = useState(inquiry);
  const [applicantName, setApplicantName] = useState(inquiry.applicantName);
  const [phone, setPhone] = useState(inquiry.normalizedPhone);
  const [email, setEmail] = useState(inquiry.email ?? '');
  const [source, setSource] = useState(inquiry.source);
  const [sourceDetail, setSourceDetail] = useState(inquiry.sourceDetail ?? '');
  const [preferredLanguageCode, setPreferredLanguageCode] = useState(
    inquiry.preferredLanguageCode || 'en'
  );
  const [update, updateState] = useUpdateAdmissionInquiryMutation();

  useEffect(() => {
    setCurrent(inquiry);
    setApplicantName(inquiry.applicantName);
    setPhone(inquiry.normalizedPhone);
    setEmail(inquiry.email ?? '');
    setSource(inquiry.source);
    setSourceDetail(inquiry.sourceDetail ?? '');
    setPreferredLanguageCode(inquiry.preferredLanguageCode || 'en');
  }, [inquiry]);

  const dirty =
    applicantName.trim() !== current.applicantName ||
    phone.trim() !== current.normalizedPhone ||
    email.trim() !== (current.email ?? '') ||
    source !== current.source ||
    sourceDetail.trim() !== (current.sourceDetail ?? '') ||
    preferredLanguageCode !== (current.preferredLanguageCode || 'en');

  const save = async () => {
    if (!applicantName.trim() || phone.replace(/\D/g, '').length < 7) return;
    try {
      const result = await update({
        id: current.id,
        body: {
          applicantName: applicantName.trim(),
          phone: phone.trim(),
          email: email.trim() || null,
          source,
          sourceDetail: sourceDetail.trim() || null,
          preferredLanguageCode,
          concurrencyStamp: current.concurrencyStamp,
        },
      }).unwrap();
      setCurrent(result);
      shikshaMitraToast.success({ message: 'Inquiry details updated.' });
    } catch (error) {
      shikshaMitraToast.error({
        message: parseApiProblemDetail(error).detail || 'Unable to update inquiry details.',
      });
    }
  };

  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle1">Overview</Typography>
      <TextField
        fullWidth
        required
        size="small"
        label="Applicant name"
        value={applicantName}
        disabled={readOnly}
        onChange={(event) => setApplicantName(event.target.value)}
        slotProps={{ htmlInput: { maxLength: 256 } }}
      />
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        <TextField
          fullWidth
          required
          size="small"
          label="Mobile number"
          value={phone}
          disabled={readOnly}
          error={Boolean(phone && phone.replace(/\D/g, '').length < 7)}
          helperText={
            phone && phone.replace(/\D/g, '').length < 7 ? 'Enter a valid mobile number.' : ' '
          }
          onChange={(event) => setPhone(event.target.value)}
          slotProps={{ htmlInput: { maxLength: 32, inputMode: 'tel' } }}
        />
        <TextField
          fullWidth
          size="small"
          type="email"
          label="Email"
          value={email}
          disabled={readOnly}
          onChange={(event) => setEmail(event.target.value)}
          slotProps={{ htmlInput: { maxLength: 256 } }}
        />
      </Stack>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        <TextField
          select
          fullWidth
          size="small"
          label="Source"
          value={source}
          disabled={readOnly}
          onChange={(event) => setSource(Number(event.target.value) as AdmissionInquiry['source'])}
        >
          {admissionInquirySourceOptions.map((label, value) => (
            <MenuItem key={label} value={value}>
              {label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          fullWidth
          size="small"
          label="Communication language"
          value={preferredLanguageCode}
          disabled={readOnly}
          onChange={(event) => setPreferredLanguageCode(event.target.value)}
        >
          {admissionInquiryLanguageOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </Stack>
      <TextField
        fullWidth
        size="small"
        label="Source details"
        value={sourceDetail}
        disabled={readOnly}
        onChange={(event) => setSourceDetail(event.target.value)}
        slotProps={{ htmlInput: { maxLength: 512 } }}
      />
      {!readOnly && (
        <LoadingButton
          variant="outlined"
          loading={updateState.isLoading}
          disabled={!dirty || !applicantName.trim() || phone.replace(/\D/g, '').length < 7}
          onClick={save}
          sx={{ alignSelf: 'flex-start' }}
        >
          Save changes
        </LoadingButton>
      )}
    </Stack>
  );
}
