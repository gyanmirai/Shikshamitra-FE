'use client';

import React from 'react';
import { Box, Paper, Stack, Typography, Chip, IconButton, Button, Tooltip, Divider } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { LoadingButton } from '@mui/lab';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import CustomTooltip from 'src/components/custom-tooltip';
import { GlobalIcons } from 'src/utils/icons';
import type { QuestionPaperMetadata } from '../types';

const STATUS_LABEL: Record<number, string> = {
  1: 'Draft',
  2: 'Generated',
  3: 'Submitted',
  4: 'Approved',
  5: 'Rejected',
  6: 'Published',
  7: 'Locked',
  8: 'Archived',
};

const STATUS_COLOR: Record<number, 'default' | 'info' | 'success' | 'error' | 'warning' | 'primary'> = {
  1: 'default',
  2: 'info',
  3: 'warning',
  4: 'success',
  5: 'error',
  6: 'primary',
  7: 'error',
  8: 'default',
};

interface QuestionPaperHeaderProps {
  paper: QuestionPaperMetadata;
  isAutoSaving?: boolean;
  lastSavedTime?: string;
  blueprintValid: boolean;
  aiSuggestionCount: number;
  onBack: () => void;
  onSaveBlueprint: () => void;
  onValidate: () => void;
  onToggleAiDrawer: () => void;
  onToggleAnalyticsModal: () => void;
  onOpenPreview: () => void;
  onGeneratePaper: () => void;
  isSaving?: boolean;
  isValidating?: boolean;
  isGenerating?: boolean;
}

export default function QuestionPaperHeader({
  paper,
  isAutoSaving = false,
  lastSavedTime = 'Just now',
  blueprintValid,
  aiSuggestionCount,
  onBack,
  onSaveBlueprint,
  onValidate,
  onToggleAiDrawer,
  onToggleAnalyticsModal,
  onOpenPreview,
  onGeneratePaper,
  isSaving = false,
  isValidating = false,
  isGenerating = false,
}: QuestionPaperHeaderProps) {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        px: { xs: 2, md: 3 },
        py: 1.5,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: alpha(theme.palette.background.paper, 0.96),
        backdropFilter: 'blur(8px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'center' }} gap={1.5}>
        {/* Left: Title Metadata */}
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="subtitle1" fontWeight={700} noWrap sx={{ fontSize: '1.05rem', letterSpacing: '-0.01em' }}>
                {paper.paperTitle || 'Untitled Question Paper'}
              </Typography>
              <Label variant="soft" color={(STATUS_COLOR[paper.status] as any) || 'default'} sx={{ fontWeight: 700, height: 22 }}>
                {STATUS_LABEL[paper.status] || 'Draft'}
              </Label>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center" mt={0.5} flexWrap="wrap" useFlexGap>
              <Chip
                size="small"
                icon={<Iconify icon="solar:book-2-bold-duotone" width={14} />}
                label={`${paper.standardName || 'Class'} • ${paper.subjectName || 'Subject'}`}
                variant="soft"
                color="primary"
                sx={{ height: 22, fontSize: '0.72rem', fontWeight: 600 }}
              />
              <Chip
                size="small"
                icon={<Iconify icon="solar:document-text-bold-duotone" width={14} />}
                label={`${paper.totalMarks} Marks`}
                variant="soft"
                color="info"
                sx={{ height: 22, fontSize: '0.72rem', fontWeight: 600 }}
              />
              <Chip
                size="small"
                icon={<Iconify icon="solar:clock-circle-bold-duotone" width={14} />}
                label={`${paper.durationMinutes} Mins`}
                variant="soft"
                color="secondary"
                sx={{ height: 22, fontSize: '0.72rem', fontWeight: 600 }}
              />
              {paper.creationMode && (
                <Chip
                  size="small"
                  label={paper.creationMode}
                  variant="outlined"
                  sx={{ height: 22, fontSize: '0.72rem', fontWeight: 500 }}
                />
              )}

              {/* Auto save pill */}
              <Box display="inline-flex" alignItems="center" gap={0.5} sx={{ color: 'text.secondary', fontSize: '0.72rem', ml: 1 }}>
                <Iconify
                  icon={isAutoSaving ? 'mingcute:loading-line' : 'mingcute:check-circle-line'}
                  width={14}
                  color={isAutoSaving ? theme.palette.warning.main : theme.palette.success.main}
                  sx={{ animation: isAutoSaving ? 'spin 1.5s linear infinite' : 'none' }}
                />
                <Typography variant="caption" color="text.secondary">
                  {isAutoSaving ? 'Saving...' : `Saved ${lastSavedTime}`}
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Stack>

        {/* Right: Actions */}
        <Stack direction="row" spacing={1} alignItems="center" justifyContent={{ xs: 'flex-start', md: 'flex-end' }} flexWrap="wrap" useFlexGap>
          <LoadingButton
            size="small"
            variant="outlined"
            loading={isSaving}
            onClick={onSaveBlueprint}
            startIcon={<Iconify icon="mingcute:save-line" width={16} />}
          >
            Save Draft
          </LoadingButton>

          <LoadingButton
            size="small"
            variant="outlined"
            color="info"
            loading={isValidating}
            onClick={onValidate}
            startIcon={<Iconify icon="mingcute:check-circle-line" width={16} />}
          >
            Validate
          </LoadingButton>

          <Button
            size="small"
            variant="outlined"
            color="inherit"
            onClick={onToggleAnalyticsModal}
            startIcon={<Iconify icon="solar:chart-2-bold-duotone" width={16} />}
          >
            Analytics
          </Button>

          <Button
            size="small"
            variant="outlined"
            onClick={onOpenPreview}
            startIcon={<Iconify icon="mingcute:eye-line" width={16} />}
          >
            Preview
          </Button>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5, display: { xs: 'none', sm: 'block' } }} />

          <CustomTooltip
            title={blueprintValid ? 'Ready to generate paper using blueprint rules' : 'Complete blueprint balance (Chapter marks, Difficulty 100%, Bloom 100%) to enable generation'}
          >
            <span>
              <LoadingButton
                size="small"
                variant="contained"
                color="primary"
                loading={isGenerating}
                disabled={!blueprintValid}
                onClick={onGeneratePaper}
                startIcon={<Iconify icon={GlobalIcons.submit} width={16} />}
                sx={{
                  px: 2,
                  boxShadow: (t) => `0 4px 14px 0 ${alpha(t.palette.primary.main, 0.35)}`,
                  fontWeight: 700,
                }}
              >
                Generate Paper
              </LoadingButton>
            </span>
          </CustomTooltip>
        </Stack>
      </Stack>
    </Paper >
  );
}
