'use client';

import React, { useState } from 'react';
import { varAlpha } from 'src/theme/styles';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { LoadingButton } from '@mui/lab';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  Box,
  Stack,
  Paper,
  Button,
  Typography,
  DialogActions,
  TextField,
} from '@mui/material';

import { STATUS_COLOR, STATUS_LABEL } from '../constants';
import type { CheckResult } from './steps/StepCheckValidate';
import type { QuestionPaperMetadata, SectionPattern } from '../types';

interface ReviewApprovalPanelProps {
  paper: QuestionPaperMetadata;
  sections: SectionPattern[];
  checkResults: { category: string; items: CheckResult[] }[];
  onApprove: (cb: () => void) => void;
  onReject: (feedback: string, cb: () => void) => void;
  onPublish: (cb: () => void) => void;
  isApproving?: boolean;
  isRejecting?: boolean;
  isPublishing?: boolean;
  onPreview: () => void;
  onViewQuestions: () => void;
}

/**
 * Reviewer experience (UX spec §29–31): simpler than the builder.
 * Shows the paper summary, entry points to preview/questions/validation and
 * the Approve / Reject (with feedback) / Publish lifecycle actions.
 */
export default function ReviewApprovalPanel({
  paper,
  sections,
  checkResults,
  onApprove,
  onReject,
  onPublish,
  isApproving = false,
  isRejecting = false,
  isPublishing = false,
  onPreview,
  onViewQuestions,
}: ReviewApprovalPanelProps) {
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectFeedback, setRejectFeedback] = useState('');
  const [feedbackError, setFeedbackError] = useState(false);

  const status = paper.status;
  const questionCount = sections.reduce((s, sec) => s + (sec.questions?.length || 0), 0);
  const warningCount = checkResults.reduce((n, cat) => n + cat.items.filter((i) => i.severity === 'warning').length, 0);
  const errorCount = checkResults.reduce((n, cat) => n + cat.items.filter((i) => i.severity === 'error').length, 0);

  const handleRejectConfirm = () => {
    if (!rejectFeedback.trim()) {
      setFeedbackError(true);
      return;
    }
    onReject(rejectFeedback.trim(), () => {
      setRejectDialogOpen(false);
      setRejectFeedback('');
      setFeedbackError(false);
    });
  };

  return (
    <Stack spacing={2.5} sx={{ maxWidth: 860, mx: 'auto', width: '100%' }}>
      {/* Status banner */}
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          borderRadius: 2,
          borderColor: 'divider',
          bgcolor: (t) => varAlpha(t.vars.palette.success.mainChannel, 0.05),
        }}
      >
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Iconify icon={status === 4 ? 'mdi:check-circle' : 'mdi:eye-outline'} width={20} color="success.main" />
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="subtitle1" fontWeight={700}>
                {status === 4 ? 'This paper has been approved.' : 'This paper is waiting for your review.'}
              </Typography>
              <Label variant="soft" color={STATUS_COLOR[status]} sx={{ fontWeight: 700, height: 22 }}>
                {STATUS_LABEL[status]}
              </Label>
            </Stack>
            {status === 4 && (
              <Typography variant="caption" color="text.secondary">
                Publishing will make the paper available for the examination. Editing is restricted — create a new version if changes are required.
              </Typography>
            )}
          </Box>
        </Stack>
      </Paper>

      {/* Paper summary */}
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }} display="block" mb={1.25}>
          Paper Summary
        </Typography>
        <Stack direction="row" spacing={2.5} flexWrap="wrap" useFlexGap>
          <SummaryItem label="Paper Name" value={paper.paperTitle} />
          <SummaryItem label="Exam" value={paper.examTitle || 'Not linked'} />
          <SummaryItem label="Class" value={paper.standardName || '—'} />
          <SummaryItem label="Subject" value={paper.subjectName || '—'} />
          <SummaryItem label="Marks" value={String(paper.totalMarks)} />
          <SummaryItem label="Duration" value={`${paper.durationMinutes} minutes`} />
          <SummaryItem label="Questions" value={String(questionCount)} />
          <SummaryItem label="Created By" value={paper.createdBy || '—'} />
        </Stack>
      </Paper>

      {/* Entry points */}
      <Grid3>
        <EntryCard icon="mdi:eye-outline" title="Preview Paper" description="See the final printed document." onClick={onPreview} />
        <EntryCard icon="mdi:library" title="View Questions" description={`${questionCount} questions across ${sections.length} sections.`} onClick={onViewQuestions} />
        <EntryCard
          icon="mdi:checkbox-marked-outline"
          title="View Validation"
          description={errorCount === 0 ? `No blocking issues${warningCount ? ` · ${warningCount} warnings` : ''}.` : `${errorCount} blocking issues.`}
          onClick={onViewQuestions}
        />
      </Grid3>

      {/* Actions */}
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Stack direction="row" spacing={1.25} justifyContent="flex-end" flexWrap="wrap" useFlexGap>
          {status === 3 && (
            <>
              <LoadingButton
                variant="outlined"
                color="error"
                loading={isRejecting}
                onClick={() => setRejectDialogOpen(true)}
                startIcon={<Iconify icon="mdi:close-circle-outline" width={16} />}
              >
                Reject
              </LoadingButton>
              <LoadingButton
                variant="contained"
                color="success"
                loading={isApproving}
                onClick={() => onApprove(() => {})}
                startIcon={<Iconify icon="mdi:check-circle-outline" width={16} />}
              >
                Approve
              </LoadingButton>
            </>
          )}
          {status === 4 && (
            <LoadingButton
              variant="contained"
              loading={isPublishing}
              onClick={() => onPublish(() => {})}
              startIcon={<Iconify icon="mdi:upload" width={16} />}
            >
              Publish
            </LoadingButton>
          )}
        </Stack>
      </Paper>

      {/* Reject dialog with required feedback */}
      <CustomDialog
        open={rejectDialogOpen}
        handleClose={() => setRejectDialogOpen(false)}
        title={
          <Stack direction="row" spacing={1} alignItems="center">
            <Iconify icon="mdi:close-circle-outline" color="error.main" width={20} />
            <Typography variant="h6" fontWeight={700}>
              Reject Paper
            </Typography>
          </Stack>
        }
        maxWidth="sm"
        hasForm={false}
      >
        <DialogScrollContent>
          <Stack spacing={1.5}>
            <Typography variant="body2" color="text.secondary">
              Please explain what needs to be corrected. The author will see this feedback and can edit &amp; resubmit.
            </Typography>
            <TextField
              fullWidth
              multiline
              minRows={4}
              size="small"
              label="Rejection feedback *"
              placeholder="e.g. Section B is missing one question and chapter coverage is below target."
              value={rejectFeedback}
              onChange={(e) => {
                setRejectFeedback(e.target.value);
                if (e.target.value.trim()) setFeedbackError(false);
              }}
              error={feedbackError}
              helperText={feedbackError ? 'Feedback is required to reject a paper.' : ''}
            />
          </Stack>
        </DialogScrollContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button variant="outlined" color="inherit" onClick={() => setRejectDialogOpen(false)}>
            Cancel
          </Button>
          <LoadingButton variant="contained" color="error" loading={isRejecting} onClick={handleRejectConfirm}>
            Reject Paper
          </LoadingButton>
        </DialogActions>
      </CustomDialog>
    </Stack>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ minWidth: 150 }}>
      <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 220 }}>
        {value}
      </Typography>
    </Box>
  );
}

function Grid3({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
        gap: 1.5,
      }}
    >
      {children}
    </Box>
  );
}

function EntryCard({
  icon,
  title,
  description,
  onClick,
}: {
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <Paper
      variant="outlined"
      onClick={onClick}
      sx={{
        p: 2,
        borderRadius: 2,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        '&:hover': { borderColor: 'primary.main', bgcolor: (t) => varAlpha(t.vars.palette.primary.mainChannel, 0.03) },
      }}
    >
      <Stack spacing={1}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 1.25,
            display: 'grid',
            placeItems: 'center',
            color: 'primary.main',
            bgcolor: (t) => varAlpha(t.vars.palette.primary.mainChannel, 0.1),
          }}
        >
          <Iconify icon={icon} width={17} />
        </Box>
        <Typography variant="subtitle2" fontWeight={700}>
          {title}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {description}
        </Typography>
      </Stack>
    </Paper>
  );
}
