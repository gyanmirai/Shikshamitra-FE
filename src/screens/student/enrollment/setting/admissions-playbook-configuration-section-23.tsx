'use client';

import type { AdmissionCrmSeatPlanDto } from 'src/redux/student/admissions-crm/final-admission-contracts';

import type { AdmissionCrmAdmissionRoundDto } from 'src/redux/student/admissions-crm/core-leads-contracts';

import { Add, DeleteOutline } from '@mui/icons-material';

import {
  Box,
  Stack,
  Paper,
  Button,
  Divider,
  TextField,
  Typography,
  IconButton,
} from '@mui/material';

import { useAdmissionsPlaybookWorkspace } from './admissions-playbook-configuration-context';

const createRound = (): AdmissionCrmAdmissionRoundDto => ({
  code: '',
  name: '',
  openingDate: '',
  closingDate: '',
  examWindowStart: null,
  examWindowEnd: null,
  registrationDeadline: null,
  decisionDeadline: null,
  isActive: true,
});

const createSeatPlan = (): AdmissionCrmSeatPlanDto => ({
  code: '',
  roundCode: null,
  plannedSeats: 0,
  approvedCapacity: 0,
  offeredSeats: 0,
  acceptedSeats: 0,
  waitlistedApplicants: 0,
  withdrawnApplicants: 0,
  remainingCapacity: 0,
  isOverAllocated: false,
});

export function AdmissionsPlaybookRoundsStep() {
  const { state: controllerState, actions, meta } = useAdmissionsPlaybookWorkspace();
  const { editorTab, form, readOnly, setForm, updateRound, updateSeatPlan } = {
    ...controllerState,
    ...actions,
    ...meta,
  };

  return (
    <>
      {editorTab === 2 ? (
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle2">Admission rounds</Typography>
            <Button
              size="small"
              startIcon={<Add />}
              disabled={readOnly}
              onClick={() =>
                setForm((current) => ({
                  ...current,
                  rounds: [...current.rounds, createRound()],
                }))
              }
            >
              Add Round
            </Button>
          </Stack>
          {form.rounds.map((round, index) => (
            <Paper
              key={`${round.code}-${index}`}
              variant="outlined"
              sx={{ p: 1.25, borderRadius: 1 }}
            >
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(4, minmax(0, 1fr)) auto' },
                  gap: 1,
                  alignItems: 'center',
                }}
              >
                <TextField
                  size="small"
                  label="Code"
                  value={round.code}
                  disabled={readOnly}
                  onChange={(event) => updateRound(index, { code: event.target.value })}
                />
                <TextField
                  size="small"
                  label="Name"
                  value={round.name}
                  disabled={readOnly}
                  onChange={(event) => updateRound(index, { name: event.target.value })}
                />
                <TextField
                  size="small"
                  type="date"
                  label="Opens"
                  InputLabelProps={{ shrink: true }}
                  value={round.openingDate?.slice(0, 10) || ''}
                  disabled={readOnly}
                  onChange={(event) => updateRound(index, { openingDate: event.target.value })}
                />
                <TextField
                  size="small"
                  type="date"
                  label="Closes"
                  InputLabelProps={{ shrink: true }}
                  value={round.closingDate?.slice(0, 10) || ''}
                  disabled={readOnly}
                  onChange={(event) => updateRound(index, { closingDate: event.target.value })}
                />
                <IconButton
                  aria-label="Remove round"
                  disabled={readOnly}
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      rounds: current.rounds.filter((_item, itemIndex) => itemIndex !== index),
                    }))
                  }
                >
                  <DeleteOutline />
                </IconButton>
                <TextField
                  size="small"
                  type="date"
                  label="Exam starts"
                  InputLabelProps={{ shrink: true }}
                  value={round.examWindowStart?.slice(0, 10) || ''}
                  disabled={readOnly}
                  onChange={(event) =>
                    updateRound(index, { examWindowStart: event.target.value || null })
                  }
                />
                <TextField
                  size="small"
                  type="date"
                  label="Exam ends"
                  InputLabelProps={{ shrink: true }}
                  value={round.examWindowEnd?.slice(0, 10) || ''}
                  disabled={readOnly}
                  onChange={(event) =>
                    updateRound(index, { examWindowEnd: event.target.value || null })
                  }
                />
                <TextField
                  size="small"
                  type="date"
                  label="Registration deadline"
                  InputLabelProps={{ shrink: true }}
                  value={round.registrationDeadline?.slice(0, 10) || ''}
                  disabled={readOnly}
                  onChange={(event) =>
                    updateRound(index, { registrationDeadline: event.target.value || null })
                  }
                />
                <TextField
                  size="small"
                  type="date"
                  label="Decision deadline"
                  InputLabelProps={{ shrink: true }}
                  value={round.decisionDeadline?.slice(0, 10) || ''}
                  disabled={readOnly}
                  onChange={(event) =>
                    updateRound(index, { decisionDeadline: event.target.value || null })
                  }
                />
              </Box>
            </Paper>
          ))}
          <Divider />
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle2">Seat plans</Typography>
            <Button
              size="small"
              startIcon={<Add />}
              disabled={readOnly}
              onClick={() =>
                setForm((current) => ({
                  ...current,
                  seatPlans: [...current.seatPlans, createSeatPlan()],
                }))
              }
            >
              Add Seat Plan
            </Button>
          </Stack>
          {form.seatPlans.map((plan, index) => (
            <Paper
              key={`${plan.code}-${index}`}
              variant="outlined"
              sx={{ p: 1.25, borderRadius: 1 }}
            >
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(4, minmax(0, 1fr)) auto' },
                  gap: 1,
                  alignItems: 'center',
                }}
              >
                <TextField
                  size="small"
                  label="Code"
                  value={plan.code}
                  disabled={readOnly}
                  onChange={(event) => updateSeatPlan(index, { code: event.target.value })}
                />
                <TextField
                  size="small"
                  label="Round code"
                  value={plan.roundCode || ''}
                  disabled={readOnly}
                  onChange={(event) => updateSeatPlan(index, { roundCode: event.target.value })}
                />
                <TextField
                  size="small"
                  label="Campus"
                  value={plan.campus || ''}
                  disabled={readOnly}
                  onChange={(event) => updateSeatPlan(index, { campus: event.target.value })}
                />
                <TextField
                  size="small"
                  label="Class"
                  value={plan.desiredClass || ''}
                  disabled={readOnly}
                  onChange={(event) => updateSeatPlan(index, { desiredClass: event.target.value })}
                />
                <IconButton
                  aria-label="Remove seat plan"
                  disabled={readOnly}
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      seatPlans: current.seatPlans.filter(
                        (_item, itemIndex) => itemIndex !== index
                      ),
                    }))
                  }
                >
                  <DeleteOutline />
                </IconButton>
                {(
                  [
                    'plannedSeats',
                    'approvedCapacity',
                    'offeredSeats',
                    'acceptedSeats',
                    'waitlistedApplicants',
                    'withdrawnApplicants',
                  ] as const
                ).map((key) => (
                  <TextField
                    key={key}
                    size="small"
                    type="number"
                    label={key.replace(/([A-Z])/g, ' $1')}
                    value={plan[key]}
                    disabled={readOnly}
                    onChange={(event) =>
                      updateSeatPlan(index, { [key]: Number(event.target.value) })
                    }
                  />
                ))}
              </Box>
            </Paper>
          ))}
        </Stack>
      ) : null}
    </>
  );
}
