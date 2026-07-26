'use client';

import { useMemo, useState } from 'react';
import { Close, PhoneIphone, SchoolOutlined, DesktopWindows } from '@mui/icons-material';
import {
  AdmissionCrmFormFieldType,
  type AdmissionCrmFormFieldDto,
  type AdmissionCrmFormTemplateDto,
} from 'src/redux/student/admissions-crm/admissions-crm-api';
import {
  Box,
  Link,
  Chip,
  Alert,
  Stack,
  Paper,
  Select,
  Button,
  Dialog,
  Checkbox,
  MenuItem,
  TextField,
  Typography,
  IconButton,
  InputLabel,
  FormControl,
  DialogTitle,
  ToggleButton,
  DialogContent,
  FormHelperText,
  FormControlLabel,
  ToggleButtonGroup,
  type SelectChangeEvent,
} from '@mui/material';

import {
  inquiryFormPreviewLanguages,
  isInquiryFormPreviewFieldVisible,
  getInquiryFormPreviewDefaultValue,
  resolveInquiryFormPreviewTemplate,
} from './inquiry-form-template-utils';

import type {
  InquiryFormPreviewLanguage,
  InquiryFormPreviewFieldValue,
} from './inquiry-form-template-utils';

type PreviewDevice = 'desktop' | 'mobile';

type Props = {
  template: AdmissionCrmFormTemplateDto;
  onClose: () => void;
};

const inputType = (fieldType: AdmissionCrmFormFieldType) => {
  if (fieldType === AdmissionCrmFormFieldType.Email) return 'email';
  if (fieldType === AdmissionCrmFormFieldType.Phone) return 'tel';
  if (fieldType === AdmissionCrmFormFieldType.Number) return 'number';
  if (fieldType === AdmissionCrmFormFieldType.Date) return 'date';
  return 'text';
};

const fieldLabel = (field: AdmissionCrmFormFieldDto) =>
  field.required ? `${field.label} *` : field.label;

export function InquiryFormTemplatePreviewDialog({ template, onClose }: Props) {
  const [language, setLanguage] = useState<InquiryFormPreviewLanguage>('en');
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const [fieldValues, setFieldValues] = useState<Record<string, InquiryFormPreviewFieldValue>>(() =>
    Object.fromEntries(
      template.fields.map((field) => [field.key, getInquiryFormPreviewDefaultValue(field)])
    )
  );
  const { template: localizedTemplate, usesEnglishFallback } = useMemo(
    () => resolveInquiryFormPreviewTemplate(template, language),
    [language, template]
  );
  const visibleFields = useMemo(
    () =>
      [...localizedTemplate.fields]
        .sort((left, right) => left.displayOrder - right.displayOrder)
        .filter((field) => isInquiryFormPreviewFieldVisible(field, fieldValues)),
    [fieldValues, localizedTemplate.fields]
  );
  const sections = useMemo(() => {
    const result: Array<{ name: string; fields: AdmissionCrmFormFieldDto[] }> = [];
    visibleFields.forEach((field) => {
      const sectionName = field.sectionName?.trim() || '';
      const currentSection = result.find((section) => section.name === sectionName);
      if (currentSection) {
        currentSection.fields.push(field);
      } else {
        result.push({ name: sectionName, fields: [field] });
      }
    });
    return result;
  }, [visibleFields]);

  const published = template.isPublic && template.isActive;
  const languageName =
    inquiryFormPreviewLanguages.find((option) => option.code === language)?.label || 'English';

  const setFieldValue = (fieldKey: string, value: InquiryFormPreviewFieldValue) => {
    setFieldValues((current) => ({ ...current, [fieldKey]: value }));
  };

  const renderField = (field: AdmissionCrmFormFieldDto) => {
    const value = fieldValues[field.key];

    if (
      field.fieldType === AdmissionCrmFormFieldType.Select ||
      field.fieldType === AdmissionCrmFormFieldType.MultiSelect
    ) {
      const isMultiSelect = field.fieldType === AdmissionCrmFormFieldType.MultiSelect;
      return (
        <FormControl key={field.key} fullWidth required={field.required}>
          <InputLabel id={`preview-${field.key}-label`}>{field.label}</InputLabel>
          <Select
            multiple={isMultiSelect}
            labelId={`preview-${field.key}-label`}
            label={field.label}
            name={field.key}
            value={isMultiSelect ? (Array.isArray(value) ? value : []) : String(value || '')}
            onChange={(event: SelectChangeEvent<string | string[]>) => {
              const nextValue = event.target.value;
              setFieldValue(
                field.key,
                isMultiSelect && typeof nextValue === 'string' ? nextValue.split(',') : nextValue
              );
            }}
          >
            {(field.options || []).map((option, index) => (
              <MenuItem key={option} value={option}>
                {field.optionLabels?.[index] || option}
              </MenuItem>
            ))}
          </Select>
          {field.helperText ? <FormHelperText>{field.helperText}</FormHelperText> : null}
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
            label={fieldLabel(field)}
          />
          {field.helperText ? (
            <Typography variant="caption" color="text.secondary" display="block">
              {field.helperText}
            </Typography>
          ) : null}
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
        type={inputType(field.fieldType)}
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

  return (
    <Dialog
      open
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      aria-labelledby="inquiry-form-preview-title"
      aria-describedby="inquiry-form-preview-description"
      PaperProps={{ sx: { maxHeight: 'min(92dvh, 960px)', overscrollBehavior: 'contain' } }}
    >
      <DialogTitle component="div">
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={2}>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              id="inquiry-form-preview-title"
              component="h2"
              variant="h6"
              sx={{ textWrap: 'balance' }}
            >
              Parent Form Preview
            </Typography>
            <Typography
              id="inquiry-form-preview-description"
              variant="body2"
              color="text.secondary"
              sx={{ textWrap: 'pretty' }}
            >
              Test translations, field rules, and responsive layout before sharing this form.
            </Typography>
          </Box>
          <IconButton aria-label="Close parent form preview" edge="end" onClick={onClose}>
            <Close aria-hidden="true" />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            gap={1.5}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', md: 'center' }}
          >
            <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
              <Chip
                size="small"
                color={published ? 'success' : 'warning'}
                label={published ? 'Published / Active' : 'Draft / Not Published'}
              />
              <Typography variant="caption" color="text.secondary">
                Preview only — no inquiry will be submitted.
              </Typography>
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} gap={1}>
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel id="inquiry-preview-language-label">Preview Language</InputLabel>
                <Select
                  labelId="inquiry-preview-language-label"
                  label="Preview Language"
                  name="inquiryPreviewLanguage"
                  value={language}
                  onChange={(event) =>
                    setLanguage(event.target.value as InquiryFormPreviewLanguage)
                  }
                >
                  {inquiryFormPreviewLanguages.map((option) => (
                    <MenuItem key={option.code} value={option.code}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <ToggleButtonGroup
                exclusive
                size="small"
                value={device}
                aria-label="Preview device"
                onChange={(_, value: PreviewDevice | null) => {
                  if (value) setDevice(value);
                }}
              >
                <ToggleButton value="desktop" aria-label="Desktop preview">
                  <DesktopWindows aria-hidden="true" sx={{ mr: 0.75 }} />
                  Desktop
                </ToggleButton>
                <ToggleButton value="mobile" aria-label="Mobile preview">
                  <PhoneIphone aria-hidden="true" sx={{ mr: 0.75 }} />
                  Mobile
                </ToggleButton>
              </ToggleButtonGroup>
            </Stack>
          </Stack>

          {language !== 'en' && usesEnglishFallback ? (
            <Alert severity="info" role="status">
              Some {languageName} text is empty, so the preview uses English fallback text.
            </Alert>
          ) : null}

          <Box
            sx={{
              bgcolor: 'background.neutral',
              borderRadius: 1.5,
              p: { xs: 1, sm: 2.5 },
              overflowX: 'auto',
            }}
          >
            <Paper
              aria-label={`${device === 'mobile' ? 'Mobile' : 'Desktop'} parent form preview`}
              variant="outlined"
              sx={{
                width: '100%',
                maxWidth: device === 'mobile' ? 390 : 780,
                minWidth: 0,
                mx: 'auto',
                overflow: 'hidden',
                borderRadius: device === 'mobile' ? 3 : 1.5,
                boxShadow: device === 'mobile' ? 3 : 1,
              }}
            >
              <Box
                component="header"
                sx={{
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  px: { xs: 2, sm: 3 },
                  py: { xs: 2.25, sm: 3 },
                }}
              >
                <Stack direction="row" gap={1.5} alignItems="flex-start">
                  <Box
                    aria-hidden="true"
                    sx={{
                      width: 38,
                      height: 38,
                      flexShrink: 0,
                      display: 'grid',
                      placeItems: 'center',
                      borderRadius: '50%',
                      bgcolor: 'common.white',
                      color: 'primary.main',
                    }}
                  >
                    <SchoolOutlined />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="overline" sx={{ opacity: 0.86 }}>
                      School Admissions
                    </Typography>
                    <Typography
                      component="h3"
                      variant={device === 'mobile' ? 'h6' : 'h5'}
                      sx={{ overflowWrap: 'anywhere', textWrap: 'balance' }}
                    >
                      {localizedTemplate.templateName}
                    </Typography>
                    {localizedTemplate.description ? (
                      <Typography
                        variant="body2"
                        sx={{ mt: 0.5, opacity: 0.9, overflowWrap: 'anywhere' }}
                      >
                        {localizedTemplate.description}
                      </Typography>
                    ) : null}
                  </Box>
                </Stack>
              </Box>

              <Box
                component="form"
                aria-label="Preview inquiry form"
                onSubmit={(event) => event.preventDefault()}
                sx={{ p: { xs: 2, sm: 3 } }}
              >
                <Stack spacing={2.5}>
                  <Typography variant="body2" color="text.secondary">
                    Required fields are marked with an asterisk. Conditional fields update as you
                    enter sample responses.
                  </Typography>
                  {sections.map((section, sectionIndex) => (
                    <Stack key={`${section.name}-${sectionIndex}`} spacing={1.5}>
                      {section.name ? (
                        <Typography component="h4" variant="subtitle1">
                          {section.name}
                        </Typography>
                      ) : null}
                      {section.fields.map(renderField)}
                    </Stack>
                  ))}
                  {!sections.length ? (
                    <Alert severity="warning">
                      This form has no fields to preview. Add at least one field before publishing.
                    </Alert>
                  ) : null}
                  {localizedTemplate.isPublic ? (
                    <Stack spacing={1}>
                      <FormControlLabel
                        control={<Checkbox name="previewConsent" />}
                        label={localizedTemplate.consentText || 'Consent text is not configured.'}
                      />
                      {localizedTemplate.privacyNoticeUrl ? (
                        <Link
                          href={localizedTemplate.privacyNoticeUrl}
                          target="_blank"
                          rel="noreferrer"
                          sx={{ alignSelf: 'flex-start' }}
                        >
                          Privacy Notice
                        </Link>
                      ) : null}
                    </Stack>
                  ) : (
                    <Alert severity="info">
                      This is an internal staff form and will not be available through a public
                      parent link.
                    </Alert>
                  )}
                  <Button type="button" variant="contained" disabled fullWidth>
                    Submit Inquiry
                  </Button>
                </Stack>
              </Box>
            </Paper>
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
