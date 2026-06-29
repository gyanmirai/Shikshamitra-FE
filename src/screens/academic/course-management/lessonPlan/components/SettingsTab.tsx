'use client';

import React from 'react';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import {
  Box,
  Card,
  Grid,
  Stack,
  Alert,
  Button,
  Slider,
  Switch,
  Divider,
  TextField,
  Typography,
  CardContent,
  FormControlLabel,
} from '@mui/material';

import { reviewModeOptions, academicYearOptions } from '../lessonPlanData';

import type { LessonPlanSettings } from '../lessonPlanData';

type Props = {
  settings: LessonPlanSettings;
  onChange: (settings: LessonPlanSettings) => void;
};

const SettingsTab = ({ settings, onChange }: Props) => {
  const set = <K extends keyof LessonPlanSettings>(key: K, value: LessonPlanSettings[K]) =>
    onChange({ ...settings, [key]: value });

  const handleSave = () => {
    shikshaMitraToast.success({ message: 'Lesson plan settings saved successfully.' });
  };

  return (
    <Stack spacing={3} sx={{ maxWidth: 1200, mx: 'auto', pb: 5 }}>
      {/* Header and Top Save Action */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 1 }}
      >
        <Box>
          <Typography variant="h5" fontWeight="bold">
            Configuration Settings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your lesson planning workflows, submission timelines, and AI preferences.
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          size="medium"
          startIcon={<Iconify icon="mdi:content-save-outline" />}
          onClick={handleSave}
          sx={{
            px: 3,
            py: 1,
            borderRadius: 1,
            fontWeight: 'bold',
            alignSelf: { xs: 'stretch', sm: 'auto' },
          }}
        >
          Save All Settings
        </Button>
      </Stack>

      <Alert severity="info" icon={<Iconify icon="mdi:information-outline" />}>
        Settings apply to the selected academic year. Changes take effect immediately.
      </Alert>

      {/* Main Grid container using latest size patterns */}
      <Grid container spacing={3}>
        {/* General Settings spanning full width */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 1,
                    display: 'flex',
                    bgcolor: 'grey.100',
                    color: 'text.secondary',
                    ...(theme) =>
                      theme.palette.mode === 'dark' && {
                        bgcolor: 'grey.800',
                      },
                  }}
                >
                  <Iconify icon="mdi:cog-outline" width={24} height={24} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    General Settings
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Define default academic settings and toggle overall configuration status.
                  </Typography>
                </Box>
              </Stack>
              <Divider sx={{ my: 2, borderStyle: 'dashed' }} />
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <CustomSelect
                    label="Academic Year"
                    options={academicYearOptions}
                    value={settings.academicYear}
                    onChange={(v) => set('academicYear', v as string)}
                    formControlProps={{ fullWidth: true }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 8 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.settingsActive}
                        onChange={(e) => set('settingsActive', e.target.checked)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="subtitle2">Settings Active</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Enable or disable configuration overrides for this academic year.
                        </Typography>
                      </Box>
                    }
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Left Column Settings */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={3}>
            {/* Approval Workflow */}
            <Card>
              <CardContent>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 1,
                      display: 'flex',
                      bgcolor: 'primary.lighter',
                      color: 'primary.main',
                    }}
                  >
                    <Iconify icon="mdi:check-decagram-outline" width={24} height={24} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Approval Workflow
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Configure review hierarchy and automated approval policies.
                    </Typography>
                  </Box>
                </Stack>
                <Divider sx={{ my: 2, borderStyle: 'dashed' }} />
                <Stack spacing={2.5}>
                  <CustomSelect
                    label="Approval Mode"
                    options={reviewModeOptions}
                    value={settings.approvalMode}
                    onChange={(v) => set('approvalMode', v as LessonPlanSettings['approvalMode'])}
                    formControlProps={{ fullWidth: true }}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.autoApprovalForLowRiskDiary}
                        onChange={(e) => set('autoApprovalForLowRiskDiary', e.target.checked)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="subtitle2">
                          Allow auto-approval for low-risk diary
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Automatically approve diary entries that match plan topics.
                        </Typography>
                      </Box>
                    }
                  />
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Escalation Threshold
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      sx={{ mb: 2 }}
                    >
                      Escalate to next level after {settings.escalationAfterPendingDays} days
                      pending approval.
                    </Typography>
                    <Slider
                      min={1}
                      max={10}
                      value={settings.escalationAfterPendingDays}
                      onChange={(_, v) => set('escalationAfterPendingDays', v as number)}
                      valueLabelDisplay="auto"
                      marks={[
                        { value: 1, label: '1d' },
                        { value: 5, label: '5d' },
                        { value: 10, label: '10d' },
                      ]}
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Diary Submission Rules */}
            <Card>
              <CardContent>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 1,
                      display: 'flex',
                      bgcolor: 'secondary.lighter',
                      color: 'secondary.main',
                    }}
                  >
                    <Iconify icon="mdi:notebook-edit-outline" width={24} height={24} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Diary Submission Rules
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Set submission deadlines, backdating rules, and sub-teaching rules.
                    </Typography>
                  </Box>
                </Stack>
                <Divider sx={{ my: 2, borderStyle: 'dashed' }} />
                <Stack spacing={2}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.requireDiaryForEveryPlannedLesson}
                        onChange={(e) => set('requireDiaryForEveryPlannedLesson', e.target.checked)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="subtitle2">
                          Require diary for every planned lesson
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Enforces that all scheduled lesson plans must have a diary entry.
                        </Typography>
                      </Box>
                    }
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.allowBackdatedDiary}
                        onChange={(e) => set('allowBackdatedDiary', e.target.checked)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="subtitle2">Allow backdated diary entry</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Let teachers submit diaries for past days.
                        </Typography>
                      </Box>
                    }
                  />

                  {settings.allowBackdatedDiary && (
                    <Stack
                      spacing={2}
                      sx={{
                        ml: 4,
                        mt: 1,
                        mb: 1,
                      }}
                    >
                      <Box sx={{ maxWidth: 360 }}>
                        <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                          Max backdate days: {settings.maxBackdateDays}
                        </Typography>
                        <Slider
                          min={0}
                          max={15}
                          value={settings.maxBackdateDays}
                          onChange={(_, v) => set('maxBackdateDays', v as number)}
                          valueLabelDisplay="auto"
                          marks={[
                            { value: 0, label: '0d' },
                            { value: 5, label: '5d' },
                            { value: 10, label: '10d' },
                            { value: 15, label: '15d' },
                          ]}
                        />
                      </Box>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.requireBackdateReason}
                            onChange={(e) => set('requireBackdateReason', e.target.checked)}
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="subtitle2">
                              Require reason for backdated diary
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Teachers must specify why the entry is being submitted late.
                            </Typography>
                          </Box>
                        }
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.requireEvidenceForBackdate}
                            onChange={(e) => set('requireEvidenceForBackdate', e.target.checked)}
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="subtitle2">
                              Require evidence for backdated diary
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Upload attachment/document as proof of late activity.
                            </Typography>
                          </Box>
                        }
                      />
                    </Stack>
                  )}

                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.allowDiaryWithoutLessonPlan}
                        onChange={(e) => set('allowDiaryWithoutLessonPlan', e.target.checked)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="subtitle2">Allow diary without lesson plan</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Allows reporting daily details without a pre-existing lesson plan.
                        </Typography>
                      </Box>
                    }
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.allowSubstituteDiary}
                        onChange={(e) => set('allowSubstituteDiary', e.target.checked)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="subtitle2">
                          Allow substitute diary submission
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Let substitute teachers submit diary entries on behalf of primary
                          teachers.
                        </Typography>
                      </Box>
                    }
                  />
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* Right Column Settings */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={3}>
            {/* Progress Rules */}
            <Card>
              <CardContent>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 1,
                      display: 'flex',
                      bgcolor: 'success.lighter',
                      color: 'success.main',
                    }}
                  >
                    <Iconify icon="mdi:chart-line" width={24} height={24} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Progress Rules
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Track completion percentage and enforce variance thresholds.
                    </Typography>
                  </Box>
                </Stack>
                <Divider sx={{ my: 2, borderStyle: 'dashed' }} />
                <Stack spacing={2}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.autoUpdateChapterProgressAfterApprovedDiary}
                        onChange={(e) =>
                          set('autoUpdateChapterProgressAfterApprovedDiary', e.target.checked)
                        }
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="subtitle2">
                          Auto update chapter progress after approved diary
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Syllabus progress is updated automatically upon diary review approval.
                        </Typography>
                      </Box>
                    }
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.allowProgressDecreaseWithOverride}
                        onChange={(e) => set('allowProgressDecreaseWithOverride', e.target.checked)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="subtitle2">
                          Allow progress decrease with override
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Let admin roles lower progress percentage for corrections.
                        </Typography>
                      </Box>
                    }
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.requireEvidenceForProgressOverride}
                        onChange={(e) =>
                          set('requireEvidenceForProgressOverride', e.target.checked)
                        }
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="subtitle2">
                          Require evidence for progress override
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Require documentation uploads to override progress manually.
                        </Typography>
                      </Box>
                    }
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.requireReasonIfActualDiffersFromPlanned}
                        onChange={(e) =>
                          set('requireReasonIfActualDiffersFromPlanned', e.target.checked)
                        }
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="subtitle2">
                          Require reason if progress differs from planned
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Flag entries when actual progress deviates significantly from plan.
                        </Typography>
                      </Box>
                    }
                  />

                  <Box sx={{ mt: 1 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Maximum progress update per diary: {settings.maxProgressUpdatePerDiary}%
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      sx={{ mb: 2 }}
                    >
                      Restrict single diary entries from completing more than the specified limit.
                    </Typography>
                    <Slider
                      min={5}
                      max={100}
                      step={5}
                      value={settings.maxProgressUpdatePerDiary}
                      onChange={(_, v) => set('maxProgressUpdatePerDiary', v as number)}
                      valueLabelDisplay="auto"
                      marks={[
                        { value: 5, label: '5%' },
                        { value: 25, label: '25%' },
                        { value: 50, label: '50%' },
                        { value: 75, label: '75%' },
                        { value: 100, label: '100%' },
                      ]}
                    />
                  </Box>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.autoDetectSyllabusDelay}
                        onChange={(e) => set('autoDetectSyllabusDelay', e.target.checked)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="subtitle2">
                          Auto-detect and alert syllabus delay
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Analyze teaching velocity against academic schedules to flag delays.
                        </Typography>
                      </Box>
                    }
                  />
                </Stack>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardContent>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 1,
                      display: 'flex',
                      bgcolor: 'warning.lighter',
                      color: 'warning.main',
                    }}
                  >
                    <Iconify icon="mdi:bell-ring-outline" width={24} height={24} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Notifications
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Configure alerts and summaries for teachers, parents, and administration.
                    </Typography>
                  </Box>
                </Stack>
                <Divider sx={{ my: 2, borderStyle: 'dashed' }} />
                <Stack spacing={2.5}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Diary Pending Reminder Time"
                        type="time"
                        value={settings.diaryPendingReminderTime}
                        onChange={(e) => set('diaryPendingReminderTime', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          Approval pending reminder
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Send alert after {settings.approvalPendingReminderDays} day(s) pending.
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Box sx={{ px: 1 }}>
                    <Slider
                      min={1}
                      max={7}
                      value={settings.approvalPendingReminderDays}
                      onChange={(_, v) => set('approvalPendingReminderDays', v as number)}
                      valueLabelDisplay="auto"
                      marks={[
                        { value: 1, label: '1d' },
                        { value: 3, label: '3d' },
                        { value: 5, label: '5d' },
                        { value: 7, label: '7d' },
                      ]}
                    />
                  </Box>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.enableMissedLessonReminder}
                        onChange={(e) => set('enableMissedLessonReminder', e.target.checked)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="subtitle2">Enable missed lesson reminder</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Notify teachers immediately when a lesson is marked as missed.
                        </Typography>
                      </Box>
                    }
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.enableSyllabusDelayAlert}
                        onChange={(e) => set('enableSyllabusDelayAlert', e.target.checked)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="subtitle2">Enable syllabus delay alert</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Alert subject heads when syllabus progress falls behind schedule.
                        </Typography>
                      </Box>
                    }
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.weeklyPrincipalSummary}
                        onChange={(e) => set('weeklyPrincipalSummary', e.target.checked)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="subtitle2">
                          Send weekly summary to principal
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Email an aggregated lesson completion report every Friday.
                        </Typography>
                      </Box>
                    }
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.enableParentUpdate}
                        onChange={(e) => set('enableParentUpdate', e.target.checked)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="subtitle2">
                          Enable parent update generation from approved diary
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Automatically draft a parent-facing update when a diary entry is approved.
                        </Typography>
                      </Box>
                    }
                  />
                </Stack>
              </CardContent>
            </Card>

            {/* AI Assistance */}
            <Card>
              <CardContent>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 1,
                      display: 'flex',
                      bgcolor: 'info.lighter',
                      color: 'info.main',
                    }}
                  >
                    <Iconify icon="mdi:robot-outline" width={24} height={24} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      AI Assistance
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Configure artificial intelligence features for drafting and review.
                    </Typography>
                  </Box>
                </Stack>
                <Divider sx={{ my: 2, borderStyle: 'dashed' }} />
                <Stack spacing={2}>
                  <Alert severity="info" sx={{ mb: 1.5 }}>
                    AI features require an active AI integration. Enable only what is needed.
                  </Alert>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.allowAiLessonPlanGeneration}
                        onChange={(e) => set('allowAiLessonPlanGeneration', e.target.checked)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="subtitle2">Allow AI lesson plan generation</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Enable co-pilot features to automatically draft lesson structures.
                        </Typography>
                      </Box>
                    }
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.allowAiDiarySummary}
                        onChange={(e) => set('allowAiDiarySummary', e.target.checked)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="subtitle2">
                          Allow AI diary summary generation
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Draft daily teaching summaries from class transcriptions or bullet points.
                        </Typography>
                      </Box>
                    }
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.allowAiReviewAssistant}
                        onChange={(e) => set('allowAiReviewAssistant', e.target.checked)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="subtitle2">Allow AI HOD review assistant</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Assist HODs by highlighting anomalies during diary approval loops.
                        </Typography>
                      </Box>
                    }
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.allowAiParentUpdate}
                        onChange={(e) => set('allowAiParentUpdate', e.target.checked)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="subtitle2">
                          Allow AI parent update generator
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Translate technical curriculum topics into simple updates for parents.
                        </Typography>
                      </Box>
                    }
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.requireHumanReviewForAiContent}
                        onChange={(e) => set('requireHumanReviewForAiContent', e.target.checked)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="subtitle2">
                          Require human review before using AI content
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Prevent AI-generated content from going live without explicit teacher
                          approval.
                        </Typography>
                      </Box>
                    }
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.storeAiSuggestionHistory}
                        onChange={(e) => set('storeAiSuggestionHistory', e.target.checked)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="subtitle2">Store AI suggestion history</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Audit and retain previous drafts generated by AI systems.
                        </Typography>
                      </Box>
                    }
                  />
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default SettingsTab;
