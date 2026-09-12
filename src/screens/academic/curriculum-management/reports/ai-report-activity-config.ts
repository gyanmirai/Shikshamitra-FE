import type { AiReportStage } from './hooks/useAiCurriculumReport';

export type AiReportBusyStage = Extract<
  AiReportStage,
  'planning' | 'generating' | 'queued' | 'processing'
>;

export const AI_REPORT_ACTIVITY_COPY: Record<
  AiReportBusyStage,
  { status: string; description: string }
> = {
  planning: {
    status: 'Thinking',
    description: 'Understanding your request and finding the right Curriculum filters.',
  },
  generating: {
    status: 'Checking the report plan',
    description: 'Validating the selected context, permissions, fields, and filters.',
  },
  queued: {
    status: 'Preparing your report',
    description: 'Your secure PDF request is queued for generation.',
  },
  processing: {
    status: 'Creating your PDF',
    description: 'Reading permitted records and composing the downloadable report.',
  },
};

export function isAiReportBusyStage(stage: AiReportStage): stage is AiReportBusyStage {
  return ['planning', 'generating', 'queued', 'processing'].includes(stage);
}
