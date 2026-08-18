'use client';

import { useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import {
  Box,
  Chip,
  Stack,
  Drawer,
  Button,
  Checkbox,
  IconButton,
  Typography,
  FormControlLabel,
} from '@mui/material';

import { BLOOM_LABELS, DIFFICULTY_LABELS, QUESTION_TYPE_LABELS } from '../constants';

import type { QuestionItem } from '../types';

interface QuestionReplaceDrawerProps {
  open: boolean;
  onClose: () => void;
  question: QuestionItem | null;
  bankQuestions: QuestionItem[];
  onReplace: (newQuestion: QuestionItem) => void;
}

/**
 * Focused replacement drawer (UX spec §18):
 * shows locked criteria of the question being replaced, then similar approved
 * questions. The user may loosen some criteria to widen the alternatives.
 */
export default function QuestionReplaceDrawer({
  open,
  onClose,
  question,
  bankQuestions,
  onReplace,
}: QuestionReplaceDrawerProps) {
  const theme = useTheme();
  const [allowDifferentDifficulty, setAllowDifferentDifficulty] = useState(false);
  const [allowDifferentTopic, setAllowDifferentTopic] = useState(false);

  const resetLooseCriteria = () => {
    setAllowDifferentDifficulty(false);
    setAllowDifferentTopic(false);
  };

  const alternatives = useMemo(() => {
    if (!question) return [];
    return bankQuestions.filter((q) => {
      if (q.id === question.id) return false;
      if (q.questionType !== question.questionType) return false;
      if (q.marks !== question.marks) return false;
      if (!allowDifferentTopic && question.chapterId && q.chapterId !== question.chapterId)
        return false;
      if (!allowDifferentDifficulty && q.difficultyLevel !== question.difficultyLevel) return false;
      return true;
    });
  }, [question, bankQuestions, allowDifferentDifficulty, allowDifferentTopic]);

  const handleClose = () => {
    resetLooseCriteria();
    onClose();
  };

  const handleReplace = (newQuestion: QuestionItem) => {
    resetLooseCriteria();
    onReplace(newQuestion);
  };

  if (!question) return null;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 420 }, display: 'flex', flexDirection: 'column' },
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
          <Typography variant="subtitle1" fontWeight={700}>
            Replace Question
          </Typography>
          <IconButton size="small" onClick={handleClose}>
            <Iconify icon="mdi:close" width={18} />
          </IconButton>
        </Stack>
        <Typography variant="body2" color="text.secondary">
          Choose another question with similar characteristics.
        </Typography>
      </Box>

      {/* Locked criteria */}
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography
          variant="caption"
          fontWeight={700}
          color="text.secondary"
          sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
          display="block"
          mb={1}
        >
          Locked criteria
        </Typography>
        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
          <Chip
            size="small"
            label={`Type: ${QUESTION_TYPE_LABELS[question.questionType] || '—'}`}
            variant="outlined"
            sx={{ height: 24 }}
          />
          <Chip
            size="small"
            label={`Marks: ${question.marks}`}
            variant="outlined"
            sx={{ height: 24 }}
          />
          <Chip
            size="small"
            label={`Chapter: ${question.chapterName || 'Any'}`}
            variant="outlined"
            sx={{ height: 24 }}
          />
          <Chip
            size="small"
            label={`Difficulty: ${DIFFICULTY_LABELS[question.difficultyLevel] || '—'}`}
            variant="outlined"
            sx={{ height: 24 }}
          />
        </Stack>
      </Box>

      {/* Loosen criteria */}
      <Box sx={{ px: 2, py: 1.25, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography
          variant="caption"
          fontWeight={700}
          color="text.secondary"
          sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
          display="block"
          mb={0.5}
        >
          Widen search
        </Typography>
        <Stack spacing={0}>
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={allowDifferentTopic}
                onChange={(e) => setAllowDifferentTopic(e.target.checked)}
              />
            }
            label={<Typography variant="body2">Allow different topic</Typography>}
          />
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={allowDifferentDifficulty}
                onChange={(e) => setAllowDifferentDifficulty(e.target.checked)}
              />
            }
            label={<Typography variant="body2">Allow different difficulty</Typography>}
          />
        </Stack>
      </Box>

      {/* Alternatives */}
      <Scrollbar sx={{ flex: 1, p: 1.5 }}>
        {alternatives.length === 0 ? (
          <Box sx={{ py: 5, textAlign: 'center' }}>
            <Iconify icon="mdi:magnify-duotone" width={28} color="text.disabled" />
            <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 1 }}>
              No matching questions found
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
              Try loosening the criteria above or add more questions to the Question Bank.
            </Typography>
          </Box>
        ) : (
          <Stack spacing={1}>
            {alternatives.map((alt) => (
              <Box
                key={alt.id}
                sx={{
                  p: 1.25,
                  borderRadius: 1.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': { borderColor: 'primary.main' },
                  transition: 'all 0.15s ease',
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
                  gap={1}
                >
                  <Typography variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.5, flex: 1 }}>
                    {alt.questionText}
                  </Typography>
                  <Button size="small" variant="outlined" onClick={() => handleReplace(alt)}>
                    Use
                  </Button>
                </Stack>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mt: 0.5 }}
                >
                  {[
                    alt.chapterName,
                    DIFFICULTY_LABELS[alt.difficultyLevel],
                    BLOOM_LABELS[alt.bloomLevel],
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </Typography>
              </Box>
            ))}
          </Stack>
        )}
      </Scrollbar>
    </Drawer>
  );
}
