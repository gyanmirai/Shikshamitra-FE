'use client';

import type { AdmissionFormFieldType } from 'src/redux/student/admissions/admission-forms-api';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useRef, useState, useEffect } from 'react';
import AdmissionRuntimeField from 'src/screens/student/admissions/admission-runtime-field';
import { useAdmissionPhotoReads } from 'src/screens/student/admissions/use-admission-photo-reads';
import { isAdmissionRuleVisible } from 'src/screens/student/admissions/admission-visibility-rules';
import { buildDynamicAdmissionYupSchema } from 'src/screens/student/admissions/admission-form-validation';
import { preserveCompatibleInquiryAnswers } from 'src/screens/student/admissions/admission-inquiry-model';
import {
  Box,
  Card,
  Alert,
  Stack,
  Button,
  Checkbox,
  MenuItem,
  TextField,
  Typography,
  CircularProgress,
  FormControlLabel,
} from '@mui/material';

type PublicField = {
  code: string;
  label: string;
  fieldType: AdmissionFormFieldType;
  required: boolean;
  readOnly: boolean;
  displayOrder: number;
  placeholder?: string | null;
  helpText?: string | null;
  defaultValue?: string | null;
  optionsJson?: string | null;
  validationJson?: string | null;
  visibilityRuleJson?: string | null;
  requiredRuleJson?: string | null;
  isIdentityFallback?: boolean;
};
type PublicSection = {
  code: string;
  name: string;
  displayOrder: number;
  visibilityRuleJson?: string | null;
  fields: PublicField[];
};
type PublicOffering = {
  id: string;
  name: string;
  code: string;
  boardId: string;
  boardName: string;
  mediumId: string;
  mediumName: string;
  standardId: string;
  standardName: string;
  canCreateInquiry?: boolean;
  unavailableReason?: string | null;
};
type PublicContext = {
  logoUrl?: string | null;
  bannerUrl?: string | null;
  offerings: PublicOffering[];
  academicOptions?: Omit<PublicOffering, 'id' | 'name' | 'code'>[];
  admissionCycleName: string;
  source: number;
  form?: { id: string; name: string; version: number; sections: PublicSection[] } | null;
};
type InquiryValues = {
  fields: Record<string, string>;
  consentToContact: boolean;
};
type PublicInquiryDraft = { fields: PublicField[]; values: Record<string, string> };

const apiBase = `${process.env.NEXT_PUBLIC_API_URL}/api`;

const serializeValue = (field: PublicField, value: string) => {
  if ([7, 9, 11].includes(field.fieldType)) {
    try {
      JSON.parse(value);
      return value;
    } catch {
      /* Store as a JSON string. */
    }
  }
  return JSON.stringify(value);
};

export default function PublicAdmissionInquiryScreen({ token }: { token: string }) {
  const [context, setContext] = useState<PublicContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [boardId, setBoardId] = useState('');
  const [mediumId, setMediumId] = useState('');
  const [standardId, setStandardId] = useState('');
  const [offeringId, setOfferingId] = useState('');
  const [formContext, setFormContext] = useState<PublicContext | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const draft = useRef<PublicInquiryDraft | null>(null);

  useEffect(() => {
    draft.current = null;
    setBoardId('');
    setMediumId('');
    setStandardId('');
    setOfferingId('');
    setFormContext(null);
    setSubmitted(false);
    setSaving(false);
  }, [token]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError('');
    fetch(`${apiBase}/public/admission-inquiries/${encodeURIComponent(token)}`, {
      cache: 'no-store',
    })
      .then((response) => {
        if (!response.ok) throw new Error('This inquiry link is unavailable or has expired.');
        return response.json() as Promise<PublicContext>;
      })
      .then((value) => {
        if (mounted) setContext(value);
      })
      .catch(() => {
        if (mounted) setError('This inquiry link is unavailable or has expired.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [token, retry]);

  const all = context?.offerings ?? [];
  const academic = context?.academicOptions ?? all;
  const unique = (items: { id: string; name: string }[]) =>
    Array.from(new Map(items.map((item) => [item.id, item])).values());
  const classOfferings = all.filter(
    (item) =>
      item.boardId === boardId && item.mediumId === mediumId && item.standardId === standardId
  );
  const matching = classOfferings.filter((item) => item.canCreateInquiry !== false);
  useEffect(() => {
    if (matching.length === 1 && !offeringId) setOfferingId(matching[0].id);
  }, [matching, offeringId]);
  useEffect(() => {
    let active = true;
    setFormContext(null);
    setFormError('');
    if (!offeringId) {
      setFormLoading(false);
      return () => {
        active = false;
      };
    }
    setFormLoading(true);
    fetch(
      `${apiBase}/public/admission-inquiries/${encodeURIComponent(token)}?offeringId=${encodeURIComponent(offeringId)}`,
      { cache: 'no-store' }
    )
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.error?.message || 'Admission is not open for the selected class.');
        if (active) setFormContext(data);
      })
      .catch((failure: Error) => {
        if (active) setFormError(failure.message);
      })
      .finally(() => {
        if (active) setFormLoading(false);
      });
    return () => {
      active = false;
    };
  }, [token, offeringId, retry]);

  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default', px: 2, py: { xs: 3, sm: 6 } }}>
      <Card variant="outlined" sx={{ maxWidth: 640, mx: 'auto', p: { xs: 2, sm: 4 } }}>
        <Stack spacing={2}>
          {context?.bannerUrl && <Box component="img" src={`${process.env.NEXT_PUBLIC_API_URL}${context.bannerUrl}`}
            alt="School banner" sx={{ width: 1, maxHeight: 160, objectFit: 'contain' }} />}
          {context?.logoUrl && !context.bannerUrl && <Box component="img" src={`${process.env.NEXT_PUBLIC_API_URL}${context.logoUrl}`}
            alt="School logo" sx={{ width: 64, height: 64, objectFit: 'contain' }} />}
          <Box>
            <Typography variant="h4" component="h1">
              Admission inquiry
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Choose a class to check admission availability, then share your details.
            </Typography>
          </Box>
          {loading && <CircularProgress size={28} aria-label="Loading inquiry form" />}
          {error && (
            <Alert
              severity="error"
              action={<Button onClick={() => setRetry((value) => value + 1)}>Retry</Button>}
            >
              {error}
            </Alert>
          )}
          {context && !submitted && (
            <>
              <Typography variant="body2">
                Admission period: {context.admissionCycleName}
              </Typography>
              <TextField
                select
                fullWidth
                required
                size="small"
                label="Board"
                value={boardId}
                disabled={saving}
                onChange={(event) => {
                  setBoardId(event.target.value);
                  setMediumId('');
                  setStandardId('');
                  setOfferingId('');
                }}
              >
                {unique(academic.map((item) => ({ id: item.boardId, name: item.boardName }))).map(
                  (item) => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.name}
                    </MenuItem>
                  )
                )}
              </TextField>
              <TextField
                select
                fullWidth
                required
                size="small"
                label="Medium"
                value={mediumId}
                disabled={saving || !boardId}
                onChange={(event) => {
                  setMediumId(event.target.value);
                  setStandardId('');
                  setOfferingId('');
                }}
              >
                {unique(
                  academic
                    .filter((item) => item.boardId === boardId)
                    .map((item) => ({ id: item.mediumId, name: item.mediumName }))
                ).map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                fullWidth
                required
                size="small"
                label="Class"
                value={standardId}
                disabled={saving || !mediumId}
                onChange={(event) => {
                  setStandardId(event.target.value);
                  setOfferingId('');
                }}
              >
                {unique(
                  academic
                    .filter((item) => item.boardId === boardId && item.mediumId === mediumId)
                    .map((item) => ({ id: item.standardId, name: item.standardName }))
                ).map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name}
                  </MenuItem>
                ))}
              </TextField>
              {matching.length > 1 && (
                <TextField
                  select
                  fullWidth
                  required
                  size="small"
                  label="Admission option"
                  value={offeringId}
                  disabled={saving}
                  onChange={(event) => setOfferingId(event.target.value)}
                >
                  {matching.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.name || item.code}
                    </MenuItem>
                  ))}
                </TextField>
              )}
              {(academic.length === 0 || (standardId && matching.length === 0)) && (
                <Alert severity="warning">
                  {classOfferings.find((item) => item.unavailableReason)?.unavailableReason ||
                    'Selected class has no admission open.'}
                </Alert>
              )}
              {formLoading && (
                <CircularProgress size={24} aria-label="Checking admission availability" />
              )}
              {formError && (
                <Alert
                  severity="warning"
                  action={<Button onClick={() => setRetry((value) => value + 1)}>Retry</Button>}
                >
                  {formError}
                </Alert>
              )}
              {formContext?.form &&
                !formLoading &&
                !formError &&
                matching.some((item) => item.id === offeringId) && (
                  <InquiryForm
                    key={offeringId}
                    token={token}
                    context={formContext}
                    offering={matching.find((item) => item.id === offeringId)!}
                    draft={draft.current}
                    onDraft={(value) => { draft.current = value; }}
                    onBusy={setSaving}
                    onSubmitted={() => setSubmitted(true)}
                  />
                )}
            </>
          )}
          {submitted && (
            <Alert severity="success">
              Thank you. Your inquiry has been received. The school will contact you.
            </Alert>
          )}
        </Stack>
      </Card>
    </Box>
  );
}

function InquiryForm({
  token,
  context,
  offering,
  draft,
  onDraft,
  onBusy,
  onSubmitted,
}: {
  token: string;
  context: PublicContext;
  offering: PublicOffering;
  draft: PublicInquiryDraft | null;
  onDraft: (value: PublicInquiryDraft) => void;
  onBusy: (busy: boolean) => void;
  onSubmitted: () => void;
}) {
  const { readingPhoto, onPhotoReading } = useAdmissionPhotoReads();
  const [requestError, setRequestError] = useState('');
  const sections = context.form?.sections ?? [];
  const fields = sections.flatMap((section) => section.fields);
  const initialValues: InquiryValues = {
    fields: preserveCompatibleInquiryAnswers(draft?.fields ?? [], fields, draft?.values ?? {}),
    consentToContact: false,
  };
  const validationSchema = Yup.object({
    fields: buildDynamicAdmissionYupSchema({ sections }),
    consentToContact: Yup.boolean().oneOf([true], 'Please agree to be contacted.'),
  });
  const formik = useFormik<InquiryValues>({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      if (readingPhoto) return;
      setRequestError('');
      const visibleFields = sections
        .filter((section) => isAdmissionRuleVisible(section.visibilityRuleJson, values.fields))
        .flatMap((section) => section.fields)
        .filter(
          (field) =>
            field.fieldType !== 12 &&
            isAdmissionRuleVisible(field.visibilityRuleJson, values.fields)
        );
      const fallbackValue = (code: string) => values.fields[code]?.trim() ?? '';
      const payload = {
        admissionOfferingId: offering.id,
        boardId: offering.boardId,
        mediumId: offering.mediumId,
        standardId: offering.standardId,
        applicantFirstName: fallbackValue('PUBLIC_APPLICANT_FIRST_NAME'),
        guardianFirstName: fallbackValue('PUBLIC_GUARDIAN_FIRST_NAME'),
        guardianPhone: fallbackValue('PUBLIC_GUARDIAN_PHONE'),
        consentToContact: values.consentToContact,
        preferredLanguageCode: 'en',
        formValues: visibleFields
          .filter((field) => !field.isIdentityFallback)
          .map((field) => ({
            fieldCode: field.code,
            valueJson: serializeValue(field, values.fields[field.code] ?? ''),
          })),
      };

      try {
        const response = await fetch(
          `${apiBase}/public/admission-inquiries/${encodeURIComponent(token)}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          }
        );
        if (!response.ok) {
          const failure = await response.json().catch(() => ({}));
          throw new Error(
            failure.error?.message ||
              'We could not receive your inquiry. Check the details and try again.'
          );
        }
        onSubmitted();
      } catch (failure) {
        setRequestError(
          failure instanceof Error
            ? failure.message
            : 'We could not receive your inquiry. Check the details and try again.'
        );
      }
    },
  });
  useEffect(() => {
    onBusy(formik.isSubmitting || readingPhoto);
  }, [formik.isSubmitting, onBusy, readingPhoto]);
  useEffect(() => {
    onDraft({ fields, values: formik.values.fields });
  }, [fields, formik.values.fields, onDraft]);
  const fieldErrors = formik.errors.fields as Record<string, string> | undefined;
  const touchedFields = formik.touched.fields as Record<string, boolean> | undefined;

  return (
    <Box component="form" noValidate onSubmit={formik.handleSubmit}>
      <Stack spacing={2}>
        <Alert severity="info">Admission period: {context.admissionCycleName}</Alert>
        {context.form && (
          <>
            <Typography variant="h6" component="h2">
              {context.form.name}
            </Typography>
            {sections
              .filter((section) =>
                isAdmissionRuleVisible(section.visibilityRuleJson, formik.values.fields)
              )
              .map((section) => (
                <Stack key={section.code} spacing={1}>
                  <Typography variant="subtitle1" component="h3">
                    {section.name}
                  </Typography>
                  {section.fields
                    .filter((field) =>
                      isAdmissionRuleVisible(field.visibilityRuleJson, formik.values.fields)
                    )
                    .map((field) => (
                      <AdmissionRuntimeField
                        key={field.code}
                        onBusyChange={(busy) => onPhotoReading(field.code, busy)}
                        field={field}
                        value={formik.values.fields[field.code] ?? ''}
                        disabled={readingPhoto || formik.isSubmitting || field.readOnly}
                        error={
                          formik.submitCount > 0 || touchedFields?.[field.code]
                            ? fieldErrors?.[field.code]
                            : undefined
                        }
                        formValues={formik.values.fields}
                        onChange={(value) => formik.setFieldValue(`fields.${field.code}`, value)}
                        onBlur={() => formik.setFieldTouched(`fields.${field.code}`, true)}
                      />
                    ))}
                </Stack>
              ))}
          </>
        )}
        <FormControlLabel
          control={
            <Checkbox
              size="small"
              disabled={readingPhoto || formik.isSubmitting}
              checked={formik.values.consentToContact}
              onChange={(_, checked) => formik.setFieldValue('consentToContact', checked)}
            />
          }
          label="I agree that the school may contact me about this admission inquiry."
        />
        {formik.submitCount > 0 && formik.errors.consentToContact && (
          <Alert severity="error">{formik.errors.consentToContact}</Alert>
        )}
        {requestError && <Alert severity="error">{requestError}</Alert>}
        <Button
          type="submit"
          size="small"
          variant="contained"
          disabled={readingPhoto || formik.isSubmitting}
          sx={{ minHeight: 44 }}
        >
          {formik.isSubmitting ? 'Sending inquiry...' : 'Send inquiry'}
        </Button>
      </Stack>
    </Box>
  );
}
