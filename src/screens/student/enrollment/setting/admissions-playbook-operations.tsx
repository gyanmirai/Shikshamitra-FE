'use client';

import type {
  AdmissionCrmPlaybookDto,
  AdmissionCrmExamResultPreviewDto,
  AdmissionCrmSlotRecommendationDto,
  AdmissionCrmSlotGenerationResultDto,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { shikshaMitraToast } from 'src/components/toast';
import { Rule, Calculate, EventAvailable } from '@mui/icons-material';
import {
  Box,
  Tab,
  Chip,
  Tabs,
  Stack,
  Paper,
  Dialog,
  Button,
  MenuItem,
  TextField,
  Typography,
  DialogTitle,
  DialogActions,
  DialogContent,
} from '@mui/material';
import {
  usePreviewAdmissionCrmExamResultMutation,
  useGenerateAdmissionCrmPlaybookSlotsMutation,
  useRecommendAdmissionCrmPlaybookSlotMutation,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

type Props = {
  playbook: AdmissionCrmPlaybookDto;
  open: boolean;
  onClose: () => void;
};

const today = () => new Date().toISOString().slice(0, 10);

const addDays = (date: string, days: number) => {
  const value = new Date(`${date}T00:00:00`);
  value.setDate(value.getDate() + days);
  return value.toISOString().slice(0, 10);
};

const getErrorMessage = (error: unknown) => {
  if (typeof error === 'object' && error && 'data' in error) {
    const { data } = error as { data?: { detail?: string; errorCode?: string } };
    return data?.detail || data?.errorCode || 'The operation could not be completed.';
  }
  return 'The operation could not be completed.';
};

export const AdmissionsPlaybookOperations = ({ playbook, open, onClose }: Props) => {
  const initialDate = today();
  const [tab, setTab] = useState(0);
  const [slotTemplateCode, setSlotTemplateCode] = useState(playbook.slotTemplates[0]?.code || '');
  const [fromDate, setFromDate] = useState(initialDate);
  const [toDate, setToDate] = useState(addDays(initialDate, 7));
  const [utcOffsetMinutes, setUtcOffsetMinutes] = useState(-new Date().getTimezoneOffset());
  const [generationResult, setGenerationResult] =
    useState<AdmissionCrmSlotGenerationResultDto | null>(null);
  const [assignmentRuleCode, setAssignmentRuleCode] = useState(
    playbook.assignmentRules.find((rule) => rule.isActive)?.code || ''
  );
  const [preferredDate, setPreferredDate] = useState('');
  const [recommendation, setRecommendation] = useState<AdmissionCrmSlotRecommendationDto | null>(
    null
  );
  const [examDefinitionCode, setExamDefinitionCode] = useState(
    playbook.examDefinitions[0]?.code || ''
  );
  const selectedExam = playbook.examDefinitions.find((exam) => exam.code === examDefinitionCode);
  const [componentScores, setComponentScores] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      (playbook.examDefinitions[0]?.components || []).map((item) => [item.code, 0])
    )
  );
  const [resultPreview, setResultPreview] = useState<AdmissionCrmExamResultPreviewDto | null>(null);

  const [generateSlots, generateState] = useGenerateAdmissionCrmPlaybookSlotsMutation();
  const [recommendSlot, recommendState] = useRecommendAdmissionCrmPlaybookSlotMutation();
  const [previewResult, previewState] = usePreviewAdmissionCrmExamResultMutation();

  const changeExam = (code: string) => {
    setExamDefinitionCode(code);
    const exam = playbook.examDefinitions.find((item) => item.code === code);
    setComponentScores(Object.fromEntries((exam?.components || []).map((item) => [item.code, 0])));
    setResultPreview(null);
  };

  const runGeneration = async () => {
    if (!slotTemplateCode || !fromDate || !toDate) return;
    try {
      const result = await generateSlots({
        playbookId: playbook.id,
        body: { slotTemplateCode, fromDate, toDate, utcOffsetMinutes },
      }).unwrap();
      setGenerationResult(result);
      shikshaMitraToast.success({ message: `${result.createdCount} exam slots created.` });
    } catch (error) {
      shikshaMitraToast.error({ message: getErrorMessage(error) });
    }
  };

  const runRecommendation = async () => {
    if (!assignmentRuleCode) return;
    try {
      const result = await recommendSlot({
        playbookId: playbook.id,
        body: { assignmentRuleCode, preferredDate: preferredDate || null },
      }).unwrap();
      setRecommendation(result);
    } catch (error) {
      shikshaMitraToast.error({ message: getErrorMessage(error) });
    }
  };

  const runResultPreview = async () => {
    if (!examDefinitionCode) return;
    try {
      const result = await previewResult({
        playbookId: playbook.id,
        body: { examDefinitionCode, componentScores },
      }).unwrap();
      setResultPreview(result);
    } catch (error) {
      shikshaMitraToast.error({ message: getErrorMessage(error) });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{playbook.name} Operations</DialogTitle>
      <DialogContent dividers sx={{ p: 0 }}>
        <Tabs
          value={tab}
          onChange={(_event, value: number) => setTab(value)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<EventAvailable />} iconPosition="start" label="Generate Slots" />
          <Tab icon={<Rule />} iconPosition="start" label="Test Assignment" />
          <Tab icon={<Calculate />} iconPosition="start" label="Preview Result" />
        </Tabs>

        <Box sx={{ p: 2 }}>
          {tab === 0 ? (
            <Stack spacing={2}>
              <TextField
                select
                size="small"
                label="Slot template"
                value={slotTemplateCode}
                onChange={(event) => setSlotTemplateCode(event.target.value)}
              >
                {playbook.slotTemplates
                  .filter((item) => item.isActive)
                  .map((item) => (
                    <MenuItem key={item.code} value={item.code}>
                      {item.name}
                    </MenuItem>
                  ))}
              </TextField>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                  gap: 1.5,
                }}
              >
                <TextField
                  size="small"
                  type="date"
                  label="From"
                  value={fromDate}
                  onChange={(event) => setFromDate(event.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
                <TextField
                  size="small"
                  type="date"
                  label="To"
                  value={toDate}
                  onChange={(event) => setToDate(event.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
                <TextField
                  size="small"
                  type="number"
                  label="UTC offset (minutes)"
                  value={utcOffsetMinutes}
                  onChange={(event) => setUtcOffsetMinutes(Number(event.target.value))}
                />
              </Box>
              <LoadingButton
                variant="contained"
                startIcon={<EventAvailable />}
                loading={generateState.isLoading}
                disabled={!slotTemplateCode || !fromDate || !toDate}
                onClick={runGeneration}
                sx={{ alignSelf: 'flex-start' }}
              >
                Generate Slots
              </LoadingButton>
              {generationResult ? (
                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
                  <Stack direction="row" gap={1} flexWrap="wrap">
                    <Chip
                      size="small"
                      color="success"
                      label={`${generationResult.createdCount} created`}
                    />
                    <Chip
                      size="small"
                      variant="outlined"
                      label={`${generationResult.existingCount} already existed`}
                    />
                    <Chip
                      size="small"
                      variant="outlined"
                      label={`${generationResult.slots.length} total`}
                    />
                  </Stack>
                </Paper>
              ) : null}
            </Stack>
          ) : null}

          {tab === 1 ? (
            <Stack spacing={2}>
              <TextField
                select
                size="small"
                label="Assignment rule"
                value={assignmentRuleCode}
                onChange={(event) => setAssignmentRuleCode(event.target.value)}
              >
                {playbook.assignmentRules
                  .filter((item) => item.isActive)
                  .map((item) => (
                    <MenuItem key={item.code} value={item.code}>
                      {item.name}
                    </MenuItem>
                  ))}
              </TextField>
              <TextField
                size="small"
                type="date"
                label="Preferred date (optional)"
                value={preferredDate}
                onChange={(event) => setPreferredDate(event.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <LoadingButton
                variant="contained"
                startIcon={<Rule />}
                loading={recommendState.isLoading}
                disabled={!assignmentRuleCode}
                onClick={runRecommendation}
                sx={{ alignSelf: 'flex-start' }}
              >
                Find Best Slot
              </LoadingButton>
              {recommendation ? (
                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
                  <Stack spacing={0.5}>
                    <Typography variant="subtitle2">{recommendation.slotName}</Typography>
                    <Typography variant="body2">
                      {new Date(recommendation.startTime).toLocaleString()} - Room{' '}
                      {recommendation.roomNo}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {recommendation.availableSeats} of {recommendation.capacity} seats available
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {recommendation.explanation}
                    </Typography>
                  </Stack>
                </Paper>
              ) : null}
            </Stack>
          ) : null}

          {tab === 2 ? (
            <Stack spacing={2}>
              <TextField
                select
                size="small"
                label="Exam definition"
                value={examDefinitionCode}
                onChange={(event) => changeExam(event.target.value)}
              >
                {playbook.examDefinitions.map((item) => (
                  <MenuItem key={item.code} value={item.code}>
                    {item.name}
                  </MenuItem>
                ))}
              </TextField>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                  gap: 1.5,
                }}
              >
                {(selectedExam?.components || []).map((component) => (
                  <TextField
                    key={component.code}
                    size="small"
                    type="number"
                    label={`${component.name} (max ${component.maximumMarks})`}
                    value={componentScores[component.code] ?? 0}
                    onChange={(event) =>
                      setComponentScores((current) => ({
                        ...current,
                        [component.code]: Number(event.target.value),
                      }))
                    }
                    slotProps={{
                      htmlInput: {
                        min: 0,
                        max: component.maximumMarks,
                        step: 10 ** -component.scorePrecision,
                      },
                    }}
                  />
                ))}
              </Box>
              <LoadingButton
                variant="contained"
                startIcon={<Calculate />}
                loading={previewState.isLoading}
                disabled={!examDefinitionCode}
                onClick={runResultPreview}
                sx={{ alignSelf: 'flex-start' }}
              >
                Evaluate Result
              </LoadingButton>
              {resultPreview ? (
                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
                  <Stack spacing={0.75}>
                    <Stack direction="row" alignItems="center" gap={1}>
                      <Chip
                        size="small"
                        color={resultPreview.passed ? 'success' : 'error'}
                        label={resultPreview.outcome}
                      />
                      <Typography variant="body2">
                        {resultPreview.weightedPercentage.toFixed(2)}%
                      </Typography>
                    </Stack>
                    {resultPreview.decisionReasons.map((reason) => (
                      <Typography key={reason} variant="caption" color="text.secondary">
                        {reason}
                      </Typography>
                    ))}
                  </Stack>
                </Paper>
              ) : null}
            </Stack>
          ) : null}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};
