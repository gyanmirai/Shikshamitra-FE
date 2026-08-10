'use client';

import type { AdmissionCrmSlotAssignmentRuleDto } from 'src/redux/student/admissions-crm/setup-playbooks-contracts';

import type { AdmissionCrmSlotTemplateDto } from 'src/redux/student/admissions-crm/core-leads-contracts';

import { Add, DeleteOutline } from '@mui/icons-material';

import {
  Box,
  Stack,
  Paper,
  Select,
  Button,
  Divider,
  MenuItem,
  TextField,
  Typography,
  IconButton,
  InputLabel,
  FormControl,
} from '@mui/material';

import { AdmissionCrmSlotAssignmentStrategy } from 'src/redux/student/admissions-crm/setup-playbooks-contracts';

import { useAdmissionsPlaybookWorkspace } from './admissions-playbook-configuration-context';

const assignmentStrategyLabel: Record<AdmissionCrmSlotAssignmentStrategy, string> = {
  [AdmissionCrmSlotAssignmentStrategy.Manual]: 'Manual',
  [AdmissionCrmSlotAssignmentStrategy.EarliestAvailable]: 'Earliest available',
  [AdmissionCrmSlotAssignmentStrategy.RoundRobin]: 'Round robin',
  [AdmissionCrmSlotAssignmentStrategy.ClassMatch]: 'Class match',
  [AdmissionCrmSlotAssignmentStrategy.CampusMatch]: 'Campus match',
  [AdmissionCrmSlotAssignmentStrategy.PreferredDate]: 'Preferred date',
  [AdmissionCrmSlotAssignmentStrategy.LanguageMatch]: 'Language match',
  [AdmissionCrmSlotAssignmentStrategy.SiblingGrouping]: 'Sibling grouping',
  [AdmissionCrmSlotAssignmentStrategy.BalancedCapacity]: 'Balanced capacity',
};

const createSlot = (): AdmissionCrmSlotTemplateDto => ({
  code: '',
  name: '',
  examDefinitionCode: '',
  roomNo: 1,
  capacity: 30,
  reportingTime: '08:30',
  startTime: '09:00',
  endTime: '10:00',
  validFrom: null,
  validTo: null,
  daysOfWeek: [],
  blackoutDates: [],
  isActive: true,
});

const createAssignmentRule = (): AdmissionCrmSlotAssignmentRuleDto => ({
  code: '',
  name: '',
  trigger: 'ExamReady',
  strategy: AdmissionCrmSlotAssignmentStrategy.EarliestAvailable,
  priority: 10,
  slotTemplateCode: null,
  isActive: true,
});

export function AdmissionsPlaybookSlotsStep() {
  const { state: controllerState, actions, meta } = useAdmissionsPlaybookWorkspace();
  const { editorTab, form, readOnly, setForm, updateRule, updateSlot } = {
    ...controllerState,
    ...actions,
    ...meta,
  };

  return (
    <>
      {editorTab === 4 ? (
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle2">Slot templates</Typography>
            <Button
              size="small"
              startIcon={<Add />}
              disabled={readOnly}
              onClick={() =>
                setForm((current) => ({
                  ...current,
                  slotTemplates: [...current.slotTemplates, createSlot()],
                }))
              }
            >
              Add Slot Template
            </Button>
          </Stack>
          {form.slotTemplates.map((slot, index) => (
            <Paper
              key={`${slot.code}-${index}`}
              variant="outlined"
              sx={{ p: 1.25, borderRadius: 1 }}
            >
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(6, minmax(0, 1fr)) auto' },
                  gap: 1,
                  alignItems: 'center',
                }}
              >
                <TextField
                  size="small"
                  label="Code"
                  value={slot.code}
                  disabled={readOnly}
                  onChange={(event) => updateSlot(index, { code: event.target.value })}
                />
                <TextField
                  size="small"
                  label="Name"
                  value={slot.name}
                  disabled={readOnly}
                  onChange={(event) => updateSlot(index, { name: event.target.value })}
                />
                <TextField
                  size="small"
                  label="Exam code"
                  value={slot.examDefinitionCode}
                  disabled={readOnly}
                  onChange={(event) =>
                    updateSlot(index, { examDefinitionCode: event.target.value })
                  }
                />
                <TextField
                  size="small"
                  label="Room or hall"
                  value={slot.roomOrHall || ''}
                  disabled={readOnly}
                  onChange={(event) => updateSlot(index, { roomOrHall: event.target.value })}
                />
                <TextField
                  size="small"
                  type="number"
                  label="Room number"
                  value={slot.roomNo}
                  disabled={readOnly}
                  onChange={(event) => updateSlot(index, { roomNo: Number(event.target.value) })}
                />
                <TextField
                  size="small"
                  type="number"
                  label="Capacity"
                  value={slot.capacity}
                  disabled={readOnly}
                  onChange={(event) => updateSlot(index, { capacity: Number(event.target.value) })}
                />
                <IconButton
                  aria-label="Remove slot template"
                  disabled={readOnly}
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      slotTemplates: current.slotTemplates.filter(
                        (_item, itemIndex) => itemIndex !== index
                      ),
                    }))
                  }
                >
                  <DeleteOutline />
                </IconButton>
                <TextField
                  size="small"
                  type="time"
                  label="Reporting"
                  InputLabelProps={{ shrink: true }}
                  value={slot.reportingTime.slice(0, 5)}
                  disabled={readOnly}
                  onChange={(event) => updateSlot(index, { reportingTime: event.target.value })}
                />
                <TextField
                  size="small"
                  type="time"
                  label="Starts"
                  InputLabelProps={{ shrink: true }}
                  value={slot.startTime.slice(0, 5)}
                  disabled={readOnly}
                  onChange={(event) => updateSlot(index, { startTime: event.target.value })}
                />
                <TextField
                  size="small"
                  type="time"
                  label="Ends"
                  InputLabelProps={{ shrink: true }}
                  value={slot.endTime.slice(0, 5)}
                  disabled={readOnly}
                  onChange={(event) => updateSlot(index, { endTime: event.target.value })}
                />
                <TextField
                  size="small"
                  type="date"
                  label="Valid from"
                  InputLabelProps={{ shrink: true }}
                  value={slot.validFrom?.slice(0, 10) || ''}
                  disabled={readOnly}
                  onChange={(event) => updateSlot(index, { validFrom: event.target.value || null })}
                />
                <TextField
                  size="small"
                  type="date"
                  label="Valid to"
                  InputLabelProps={{ shrink: true }}
                  value={slot.validTo?.slice(0, 10) || ''}
                  disabled={readOnly}
                  onChange={(event) => updateSlot(index, { validTo: event.target.value || null })}
                />
              </Box>
            </Paper>
          ))}
          <Divider />
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle2">Auto-assignment rules</Typography>
            <Button
              size="small"
              startIcon={<Add />}
              disabled={readOnly}
              onClick={() =>
                setForm((current) => ({
                  ...current,
                  assignmentRules: [...current.assignmentRules, createAssignmentRule()],
                }))
              }
            >
              Add Rule
            </Button>
          </Stack>
          {form.assignmentRules.map((rule, index) => (
            <Paper
              key={`${rule.code}-${index}`}
              variant="outlined"
              sx={{ p: 1.25, borderRadius: 1 }}
            >
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(6, minmax(0, 1fr)) auto' },
                  gap: 1,
                  alignItems: 'center',
                }}
              >
                <TextField
                  size="small"
                  label="Code"
                  value={rule.code}
                  disabled={readOnly}
                  onChange={(event) => updateRule(index, { code: event.target.value })}
                />
                <TextField
                  size="small"
                  label="Name"
                  value={rule.name}
                  disabled={readOnly}
                  onChange={(event) => updateRule(index, { name: event.target.value })}
                />
                <TextField
                  select
                  size="small"
                  label="Trigger"
                  value={rule.trigger}
                  disabled={readOnly}
                  onChange={(event) => updateRule(index, { trigger: event.target.value })}
                >
                  <MenuItem value="ExamReady">Exam ready</MenuItem>
                  <MenuItem value="Interested">Interested</MenuItem>
                  <MenuItem value="ApplicantSelfSchedule">Applicant self-scheduling</MenuItem>
                </TextField>
                <FormControl size="small" disabled={readOnly}>
                  <InputLabel>Strategy</InputLabel>
                  <Select
                    label="Strategy"
                    value={rule.strategy}
                    onChange={(event) =>
                      updateRule(index, {
                        strategy: Number(event.target.value) as AdmissionCrmSlotAssignmentStrategy,
                      })
                    }
                  >
                    {Object.entries(assignmentStrategyLabel).map(([value, label]) => (
                      <MenuItem key={value} value={Number(value)}>
                        {label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  size="small"
                  type="number"
                  label="Priority"
                  value={rule.priority}
                  disabled={readOnly}
                  onChange={(event) => updateRule(index, { priority: Number(event.target.value) })}
                />
                <TextField
                  size="small"
                  label="Slot template code"
                  value={rule.slotTemplateCode || ''}
                  disabled={readOnly}
                  onChange={(event) => updateRule(index, { slotTemplateCode: event.target.value })}
                />
                <IconButton
                  aria-label="Remove assignment rule"
                  disabled={readOnly}
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      assignmentRules: current.assignmentRules.filter(
                        (_item, itemIndex) => itemIndex !== index
                      ),
                    }))
                  }
                >
                  <DeleteOutline />
                </IconButton>
              </Box>
            </Paper>
          ))}
        </Stack>
      ) : null}
    </>
  );
}
