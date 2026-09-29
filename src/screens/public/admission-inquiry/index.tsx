'use client';

import type { AdmissionFormFieldType } from 'src/redux/student/admissions/admission-forms-api';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useState, useEffect } from 'react';
import ShakingTextField from 'src/components/shaking-text-field';
import AdmissionRuntimeField from 'src/screens/student/admissions/admission-runtime-field';
import { isAdmissionRuleVisible } from 'src/screens/student/admissions/admission-visibility-rules';
import { buildDynamicAdmissionYupSchema } from 'src/screens/student/admissions/admission-form-validation';
import { Box, Card, Alert, Stack, Button, Checkbox, TextField, Typography, CircularProgress, FormControlLabel } from '@mui/material';

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
type PublicContext = {
  admissionCycleName: string;
  source: number;
  form?: { id: string; name: string; version: number; sections: PublicSection[] } | null;
};
type InquiryValues = {
  applicantFirstName: string;
  applicantLastName: string;
  guardianFirstName: string;
  guardianLastName: string;
  guardianPhone: string;
  guardianEmail: string;
  classInterest: string;
  fields: Record<string, string>;
  consentToContact: boolean;
};
type LegacyFieldName = Exclude<keyof InquiryValues, 'fields' | 'consentToContact'>;

const apiBase = `${process.env.NEXT_PUBLIC_API_URL}/api`;
const phoneMessage = 'Enter a valid 10-digit Indian mobile number.';
const legacySchema = Yup.object({
  applicantFirstName: Yup.string().trim().required('Student first name is required.'),
  guardianFirstName: Yup.string().trim().required('Parent or guardian first name is required.'),
  guardianPhone: Yup.string().trim().matches(/^[6-9]\d{9}$/, phoneMessage).required(phoneMessage),
  guardianEmail: Yup.string().trim().email('Enter a valid email address.'),
  consentToContact: Yup.boolean().oneOf([true], 'Please agree to be contacted.'),
});

const serializeValue = (field: PublicField, value: string) => {
  if ([7, 9, 11].includes(field.fieldType)) {
    try { JSON.parse(value); return value; } catch { /* Store as a JSON string. */ }
  }
  return JSON.stringify(value);
};

export default function PublicAdmissionInquiryScreen({ token }: { token: string }) {
  const [context, setContext] = useState<PublicContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    fetch(`${apiBase}/public/admission-inquiries/${encodeURIComponent(token)}`, { cache: 'no-store' })
      .then((response) => {
        if (!response.ok) throw new Error('This inquiry link is unavailable or has expired.');
        return response.json() as Promise<PublicContext>;
      })
      .then((value) => { if (mounted) setContext(value); })
      .catch(() => { if (mounted) setError('This inquiry link is unavailable or has expired.'); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [token]);

  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default', px: 2, py: { xs: 3, sm: 6 } }}>
      <Card variant="outlined" sx={{ maxWidth: 640, mx: 'auto', p: { xs: 2, sm: 4 } }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="h4" component="h1">Admission inquiry</Typography>
            <Typography variant="body2" color="text.secondary">
              Share a few details. The school will confirm the right class offering and contact you.
            </Typography>
          </Box>
          {loading && <CircularProgress size={28} aria-label="Loading inquiry form" />}
          {error && <Alert severity="error">{error}</Alert>}
          {context && !submitted && <InquiryForm token={token} context={context}
            onSubmitted={() => setSubmitted(true)} />}
          {submitted && <Alert severity="success">Thank you. Your inquiry has been received. The school will contact you.</Alert>}
        </Stack>
      </Card>
    </Box>
  );
}

function InquiryForm({ token, context, onSubmitted }: {
  token: string;
  context: PublicContext;
  onSubmitted: () => void;
}) {
  const [requestError, setRequestError] = useState('');
  const sections = context.form?.sections ?? [];
  const fields = sections.flatMap((section) => section.fields);
  const initialValues: InquiryValues = {
    applicantFirstName: '', applicantLastName: '', guardianFirstName: '', guardianLastName: '',
    guardianPhone: '', guardianEmail: '', classInterest: '',
    fields: Object.fromEntries(fields.map((field) => [field.code, field.defaultValue ?? ''])),
    consentToContact: false,
  };
  const validationSchema = context.form
    ? Yup.object({
        fields: buildDynamicAdmissionYupSchema({ sections }),
        consentToContact: Yup.boolean().oneOf([true], 'Please agree to be contacted.'),
      })
    : legacySchema;
  const formik = useFormik<InquiryValues>({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      setRequestError('');
      const visibleFields = sections
        .filter((section) => isAdmissionRuleVisible(section.visibilityRuleJson, values.fields))
        .flatMap((section) => section.fields)
        .filter((field) => field.fieldType !== 12 &&
          isAdmissionRuleVisible(field.visibilityRuleJson, values.fields));
      const fallbackValue = (code: string) => values.fields[code]?.trim() ?? '';
      const payload = context.form
        ? {
            applicantFirstName: fallbackValue('PUBLIC_APPLICANT_FIRST_NAME'),
            guardianFirstName: fallbackValue('PUBLIC_GUARDIAN_FIRST_NAME'),
            guardianPhone: fallbackValue('PUBLIC_GUARDIAN_PHONE'),
            consentToContact: values.consentToContact,
            preferredLanguageCode: 'en',
            formValues: visibleFields.filter((field) => !field.isIdentityFallback).map((field) => ({
              fieldCode: field.code,
              valueJson: serializeValue(field, values.fields[field.code] ?? ''),
            })),
          }
        : {
            applicantFirstName: values.applicantFirstName,
            applicantLastName: values.applicantLastName,
            guardianFirstName: values.guardianFirstName,
            guardianLastName: values.guardianLastName,
            guardianPhone: values.guardianPhone,
            guardianEmail: values.guardianEmail,
            classInterest: values.classInterest,
            preferredLanguageCode: 'en',
            consentToContact: values.consentToContact,
          };
      try {
        const response = await fetch(`${apiBase}/public/admission-inquiries/${encodeURIComponent(token)}`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error('Submission failed');
        onSubmitted();
      } catch {
        setRequestError('We could not receive your inquiry. Check the details and try again.');
      }
    },
  });
  const fieldErrors = formik.errors.fields as Record<string, string> | undefined;
  const touchedFields = formik.touched.fields as Record<string, boolean> | undefined;

  const legacyField = (name: LegacyFieldName, label: string, required = false, type = 'text') => {
    const message = formik.errors[name];
    const invalid = Boolean(formik.touched[name] && message);
    return (
      <ShakingTextField key={name} error={invalid}>
        <TextField fullWidth size="small" name={name} label={label} type={type} required={required}
          value={formik.values[name]} onChange={formik.handleChange} onBlur={formik.handleBlur}
          error={invalid} helperText={invalid ? message : undefined} />
      </ShakingTextField>
    );
  };

  return (
    <Box component="form" noValidate onSubmit={formik.handleSubmit}>
      <Stack spacing={2}>
        <Alert severity="info">Admission period: {context.admissionCycleName}</Alert>
        {context.form ? (
          <>
            <Typography variant="h6" component="h2">{context.form.name}</Typography>
            {sections
              .filter((section) => isAdmissionRuleVisible(section.visibilityRuleJson, formik.values.fields))
              .map((section) => (
                <Stack key={section.code} spacing={1}>
                  <Typography variant="subtitle1" component="h3">{section.name}</Typography>
                  {section.fields
                    .filter((field) => isAdmissionRuleVisible(field.visibilityRuleJson, formik.values.fields))
                    .map((field) => (
                      <AdmissionRuntimeField key={field.code} field={field}
                        value={formik.values.fields[field.code] ?? ''}
                        disabled={formik.isSubmitting || field.readOnly}
                        error={formik.submitCount > 0 || touchedFields?.[field.code]
                          ? fieldErrors?.[field.code] : undefined}
                        formValues={formik.values.fields}
                        onChange={(value) => formik.setFieldValue(`fields.${field.code}`, value)}
                        onBlur={() => formik.setFieldTouched(`fields.${field.code}`, true)} />
                    ))}
                </Stack>
              ))}
          </>
        ) : (
          <>
            {legacyField('applicantFirstName', 'Student first name', true)}
            {legacyField('applicantLastName', 'Student last name')}
            {legacyField('classInterest', 'Class interested in')}
            {legacyField('guardianFirstName', 'Parent or guardian first name', true)}
            {legacyField('guardianLastName', 'Parent or guardian last name')}
            {legacyField('guardianPhone', 'Mobile number', true, 'tel')}
            {legacyField('guardianEmail', 'Email address', false, 'email')}
          </>
        )}
        <FormControlLabel control={<Checkbox size="small" checked={formik.values.consentToContact}
          onChange={(_, checked) => formik.setFieldValue('consentToContact', checked)} />}
          label="I agree that the school may contact me about this admission inquiry." />
        {formik.submitCount > 0 && formik.errors.consentToContact &&
          <Alert severity="error">{formik.errors.consentToContact}</Alert>}
        {requestError && <Alert severity="error">{requestError}</Alert>}
        <Button type="submit" size="small" variant="contained" disabled={formik.isSubmitting}
          sx={{ minHeight: 44 }}>
          {formik.isSubmitting ? 'Sending inquiry...' : 'Send inquiry'}
        </Button>
      </Stack>
    </Box>
  );
}
