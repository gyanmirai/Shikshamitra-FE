'use client';

import { LoadingButton } from 'src/components/loading-button';

import { ExpandMore, InfoOutlined } from '@mui/icons-material';

import {
  Box,
  Alert,
  Stack,
  Paper,
  Switch,
  Select,
  Divider,
  Tooltip,
  Checkbox,
  MenuItem,
  Accordion,
  TextField,
  Typography,
  InputLabel,
  FormControl,
  AccordionDetails,
  AccordionSummary,
  FormControlLabel,
} from '@mui/material';

import { AdmissionCrmMeritRankingMode } from 'src/redux/student/admissions-crm/setup-playbooks-contracts';

import { getCrmUserOptionLabel } from './admissions-crm-configuration-utils';

import { useAdmissionsCrmConfigurationWorkspace } from './admissions-crm-configuration-context';

import { AdmissionsCrmApplicantChecklistPanel } from './admissions-crm-configuration-section-211';

function SettingsHelpLabel({ label, help }: { label: string; help: string }) {
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        minWidth: 0,
        verticalAlign: 'middle',
      }}
    >
      <Typography component="span" variant="inherit">
        {label}
      </Typography>
      <Tooltip title={help} arrow>
        <Box
          component="span"
          role="img"
          aria-label={help}
          sx={{ display: 'inline-flex', color: 'action.active' }}
        >
          <InfoOutlined sx={{ fontSize: 16 }} />
        </Box>
      </Tooltip>
    </Box>
  );
}

const slaWorkingDayOptions = [
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
  { value: 0, label: 'Sun' },
];

const meritModeLabel: Record<AdmissionCrmMeritRankingMode, string> = {
  [AdmissionCrmMeritRankingMode.MarksThenInquiryDate]: 'Marks, then inquiry date',
  [AdmissionCrmMeritRankingMode.MarksThenLeadScore]: 'Marks, then lead score',
  [AdmissionCrmMeritRankingMode.LeadScoreThenMarks]: 'Lead score, then marks',
};

export function AdmissionsCrmConfigurationJourneyPanel() {
  const { state: controllerState, actions, meta } = useAdmissionsCrmConfigurationWorkspace();
  const {
    academicYearId,
    cycleForm,
    handleAddApplicantChecklistItem,
    handleApplicantChecklistChange,
    handleApplySchoolDefaultCycle,
    handleCycleChange,
    handleCycleReadinessToggle,
    handleRemoveApplicantChecklistItem,
    handleSaveCycle,
    handleSaveSchoolDefaultCycle,
    isPreviewingCycleImpact,
    isSchoolDefaultCycleFetching,
    isUpdatingCycle,
    isUpdatingSchoolDefaultCycle,
    ownerOptions,
    schoolDefaultCycle,
    setCycleForm,
  } = { ...controllerState, ...actions, ...meta };

  return (
    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
      <Stack spacing={1.25}>
        <Stack direction={{ xs: 'column', sm: 'row' }} gap={1} justifyContent="space-between">
          <Box>
            <Typography component="h2" variant="subtitle1">
              Admission Year
            </Typography>
            <Typography variant="caption" color="text.secondary">
              School defaults can be applied to the current form or saved from it.
            </Typography>
          </Box>
          <Stack direction="row" gap={1} flexWrap="wrap">
            <LoadingButton
              size="small"
              variant="outlined"
              loading={isSchoolDefaultCycleFetching}
              disabled={!schoolDefaultCycle || isUpdatingCycle || isUpdatingSchoolDefaultCycle}
              onClick={handleApplySchoolDefaultCycle}
            >
              Apply Default
            </LoadingButton>
            <LoadingButton
              size="small"
              variant="outlined"
              loading={isUpdatingSchoolDefaultCycle}
              disabled={isUpdatingCycle}
              onClick={handleSaveSchoolDefaultCycle}
            >
              Save As Default
            </LoadingButton>
          </Stack>
        </Stack>
        <Divider />
        <Accordion defaultExpanded disableGutters variant="outlined">
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box>
              <Typography variant="subtitle2">Basics</Typography>
              <Typography variant="caption" color="text.secondary">
                Name and identify this admission setup.
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <TextField
              fullWidth
              size="small"
              label="Admission setup name"
              value={cycleForm.cycleName}
              disabled={!academicYearId || isUpdatingCycle || isUpdatingSchoolDefaultCycle}
              onChange={(event) => handleCycleChange('cycleName', event.target.value)}
            />
          </AccordionDetails>
        </Accordion>
        <Accordion disableGutters variant="outlined">
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box>
              <Typography variant="subtitle2">
                <SettingsHelpLabel
                  label="Working calendar"
                  help="Defines which days and hours count toward response targets for admission inquiries."
                />
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Working days, hours, holidays, and escalation ownership.
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ display: 'grid', gap: 1.25 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} gap={1}>
              <TextField
                fullWidth
                size="small"
                label="Time zone"
                value={cycleForm.slaPolicy.timeZoneId}
                onChange={(event) =>
                  setCycleForm((current) => ({
                    ...current,
                    slaPolicy: { ...current.slaPolicy, timeZoneId: event.target.value },
                  }))
                }
              />
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Working day starts"
                inputProps={{ min: 0, max: 23 }}
                value={cycleForm.slaPolicy.workingDayStartHour}
                onChange={(event) =>
                  setCycleForm((current) => ({
                    ...current,
                    slaPolicy: {
                      ...current.slaPolicy,
                      workingDayStartHour: Number(event.target.value),
                    },
                  }))
                }
              />
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Working day ends"
                inputProps={{ min: 1, max: 24 }}
                value={cycleForm.slaPolicy.workingDayEndHour}
                onChange={(event) =>
                  setCycleForm((current) => ({
                    ...current,
                    slaPolicy: {
                      ...current.slaPolicy,
                      workingDayEndHour: Number(event.target.value),
                    },
                  }))
                }
              />
            </Stack>
            <Stack direction="row" gap={1} flexWrap="wrap">
              {slaWorkingDayOptions.map((day) => (
                <FormControlLabel
                  key={day.value}
                  label={day.label}
                  control={
                    <Checkbox
                      size="small"
                      checked={cycleForm.slaPolicy.workingDays.includes(day.value)}
                      onChange={(event) =>
                        setCycleForm((current) => ({
                          ...current,
                          slaPolicy: {
                            ...current.slaPolicy,
                            workingDays: event.target.checked
                              ? [...current.slaPolicy.workingDays, day.value]
                              : current.slaPolicy.workingDays.filter(
                                  (value) => value !== day.value
                                ),
                          },
                        }))
                      }
                    />
                  }
                />
              ))}
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} gap={1}>
              <TextField
                fullWidth
                size="small"
                label="Holidays"
                helperText="Comma-separated dates in YYYY-MM-DD format"
                value={cycleForm.slaPolicy.holidays.join(', ')}
                onChange={(event) =>
                  setCycleForm((current) => ({
                    ...current,
                    slaPolicy: {
                      ...current.slaPolicy,
                      holidays: event.target.value
                        .split(',')
                        .map((value) => value.trim())
                        .filter(Boolean),
                    },
                  }))
                }
              />
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Escalate after additional hours"
                helperText="How long to wait after the response target is missed before notifying the escalation owner."
                inputProps={{ min: 0, max: 720 }}
                value={cycleForm.slaPolicy.escalationAfterHours}
                onChange={(event) =>
                  setCycleForm((current) => ({
                    ...current,
                    slaPolicy: {
                      ...current.slaPolicy,
                      escalationAfterHours: Number(event.target.value),
                    },
                  }))
                }
              />
              <FormControl fullWidth size="small">
                <InputLabel>Escalation owner</InputLabel>
                <Select
                  label="Escalation owner"
                  inputProps={{ 'aria-label': 'Escalation owner' }}
                  value={cycleForm.slaPolicy.escalationOwnerUserId || ''}
                  onChange={(event) =>
                    setCycleForm((current) => ({
                      ...current,
                      slaPolicy: {
                        ...current.slaPolicy,
                        escalationOwnerUserId: event.target.value || null,
                      },
                    }))
                  }
                >
                  <MenuItem value="">Lead owner</MenuItem>
                  {ownerOptions.map((owner) => (
                    <MenuItem key={owner.id} value={owner.id}>
                      {getCrmUserOptionLabel(owner)}
                    </MenuItem>
                  ))}
                </Select>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                  The person notified when an inquiry is overdue beyond the extra hours above.
                </Typography>
              </FormControl>
            </Stack>
          </AccordionDetails>
        </Accordion>
        <Accordion disableGutters variant="outlined">
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box>
              <Typography variant="subtitle2">
                <SettingsHelpLabel
                  label="Evaluation and automation"
                  help="Controls default response targets, exam pass marks, stale inquiries, and ranking behavior."
                />
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Service targets, passing score, inactivity, and ranking defaults.
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ display: 'grid', gap: 1.25 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} gap={1}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Lead SLA hours"
                helperText="Target response time for a new admission inquiry before it is treated as overdue."
                value={cycleForm.defaultLeadSlaHours}
                disabled={!academicYearId || isUpdatingCycle || isUpdatingSchoolDefaultCycle}
                onChange={(event) =>
                  handleCycleChange('defaultLeadSlaHours', Number(event.target.value))
                }
              />
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Passing %"
                value={cycleForm.defaultExamPassingPercentage}
                disabled={!academicYearId || isUpdatingCycle || isUpdatingSchoolDefaultCycle}
                onChange={(event) =>
                  handleCycleChange('defaultExamPassingPercentage', Number(event.target.value))
                }
              />
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Activation cancellation window (days)"
                inputProps={{ min: 0, max: 90 }}
                value={cycleForm.activationCancellationWindowDays}
                disabled={!academicYearId || isUpdatingCycle || isUpdatingSchoolDefaultCycle}
                onChange={(event) =>
                  handleCycleChange('activationCancellationWindowDays', Number(event.target.value))
                }
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} gap={1}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Stale after days"
                value={cycleForm.staleAfterDays}
                disabled={!academicYearId || isUpdatingCycle || isUpdatingSchoolDefaultCycle}
                onChange={(event) =>
                  handleCycleChange('staleAfterDays', Number(event.target.value))
                }
              />
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Archive after days"
                value={cycleForm.archiveAfterDays}
                disabled={!academicYearId || isUpdatingCycle || isUpdatingSchoolDefaultCycle}
                onChange={(event) =>
                  handleCycleChange('archiveAfterDays', Number(event.target.value))
                }
              />
            </Stack>
            <FormControl fullWidth size="small">
              <InputLabel>Merit ranking</InputLabel>
              <Select
                label="Merit ranking"
                inputProps={{ 'aria-label': 'Merit ranking' }}
                value={cycleForm.meritRankingMode}
                disabled={!academicYearId || isUpdatingCycle || isUpdatingSchoolDefaultCycle}
                onChange={(event) =>
                  handleCycleChange(
                    'meritRankingMode',
                    Number(event.target.value) as AdmissionCrmMeritRankingMode
                  )
                }
              >
                {Object.entries(meritModeLabel).map(([value, label]) => (
                  <MenuItem key={value} value={Number(value)}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </AccordionDetails>
        </Accordion>
        <Accordion disableGutters variant="outlined">
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box>
              <Typography variant="subtitle2">Activation safeguards</Typography>
              <Typography variant="caption" color="text.secondary">
                Cycle availability and registration-before-exam controls.
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Stack direction={{ xs: 'column', sm: 'row' }} gap={1}>
              <FormControlLabel
                control={
                  <Switch
                    checked={cycleForm.isActive}
                    disabled={!academicYearId || isUpdatingCycle || isUpdatingSchoolDefaultCycle}
                    onChange={(event) => handleCycleChange('isActive', event.target.checked)}
                  />
                }
                label="Active"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={cycleForm.registrationFormRequiredBeforeExam}
                    disabled={!academicYearId || isUpdatingCycle || isUpdatingSchoolDefaultCycle}
                    onChange={(event) =>
                      handleCycleChange('registrationFormRequiredBeforeExam', event.target.checked)
                    }
                  />
                }
                label="Registration before exam"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={cycleForm.entranceExamRequired}
                    disabled={!academicYearId || isUpdatingCycle || isUpdatingSchoolDefaultCycle}
                    onChange={(event) =>
                      handleCycleChange('entranceExamRequired', event.target.checked)
                    }
                  />
                }
                label="Entrance exam required"
              />
            </Stack>
            {!cycleForm.entranceExamRequired && (
              <Alert severity="warning" sx={{ mt: 1 }}>
                Exam scheduling is disabled for this admission year. Applicants use the exam-waived
                registration and admission readiness path.
              </Alert>
            )}
          </AccordionDetails>
        </Accordion>
        <AdmissionsCrmApplicantChecklistPanel />
        <LoadingButton
          size="small"
          variant="contained"
          loading={isUpdatingCycle || isPreviewingCycleImpact}
          disabled={!academicYearId || isUpdatingSchoolDefaultCycle}
          onClick={handleSaveCycle}
          sx={{
            alignSelf: 'flex-start',
            position: 'sticky',
            bottom: 16,
            zIndex: 1,
            boxShadow: 2,
          }}
        >
          Save Cycle
        </LoadingButton>
      </Stack>
    </Paper>
  );
}
