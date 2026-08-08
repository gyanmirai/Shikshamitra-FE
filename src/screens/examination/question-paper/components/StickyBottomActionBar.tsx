'use client';

import React from 'react';
import { LoadingButton } from '@mui/lab';
import { varAlpha } from 'src/theme/styles';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { alpha, useTheme } from '@mui/material/styles';
import { Box, Paper, Stack, Typography, Button, Divider } from '@mui/material';

interface StickyBottomActionBarProps {
  currentMarks: number;
  totalMarks: number;
  questionCount: number;
  blueprintValid: boolean;
  onSaveDraft: () => void;
  onOpenPreview: () => void;
  onGeneratePaper: () => void;
  isSaving?: boolean;
  isGenerating?: boolean;
}

export default function StickyBottomActionBar({
  currentMarks,
  totalMarks,
  questionCount,
  blueprintValid,
  onSaveDraft,
  onOpenPreview,
  onGeneratePaper,
  isSaving = false,
  isGenerating = false,
}: StickyBottomActionBarProps) {
  const theme = useTheme();
  const remainingMarks = totalMarks - currentMarks;

  return (
    <Paper
      elevation={4}
      sx={{
        px: { xs: 2, md: 3 },
        py: 1.25,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: (t) => varAlpha(t.vars.palette.background.paperChannel, 0.96),
        backdropFilter: 'blur(8px)',
        position: 'sticky',
        bottom: 0,
        zIndex: 100,
        boxShadow: (t) => `0 -8px 24px -4px ${alpha(t.palette.common.black, 0.08)}`,
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems="center"
        gap={1.5}
      >
        {/* Status Indicators */}
        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
          <Label
            variant="soft"
            color={remainingMarks === 0 ? 'success' : remainingMarks > 0 ? 'warning' : 'error'}
            sx={{ fontWeight: 700, px: 1.25, py: 0.5, height: 26, fontSize: '0.78rem' }}
          >
            <Iconify
              icon={remainingMarks === 0 ? 'mingcute:check-circle-line' : 'mingcute:alert-line'}
              width={14}
              sx={{ mr: 0.5 }}
            />
            {remainingMarks === 0
              ? 'Marks Balanced (0 left)'
              : remainingMarks > 0
                ? `${remainingMarks} Marks Remaining`
                : 'Marks Exceeded'}
          </Label>

          <Label
            variant="soft"
            color="info"
            sx={{ fontWeight: 600, height: 26, fontSize: '0.78rem' }}
          >
            {questionCount} Questions Added
          </Label>

          <Label
            variant="soft"
            color={blueprintValid ? 'success' : 'warning'}
            sx={{ fontWeight: 700, height: 26, fontSize: '0.78rem' }}
          >
            {blueprintValid ? '✓ Blueprint Validated' : '⚠ Blueprint Issues Exist'}
          </Label>
        </Stack>

        {/* Actions */}
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            onClick={onOpenPreview}
            startIcon={<Iconify icon="mingcute:eye-line" />}
          >
            Preview Paper
          </Button>

          <LoadingButton
            size="small"
            variant="outlined"
            loading={isSaving}
            onClick={onSaveDraft}
            startIcon={<Iconify icon="mingcute:save-line" />}
          >
            Save Draft
          </LoadingButton>

          <LoadingButton
            size="small"
            variant="contained"
            color="primary"
            loading={isGenerating}
            disabled={!blueprintValid}
            onClick={onGeneratePaper}
            startIcon={<Iconify icon={GlobalIcons.submit} width={16} />}
            sx={{
              px: 2.5,
              fontWeight: 700,
              boxShadow: (t) => `0 4px 14px 0 ${alpha(t.palette.primary.main, 0.4)}`,
            }}
          >
            Generate Paper
          </LoadingButton>
        </Stack>
      </Stack>
    </Paper>
  );
}
