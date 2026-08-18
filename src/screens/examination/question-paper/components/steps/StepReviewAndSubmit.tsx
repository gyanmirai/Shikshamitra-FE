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
        display: 'grid',
        gridTemplateColumns: {
          xs: 'minmax(0, 1fr)',
          xl: 'minmax(0, 1.65fr) minmax(380px, 0.85fr)',
        },
        alignItems: 'start',
        gap: { xs: 3, xl: 4 },
        width: '100%',
        maxWidth: 1600,
        mx: 'auto',
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <StepCheckValidate results={results} onGoToStep={onGoToStep} />
      </Box>
      <Box
        sx={{
          minWidth: 0,
          position: { xl: 'sticky' },
          top: { xl: 0 },
          alignSelf: 'start',
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
        />
      </Box>
    </Box>
  );
}
