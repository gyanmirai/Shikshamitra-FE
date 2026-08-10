'use client';

import type { AdmissionCrmExamDefinitionDto } from 'src/redux/student/admissions-crm/communication-exams-events-contracts';

import { Add, DeleteOutline } from '@mui/icons-material';

import {
  Box,
  Alert,
  Stack,
  Switch,
  Select,
  Button,
  Divider,
  MenuItem,
  TextField,
  Typography,
  IconButton,
  InputLabel,
  FormControl,
  FormControlLabel,
} from '@mui/material';

import { AdmissionCrmAssessmentComponentType } from 'src/redux/student/admissions-crm/setup-playbooks-contracts';

import { useAdmissionsPlaybookWorkspace } from './admissions-playbook-configuration-context';

const assessmentTypeLabel: Record<AdmissionCrmAssessmentComponentType, string> = {
  [AdmissionCrmAssessmentComponentType.WrittenTest]: 'Written test',
  [AdmissionCrmAssessmentComponentType.Interview]: 'Interview',
  [AdmissionCrmAssessmentComponentType.Interaction]: 'Interaction',
  [AdmissionCrmAssessmentComponentType.Observation]: 'Observation',
  [AdmissionCrmAssessmentComponentType.ReadinessAssessment]: 'Readiness assessment',
};

const updateAt = <T,>(items: T[], index: number, patch: Partial<T>): T[] =>
  items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item));

const createExam = (): AdmissionCrmExamDefinitionDto => ({
  code: '',
  name: '',
  durationMinutes: 60,
  hallTicketEnabled: false,
  components: [
    {
      code: '',
      name: '',
      componentType: AdmissionCrmAssessmentComponentType.WrittenTest,
      maximumMarks: 100,
      minimumMarks: 40,
      weightPercentage: 100,
      isMandatory: true,
      scorePrecision: 0,
    },
  ],
  resultRule: {
    aggregatePassingPercentage: 40,
    requireMandatoryComponentPass: true,
    meritCapacity: null,
    waitlistCapacity: null,
    tieBreakerCodes: [],
  },
});

export function AdmissionsPlaybookExamsStep() {
  const { state: controllerState, actions, meta } = useAdmissionsPlaybookWorkspace();
  const { editorTab, form, readOnly, setForm, updateExam } = {
    ...controllerState,
    ...actions,
    ...meta,
  };

  return (
    <>
      {editorTab === 3 ? (
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle2">Entrance exam definitions</Typography>
            <Button
              size="small"
              startIcon={<Add />}
              disabled={readOnly}
              onClick={() =>
                setForm((current) => ({
                  ...current,
                  examDefinitions: [...current.examDefinitions, createExam()],
                }))
              }
            >
              Add Exam
            </Button>
          </Stack>
          {form.examDefinitions.map((exam, examIndex) => (
            <Box key={`${exam.code}-${examIndex}`} sx={{ display: 'grid', gap: 1.25 }}>
              {examIndex > 0 ? <Divider /> : null}
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems="center">
                <TextField
                  size="small"
                  label="Code"
                  value={exam.code}
                  disabled={readOnly}
                  onChange={(event) => updateExam(examIndex, { code: event.target.value })}
                />
                <TextField
                  fullWidth
                  size="small"
                  label="Exam name"
                  value={exam.name}
                  disabled={readOnly}
                  onChange={(event) => updateExam(examIndex, { name: event.target.value })}
                />
                <TextField
                  size="small"
                  label="Round code"
                  value={exam.roundCode || ''}
                  disabled={readOnly}
                  onChange={(event) => updateExam(examIndex, { roundCode: event.target.value })}
                />
                <TextField
                  size="small"
                  label="Class"
                  value={exam.desiredClass || ''}
                  disabled={readOnly}
                  onChange={(event) => updateExam(examIndex, { desiredClass: event.target.value })}
                />
                <TextField
                  size="small"
                  type="number"
                  label="Duration minutes"
                  value={exam.durationMinutes}
                  disabled={readOnly}
                  onChange={(event) =>
                    updateExam(examIndex, { durationMinutes: Number(event.target.value) })
                  }
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={exam.hallTicketEnabled}
                      disabled={readOnly}
                      onChange={(event) =>
                        updateExam(examIndex, { hallTicketEnabled: event.target.checked })
                      }
                    />
                  }
                  label="Hall ticket"
                />
                <IconButton
                  aria-label="Remove exam"
                  disabled={readOnly}
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      examDefinitions: current.examDefinitions.filter(
                        (_item, itemIndex) => itemIndex !== examIndex
                      ),
                    }))
                  }
                >
                  <DeleteOutline />
                </IconButton>
              </Stack>
              <Typography variant="caption" color="text.secondary">
                Assessment components
              </Typography>
              {exam.components.map((component, componentIndex) => (
                <Box
                  key={`${component.code}-${componentIndex}`}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(7, minmax(0, 1fr)) auto' },
                    gap: 1,
                    alignItems: 'center',
                  }}
                >
                  <TextField
                    size="small"
                    label="Code"
                    value={component.code}
                    disabled={readOnly}
                    onChange={(event) =>
                      updateExam(examIndex, {
                        components: updateAt(exam.components, componentIndex, {
                          code: event.target.value,
                        }),
                      })
                    }
                  />
                  <TextField
                    size="small"
                    label="Name"
                    value={component.name}
                    disabled={readOnly}
                    onChange={(event) =>
                      updateExam(examIndex, {
                        components: updateAt(exam.components, componentIndex, {
                          name: event.target.value,
                        }),
                      })
                    }
                  />
                  <FormControl size="small" disabled={readOnly}>
                    <InputLabel>Type</InputLabel>
                    <Select
                      label="Type"
                      value={component.componentType}
                      onChange={(event) =>
                        updateExam(examIndex, {
                          components: updateAt(exam.components, componentIndex, {
                            componentType: Number(
                              event.target.value
                            ) as AdmissionCrmAssessmentComponentType,
                          }),
                        })
                      }
                    >
                      {Object.entries(assessmentTypeLabel).map(([value, label]) => (
                        <MenuItem key={value} value={Number(value)}>
                          {label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    size="small"
                    type="number"
                    label="Maximum"
                    value={component.maximumMarks}
                    disabled={readOnly}
                    onChange={(event) =>
                      updateExam(examIndex, {
                        components: updateAt(exam.components, componentIndex, {
                          maximumMarks: Number(event.target.value),
                        }),
                      })
                    }
                  />
                  <TextField
                    size="small"
                    type="number"
                    label="Minimum"
                    value={component.minimumMarks ?? ''}
                    disabled={readOnly}
                    onChange={(event) =>
                      updateExam(examIndex, {
                        components: updateAt(exam.components, componentIndex, {
                          minimumMarks: event.target.value ? Number(event.target.value) : null,
                        }),
                      })
                    }
                  />
                  <TextField
                    size="small"
                    type="number"
                    label="Weight %"
                    value={component.weightPercentage}
                    disabled={readOnly}
                    onChange={(event) =>
                      updateExam(examIndex, {
                        components: updateAt(exam.components, componentIndex, {
                          weightPercentage: Number(event.target.value),
                        }),
                      })
                    }
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={component.isMandatory}
                        disabled={readOnly}
                        onChange={(event) =>
                          updateExam(examIndex, {
                            components: updateAt(exam.components, componentIndex, {
                              isMandatory: event.target.checked,
                            }),
                          })
                        }
                      />
                    }
                    label="Required"
                  />
                  <IconButton
                    aria-label="Remove component"
                    disabled={readOnly || exam.components.length === 1}
                    onClick={() =>
                      updateExam(examIndex, {
                        components: exam.components.filter(
                          (_item, itemIndex) => itemIndex !== componentIndex
                        ),
                      })
                    }
                  >
                    <DeleteOutline />
                  </IconButton>
                </Box>
              ))}
              <Button
                size="small"
                startIcon={<Add />}
                disabled={readOnly}
                onClick={() =>
                  updateExam(examIndex, {
                    components: [
                      ...exam.components,
                      {
                        ...createExam().components[0],
                        code: '',
                        name: '',
                        weightPercentage: 0,
                      },
                    ],
                  })
                }
                sx={{ justifySelf: 'start' }}
              >
                Add Component
              </Button>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
                <TextField
                  size="small"
                  type="number"
                  label="Pass %"
                  value={exam.resultRule.aggregatePassingPercentage}
                  disabled={readOnly}
                  onChange={(event) =>
                    updateExam(examIndex, {
                      resultRule: {
                        ...exam.resultRule,
                        aggregatePassingPercentage: Number(event.target.value),
                      },
                    })
                  }
                />
                <TextField
                  size="small"
                  type="number"
                  label="Merit capacity"
                  value={exam.resultRule.meritCapacity ?? ''}
                  disabled={readOnly}
                  onChange={(event) =>
                    updateExam(examIndex, {
                      resultRule: {
                        ...exam.resultRule,
                        meritCapacity: event.target.value ? Number(event.target.value) : null,
                      },
                    })
                  }
                />
                <TextField
                  size="small"
                  type="number"
                  label="Waitlist capacity"
                  value={exam.resultRule.waitlistCapacity ?? ''}
                  disabled={readOnly}
                  onChange={(event) =>
                    updateExam(examIndex, {
                      resultRule: {
                        ...exam.resultRule,
                        waitlistCapacity: event.target.value ? Number(event.target.value) : null,
                      },
                    })
                  }
                />
                <TextField
                  fullWidth
                  size="small"
                  label="Tie breakers"
                  value={exam.resultRule.tieBreakerCodes.join(', ')}
                  disabled={readOnly}
                  onChange={(event) =>
                    updateExam(examIndex, {
                      resultRule: {
                        ...exam.resultRule,
                        tieBreakerCodes: event.target.value
                          .split(',')
                          .map((value) => value.trim())
                          .filter(Boolean),
                      },
                    })
                  }
                />
              </Stack>
              <Alert severity="info">
                Runtime outcome routing is fixed and auditable: a pass moves the applicant to
                Eligible, a failed result moves to Rejected, and a waitlist requires an eligibility
                decision. Use Follow-up Automation to send the matching parent message or create a
                staff task.
              </Alert>
            </Box>
          ))}
        </Stack>
      ) : null}
    </>
  );
}
