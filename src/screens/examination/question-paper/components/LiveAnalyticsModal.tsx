'use client';

import React from 'react';
import {
  Box,
  Card,
  Grid,
  Stack,
  Typography,
  LinearProgress,
  DialogActions,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import CancelButton from 'src/components/cancel-button';
import { Scrollbar } from 'src/components/scrollbar';
import { Iconify } from 'src/components/iconify';
import type { PaperSection, QuestionItem } from '../types';

interface LiveAnalyticsModalProps {
  open: boolean;
  onClose: () => void;
  sections: PaperSection[];
  totalPaperMarks: number;
  difficultyDist: Record<number, number>;
  bloomDist: Record<number, number>;
}

export default function LiveAnalyticsModal({
  open,
  onClose,
  sections,
  totalPaperMarks,
  difficultyDist,
  bloomDist,
}: LiveAnalyticsModalProps) {
  const theme = useTheme();

  const allQuestions: QuestionItem[] = sections.flatMap((s) => s.questions || []);
  const currentMarks = allQuestions.reduce((s, q) => s + (q.marks || 0), 0);

  const diffCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0 };
  allQuestions.forEach((q) => {
    diffCounts[q.difficultyLevel] = (diffCounts[q.difficultyLevel] || 0) + (q.marks || 0);
  });

  const bloomCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  allQuestions.forEach((q) => {
    bloomCounts[q.bloomLevel] = (bloomCounts[q.bloomLevel] || 0) + (q.marks || 0);
  });

  const bloomNames = ['Remembering', 'Understanding', 'Applying', 'Analyzing', 'Evaluating', 'Creating'];

  return (
    <CustomDialog
      open={open}
      handleClose={onClose}
      title={
        <Stack direction="row" spacing={1} alignItems="center">
          <Iconify icon="mdi:chart-bar" color="primary.main" width={22} />
          <Typography variant="h6" fontWeight={700}>
            Live Assessment Analytics
          </Typography>
        </Stack>
      }
      maxWidth="md"
      hasForm={false}
    >
      <DialogScrollContent sx={{ p: 0 }}>
        <Scrollbar sx={{ maxHeight: 520, p: 2.5 }}>
          <Grid container spacing={2}>
            {/* Difficulty Level Breakdown */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Typography variant="subtitle2" fontWeight={700} mb={1.5}>
                  Difficulty Level Breakdown
                </Typography>
                <Stack spacing={1.5}>
                  {[
                    { level: 1, label: 'Easy', color: 'success' },
                    { level: 2, label: 'Medium', color: 'warning' },
                    { level: 3, label: 'Hard', color: 'error' },
                  ].map((d) => {
                    const targetPct = difficultyDist[d.level] || 0;
                    const actualMarks = diffCounts[d.level] || 0;
                    const actualPct = currentMarks > 0 ? Math.round((actualMarks / currentMarks) * 100) : 0;
                    return (
                      <Box key={d.level}>
                        <Stack direction="row" justifyContent="space-between" mb={0.5}>
                          <Typography variant="caption" fontWeight={600}>
                            {d.label}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {actualMarks}M ({actualPct}%) | Target: {targetPct}%
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={actualPct}
                          color={d.color as any}
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    );
                  })}
                </Stack>
              </Card>
            </Grid>

            {/* Bloom Cognitive Depth */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Typography variant="subtitle2" fontWeight={700} mb={1.5}>
                  Bloom&apos;s Cognitive Depth
                </Typography>
                <Stack spacing={1.25}>
                  {bloomNames.map((name, idx) => {
                    const level = idx + 1;
                    const targetPct = bloomDist[level] || 0;
                    const actualMarks = bloomCounts[level] || 0;
                    const actualPct = currentMarks > 0 ? Math.round((actualMarks / currentMarks) * 100) : 0;
                    return (
                      <Box key={name}>
                        <Stack direction="row" justifyContent="space-between" mb={0.25}>
                          <Typography variant="caption" fontWeight={600}>
                            {name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {actualMarks}M ({actualPct}% / {targetPct}%)
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={actualPct}
                          color="primary"
                          sx={{ height: 5, borderRadius: 2.5 }}
                        />
                      </Box>
                    );
                  })}
                </Stack>
              </Card>
            </Grid>

            {/* Section Wise Breakdown */}
            <Grid size={{ xs: 12 }}>
              <Card elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Typography variant="subtitle2" fontWeight={700} mb={1.5}>
                  Section Wise Marks Distribution
                </Typography>
                <Grid container spacing={1.5}>
                  {sections.map((sec, i) => {
                    const secMarks = (sec.questions || []).reduce((s, q) => s + (q.marks || 0), 0);
                    return (
                      <Grid key={sec.id || i} size={{ xs: 12, sm: 4 }}>
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: 1.5,
                            bgcolor: alpha(theme.palette.grey[500], 0.04),
                            border: '1px solid',
                            borderColor: 'divider',
                          }}
                        >
                          <Typography variant="subtitle2" fontWeight={700}>
                            {sec.sectionName}
                          </Typography>
                          <Typography variant="h5" fontWeight={700} mt={0.5}>
                            {secMarks} <Typography component="span" variant="caption" color="text.secondary">Marks</Typography>
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                            {sec.questions?.length || 0} Questions added
                          </Typography>
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              </Card>
            </Grid>
          </Grid>
        </Scrollbar>
      </DialogScrollContent>

      <DialogActions sx={{ px: 3, py: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
        <CancelButton buttonText="Close" onClick={onClose} />
      </DialogActions>
    </CustomDialog>
  );
}
