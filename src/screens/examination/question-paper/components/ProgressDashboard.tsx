'use client';

import React, { useMemo } from 'react';
import { TimetableSettingsSummaryCards } from 'src/components/timetable-settings-summary-cards/TimetableSettingsSummaryCards';

interface ProgressDashboardProps {
  currentMarks: number;
  totalMarks: number;
  questionCount: number;
  targetQuestionCount?: number;
  chapterCoveragePct: number;
  difficultyMatchPct: number;
  bloomMatchPct: number;
  completionScore: number;
}

export default function ProgressDashboard({
  currentMarks,
  totalMarks,
  questionCount,
  targetQuestionCount = 30,
  chapterCoveragePct,
  difficultyMatchPct,
  bloomMatchPct,
  completionScore,
}: ProgressDashboardProps) {
  const summaryCards = useMemo(
    () => [
      {
        label: 'Marks Balance',
        value: `${currentMarks} / ${totalMarks}`,
        icon: 'mingcute:check-circle-line',
        color: (currentMarks === totalMarks ? 'success' : 'warning') as 'success' | 'warning',
      },
      {
        label: 'Questions Added',
        value: `${questionCount} Qs`,
        icon: 'solar:document-text-bold-duotone',
        color: 'info' as const,
      },
      {
        label: 'Chapter Coverage',
        value: `${chapterCoveragePct}%`,
        icon: 'solar:bookmark-bold-duotone',
        color: (chapterCoveragePct >= 80 ? 'success' : 'warning') as 'success' | 'warning',
      },
      {
        label: 'Difficulty Balance',
        value: `${difficultyMatchPct}%`,
        icon: 'solar:tuning-bold-duotone',
        color: (difficultyMatchPct === 100 ? 'success' : 'warning') as 'success' | 'warning',
      },
      {
        label: 'Bloom Taxonomy',
        value: `${bloomMatchPct}%`,
        icon: 'solar:graph-up-bold-duotone',
        color: (bloomMatchPct === 100 ? 'success' : 'warning') as 'success' | 'warning',
      },
      {
        label: 'Completion Score',
        value: `${completionScore}%`,
        icon: 'solar:stars-minimalistic-bold-duotone',
        color: (completionScore >= 90 ? 'success' : 'info') as 'success' | 'info',
      },
    ],
    [currentMarks, totalMarks, questionCount, chapterCoveragePct, difficultyMatchPct, bloomMatchPct, completionScore]
  );

  return <TimetableSettingsSummaryCards cards={summaryCards} cardsPerRow={6} />;
}
