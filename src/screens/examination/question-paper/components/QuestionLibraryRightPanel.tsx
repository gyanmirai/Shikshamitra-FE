'use client';

import React, { useState } from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { alpha, useTheme } from '@mui/material/styles';
import CustomSelect from 'src/components/custom-select';
import {
  Box,
  Card,
  Chip,
  Stack,
  Tooltip,
  TextField,
  IconButton,
  Typography,
  InputAdornment,
  CircularProgress,
} from '@mui/material';

import type { QuestionItem, QuestionLibraryFilters } from '../types';

const DIFFICULTY_OPTIONS = [
  { value: '', label: 'All Difficulties' },
  { value: 1, label: 'Easy' },
  { value: 2, label: 'Medium' },
  { value: 3, label: 'Hard' },
];

const BLOOM_OPTIONS = [
  { value: '', label: 'All Bloom Levels' },
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
  onAddQuestion: (question: QuestionItem) => void;
  onFiltersChange: (filters: QuestionLibraryFilters) => void;
  isLoading?: boolean;
  isError?: boolean;
}

export default function QuestionLibraryRightPanel({
  bankQuestions,
  availableCount,
  addedQuestionIds,
  chapters,
  onAddQuestion,
  onFiltersChange,
  isLoading = false,
  isError = false,
}: QuestionLibraryRightPanelProps) {
  const theme = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChapterId, setSelectedChapterId] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<number | ''>('');
  const [selectedBloom, setSelectedBloom] = useState<number | ''>('');

  const chapterSelectOptions = [
    { value: '', label: 'All Chapters' },
    ...chapters.map((c) => ({ value: c.id, label: `${c.chapterNumber}. ${c.chapterName}` })),
  ];

  const hasAdditionalFilters = Boolean(searchQuery.trim() || selectedDifficulty || selectedBloom);
  const emptyMessage = isError
    ? 'Unable to load questions from the Question Bank.'
    : selectedChapterId && !hasAdditionalFilters
      ? 'No questions exist for this chapter.'
      : hasAdditionalFilters
        ? 'No questions match applied filters.'
        : 'No approved questions exist for this class and subject.';

  const emitFilters = (filters: QuestionLibraryFilters) => {
    onFiltersChange(filters);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    emitFilters({ keyword: value, chapterId: selectedChapterId, difficultyLevel: selectedDifficulty, bloomLevel: selectedBloom });
  };

  const handleChapterChange = (value: string) => {
    setSelectedChapterId(value);
    emitFilters({ keyword: searchQuery, chapterId: value, difficultyLevel: selectedDifficulty, bloomLevel: selectedBloom });
  };

  const handleDifficultyChange = (value: number | '') => {
    setSelectedDifficulty(value);
    emitFilters({ keyword: searchQuery, chapterId: selectedChapterId, difficultyLevel: value, bloomLevel: selectedBloom });
  };

  const handleBloomChange = (value: number | '') => {
    setSelectedBloom(value);
    emitFilters({ keyword: searchQuery, chapterId: selectedChapterId, difficultyLevel: selectedDifficulty, bloomLevel: value });
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
          bgcolor: alpha(theme.palette.grey[500], 0.02),
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box
              sx={{
                width: 26,
                height: 26,
                borderRadius: 1,
                bgcolor: 'action.hover',
                color: 'text.primary',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <Iconify icon="solar:library-bold-duotone" width={15} />
            </Box>
            <Typography variant="subtitle2" fontWeight={700}>
              Question Library
            </Typography>
          </Stack>
          <Label variant="soft" color="default" sx={{ fontWeight: 700 }}>
            {availableCount} Available
          </Label>
        </Stack>

        <TextField
          fullWidth
          size="small"
          placeholder="Search question bank..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="mingcute:search-line" width={15} color="text.secondary" />
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
              onChange={(val) => handleDifficultyChange(val as number | '')}
            />
            <CustomSelect
              label="Bloom"
              options={BLOOM_OPTIONS}
              value={selectedBloom}
              onChange={(val) => handleBloomChange(val as number | '')}
            />
          </Stack>
        </Stack>
      </Box>

      {/* Scrollable Questions List using Scrollbar */}
      <Scrollbar sx={{ flex: 1, p: 1.25 }}>
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
            <Iconify icon="solar:magnifer-bold-duotone" width={24} color="text.disabled" />
            <Typography variant="caption" color="text.secondary" display="block" mt={1}>
              {emptyMessage}
            </Typography>
          </Box>
        ) : (
          <Stack spacing={1}>
            {bankQuestions.map((question) => {
              const isAdded = addedQuestionIds.includes(question.id) || addedQuestionIds.includes(question.questionBankItemId || '');

              return (
                <Box
                  key={question.id}
                  sx={{
                    p: 1.25,
                    borderRadius: 1.25,
                    border: '1px solid',
                    borderColor: isAdded ? 'success.light' : 'divider',
                    bgcolor: isAdded ? alpha(theme.palette.success.main, 0.03) : 'background.paper',
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
                    <Typography variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.5, flex: 1, color: 'text.primary' }}>
                      {question.questionText}
                    </Typography>

                    <Tooltip title={isAdded ? 'Already added' : 'Add to paper'}>
                      <span>
                        <IconButton
                          size="small"
                          color={isAdded ? 'success' : 'primary'}
                          disabled={isAdded}
                          onClick={() => onAddQuestion(question)}
                        >
                          <Iconify
                            icon={isAdded ? 'mingcute:check-circle-line' : 'mingcute:add-circle-line'}
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
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        )}
      </Scrollbar>
    </Card>
  );
}
