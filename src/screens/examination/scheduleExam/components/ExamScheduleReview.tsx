import type { FormikProps } from 'formik';

import dayjs from 'dayjs';
import { Box, Chip, Grid, Paper, Divider, Typography } from '@mui/material';

import { ExamReviewInfoItem } from './ExamReviewInfoItem';
import { ExamReviewAccordion } from './ExamReviewAccordion';
import { reviewCardSx, reviewChipSx, reviewFactsSx } from './exam-review-styles';

import type { IExamFormValues } from '../type';

/**
 * Flattens the formik subjects array into review rows.
 */
function buildReviewRows(subjects: any[]): any[] {
  const rows: any[] = [];
  subjects.forEach((sub) => {
    if (!sub.electiveGroupId) {
      // Core subject
      rows.push(sub);
    } else if (sub.schedulingMode === 'separate' && Array.isArray(sub.subjects)) {
      // Separate-mode elective: expand into individual subject rows
      (sub.subjects as any[]).forEach((s) => {
        if (s.isExamSelectionDisabled) return;
        const sName = s.subjectName || s.name || '';
        const groupName =
          sub.electiveGroupName ||
          s.electiveGroupName ||
          (sub.subjectName !== sName ? sub.subjectName : '') ||
          '';
        rows.push({
          subjectId: s.subjectId,
          subjectName: sName,
          subjectCode: s.subjectCode || s.code || '',
          subjectColor: s.subjectColor || sub.subjectColor || '#9E9E9E',
          electiveGroupId: sub.electiveGroupId,
          electiveGroupName: groupName,
          examDate: s.examDate,
          startTime: s.startTime,
          endTime: s.endTime,
          totalMarks: s.totalMarks,
          passingMarks: s.passingMarks,
          notes: s.notes,
        });
      });
    } else {
      // Combined-mode elective: one row for the whole group
      rows.push(sub);
    }
  });
  return rows;
}

const ExamScheduleReview = ({
  formik,
  onEdit,
}: {
  formik: FormikProps<IExamFormValues>;
  onEdit?: () => void;
}) => {
  const reviewRows = buildReviewRows(formik.values.subjects);

  return (
    <ExamReviewAccordion
      title="Subject Schedule"
      icon="solar:calendar-bold-duotone"
      onEdit={onEdit}
    >
      {reviewRows.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No subjects scheduled yet.
        </Typography>
      ) : (
        <Grid container spacing={2} alignItems="stretch">
          {reviewRows.map((row, index) => {
            const totalMarks =
              row.totalMarks !== '' && row.totalMarks != null ? row.totalMarks : '-';
            const passingMarks =
              row.passingMarks !== '' && row.passingMarks != null ? row.passingMarks : '-';

            return (
              <Grid
                key={`${row.subjectId || row.subjectName}-${index}`}
                size={{ xs: 12, lg: reviewRows.length === 1 ? 12 : 6 }}
              >
                <Paper variant="outlined" sx={reviewCardSx}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 1,
                      minHeight: 32,
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      fontWeight={700}
                      sx={{ overflowWrap: 'anywhere' }}
                    >
                      {row.subjectName || '-'}
                    </Typography>
                    {row.subjectCode && (
                      <Typography variant="caption" color="text.secondary">
                        {row.subjectCode}
                      </Typography>
                    )}
                    {row.electiveGroupName && (
                      <Chip
                        label={row.electiveGroupName}
                        size="small"
                        variant="outlined"
                        sx={reviewChipSx}
                      />
                    )}
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box
                    sx={{
                      ...reviewFactsSx,
                      '@container (min-width: 680px)': {
                        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                      },
                    }}
                  >
                    <ExamReviewInfoItem
                      label="Date"
                      value={row.examDate ? dayjs(row.examDate).format('D MMM YYYY') : '-'}
                    />
                    <ExamReviewInfoItem
                      label="Time"
                      value={
                        row.startTime && row.endTime
                          ? `${dayjs(row.startTime).format('h:mm A')} – ${dayjs(row.endTime).format('h:mm A')}`
                          : '-'
                      }
                    />
                    <ExamReviewInfoItem label="Total Marks" value={totalMarks} />
                    <ExamReviewInfoItem label="Passing Marks" value={passingMarks} />
                    {row.notes && (
                      <Box sx={{ gridColumn: '1 / -1' }}>
                        <ExamReviewInfoItem label="Notes" value={row.notes} />
                      </Box>
                    )}
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      )}
    </ExamReviewAccordion>
  );
};

export default ExamScheduleReview;
