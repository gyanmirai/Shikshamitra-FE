import type { AdmissionInquiry } from 'src/redux/student/admissions/admission-inquiries-api';

import { useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { LoadingButton } from 'src/components/loading-button';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { Stack, Button, MenuItem, TextField, Typography } from '@mui/material';
import { useUpdateAdmissionInquiryMutation } from 'src/redux/student/admissions/admission-inquiries-api';

import { useAdmissionUnsavedChanges } from '../use-admission-unsaved-changes';
import {
  admissionInquirySourceOptions,
  admissionInquiryLanguageOptions,
} from '../admission-inquiry-model';

export function InquiryOverviewForm({
  inquiry,
  readOnly,
  onCancel,
  title = 'Overview',
}: {
  inquiry: AdmissionInquiry;
  readOnly: boolean;
  onCancel?: () => void;
  title?: string;
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
  const validPhone = /^[6-9]\d{9}$/.test(phone.replace(/\D/g, ''));

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
  useAdmissionUnsavedChanges(!readOnly, dirty);

  const save = async () => {
    if (!applicantName.trim() || !validPhone) return;
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
      <Typography variant="subtitle1" component="h2">
        {title}
      </Typography>
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
          error={Boolean(phone && !validPhone)}
          helperText={phone && !validPhone ? 'Enter a valid 10-digit Indian mobile number.' : ' '}
          onChange={(event) => setPhone(event.target.value.replace(/\D/g, '').slice(0, 10))}
          slotProps={{ htmlInput: { maxLength: 10, inputMode: 'numeric' } }}
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
        <Stack direction="row" spacing={1} justifyContent={onCancel ? 'flex-end' : 'flex-start'}>
          {onCancel && (
            <Button
              size="small"
              variant="outlined"
              disabled={updateState.isLoading}
              onClick={() => {
                if (dirty && !window.confirm('Discard unsaved inquiry changes?')) return;
                onCancel();
              }}
            >
              Cancel
            </Button>
          )}
          <LoadingButton
            size="small"
            variant={onCancel ? 'contained' : 'outlined'}
            loading={updateState.isLoading}
            disabled={!dirty || !applicantName.trim() || !validPhone}
            onClick={save}
          >
            Save changes
          </LoadingButton>
        </Stack>
      )}
    </Stack>
  );
}
