'use client';

import React from 'react';
import { varAlpha } from 'src/theme/styles';
import { Iconify } from 'src/components/iconify';
import { LoadingButton } from '@mui/lab';
import { Box, Stack, Paper, Typography } from '@mui/material';

import { STATUS_LABEL } from '../../constants';
import type { CheckResult } from './StepCheckValidate';
import type { QuestionPaperMetadata } from '../../types';

interface StepSubmitProps {
  paper: QuestionPaperMetadata | null;
  summary: { label: string; ok: boolean; detail?: string }[];
  blockingCount: number;
  warningCount: number;
  onSubmit: () => void;
  onPreview?: () => void;
  onGoToStep: (step: number) => void;
  isSubmitting?: boolean;
  readOnly?: boolean;
  showIssueLink?: boolean;
  hideActions?: boolean;
}

export default function StepSubmit({
  paper,
  summary,
  blockingCount,
  warningCount,
  onSubmit,
  onPreview,
  onGoToStep,
  isSubmitting = false,
  readOnly = false,
  showIssueLink = true,
  hideActions = false,
}: StepSubmitProps) {
  const canSubmit = blockingCount === 0 && !readOnly;

  return (
    <Stack spacing={2} sx={{ width: '100%' }}>
      <Box>
        <Typography variant="h6" fontWeight={700}>
          Ready to submit?
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Review the summary below, then preview or send this paper for approval.
        </Typography>
      </Box>

      {paper && (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Typography
            variant="caption"
            fontWeight={700}
            color="text.secondary"
            sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
            display="block"
            mb={1}
          >
            Paper Summary
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))',
              gap: 1.5,
            }}
          >
            {[
              ['Paper Name', paper.paperTitle],
              ['Class', paper.standardName],
              ['Subject', paper.subjectName],
              ['Exam', paper.examTitle],
              ['Marks', String(paper.totalMarks)],
              ['Duration', `${paper.durationMinutes} minutes`],
              ['Mode', paper.creationMode],
              ['Status', STATUS_LABEL[paper.status]],
            ]
              .filter(([, value]) => Boolean(value))
              .map(([label, value]) =>
                label && value ? (
                  <SummaryItem key={label} label={label} value={String(value)} />
                ) : null
              )}
          </Box>
        </Paper>
      )}

      {/* Readiness checklist */}
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          borderRadius: 2,
          borderColor: canSubmit ? 'success.light' : 'error.light',
          bgcolor: (t) =>
            canSubmit
              ? varAlpha(t.vars.palette.success.mainChannel, 0.04)
              : varAlpha(t.vars.palette.error.mainChannel, 0.04),
        }}
      >
        <Stack direction="row" spacing={1} alignItems="flex-start" mb={1.5}>
          <Iconify
            icon={canSubmit ? 'mdi:check-circle' : 'mdi:close-circle'}
            width={17}
            color={canSubmit ? 'success.main' : 'error.main'}
          />
          <Box>
            <Typography variant="subtitle2" fontWeight={700}>
              {canSubmit ? 'Your paper is ready for submission' : 'You cannot submit this paper yet'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {canSubmit
                ? 'All required checks have passed.'
                : `${blockingCount} issue${blockingCount > 1 ? 's' : ''} must be fixed before submission.`}
            </Typography>
          </Box>
        </Stack>

        <Stack spacing={0.75}>
          {summary.map((item) => (
            <Stack key={item.label} direction="row" spacing={1} alignItems="center">
              <Iconify
                icon={item.ok ? 'mdi:check-circle-outline' : 'mdi:close-circle-outline'}
                width={15}
                color={item.ok ? 'success.main' : 'error.main'}
              />
              <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                {item.label}
                {item.detail && !item.ok ? ` — ${item.detail}` : ''}
              </Typography>
            </Stack>
          ))}
        </Stack>

        {!canSubmit && showIssueLink && (
          <Stack direction="row" spacing={1.25} alignItems="center" mt={1.5}>
            <Typography variant="body2" color="error.main" fontWeight={600}>
              {blockingCount} issue{blockingCount > 1 ? 's' : ''} need
              {blockingCount === 1 ? 's' : ''} to be fixed.
            </Typography>
            <LoadingButton
              size="small"
              variant="outlined"
              color="error"
              onClick={() => onGoToStep(3)}
              startIcon={<Iconify icon="mdi:magnify" width={15} />}
            >
              View Issues
            </LoadingButton>
          </Stack>
        )}

        {warningCount > 0 && (
          <Typography variant="caption" color="warning.main" display="block" mt={1}>
            {warningCount} recommended improvement
            {warningCount > 1
              ? 's remain — you can still submit.'
              : ' remains — you can still submit.'}
          </Typography>
        )}
      </Paper>

      {!hideActions && canSubmit && (
        <Stack direction="row" spacing={1.25} flexWrap="wrap" useFlexGap>
          {onPreview && (
            <LoadingButton
              variant="outlined"
              size="large"
              onClick={onPreview}
              startIcon={<Iconify icon="mdi:eye-outline" width={18} />}
            >
              Preview Paper
            </LoadingButton>
          )}
          <LoadingButton
            variant="contained"
            size="large"
            loading={isSubmitting}
            onClick={onSubmit}
            startIcon={<Iconify icon="mdi:send-outline" width={18} />}
            sx={{ px: 3 }}
          >
            Submit for Review
          </LoadingButton>
        </Stack>
      )}
      {!hideActions && !canSubmit && onPreview && (
        <LoadingButton
          variant="outlined"
          size="large"
          onClick={onPreview}
          startIcon={<Iconify icon="mdi:eye-outline" width={18} />}
          sx={{ alignSelf: 'flex-start' }}
        >
          Preview Draft
        </LoadingButton>
      )}
    </Stack>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ minWidth: 140 }}>
      <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 220 }}>
        {value}
      </Typography>
    </Box>
  );
}
