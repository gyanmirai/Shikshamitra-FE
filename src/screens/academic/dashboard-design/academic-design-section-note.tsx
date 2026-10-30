import type { AcademicInsightsSectionKey } from 'src/redux/academicAPI/academicInsightsTypes';

import { AcademicPinnedNote } from './academic-pinned-note';

type SectionNote = { text: string; color: 'error.light' | 'primary.light' };

export const academicSectionNotes: Partial<Record<AcademicInsightsSectionKey, SectionNote>> = {
  classrooms: { text: 'EVERY CLASS\nCOUNTS', color: 'error.light' },
  lesson: { text: 'PLAN WELL\nTEACH WELL', color: 'primary.light' },
  tasks: { text: 'KEEP TRYING\nKEEP LEARNING', color: 'error.light' },
  evaluation: { text: 'FEEDBACK\nFUELS GROWTH', color: 'primary.light' },
  student360: { text: 'EVERY LEARNER\nMATTERS', color: 'error.light' },
};

export function AcademicDesignSectionNote({ note }: { note: SectionNote }) {
  return <AcademicPinnedNote text={note.text} color={note.color} label="Section reminder" />;
}
