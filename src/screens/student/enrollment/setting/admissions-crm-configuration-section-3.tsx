'use client';

import { LoadingButton } from 'src/components/loading-button';

import {
  Box,
  Chip,
  Alert,
  Stack,
  Paper,
  Button,
  TextField,
  Typography,
  LinearProgress,
} from '@mui/material';

import {
  leadScoringGroups,
  leadScoringPresets,
  getLeadScoringPreviews,
  matchesLeadScoringPreset,
} from './pipeline-scoring-model';

import { useAdmissionsCrmConfigurationWorkspace } from './admissions-crm-configuration-context';

export function AdmissionsCrmConfigurationSection3() {
  const { state: controllerState, actions, meta } = useAdmissionsCrmConfigurationWorkspace();
  const {
    academicYearId,
    cycleForm,
    focusPanel,
    focusSection,
    handleSaveCycle,
    handleScoringRuleChange,
    isPreviewingCycleImpact,
    isUpdatingCycle,
    setCycleForm,
  } = { ...controllerState, ...actions, ...meta };

  return (
    <>
      {focusSection === 'routing' && (!focusPanel || focusPanel === 'scoring') && (
        <Stack spacing={1.5}>
          <Paper variant="outlined" sx={{ p: { xs: 1.5, md: 2 }, borderRadius: 1.5 }}>
            <Stack spacing={1.5}>
              <Box>
                <Typography component="h2" variant="subtitle1">
                  Recommended Scoring Models
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ textWrap: 'pretty' }}>
                  Start with a transparent school-ready model, then tune individual signals only
                  when your admissions team has evidence for the change.
                </Typography>
              </Box>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
                  gap: 1,
                }}
              >
                {leadScoringPresets.map((preset) => {
                  const selected = matchesLeadScoringPreset(cycleForm.leadScoringRules, preset);
                  return (
                    <Button
                      key={preset.id}
                      variant={selected ? 'contained' : 'outlined'}
                      color={selected ? 'primary' : 'inherit'}
                      disabled={!academicYearId || isUpdatingCycle}
                      aria-pressed={selected}
                      onClick={() =>
                        setCycleForm((current) => ({
                          ...current,
                          leadScoringRules: { ...preset.rules },
                        }))
                      }
                      sx={{
                        p: 1.5,
                        minHeight: 112,
                        alignItems: 'flex-start',
                        justifyContent: 'flex-start',
                        textAlign: 'left',
                        textTransform: 'none',
                      }}
                    >
                      <Stack spacing={0.5}>
                        <Stack direction="row" gap={0.75} alignItems="center" flexWrap="wrap">
                          <Typography variant="subtitle2" color="inherit">
                            {preset.title}
                          </Typography>
                          {preset.recommended ? (
                            <Chip
                              size="small"
                              label="Recommended"
                              variant="outlined"
                              color={selected ? 'default' : 'primary'}
                            />
                          ) : null}
                        </Stack>
                        <Typography variant="body2" color={selected ? 'inherit' : 'text.secondary'}>
                          {preset.description}
                        </Typography>
                      </Stack>
                    </Button>
                  );
                })}
              </Box>
              <Alert severity="info">
                Lead scores only order work for the admissions team. They never approve, reject, or
                change applicant eligibility.
              </Alert>
            </Stack>
          </Paper>

          <Paper variant="outlined" sx={{ p: { xs: 1.5, md: 2 }, borderRadius: 1.5 }}>
            <Stack spacing={1.25}>
              <Box>
                <Typography component="h2" variant="subtitle1">
                  Score Preview
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  See how common inquiry profiles respond before saving the model.
                </Typography>
              </Box>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
                  gap: 1,
                }}
              >
                {getLeadScoringPreviews(cycleForm.leadScoringRules).map((preview) => (
                  <Stack
                    key={preview.label}
                    spacing={0.75}
                    sx={{ p: 1.25, border: 1, borderColor: 'divider', borderRadius: 1.25 }}
                  >
                    <Stack direction="row" justifyContent="space-between" gap={1}>
                      <Typography variant="subtitle2">{preview.label}</Typography>
                      <Typography
                        variant="subtitle2"
                        color="primary.main"
                        sx={{ fontVariantNumeric: 'tabular-nums' }}
                      >
                        {preview.score}
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={
                        (preview.score / Math.max(1, cycleForm.leadScoringRules.maxScore)) * 100
                      }
                      aria-label={`${preview.label} score ${preview.score}`}
                    />
                  </Stack>
                ))}
              </Box>
            </Stack>
          </Paper>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', xl: 'repeat(3, minmax(0, 1fr))' },
              gap: 1.5,
            }}
          >
            {leadScoringGroups.map((group) => (
              <Paper key={group.title} variant="outlined" sx={{ p: 1.5, borderRadius: 1.5 }}>
                <Stack spacing={1.25}>
                  <Box>
                    <Typography component="h3" variant="subtitle1">
                      {group.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {group.description}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: {
                        xs: '1fr 1fr',
                        sm: 'repeat(3, minmax(0, 1fr))',
                        xl: '1fr 1fr',
                      },
                      gap: 1,
                    }}
                  >
                    {group.fields.map((option) => (
                      <TextField
                        key={option.field}
                        size="small"
                        type="number"
                        label={option.label}
                        value={cycleForm.leadScoringRules[option.field]}
                        disabled={!academicYearId || isUpdatingCycle}
                        onChange={(event) =>
                          handleScoringRuleChange(option.field, Number(event.target.value))
                        }
                        inputProps={{ inputMode: 'numeric' }}
                      />
                    ))}
                  </Box>
                </Stack>
              </Paper>
            ))}
          </Box>

          <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1.5 }}>
            <LoadingButton
              variant="contained"
              loading={isUpdatingCycle || isPreviewingCycleImpact}
              disabled={!academicYearId}
              onClick={handleSaveCycle}
              sx={{ alignSelf: 'flex-start' }}
            >
              Save Lead Scoring
            </LoadingButton>
          </Paper>
        </Stack>
      )}
    </>
  );
}
