import { useMemo } from 'react';
import { formatDateOnly } from 'src/utils/date-only';
import { Box, Chip, Typography } from '@mui/material';
import { SubjectColorIndicator } from 'src/components/subject-color/SubejctColor';

import { getPrimaryTeacherNames } from '../../utils/primaryTeacherNames';
import { SubjectType, SubjectAssignmentStatus } from '../../enum/subjectType';

import type { ISubjectFormValues } from '../type';
import type { SubjectTableRow } from './subjectTableTypes';

export function useSubjectTableRows(subjects?: ISubjectFormValues[]): SubjectTableRow[] {
  /**
   * Memoization Justification:
   * The table receives this derived array and performs its own sorting and pagination work.
   * Keeping the reference stable avoids repeating that work on unrelated drawer state changes.
   */
  return useMemo(
    () =>
      subjects?.map((item) => ({
        ...item,
        subjectTypeValue: SubjectType[item.subjectType] || 'Core',
        subjectsName: item.subjects?.map((subject) => subject.subjectName).join(', ') || '',
        subjectNameDisplay: (
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            {item.subjects?.map((subject, index) => (
              <Box
                key={`${item.id}-${subject.subjectId || index}`}
                sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
              >
                <SubjectColorIndicator color={subject.color || subject.subject?.color} />
                <Typography variant="body2">{subject.subjectName}</Typography>
              </Box>
            ))}
            {item.isAiSuggested && (
              <Chip size="small" label="AI" color="secondary" sx={{ height: 18, fontSize: 10 }} />
            )}
          </Box>
        ),
        subjectCodeValue: item.subjects?.map((subject) => subject.subjectCode).join(', ') || '—',
        statusValue: SubjectAssignmentStatus[item.status] || 'Draft',
        primaryTeacherDisplay: getPrimaryTeacherNames(item),
        chaptersDisplay: item.chaptersCount ?? 0,
        weeklyPeriodsDisplay: item.weeklyPeriods ? `${item.weeklyPeriods}` : '0',
        lastUpdatedDisplay: item.lastUpdatedAt ? formatDateOnly(item.lastUpdatedAt) : '—',
      })) || [],
    [subjects]
  );
}
