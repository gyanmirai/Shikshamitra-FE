/* eslint-disable no-bitwise */

'use client';

import { ExpandMore } from '@mui/icons-material';

import {
  Box,
  Alert,
  Stack,
  Switch,
  Button,
  Checkbox,
  Accordion,
  TextField,
  Typography,
  AccordionDetails,
  AccordionSummary,
  FormControlLabel,
} from '@mui/material';

import { AdmissionCrmExamReadinessField } from 'src/redux/student/admissions-crm/communication-exams-events-contracts';

import { useAdmissionsCrmConfigurationWorkspace } from './admissions-crm-configuration-context';

const readinessOptions = [
  { value: AdmissionCrmExamReadinessField.Contact, label: 'Contact' },
  { value: AdmissionCrmExamReadinessField.AdmissionIntent, label: 'Admission intent' },
  { value: AdmissionCrmExamReadinessField.DesiredClass, label: 'Desired class' },
  { value: AdmissionCrmExamReadinessField.StudentName, label: 'Student name' },
  { value: AdmissionCrmExamReadinessField.ParentGuardianName, label: 'Parent name' },
  { value: AdmissionCrmExamReadinessField.InquirySource, label: 'Inquiry source' },
];

export function AdmissionsCrmApplicantChecklistPanel() {
  const { state: controllerState, actions, meta } = useAdmissionsCrmConfigurationWorkspace();
  const {
    academicYearId,
    cycleForm,
    handleAddApplicantChecklistItem,
    handleApplicantChecklistChange,
    handleCycleReadinessToggle,
    handleRemoveApplicantChecklistItem,
    isUpdatingCycle,
    isUpdatingSchoolDefaultCycle,
  } = { ...controllerState, ...actions, ...meta };

  return (
    <Accordion disableGutters variant="outlined">
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Box>
          <Typography variant="subtitle2">Readiness and applicant checklist</Typography>
          <Typography variant="caption" color="text.secondary">
            Required inquiry information and the family-facing checklist.
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ display: 'grid', gap: 1.25 }}>
        <Alert severity="info" variant="outlined">
          These settings are used when an inquiry is reviewed in Pipeline and when an applicant
          moves into exam, registration, and document readiness workspaces.
        </Alert>
        <Stack spacing={0.5}>
          <Typography variant="subtitle2">Exam readiness</Typography>
          <Stack direction="row" gap={1} flexWrap="wrap">
            {readinessOptions.map((option) => (
              <FormControlLabel
                key={option.value}
                sx={{ mr: 1 }}
                control={
                  <Checkbox
                    size="small"
                    checked={(cycleForm.examReadinessFields & option.value) === option.value}
                    disabled={!academicYearId || isUpdatingCycle || isUpdatingSchoolDefaultCycle}
                    onChange={() => handleCycleReadinessToggle(option.value)}
                  />
                }
                label={option.label}
              />
            ))}
          </Stack>
        </Stack>
        <Stack spacing={0.75}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            gap={1}
            alignItems={{ sm: 'center' }}
          >
            <Box>
              <Typography variant="subtitle2">Applicant checklist</Typography>
              <Typography variant="caption" color="text.secondary">
                Show required and optional items on the secure status link.
              </Typography>
            </Box>
            <Button
              size="small"
              variant="outlined"
              disabled={!academicYearId || isUpdatingCycle || isUpdatingSchoolDefaultCycle}
              onClick={handleAddApplicantChecklistItem}
            >
              Add Item
            </Button>
          </Stack>
          <Box sx={{ display: 'grid', gap: 1 }}>
            {cycleForm.applicantChecklist.map((item, index) => (
              <Box
                key={`${item.key}-${index}`}
                sx={{
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 1,
                  display: 'grid',
                  gap: 1,
                }}
              >
                <Stack direction={{ xs: 'column', md: 'row' }} gap={1}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Label"
                    value={item.label}
                    disabled={!academicYearId || isUpdatingCycle || isUpdatingSchoolDefaultCycle}
                    onChange={(event) =>
                      handleApplicantChecklistChange(index, 'label', event.target.value)
                    }
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Key"
                    value={item.key}
                    disabled={!academicYearId || isUpdatingCycle || isUpdatingSchoolDefaultCycle}
                    onChange={(event) =>
                      handleApplicantChecklistChange(index, 'key', event.target.value)
                    }
                  />
                </Stack>
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  gap={1}
                  alignItems={{ md: 'center' }}
                >
                  <TextField
                    fullWidth
                    size="small"
                    label="Details"
                    value={item.details ?? ''}
                    disabled={!academicYearId || isUpdatingCycle || isUpdatingSchoolDefaultCycle}
                    onChange={(event) =>
                      handleApplicantChecklistChange(index, 'details', event.target.value)
                    }
                  />
                  <TextField
                    size="small"
                    type="number"
                    label="Order"
                    value={item.displayOrder}
                    disabled={!academicYearId || isUpdatingCycle || isUpdatingSchoolDefaultCycle}
                    onChange={(event) =>
                      handleApplicantChecklistChange(
                        index,
                        'displayOrder',
                        Number(event.target.value)
                      )
                    }
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={item.isRequired}
                        disabled={
                          !academicYearId || isUpdatingCycle || isUpdatingSchoolDefaultCycle
                        }
                        onChange={(event) =>
                          handleApplicantChecklistChange(index, 'isRequired', event.target.checked)
                        }
                      />
                    }
                    label="Required"
                  />
                  <Button
                    size="small"
                    color="error"
                    disabled={!academicYearId || isUpdatingCycle || isUpdatingSchoolDefaultCycle}
                    onClick={() => handleRemoveApplicantChecklistItem(index)}
                  >
                    Remove
                  </Button>
                </Stack>
              </Box>
            ))}
            {!cycleForm.applicantChecklist.length && (
              <Typography variant="body2" color="text.secondary">
                No applicant checklist items configured
              </Typography>
            )}
          </Box>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}
