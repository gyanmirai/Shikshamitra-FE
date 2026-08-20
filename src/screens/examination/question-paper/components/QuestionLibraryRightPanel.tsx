'use client';

import React, { useState } from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { alpha, useTheme } from '@mui/material/styles';
import { varAlpha } from 'src/theme/styles';
import CustomSelect from 'src/components/custom-select';
import {
  Box,
  Button,
  Card,
  Chip,
  Checkbox,
  Stack,
  Tooltip,
  TextField,
  IconButton,
  Typography,
  InputAdornment,
  CircularProgress,
} from '@mui/material';

import type { QuestionItem, QuestionLibraryFilters } from '../types';

const ALL_FILTER_VALUE = '__all__';

const DIFFICULTY_OPTIONS = [
  { value: ALL_FILTER_VALUE, label: 'All Difficulties' },
  { value: 1, label: 'Easy' },
  { value: 2, label: 'Medium' },
  { value: 3, label: 'Hard' },
];

const BLOOM_OPTIONS = [
  { value: ALL_FILTER_VALUE, label: 'All Bloom Levels' },
  { value: 1, label: 'Remembering' },
  { value: 2, label: 'Understanding' },
  { value: 3, label: 'Applying' },
  { value: 4, label: 'Analyzing' },
  { value: 5, label: 'Evaluating' },
  { value: 6, label: 'Creating' },
];

interface QuestionLibraryRightPanelProps {
  bankQuestions: QuestionItem[];
  availableCount: number;
  addedQuestionIds: string[];
  chapters: Array<{ id: string; chapterNumber: number; chapterName: string }>;
  sectionName: string;
  questionTypeLabel: string;
  requiredCount: number;
  requiredMarks: number;
  onAddQuestion: (question: QuestionItem) => void;
  onAddQuestions: (questions: QuestionItem[]) => Promise<void>;
  onFiltersChange: (filters: QuestionLibraryFilters) => void;
  isLoading?: boolean;
  isError?: boolean;
  isAdding?: boolean;
}

export default function QuestionLibraryRightPanel({
  bankQuestions,
  availableCount,
  addedQuestionIds,
  chapters,
  sectionName,
  questionTypeLabel,
  requiredCount,
  requiredMarks,
  onAddQuestion,
  onAddQuestions,
  onFiltersChange,
  isLoading = false,
  isError = false,
  isAdding = false,
}: QuestionLibraryRightPanelProps) {
  const theme = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChapterId, setSelectedChapterId] = useState(ALL_FILTER_VALUE);
  const [selectedDifficulty, setSelectedDifficulty] = useState<number | string>(ALL_FILTER_VALUE);
  const [selectedBloom, setSelectedBloom] = useState<number | string>(ALL_FILTER_VALUE);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);

  const chapterSelectOptions = [
    { value: ALL_FILTER_VALUE, label: 'All Chapters' },
    ...chapters.map((c) => ({ value: c.id, label: `${c.chapterNumber}. ${c.chapterName}` })),
  ];

  const hasAdditionalFilters = Boolean(
    searchQuery.trim() ||
      selectedDifficulty !== ALL_FILTER_VALUE ||
      selectedBloom !== ALL_FILTER_VALUE
  );
  const hasEnoughQuestions = requiredCount === 0 || availableCount >= requiredCount;
  const emptyMessage = isError
    ? 'Unable to load questions from the Question Bank.'
    : selectedChapterId !== ALL_FILTER_VALUE && !hasAdditionalFilters
      ? 'No questions exist for this chapter.'
      : hasAdditionalFilters
        ? 'No questions match applied filters.'
        : 'No approved questions exist for this class and subject.';

  const emitFilters = (filters: QuestionLibraryFilters) => {
    onFiltersChange(filters);
  };

  const apiDifficulty = selectedDifficulty === ALL_FILTER_VALUE ? '' : Number(selectedDifficulty);
  const apiBloom = selectedBloom === ALL_FILTER_VALUE ? '' : Number(selectedBloom);

  const toggleQuestionSelection = (questionId: string) => {
    setSelectedQuestionIds((current) =>
      current.includes(questionId)
        ? current.filter((id) => id !== questionId)
        : [...current, questionId]
    );
  };

  const handleAddSelected = async () => {
    const selectedQuestions = bankQuestions.filter((question) =>
      selectedQuestionIds.includes(question.id)
    );
    if (selectedQuestions.length === 0) return;
    await onAddQuestions(selectedQuestions);
    setSelectedQuestionIds([]);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    emitFilters({ keyword: value, chapterId: selectedChapterId === ALL_FILTER_VALUE ? '' : selectedChapterId, difficultyLevel: apiDifficulty, bloomLevel: apiBloom });
  };

  const handleChapterChange = (value: string) => {
    setSelectedChapterId(value);
    emitFilters({ keyword: searchQuery, chapterId: value === ALL_FILTER_VALUE ? '' : value, difficultyLevel: apiDifficulty, bloomLevel: apiBloom });
  };

  const handleDifficultyChange = (value: number | string) => {
    setSelectedDifficulty(value);
    emitFilters({ keyword: searchQuery, chapterId: selectedChapterId === ALL_FILTER_VALUE ? '' : selectedChapterId, difficultyLevel: value === ALL_FILTER_VALUE ? '' : Number(value), bloomLevel: apiBloom });
  };

  const handleBloomChange = (value: number | string) => {
    setSelectedBloom(value);
    emitFilters({ keyword: searchQuery, chapterId: selectedChapterId === ALL_FILTER_VALUE ? '' : selectedChapterId, difficultyLevel: apiDifficulty, bloomLevel: value === ALL_FILTER_VALUE ? '' : Number(value) });
  };

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: 'background.paper',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2,
          py: 1.25,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: (t) => varAlpha(t.vars.palette.grey['500Channel'], 0.04),
        }}
      >
        <Stack spacing={0.75}>
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={1} alignItems="center" minWidth={0}>
              <Box
                sx={{
                  width: 26,
                  height: 26,
                  flexShrink: 0,
                  borderRadius: 1,
                  bgcolor: 'action.hover',
                  color: 'text.primary',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <Iconify icon="mdi:library" width={15} />
              </Box>
              <Typography variant="subtitle2" fontWeight={700} noWrap>
                Question Library
              </Typography>
            </Stack>
            <Label variant="soft" color="default" sx={{ fontWeight: 700, flexShrink: 0 }}>
              {availableCount} Available
            </Label>
          </Stack>

          <Typography variant="caption" color="text.secondary" noWrap>
            For {sectionName}: {questionTypeLabel} · {requiredMarks} Marks
          </Typography>
          <Typography
            variant="caption"
            color={hasEnoughQuestions ? 'success.main' : 'warning.main'}
            fontWeight={700}
            display="block"
          >
            {hasEnoughQuestions
              ? `✓ ${availableCount} matching questions · ${requiredCount} required`
              : `⚠ ${availableCount} approved questions · ${requiredCount} required`}
          </Typography>
        </Stack>

        <TextField
          fullWidth
          size="small"
          placeholder="Search by question, chapter, topic, or keyword..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="mdi:magnify" width={15} color="text.secondary" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Filter Bar */}
      <Box sx={{ px: 2, py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Stack spacing={0.75}>
          <CustomSelect
            label="Chapter"
            options={chapterSelectOptions}
            value={selectedChapterId}
            onChange={(val) => handleChapterChange(val as string)}
          />
          <Stack direction="row" spacing={0.75}>
            <CustomSelect
              label="Difficulty"
              options={DIFFICULTY_OPTIONS}
              value={selectedDifficulty}
              onChange={(val) => handleDifficultyChange(val as number | string)}
            />
            <CustomSelect
              label="Bloom"
              options={BLOOM_OPTIONS}
              value={selectedBloom}
              onChange={(val) => handleBloomChange(val as number | string)}
            />
          </Stack>
        </Stack>
      </Box>

      {/* Scrollable Questions List using Scrollbar */}
      <Scrollbar sx={{ flex: 1, p: 1.25 }}>
        {!isLoading && !hasEnoughQuestions && (
          <Box
            sx={{
              p: 1.25,
              mb: 1.25,
              borderRadius: 1.5,
              border: '1px solid',
              borderColor: 'warning.light',
              bgcolor: (t) => alpha(t.palette.warning.main, 0.06),
            }}
          >
            <Typography variant="caption" color="warning.main" fontWeight={700} display="block">
              ⚠ Not enough approved questions
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
              {sectionName} needs {requiredCount} questions worth {requiredMarks} marks. Adjust the
              paper pattern or add approved questions to the Question Bank.
            </Typography>
          </Box>
        )}
        {isLoading ? (
          <Box
            sx={{
              py: 4,
              px: 2,
              textAlign: 'center',
              borderRadius: 1.5,
              border: '1px dashed',
              borderColor: 'divider',
            }}
          >
            <CircularProgress size={24} />
            <Typography variant="caption" color="text.secondary" display="block" mt={1}>
              Loading questions...
            </Typography>
          </Box>
        ) : bankQuestions.length === 0 ? (
          <Box
            sx={{
              py: 4,
              px: 2,
              textAlign: 'center',
              borderRadius: 1.5,
              border: '1px dashed',
              borderColor: 'divider',
            }}
          >
            <Iconify icon="mdi:magnify-duotone" width={24} color="text.disabled" />
            <Typography variant="caption" color="text.secondary" display="block" mt={1}>
              {emptyMessage}
            </Typography>
          </Box>
        ) : (
          <Stack spacing={1}>
            {bankQuestions.map((question) => {
              const isAdded = addedQuestionIds.includes(question.id) || addedQuestionIds.includes(question.questionBankItemId || '');
              const isSelected = selectedQuestionIds.includes(question.id);

              return (
                <Box
                  key={question.id}
                  sx={{
                    p: 1.25,
                    borderRadius: 1.25,
                    border: '1px solid',
                    borderColor: isAdded ? 'success.light' : isSelected ? 'primary.main' : 'divider',
                    bgcolor: isAdded
                      ? alpha(theme.palette.success.main, 0.03)
                      : isSelected
                        ? alpha(theme.palette.primary.main, 0.04)
                        : 'background.paper',
                    opacity: isAdded ? 0.75 : 1,
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.75,
                    '&:hover': {
                      borderColor: isAdded ? 'success.main' : 'primary.main',
                    },
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
                    <Checkbox
                      size="small"
                      checked={isSelected}
                      disabled={isAdded || isAdding}
                      onChange={() => toggleQuestionSelection(question.id)}
                      inputProps={{ 'aria-label': `Select question: ${question.questionText}` }}
                      sx={{ p: 0.25, mt: -0.25 }}
                    />
                    <Typography variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.5, flex: 1, color: 'text.primary' }}>
                      {question.questionText}
                    </Typography>

                    <Tooltip title={isAdded ? 'Already added' : 'Add to paper'}>
                      <span>
                        <IconButton
                          size="small"
                          color={isAdded ? 'success' : 'primary'}
                          disabled={isAdded || isAdding}
                          onClick={() => onAddQuestion(question)}
                        >
                          <Iconify
                            icon={
                              isAdded
                                ? 'mdi:check-circle-outline'
                                : 'mdi:plus-circle-outline'
                            }
                            width={17}
                          />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Stack>

                  <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                    <Chip
                      size="small"
                      label={`${question.marks}M`}
                      color="primary"
                      variant="soft"
                      sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700 }}
                    />
                    <Chip
                      size="small"
                      label={question.difficultyLevel === 1 ? 'Easy' : question.difficultyLevel === 2 ? 'Medium' : 'Hard'}
                      color={question.difficultyLevel === 1 ? 'success' : question.difficultyLevel === 2 ? 'warning' : 'error'}
                      variant="soft"
                      sx={{ height: 18, fontSize: '0.65rem' }}
                    />
                    {question.chapterName && (
                      <Chip
                        size="small"
                        label={question.chapterName}
                        variant="outlined"
                        sx={{ height: 18, fontSize: '0.65rem', maxWidth: 130 }}
                      />
                    )}
                    <Chip
                      size="small"
                      label={`Used ${question.usageCount ?? 0} times`}
                      variant="outlined"
                      sx={{ height: 18, fontSize: '0.65rem' }}
                    />
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        )}
      </Scrollbar>
      <Box
        sx={{
          px: 1.25,
          py: 1,
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Button
          fullWidth
          size="small"
          variant="contained"
          disabled={selectedQuestionIds.length === 0 || isAdding}
          onClick={handleAddSelected}
          startIcon={<Iconify icon="mdi:playlist-plus" width={16} />}
        >
          {isAdding
            ? 'Adding selected questions...'
            : `Add selected${selectedQuestionIds.length ? ` (${selectedQuestionIds.length})` : ''}`}
        </Button>
      </Box>
    </Card>
  );
}
