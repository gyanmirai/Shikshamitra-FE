import type { FormikProps } from 'formik';
import type { Division } from 'src/types/school';
import type { LabelColor } from 'src/components/label';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Box, Grid, Chip, Paper, Divider, Typography } from '@mui/material';

import { ExamReviewInfoItem } from './ExamReviewInfoItem';
import { ExamReviewAccordion } from './ExamReviewAccordion';
import { useExamBasicReviewData } from './use-exam-basic-review-data';
import { hasSchedulableExamSubject } from './schedulable-exam-subjects';

import type { IExamFormValues } from '../type';

// ----------------------------------------------------------------------

const ExamBasicReview = ({
  formik,
  onEdit,
}: {
  formik: FormikProps<IExamFormValues>;
  onEdit?: () => void;
}) => {
  const { values } = formik;
  const { className, divisions, gradingScaleName, statusConfig } = useExamBasicReviewData(values);

  const statusLabel =
    values.status === undefined ? undefined : (
      <Label
        variant="filled"
        color={statusConfig.color as LabelColor}
        sx={{ textTransform: 'uppercase', py: 0.5, px: 1 }}
      >
        {statusConfig.label}
      </Label>
    );

  return (
    <ExamReviewAccordion
      title="Basic Details"
      icon="healthicons:i-exam-multiple-choice"
      onEdit={onEdit}
      status={statusLabel}
    >
      <Grid container spacing={2} alignItems="stretch">
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant="outlined" sx={{ height: '100%', p: 2, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Iconify
                icon="mdi:clipboard-text-outline"
                width={20}
                sx={{ color: 'text.secondary' }}
              />
              <Typography variant="subtitle2" fontWeight={700}>
                Exam setup
              </Typography>
            </Box>
            <Divider sx={{ my: 1.5 }} />
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'minmax(0, 1fr)',
                  sm: 'repeat(2, minmax(0, 1fr))',
                  md:
                    values.examName?.length > 24
                      ? 'minmax(0, 1.5fr) repeat(2, minmax(0, 1fr))'
                      : 'repeat(3, minmax(0, 1fr))',
                },
                columnGap: 2,
                rowGap: 2,
              }}
            >
              <ExamReviewInfoItem label="Exam Name" value={values.examName || '-'} />
              <ExamReviewInfoItem
                label="Exam Type"
                value={values.examTypeName || values.examType || '-'}
              />
              <ExamReviewInfoItem label="Grading Scale" value={gradingScaleName} />
              {values.description && (
                <ExamReviewInfoItem label="Description" value={values.description} />
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant="outlined" sx={{ height: '100%', p: 2, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Iconify icon="mdi:school-outline" width={20} sx={{ color: 'text.secondary' }} />
              <Typography variant="subtitle2" fontWeight={700}>
                Class & subjects
              </Typography>
            </Box>
            <Divider sx={{ my: 1.5 }} />
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'minmax(0, 1fr)',
                  sm: 'repeat(2, minmax(0, 1fr))',
                  md: 'repeat(3, minmax(0, 1fr))',
                },
                columnGap: 2,
                rowGap: 2,
              }}
            >
              <ExamReviewInfoItem label="Class" value={className || '-'} />
              <ExamReviewInfoItem
                label="Divisions"
                value={
                  divisions.length > 0 ? (
                    <Box display="flex" flexWrap="wrap" gap={0.75}>
                      {divisions.map((division: Division) => (
                        <Chip
                          key={division.id}
                          label={division.name}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  ) : (
                    '-'
                  )
                }
              />
              <ExamReviewInfoItem
                label="Subjects"
                value={
                  values.subjects.length > 0 ? (
                    <Box display="flex" flexWrap="wrap" gap={0.75}>
                      {values.subjects.filter(hasSchedulableExamSubject).map((subject) => (
                        <Chip
                          key={subject.subjectId}
                          label={subject.subjectName}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  ) : (
                    '-'
                  )
                }
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </ExamReviewAccordion>
  );
};

export default ExamBasicReview;
