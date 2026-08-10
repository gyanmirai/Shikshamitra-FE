'use client';

import {
  Box,
  Stack,
  Switch,
  Select,
  MenuItem,
  TextField,
  InputLabel,
  FormControl,
  FormControlLabel,
} from '@mui/material';

import { AdmissionCrmRegistrationPath } from 'src/redux/student/admissions-crm/registration-documents-contracts';

import { useAdmissionsPlaybookWorkspace } from './admissions-playbook-configuration-context';

const registrationPathLabel: Record<AdmissionCrmRegistrationPath, string> = {
  [AdmissionCrmRegistrationPath.RegistrationAfterExam]: 'Registration after exam',
  [AdmissionCrmRegistrationPath.RegistrationBeforeExam]: 'Registration before exam',
  [AdmissionCrmRegistrationPath.ExamWaived]: 'Exam waived',
  [AdmissionCrmRegistrationPath.DirectRegistration]: 'Direct registration',
};

export function AdmissionsPlaybookBasicsStep() {
  const { state: controllerState, actions, meta } = useAdmissionsPlaybookWorkspace();
  const { editorTab, entranceExamMode, form, readOnly, setForm } = {
    ...controllerState,
    ...actions,
    ...meta,
  };

  return (
    <>
      {editorTab === 0 ? (
        <Stack spacing={1.5}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
            <TextField
              fullWidth
              size="small"
              label="Playbook name"
              value={form.name}
              disabled={readOnly}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            />
            {!entranceExamMode ? (
              <FormControl fullWidth size="small" disabled={readOnly}>
                <InputLabel>Registration path</InputLabel>
                <Select
                  label="Registration path"
                  value={form.registrationPath}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      registrationPath: Number(event.target.value) as AdmissionCrmRegistrationPath,
                    }))
                  }
                >
                  {Object.entries(registrationPathLabel).map(([value, label]) => (
                    <MenuItem key={value} value={Number(value)}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : null}
          </Stack>
          <FormControlLabel
            control={
              <Switch
                checked={form.isFallback}
                disabled={readOnly}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    isFallback: event.target.checked,
                    applicability: event.target.checked ? {} : current.applicability,
                  }))
                }
              />
            }
            label={entranceExamMode ? 'Use as the default exam policy' : 'Fallback playbook'}
          />
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
              gap: 1,
            }}
          >
            {(
              [
                ['campus', 'Campus'],
                ['desiredClass', 'Class'],
                ['board', 'Board'],
                ['medium', 'Medium'],
                ['applicantCategory', 'Applicant category'],
                ['admissionRound', 'Admission round'],
                ['admissionRoute', 'Admission route'],
              ] as const
            ).map(([key, label]) => (
              <TextField
                key={key}
                size="small"
                label={label}
                value={form.applicability[key] || ''}
                disabled={readOnly || form.isFallback}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    applicability: { ...current.applicability, [key]: event.target.value },
                  }))
                }
              />
            ))}
          </Box>
          <TextField
            size="small"
            label="Notes"
            multiline
            minRows={2}
            value={form.notes || ''}
            disabled={readOnly}
            onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
          />
        </Stack>
      ) : null}
    </>
  );
}
