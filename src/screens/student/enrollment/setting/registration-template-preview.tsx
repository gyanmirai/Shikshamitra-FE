'use client';

import type { PublicAdmissionsLanguage } from 'src/screens/public/admissions-crm/public-admissions-copy';
import type { AdmissionCrmRegistrationTemplateUpsertDto } from 'src/redux/student/admissions-crm/admissions-crm-api';

import { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import PrintRounded from '@mui/icons-material/PrintRounded';
import { AdmissionCrmFormFieldType } from 'src/redux/student/admissions-crm/admissions-crm-api';
import {
  resolveRegistrationText,
  resolveRegistrationOptions,
} from 'src/screens/public/admissions-crm/registration-localization';
import {
  Box,
  Tab,
  Tabs,
  Stack,
  Paper,
  Button,
  Dialog,
  Divider,
  MenuItem,
  Checkbox,
  TextField,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

type Props = {
  open: boolean;
  template: AdmissionCrmRegistrationTemplateUpsertDto;
  onClose: () => void;
};

const inputType = (fieldType: AdmissionCrmFormFieldType) => {
  if (fieldType === AdmissionCrmFormFieldType.Email) return 'email';
  if (fieldType === AdmissionCrmFormFieldType.Phone) return 'tel';
  if (fieldType === AdmissionCrmFormFieldType.Date) return 'date';
  if (fieldType === AdmissionCrmFormFieldType.Number) return 'number';
  return 'text';
};

export function RegistrationTemplatePreview({ open, template, onClose }: Props) {
  const [mode, setMode] = useState<'online' | 'print'>('online');
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop');
  const [language, setLanguage] = useState<PublicAdmissionsLanguage>('en');
  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `${template.name || 'Registration Form'} - Print Preview`,
  });

  const sections = [...template.sections]
    .filter((section) => section.parentVisible)
    .sort((left, right) => left.displayOrder - right.displayOrder);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>Registration form preview</DialogTitle>
      <DialogContent dividers>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          justifyContent="space-between"
          gap={1.5}
          sx={{ mb: 2 }}
        >
          <Tabs
            value={mode}
            onChange={(_event, value: 'online' | 'print') => setMode(value)}
            aria-label="Registration form preview mode"
          >
            <Tab value="online" label="Online form" />
            <Tab value="print" label="Print form" />
          </Tabs>
          <Stack direction="row" gap={1} alignItems="center">
            {mode === 'online' ? (
              <TextField
                select
                size="small"
                label="Viewport"
                value={viewport}
                onChange={(event) => setViewport(event.target.value as 'desktop' | 'mobile')}
                sx={{ minWidth: 120 }}
              >
                <MenuItem value="desktop">Desktop</MenuItem>
                <MenuItem value="mobile">Mobile</MenuItem>
              </TextField>
            ) : null}
            <TextField
              select
              size="small"
              label="Parent Language"
              value={language}
              onChange={(event) =>
                setLanguage(event.target.value as PublicAdmissionsLanguage)
              }
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="gu">Gujarati</MenuItem>
              <MenuItem value="hi">Hindi</MenuItem>
            </TextField>
          </Stack>
        </Stack>

        <Paper
          ref={printRef}
          lang={language}
          variant="outlined"
          sx={{
            mx: 'auto',
            p: { xs: 2, md: mode === 'print' ? 5 : 3 },
            width: '100%',
            maxWidth: mode === 'print' ? 794 : viewport === 'mobile' ? 390 : 920,
            minHeight: mode === 'print' ? 1123 : 480,
            bgcolor: 'background.paper',
            '@media print': {
              width: '210mm',
              minHeight: '297mm',
              maxWidth: 'none',
              border: 0,
              boxShadow: 'none',
              p: '12mm',
            },
          }}
        >
          <Stack spacing={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5">{template.name || 'Registration Form'}</Typography>
              <Typography variant="body2" color="text.secondary">
                Student Enrollment
              </Typography>
            </Box>
            <Divider />
            {sections.map((section) => (
              <Box component="section" key={section.key || section.title}>
                <Typography variant="subtitle1">
                  {resolveRegistrationText(
                    section.title || 'Untitled section',
                    section.localizedTitles,
                    language
                  )}
                </Typography>
                {resolveRegistrationText(
                  section.description,
                  section.localizedDescriptions,
                  language
                ) ? (
                  <Typography variant="caption" color="text.secondary">
                    {resolveRegistrationText(
                      section.description,
                      section.localizedDescriptions,
                      language
                    )}
                  </Typography>
                ) : null}
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns:
                      mode === 'online' && viewport === 'mobile'
                        ? '1fr'
                        : { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                    gap: 1.5,
                    mt: 1.25,
                    '@media print': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
                  }}
                >
                  {[...section.fields]
                    .sort((left, right) => left.displayOrder - right.displayOrder)
                    .map((field) => {
                      const label = resolveRegistrationText(
                        field.label,
                        field.localizedLabels,
                        language
                      );
                      const helpText = resolveRegistrationText(
                        field.helpText,
                        field.localizedHelpTexts,
                        language
                      );
                      const options = resolveRegistrationOptions(
                        field.options,
                        field.localizedOptions,
                        language
                      );
                      return mode === 'online' ? (
                        field.fieldType === AdmissionCrmFormFieldType.Checkbox ? (
                          <FormControlLabel
                            key={field.key}
                            control={<Checkbox disabled />}
                            label={`${label}${field.required ? ' *' : ''}`}
                          />
                        ) : (
                          <TextField
                            key={field.key}
                            disabled
                            fullWidth
                            size="small"
                            type={inputType(field.fieldType)}
                            label={label}
                            required={field.required}
                            multiline={field.fieldType === AdmissionCrmFormFieldType.TextArea}
                            minRows={
                              field.fieldType === AdmissionCrmFormFieldType.TextArea ? 2 : undefined
                            }
                            helperText={helpText || undefined}
                            select={
                              field.fieldType === AdmissionCrmFormFieldType.Select ||
                              field.fieldType === AdmissionCrmFormFieldType.MultiSelect
                            }
                            slotProps={{
                              select:
                                field.fieldType === AdmissionCrmFormFieldType.MultiSelect
                                  ? { multiple: true }
                                  : undefined,
                            }}
                            value={
                              field.fieldType === AdmissionCrmFormFieldType.MultiSelect ? [] : ''
                            }
                          >
                            {field.options.map((option, optionIndex) => (
                              <MenuItem key={option} value={option}>
                                {options[optionIndex] || option}
                              </MenuItem>
                            ))}
                          </TextField>
                        )
                      ) : (
                        <Box
                          key={field.key}
                          sx={{
                            gridColumn:
                              field.fieldType === AdmissionCrmFormFieldType.TextArea
                                ? '1 / -1'
                                : 'auto',
                            minHeight:
                              field.fieldType === AdmissionCrmFormFieldType.TextArea ? 80 : 52,
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            {label}
                            {field.required ? ' *' : ''}
                          </Typography>
                          <Box sx={{ mt: 2.5, borderBottom: 1, borderColor: 'text.primary' }} />
                        </Box>
                      );
                    })}
                </Box>
              </Box>
            ))}
          </Stack>
        </Paper>
      </DialogContent>
      <DialogActions>
        {mode === 'print' ? (
          <Button startIcon={<PrintRounded />} onClick={() => handlePrint()}>
            Print
          </Button>
        ) : null}
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
