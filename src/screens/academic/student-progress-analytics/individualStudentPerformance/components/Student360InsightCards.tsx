'use client';

import type { AcademicInsightMetric } from 'src/screens/academic/components/academic-insights';

import { AcademicInsights } from 'src/screens/academic/components/academic-insights';

export type InsightCard = {
  label: string;
  value: string;
  helper: string;
  icon: string;
  color: 'primary' | 'success' | 'warning' | 'error' | 'info';
};

type Student360InsightCardsProps = {
  cards: InsightCard[];
};

const readNumericValue = (value: string) => {
  const parsed = Number.parseFloat(value.replace(/[^\d.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
};

export function Student360InsightCards({ cards }: Student360InsightCardsProps) {
  const values = cards.map((card) => readNumericValue(card.value));
  const lowestIndex = values.length > 0 ? values.indexOf(Math.min(...values)) : -1;
  const lowestCard = lowestIndex >= 0 ? cards[lowestIndex] : undefined;

  const metrics: AcademicInsightMetric[] = cards.map((card) => ({
    id: card.label.toLowerCase().replace(/\s+/g, '-'),
    label: card.label,
    value: card.value,
    helper: card.helper,
    icon: card.icon,
  }));

  return (
    <AcademicInsights
      title="Student progress insights"
      description="A concise view of this student’s academic health, participation and learning progress."
      metrics={metrics}
      chart={{
        title: 'Progress profile',
        description: 'Comparable academic indicators shown on a 0–100 scale.',
        categories: cards.map((card) => card.label),
        values,
        seriesName: 'Progress',
        valueSuffix: '%',
        max: 100,
      }}
      focus={{
        title: lowestCard ? `${lowestCard.label} is the current focus area` : 'Select a student',
        description: lowestCard
          ? `${lowestCard.helper}. Review the detailed panels below to understand the contributing records.`
          : 'Choose a student to load progress insights.',
      }}
    />
  );
}
