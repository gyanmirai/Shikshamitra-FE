'use client';

import { Box } from '@mui/material';

import StepCheckValidate, { type CheckResult } from './StepCheckValidate';
import StepSubmit from './StepSubmit';
import type { QuestionPaperMetadata } from '../../types';

interface StepReviewAndSubmitProps {
  paper: QuestionPaperMetadata | null;
  results: { category: string; items: CheckResult[] }[];
  summary: { label: string; ok: boolean; detail?: string }[];
  blockingCount: number;
  warningCount: number;
  onSubmit: () => void;
  onPreview?: () => void;
  onGoToStep: (step: number) => void;
  isSubmitting?: boolean;
  readOnly?: boolean;
}

export default function StepReviewAndSubmit({
  paper,
  results,
  summary,
  blockingCount,
  warningCount,
  onSubmit,
  onPreview,
  onGoToStep,
  isSubmitting = false,
  readOnly = false,
}: StepReviewAndSubmitProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'start',
        gap: 3,
        width: '100%',
        maxWidth: 1200,
        mx: 'auto',
      }}
    >
      <Box sx={{ minWidth: 0, width: '100%' }}>
        <StepCheckValidate results={results} onGoToStep={onGoToStep} />
      </Box>
      <Box
        sx={{
          minWidth: 0,
          width: '100%',
        }}
      >
        <StepSubmit
          paper={paper}
          summary={summary}
          blockingCount={blockingCount}
          warningCount={warningCount}
          onSubmit={onSubmit}
          onPreview={onPreview}
          onGoToStep={onGoToStep}
          isSubmitting={isSubmitting}
          readOnly={readOnly}
          showIssueLink={false}
          hideActions
        />
      </Box>
    </Box>
  );
}
