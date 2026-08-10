'use client';

import { Add, DeleteOutline } from '@mui/icons-material';

import {
  Stack,
  Paper,
  Switch,
  Select,
  Button,
  MenuItem,
  TextField,
  Typography,
  IconButton,
  InputLabel,
  FormControl,
  FormControlLabel,
} from '@mui/material';

import { AdmissionInquiryStage } from 'src/redux/student/admissions-crm/core-leads-contracts';

import { useAdmissionsPlaybookWorkspace } from './admissions-playbook-configuration-context';

const stageOptions = Object.values(AdmissionInquiryStage).filter(
  (value): value is AdmissionInquiryStage => typeof value === 'number'
);

export function AdmissionsPlaybookStagesStep() {
  const { state: controllerState, actions, meta } = useAdmissionsPlaybookWorkspace();
  const { editorTab, form, readOnly, setForm, updateStage } = {
    ...controllerState,
    ...actions,
    ...meta,
  };

  return (
    <>
      {editorTab === 1 ? (
        <Stack spacing={1.5}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle2">Pipeline stages</Typography>
            <Button
              size="small"
              startIcon={<Add />}
              disabled={readOnly}
              onClick={() =>
                setForm((current) => ({
                  ...current,
                  stages: [
                    ...current.stages,
                    {
                      code: '',
                      displayName: '',
                      reportingMilestone: AdmissionInquiryStage.FollowUp,
                      order: current.stages.length * 10 + 10,
                      isRequired: true,
                      isParentVisible: false,
                      slaHours: null,
                      allowedNextStageCodes: [],
                    },
                  ],
                }))
              }
            >
              Add Stage
            </Button>
          </Stack>
          {form.stages.map((stage, index) => (
            <Paper
              key={`${stage.code}-${index}`}
              variant="outlined"
              sx={{ p: 1.25, borderRadius: 1 }}
            >
              <Stack spacing={1}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems="center">
                  <TextField
                    size="small"
                    label="Code"
                    value={stage.code}
                    disabled={readOnly}
                    onChange={(event) => updateStage(index, { code: event.target.value })}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Display name"
                    value={stage.displayName}
                    disabled={readOnly}
                    onChange={(event) => updateStage(index, { displayName: event.target.value })}
                  />
                  <TextField
                    size="small"
                    type="number"
                    label="Order"
                    value={stage.order}
                    disabled={readOnly}
                    onChange={(event) => updateStage(index, { order: Number(event.target.value) })}
                  />
                  <FormControl size="small" sx={{ minWidth: 170 }} disabled={readOnly}>
                    <InputLabel>Milestone</InputLabel>
                    <Select
                      label="Milestone"
                      value={stage.reportingMilestone}
                      onChange={(event) =>
                        updateStage(index, {
                          reportingMilestone: Number(event.target.value) as AdmissionInquiryStage,
                        })
                      }
                    >
                      {stageOptions.map((value) => (
                        <MenuItem key={value} value={value}>
                          {AdmissionInquiryStage[value]}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <IconButton
                    aria-label="Remove stage"
                    disabled={readOnly}
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        stages: current.stages.filter((_item, itemIndex) => itemIndex !== index),
                      }))
                    }
                  >
                    <DeleteOutline />
                  </IconButton>
                </Stack>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Allowed next stage codes"
                    value={stage.allowedNextStageCodes.join(', ')}
                    disabled={readOnly}
                    onChange={(event) =>
                      updateStage(index, {
                        allowedNextStageCodes: event.target.value
                          .split(',')
                          .map((value) => value.trim())
                          .filter(Boolean),
                      })
                    }
                  />
                  <TextField
                    size="small"
                    type="number"
                    label="SLA hours"
                    value={stage.slaHours ?? ''}
                    disabled={readOnly}
                    onChange={(event) =>
                      updateStage(index, {
                        slaHours: event.target.value ? Number(event.target.value) : null,
                      })
                    }
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={stage.isRequired}
                        disabled={readOnly}
                        onChange={(event) =>
                          updateStage(index, { isRequired: event.target.checked })
                        }
                      />
                    }
                    label="Required"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={stage.isParentVisible}
                        disabled={readOnly}
                        onChange={(event) =>
                          updateStage(index, { isParentVisible: event.target.checked })
                        }
                      />
                    }
                    label="Parent visible"
                  />
                </Stack>
              </Stack>
            </Paper>
          ))}
        </Stack>
      ) : null}
    </>
  );
}
