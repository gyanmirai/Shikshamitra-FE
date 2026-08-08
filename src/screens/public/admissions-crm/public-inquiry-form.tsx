'use client';

import { shikshaMitraToast } from 'src/components/toast';
import { useRef, useMemo, useState, useEffect } from 'react';
import { LoadingButton } from 'src/components/loading-button';
import {
  AdmissionCrmFormFieldType,
  type AdmissionCrmFormFieldDto,
} from 'src/redux/student/admissions-crm/admissions-crm-api';
import {
  Box,
  Alert,
  Stack,
  Paper,
  Button,
  Select,
  Checkbox,
  MenuItem,
  TextField,
  Typography,
  InputLabel,
  FormControl,
  FormHelperText,
  LinearProgress,
  FormControlLabel,
} from '@mui/material';

import { PublicAdmissionsShell } from './public-admissions-shell';

type PublicAdmissionInquiryForm = {
  tenantId: string;
  templateId: string;
  templateName: string;
  description?: string | null;
  consentText: string;
  privacyNoticeUrl: string;
  consentVersion: string;
  fields: AdmissionCrmFormFieldDto[];
};

type SubmitResult = {
  acknowledgementMessage: string;
  statusPath: string;
};

type FieldValue = string | string[] | boolean;
type ApplicantLanguage = 'en' | 'gu' | 'hi';

const uiText: Record<ApplicantLanguage, Record<string, string>> = {
  en: {
    startTitle: 'Start Your Admission Inquiry',
    unavailableTitle: 'Admission Inquiry Unavailable',
    receivedTitle: 'Inquiry Received',
    description: 'Share the available details and the admission team will follow up.',
    retry: 'Retry',
    language: 'Language',
    loading: 'Loading inquiry form',
    unavailable: 'Inquiry form is unavailable.',
    communication: 'Communication Preferences',
    privacy: 'Privacy notice',
    submit: 'Submit Inquiry',
    status: 'View Status',
    consentRequired: 'Consent is required before submitting.',
    preferenceRequired: 'Select at least one communication preference.',
    submitFailed: 'Unable to submit inquiry.',
    required: 'is required.',
  },
  gu: {
    startTitle: 'પ્રવેશ પૂછપરછ શરૂ કરો',
    unavailableTitle: 'પ્રવેશ પૂછપરછ ઉપલબ્ધ નથી',
    receivedTitle: 'પૂછપરછ મળી ગઈ',
    description: 'ઉપલબ્ધ વિગતો આપો અને પ્રવેશ ટીમ તમારો સંપર્ક કરશે.',
    retry: 'ફરી પ્રયત્ન કરો',
    language: 'ભાષા',
    loading: 'પૂછપરછ ફોર્મ લોડ થઈ રહ્યું છે',
    unavailable: 'પૂછપરછ ફોર્મ ઉપલબ્ધ નથી.',
    communication: 'સંદેશાવ્યવહાર પસંદગીઓ',
    privacy: 'ગોપનીયતા સૂચના',
    submit: 'પૂછપરછ મોકલો',
    status: 'સ્થિતિ જુઓ',
    consentRequired: 'મોકલતા પહેલાં સંમતિ જરૂરી છે.',
    preferenceRequired: 'ઓછામાં ઓછી એક સંદેશાવ્યવહાર પસંદગી પસંદ કરો.',
    submitFailed: 'પૂછપરછ મોકલી શકાઈ નથી.',
    required: 'જરૂરી છે.',
  },
  hi: {
    startTitle: 'प्रवेश पूछताछ शुरू करें',
    unavailableTitle: 'प्रवेश पूछताछ उपलब्ध नहीं है',
    receivedTitle: 'पूछताछ प्राप्त हुई',
    description: 'उपलब्ध विवरण साझा करें और प्रवेश टीम आपसे संपर्क करेगी।',
    retry: 'पुनः प्रयास करें',
    language: 'भाषा',
    loading: 'पूछताछ फ़ॉर्म लोड हो रहा है',
    unavailable: 'पूछताछ फ़ॉर्म उपलब्ध नहीं है।',
    communication: 'संचार प्राथमिकताएँ',
    privacy: 'गोपनीयता सूचना',
    submit: 'पूछताछ भेजें',
    status: 'स्थिति देखें',
    consentRequired: 'भेजने से पहले सहमति आवश्यक है।',
    preferenceRequired: 'कम से कम एक संचार प्राथमिकता चुनें।',
    submitFailed: 'पूछताछ भेजी नहीं जा सकी।',
    required: 'आवश्यक है।',
  },
};

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}/api`;

const isEmptyValue = (value: FieldValue | undefined) => {
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'boolean') return !value;
  return !String(value || '').trim();
};

const renderFieldLabel = (field: AdmissionCrmFormFieldDto) =>
  field.required ? `${field.label} *` : field.label;

const getDefaultFieldValue = (field: AdmissionCrmFormFieldDto): FieldValue => {
  const defaultValue = field.defaultValue?.trim();

  if (field.fieldType === AdmissionCrmFormFieldType.MultiSelect) {
    return defaultValue
      ? defaultValue
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean)
      : [];
  }

  if (field.fieldType === AdmissionCrmFormFieldType.Checkbox) {
    return ['true', 'yes', '1', 'on'].includes((defaultValue || '').toLowerCase());
  }

  return defaultValue || '';
};

const getFieldStringValue = (value: FieldValue | undefined) => {
  if (Array.isArray(value)) return value.join(',');
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  return String(value || '').trim();
};

const isFieldVisible = (
  field: AdmissionCrmFormFieldDto,
  fieldValues: Record<string, FieldValue>
) => {
  const controllingKey = field.visibleWhenFieldKey?.trim();
  if (!controllingKey) {
    return true;
  }

  const actualValue = getFieldStringValue(fieldValues[controllingKey]);
  const expectedValue = field.visibleWhenValue?.trim();
  return expectedValue
    ? actualValue.toLowerCase() === expectedValue.toLowerCase()
    : Boolean(actualValue);
};

export default function PublicAdmissionInquiryFormScreen({
  tenantId,
  templateId,
  trackingFieldValues = {},
}: {
  tenantId: string;
  templateId: string;
  trackingFieldValues?: Record<string, string>;
}) {
  const [form, setForm] = useState<PublicAdmissionInquiryForm | null>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, FieldValue>>({});
  const [communicationPreferences, setCommunicationPreferences] = useState<string[]>([
    'WhatsApp',
    'SMS',
    'Email',
  ]);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [language, setLanguage] = useState<ApplicantLanguage>('en');
  const submissionKeyRef = useRef('');
  const submissionInFlightRef = useRef(false);
  const submissionStorageKey = `enrollment-inquiry-submission:${tenantId}:${templateId}`;
  const text = uiText[language];

  const getSubmissionKey = () => {
    if (submissionKeyRef.current) return submissionKeyRef.current;

    try {
      const existing = window.sessionStorage.getItem(submissionStorageKey);
      if (existing) {
        submissionKeyRef.current = existing;
        return existing;
      }
    } catch {
      // Session storage may be disabled; the in-memory key still protects this page instance.
    }

    const generated = window.crypto.randomUUID();
    submissionKeyRef.current = generated;
    try {
      window.sessionStorage.setItem(submissionStorageKey, generated);
    } catch {
      // Preserve the in-memory key when session storage is unavailable.
    }
    return generated;
  };

  useEffect(() => {
    let isMounted = true;

    async function loadForm() {
      setIsLoading(true);
      setLoadError('');
      try {
        const response = await fetch(
          `${API_BASE}/public/student-enrollment/admissions-crm/${tenantId}/forms/${templateId}?language=${language}`
        );
        if (!response.ok) {
          throw new Error(text.unavailable);
        }

        const payload = (await response.json()) as PublicAdmissionInquiryForm;
        if (!isMounted) return;

        setForm(payload);
        setFieldValues(
          Object.fromEntries(
            payload.fields.map((field) => [field.key, getDefaultFieldValue(field)])
          )
        );
      } catch (error) {
        if (isMounted) {
          setLoadError(error instanceof Error ? error.message : text.unavailable);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadForm();
    return () => {
      isMounted = false;
    };
  }, [language, reloadKey, templateId, tenantId, text.unavailable]);

  const orderedFields = useMemo(
    () => [...(form?.fields || [])].sort((a, b) => a.displayOrder - b.displayOrder),
    [form?.fields]
  );
  const visibleFields = useMemo(
    () => orderedFields.filter((field) => isFieldVisible(field, fieldValues)),
    [fieldValues, orderedFields]
  );
  const fieldSections = useMemo(() => {
    const sections: Array<{ name: string; fields: AdmissionCrmFormFieldDto[] }> = [];
    visibleFields.forEach((field) => {
      const sectionName = field.sectionName?.trim() || '';
      let section = sections.find((item) => item.name === sectionName);
      if (!section) {
        section = { name: sectionName, fields: [] };
        sections.push(section);
      }

      section.fields.push(field);
    });

    return sections;
  }, [visibleFields]);

  const setFieldValue = (key: string, value: FieldValue) => {
    setFieldValues((prev) => ({ ...prev, [key]: value }));
  };

  const togglePreference = (preference: string, checked: boolean) => {
    setCommunicationPreferences((prev) =>
      checked ? [...new Set([...prev, preference])] : prev.filter((item) => item !== preference)
    );
  };

  const validate = () => {
    if (!form) return false;

    const missing = visibleFields.find(
      (field) => field.required && isEmptyValue(fieldValues[field.key])
    );
    if (missing) {
      shikshaMitraToast.error({ message: `${missing.label} ${text.required}` });
      return false;
    }

    if (!consentAccepted) {
      shikshaMitraToast.error({ message: text.consentRequired });
      return false;
    }

    if (communicationPreferences.length === 0) {
      shikshaMitraToast.error({ message: text.preferenceRequired });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!form || !validate()) return;
    if (submissionInFlightRef.current) return;

    submissionInFlightRef.current = true;
    setIsSubmitting(true);
    try {
      const response = await fetch(
        `${API_BASE}/public/student-enrollment/admissions-crm/${tenantId}/forms/${templateId}/submit`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            submissionKey: getSubmissionKey(),
            consentVersion: form.consentVersion,
            consentAccepted,
            communicationPreferences,
            fieldValues: {
              ...trackingFieldValues,
              preferredCommunicationLanguage: language,
              ...Object.fromEntries(
                visibleFields.map((field) => [field.key, fieldValues[field.key]])
              ),
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(text.submitFailed);
      }

      const payload = (await response.json()) as SubmitResult;
      submissionKeyRef.current = '';
      try {
        window.sessionStorage.removeItem(submissionStorageKey);
      } catch {
        // The confirmed result is already rendered; storage cleanup is best-effort only.
      }
      setResult(payload);
    } catch (error) {
      shikshaMitraToast.error({
        message: error instanceof Error ? error.message : text.submitFailed,
      });
    } finally {
      submissionInFlightRef.current = false;
      setIsSubmitting(false);
    }
  };

  const renderField = (field: AdmissionCrmFormFieldDto) => {
    const value = fieldValues[field.key];

    if (field.fieldType === AdmissionCrmFormFieldType.Select) {
      return (
        <FormControl key={field.key} fullWidth>
          <InputLabel id={`${field.key}-label`}>{renderFieldLabel(field)}</InputLabel>
          <Select
            labelId={`${field.key}-label`}
            label={renderFieldLabel(field)}
            value={typeof value === 'string' ? value : ''}
            inputProps={{ name: field.key }}
            onChange={(event) => setFieldValue(field.key, event.target.value)}
          >
            {(field.options || []).map((option, index) => (
              <MenuItem key={option} value={option}>
                {field.optionLabels?.[index] || option}
              </MenuItem>
            ))}
          </Select>
          {field.helperText && <FormHelperText>{field.helperText}</FormHelperText>}
        </FormControl>
      );
    }

    if (field.fieldType === AdmissionCrmFormFieldType.MultiSelect) {
      return (
        <FormControl key={field.key} fullWidth>
          <InputLabel id={`${field.key}-label`}>{renderFieldLabel(field)}</InputLabel>
          <Select
            multiple
            labelId={`${field.key}-label`}
            label={renderFieldLabel(field)}
            value={Array.isArray(value) ? value : []}
            inputProps={{ name: field.key }}
            onChange={(event) =>
              setFieldValue(
                field.key,
                typeof event.target.value === 'string'
                  ? event.target.value.split(',')
                  : event.target.value
              )
            }
          >
            {(field.options || []).map((option, index) => (
              <MenuItem key={option} value={option}>
                {field.optionLabels?.[index] || option}
              </MenuItem>
            ))}
          </Select>
          {field.helperText && <FormHelperText>{field.helperText}</FormHelperText>}
        </FormControl>
      );
    }

    if (field.fieldType === AdmissionCrmFormFieldType.Checkbox) {
      return (
        <Box key={field.key}>
          <FormControlLabel
            control={
              <Checkbox
                name={field.key}
                checked={Boolean(value)}
                onChange={(event) => setFieldValue(field.key, event.target.checked)}
              />
            }
            label={renderFieldLabel(field)}
          />
          {field.helperText && (
            <Typography variant="caption" color="text.secondary" display="block">
              {field.helperText}
            </Typography>
          )}
        </Box>
      );
    }

    return (
      <TextField
        key={field.key}
        fullWidth
        required={field.required}
        name={field.key}
        label={field.label}
        placeholder={field.placeholder || undefined}
        helperText={field.helperText || undefined}
        value={typeof value === 'string' ? value : ''}
        type={
          field.fieldType === AdmissionCrmFormFieldType.Email
            ? 'email'
            : field.fieldType === AdmissionCrmFormFieldType.Phone
              ? 'tel'
              : field.fieldType === AdmissionCrmFormFieldType.Number
                ? 'number'
                : field.fieldType === AdmissionCrmFormFieldType.Date
                  ? 'date'
                  : 'text'
        }
        multiline={field.fieldType === AdmissionCrmFormFieldType.TextArea}
        minRows={field.fieldType === AdmissionCrmFormFieldType.TextArea ? 3 : undefined}
        autoComplete={
          field.fieldType === AdmissionCrmFormFieldType.Email
            ? 'email'
            : field.fieldType === AdmissionCrmFormFieldType.Phone
              ? 'tel'
              : 'off'
        }
        spellCheck={field.fieldType === AdmissionCrmFormFieldType.Email ? false : undefined}
        inputProps={
          field.fieldType === AdmissionCrmFormFieldType.Number
            ? { inputMode: 'numeric' }
            : undefined
        }
        InputLabelProps={
          field.fieldType === AdmissionCrmFormFieldType.Date ? { shrink: true } : undefined
        }
        onChange={(event) => setFieldValue(field.key, event.target.value)}
      />
    );
  };

  if (isLoading) {
    return (
      <PublicAdmissionsShell title={text.startTitle} language={language}>
        <Paper variant="outlined" sx={{ p: 3, width: '100%', maxWidth: 720, borderRadius: 1 }}>
          <Stack spacing={2}>
            <Typography variant="h6">{text.loading}</Typography>
            <LinearProgress />
          </Stack>
        </Paper>
      </PublicAdmissionsShell>
    );
  }

  if (loadError || !form) {
    return (
      <PublicAdmissionsShell title={text.unavailableTitle} language={language}>
        <Paper variant="outlined" sx={{ p: 3, width: '100%', maxWidth: 720, borderRadius: 1 }}>
          <Alert
            severity="error"
            role="alert"
            action={
              <Button color="inherit" size="small" onClick={() => setReloadKey((key) => key + 1)}>
                {text.retry}
              </Button>
            }
          >
            {loadError || text.unavailable}
          </Alert>
        </Paper>
      </PublicAdmissionsShell>
    );
  }

  if (result) {
    return (
      <PublicAdmissionsShell title={text.receivedTitle} language={language}>
        <Paper variant="outlined" sx={{ p: 3, width: '100%', maxWidth: 720, borderRadius: 1 }}>
          <Stack spacing={2}>
            <Alert severity="success" role="status">
              {result.acknowledgementMessage}
            </Alert>
            <Button variant="contained" href={result.statusPath}>
              {text.status}
            </Button>
          </Stack>
        </Paper>
      </PublicAdmissionsShell>
    );
  }

  return (
    <PublicAdmissionsShell
      title={form.templateName}
      description={form.description || text.description}
      language={language}
    >
      <Paper
        component="form"
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmit();
        }}
        variant="outlined"
        sx={{ p: { xs: 2, md: 3 }, width: '100%', maxWidth: 760, borderRadius: 1 }}
      >
        <Stack spacing={2}>
          <FormControl size="small" sx={{ alignSelf: 'flex-end', minWidth: 140 }}>
            <InputLabel id="admission-form-language">{text.language}</InputLabel>
            <Select
              labelId="admission-form-language"
              label={text.language}
              value={language}
              onChange={(event) => setLanguage(event.target.value as ApplicantLanguage)}
            >
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="gu">ગુજરાતી</MenuItem>
              <MenuItem value="hi">हिन्दी</MenuItem>
            </Select>
          </FormControl>
          <Stack spacing={1.5}>
            {fieldSections.map((section, index) => (
              <Stack key={`${section.name}-${index}`} spacing={1.25}>
                {section.name && <Typography variant="subtitle2">{section.name}</Typography>}
                {section.fields.map(renderField)}
              </Stack>
            ))}
          </Stack>
          <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
            <Stack spacing={1}>
              <Typography variant="subtitle2">{text.communication}</Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} gap={1}>
                {['WhatsApp', 'SMS', 'Email'].map((preference) => (
                  <FormControlLabel
                    key={preference}
                    control={
                      <Checkbox
                        name={`communication-${preference.toLowerCase()}`}
                        checked={communicationPreferences.includes(preference)}
                        onChange={(event) => togglePreference(preference, event.target.checked)}
                      />
                    }
                    label={preference}
                  />
                ))}
              </Stack>
            </Stack>
          </Paper>
          <FormControlLabel
            control={
              <Checkbox
                name="admission-consent"
                checked={consentAccepted}
                onChange={(event) => setConsentAccepted(event.target.checked)}
              />
            }
            label={form.consentText}
          />
          <Typography variant="caption" color="text.secondary">
            {text.privacy}: {form.privacyNoticeUrl}
          </Typography>
          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            {text.submit}
          </LoadingButton>
        </Stack>
      </Paper>
    </PublicAdmissionsShell>
  );
}
