'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  Chip,
  Grid,
  Stack,
  Button,
  IconButton,
  TextField,
  Typography,
  Tooltip,
  Paper,
  Divider,
  Checkbox,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import CustomTooltip from 'src/components/custom-tooltip';
import { Scrollbar } from 'src/components/scrollbar';
import type { PaperSection, QuestionItem } from '../types';

const DIFFICULTY_LABELS: Record<number, { label: string; color: 'success' | 'warning' | 'error' }> = {
  1: { label: 'Easy', color: 'success' },
  2: { label: 'Medium', color: 'warning' },
  3: { label: 'Hard', color: 'error' },
};

const BLOOM_LABELS: Record<number, string> = {
  1: 'Remembering',
  2: 'Understanding',
  3: 'Applying',
  4: 'Analyzing',
  5: 'Evaluating',
  6: 'Creating',
};

interface PaperBuilderCenterPanelProps {
  paperTitle?: string;
  standardName?: string;
  subjectName?: string;
  totalMarks?: number;
  durationMinutes?: number;
  generalInstructions?: string;
  sections: PaperSection[];
  onAddSection: () => void;
  onUpdateSection: (sectionId: string, name: string, instructions: string) => void;
  onRemoveQuestion: (paperQuestionId: string) => void;
  onDuplicateQuestion: (question: QuestionItem) => void;
  onToggleLockQuestion: (questionId: string) => void;
  onMoveQuestion: (questionId: string, direction: 'up' | 'down') => void;
  onOpenQuestionBank: () => void;
  onGenerateAiQuestions: () => void;
  readOnly?: boolean;
}

export default function PaperBuilderCenterPanel({
  paperTitle = 'Annual Examination Paper',
  standardName = 'Class X',
  subjectName = 'Mathematics',
  totalMarks = 50,
  durationMinutes = 120,
  generalInstructions = '1. All questions are compulsory.\n2. Figures to the right indicate full marks.\n3. Use of non-programmable calculator is permitted.',
  sections,
  onAddSection,
  onUpdateSection,
  onRemoveQuestion,
  onDuplicateQuestion,
  onToggleLockQuestion,
  onMoveQuestion,
  onOpenQuestionBank,
  onGenerateAiQuestions,
  readOnly = false,
}: PaperBuilderCenterPanelProps) {
  const theme = useTheme();
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [editingInstructions, setEditingInstructions] = useState(false);
  const [localInstructions, setLocalInstructions] = useState(generalInstructions);

  const allQuestions: QuestionItem[] = sections.flatMap((sec) => sec.questions || []);
  const totalQuestionsInCanvas = allQuestions.length;
  const totalCanvasMarks = allQuestions.reduce((sum, q) => sum + (q.marks || 0), 0);

  const toggleSelectQuestion = (id: string) => {
    setSelectedQuestionIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  return (
    <Box display="flex" flexDirection="column" gap={1.5} height="100%">
      {/* ── Top Canvas Action Bar ───────────────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          px: 2,
          py: 1.25,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: 'background.paper',
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: 1,
              bgcolor: 'action.hover',
              color: 'text.primary',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Iconify icon="solar:document-text-bold-duotone" width={16} />
          </Box>
          <Box>
            <Typography variant="subtitle2" fontWeight={700}>
              Live Document Canvas
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {totalQuestionsInCanvas} Questions • {totalCanvasMarks} / {totalMarks} Marks
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* ── Document Canvas Sheet (Single Screen Canvas View) ───────────────── */}
      <Scrollbar sx={{ flex: 1, pr: 0.5 }}>
        {totalQuestionsInCanvas === 0 ? (
          /* Empty State */
          <Paper
            elevation={0}
            sx={{
              p: 5,
              borderRadius: 3,
              border: '2px dashed',
              borderColor: alpha(theme.palette.primary.main, 0.25),
              bgcolor: alpha(theme.palette.primary.main, 0.02),
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 420,
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: 3,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
                display: 'grid',
                placeItems: 'center',
                mb: 2,
              }}
            >
              <Iconify icon="solar:document-add-bold-duotone" width={34} />
            </Box>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Your Examination Paper Canvas is Empty
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 460 }}>
              Drag &amp; drop questions from the right Question Library to populate your exam paper.
            </Typography>
          </Paper>
        ) : (
          /* Continuous Paper Sheet */
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, md: 4 },
              borderRadius: 2.5,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: '#ffffff',
              color: '#1a1a1a',
              boxShadow: (t) => `0 12px 36px -12px ${alpha(t.palette.common.black, 0.1)}`,
              minHeight: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: 2.5,
            }}
          >
            {/* Paper Document Header (Preview Style) */}
            <Box sx={{ textAlign: 'center', pb: 2, borderBottom: '2px solid #1a1a1a' }}>
              <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                {paperTitle}
              </Typography>
              <Typography variant="subtitle2" fontWeight={600} color="text.secondary" mt={0.5}>
                {standardName} &nbsp;•&nbsp; {subjectName}
              </Typography>

              <Grid container spacing={1} justifyContent="space-between" mt={2} sx={{ px: 2, py: 1, bgcolor: alpha(theme.palette.grey[500], 0.06), borderRadius: 1.5 }}>
                <Grid size={{ xs: 6 }} textAlign="left">
                  <Typography variant="caption" fontWeight={700} color="text.secondary">
                    TIME: {durationMinutes} MINUTES
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }} textAlign="right">
                  <Typography variant="caption" fontWeight={700} color="text.secondary">
                    MAX. MARKS: {totalMarks}
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            {/* General Instructions Block */}
            <Box
              sx={{
                p: 2,
                borderRadius: 1.5,
                bgcolor: alpha(theme.palette.grey[500], 0.04),
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.75}>
                <Typography variant="caption" fontWeight={700} color="text.primary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  General Instructions:
                </Typography>
                <IconButton size="small" onClick={() => setEditingInstructions(!editingInstructions)}>
                  <Iconify icon={editingInstructions ? 'mingcute:check-line' : 'solar:pen-bold'} width={14} color="text.secondary" />
                </IconButton>
              </Stack>

              {editingInstructions ? (
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  size="small"
                  value={localInstructions}
                  onChange={(e) => setLocalInstructions(e.target.value)}
                />
              ) : (
                <Typography variant="caption" color="text.secondary" component="div" sx={{ whiteSpace: 'pre-line', lineHeight: 1.6, fontSize: '0.78rem' }}>
                  {localInstructions}
                </Typography>
              )}
            </Box>

            {/* Single Screen Continuous Questions List */}
            <Stack spacing={1.75}>
              {allQuestions.map((question, index) => {
                const qNum = index + 1;
                const diffInfo = DIFFICULTY_LABELS[question.difficultyLevel] || { label: 'Medium', color: 'warning' };
                const bloomText = BLOOM_LABELS[question.bloomLevel] || 'Understanding';
                const isSelected = selectedQuestionIds.includes(question.id);

                return (
                  <Paper
                    key={question.id || `q-${qNum}`}
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 1.5,
                      border: '1px solid',
                      borderColor: isSelected ? 'primary.main' : 'divider',
                      bgcolor: question.isLocked ? alpha(theme.palette.warning.main, 0.03) : '#fafafa',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: '#ffffff',
                        boxShadow: `0 4px 18px 0 ${alpha(theme.palette.grey[500], 0.15)}`,
                        transform: 'translateY(-1px)',
                      },
                    }}
                  >
                    <Stack spacing={1}>
                      {/* Question Top Bar */}
                      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={1.5}>
                        <Stack direction="row" spacing={1.25} alignItems="flex-start" flex={1}>
                          <IconButton size="small" sx={{ cursor: 'grab', color: 'text.disabled', mt: -0.5 }}>
                            <Iconify icon="mingcute:drag-line" width={16} />
                          </IconButton>
                          <Checkbox
                            size="small"
                            checked={isSelected}
                            onChange={() => toggleSelectQuestion(question.id)}
                            sx={{ mt: -0.5, p: 0.25 }}
                          />
                          <Typography variant="subtitle2" fontWeight={800} color="text.primary" sx={{ fontSize: '0.92rem', minWidth: 24 }}>
                            Q{qNum}.
                          </Typography>
                          <Typography variant="body2" color="text.primary" sx={{ fontSize: '0.9rem', lineHeight: 1.6, flex: 1 }}>
                            {question.questionText}
                          </Typography>
                        </Stack>

                        {/* Right Marks Pill */}
                        <Chip
                          size="small"
                          label={`[${question.marks} ${question.marks === 1 ? 'Mark' : 'Marks'}]`}
                          color="primary"
                          variant="soft"
                          sx={{ fontWeight: 800, fontSize: '0.75rem', height: 22 }}
                        />
                      </Stack>

                      {/* Question Metadata & Actions */}
                      <Stack direction="row" alignItems="center" justifyContent="space-between" pt={0.5} pl={6}>
                        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                          <Chip
                            size="small"
                            label={diffInfo.label}
                            color={diffInfo.color}
                            variant="soft"
                            sx={{ height: 20, fontSize: '0.68rem', fontWeight: 600 }}
                          />
                          <Chip
                            size="small"
                            label={bloomText}
                            color="info"
                            variant="soft"
                            sx={{ height: 20, fontSize: '0.68rem', fontWeight: 600 }}
                          />
                          {question.chapterName && (
                            <Chip
                              size="small"
                              icon={<Iconify icon="solar:bookmark-bold-duotone" width={12} />}
                              label={question.chapterName}
                              variant="outlined"
                              sx={{ height: 20, fontSize: '0.68rem' }}
                            />
                          )}
                        </Stack>

                        {/* Action Buttons */}
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <Tooltip title={question.isLocked ? 'Unlock Question' : 'Lock Question'}>
                            <IconButton
                              size="small"
                              color={question.isLocked ? 'warning' : 'default'}
                              onClick={() => onToggleLockQuestion(question.id)}
                            >
                              <Iconify icon={question.isLocked ? 'mingcute:lock-line' : 'mingcute:unlock-line'} width={15} />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Move Up">
                            <span>
                              <IconButton size="small" onClick={() => onMoveQuestion(question.id, 'up')}>
                                <Iconify icon="mingcute:up-line" width={15} />
                              </IconButton>
                            </span>
                          </Tooltip>

                          <Tooltip title="Move Down">
                            <span>
                              <IconButton size="small" onClick={() => onMoveQuestion(question.id, 'down')}>
                                <Iconify icon="mingcute:down-line" width={15} />
                              </IconButton>
                            </span>
                          </Tooltip>

                          <Tooltip title="Duplicate">
                            <IconButton size="small" onClick={() => onDuplicateQuestion(question)}>
                              <Iconify icon="solar:copy-bold-duotone" width={15} />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Remove from paper">
                            <IconButton
                              size="small"
                              color="error"
                              disabled={readOnly || question.isLocked}
                              onClick={() => onRemoveQuestion(question.id)}
                            >
                              <Iconify icon="mingcute:delete-2-line" width={15} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </Stack>
                    </Stack>
                  </Paper>
                );
              })}
            </Stack>
          </Paper>
        )}
      </Scrollbar>
    </Box>
  );
}
