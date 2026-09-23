'use client';

import type { ITimetableSummaryCard } from 'src/components/timetable-settings-summary-cards/TimetableSettingsSummaryCards';

import { AcademicInsights } from './academic-insights';

import type { AcademicInsightMetric, AcademicInsightsProps } from './academic-insights';

export type { ITimetableSummaryCard };

type Props = Pick<AcademicInsightsProps, 'open' | 'onClose' | 'hideTrigger'> & {
  cards: ITimetableSummaryCard[];
  title?: string;
  description?: string;
};

const numericValue = (value: string | number) => {
  if (typeof value === 'number') return value;
  const parsed = Number.parseFloat(value.replace(/[^\d.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
};

export function AcademicSummaryInsights({
  cards,
  title = 'Academic insights',
  description = 'Key totals, progress indicators and items that may need attention in the current view.',
  open,
  onClose,
  hideTrigger,
}: Props) {
  const metrics: AcademicInsightMetric[] = cards.map((card) => ({
    id: card.label.toLowerCase().replace(/\s+/g, '-'),
    label: card.label,
    value: card.value,
    icon: card.icon,
    selected: card.isActive,
    onClick: card.onClick,
  }));
  const attentionCard = cards.find(
    (card) => (card.color === 'error' || card.color === 'warning') && numericValue(card.value) > 0
  );
  const allPercentages = cards.every(
    (card) => typeof card.value === 'string' && card.value.trim().endsWith('%')
  );

  return (
    <AcademicInsights
      title={title}
      description={description}
      metrics={metrics}
      open={open}
      onClose={onClose}
      hideTrigger={hideTrigger}
      chart={{
        title: 'Metric comparison',
        description: 'A quick comparison of the current values shown above.',
        categories: cards.map((card) => card.label),
        values: cards.map((card) => numericValue(card.value)),
        seriesName: 'Current value',
        valueSuffix: allPercentages ? '%' : undefined,
        max: allPercentages ? 100 : undefined,
      }}
      focus={{
        title: attentionCard
          ? `Review ${attentionCard.label.toLowerCase()}`
          : 'No immediate exception highlighted',
        description: attentionCard
          ? `${attentionCard.value} is currently flagged in this view. Select the metric to narrow the workspace when filtering is available.`
          : 'Use this view to compare the current indicators and spot changes as the underlying records are updated.',
      }}
    />
  );
}

export { AcademicSummaryInsights as TimetableSettingsSummaryCards };
