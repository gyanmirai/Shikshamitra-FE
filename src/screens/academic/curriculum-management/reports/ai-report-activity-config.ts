import type { AiReportStage } from './hooks/useAiCurriculumReport';

export type AiReportBusyStage = Extract<
  AiReportStage,
  'planning' | 'previewing' | 'generating' | 'queued' | 'processing'
>;

export const AI_REPORT_ACTIVITY_COPY: Record<
  AiReportBusyStage,
  { status: string; description: string }
> = {
  planning: {
    status: 'Thinking',
    description: 'Understanding your request and finding the right Curriculum filters.',
  },
  previewing: {
    status: 'Checking a live preview',
    description: 'Revalidating permissions and sampling only records you can access.',
  },
  generating: {
    status: 'Checking the report plan',
    description: 'Validating the selected context, permissions, fields, and filters.',
  },
  queued: {
    status: 'Preparing your report',
    description: 'Your secure report request is queued for generation.',
  },
  processing: {
    status: 'Creating your report',
    description: 'Reading permitted records and composing the downloadable report.',
  },
};

export function isAiReportBusyStage(stage: AiReportStage): stage is AiReportBusyStage {
  return ['planning', 'previewing', 'generating', 'queued', 'processing'].includes(stage);
}
