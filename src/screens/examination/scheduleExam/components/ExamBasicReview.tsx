import type { FormikProps } from 'formik';
import type { Division } from 'src/types/school';
import type { LabelColor } from 'src/components/label';

import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Box, Grid, Chip, Paper, Divider } from '@mui/material';
import { FormSectionHeader } from 'src/components/form-section-card';

import { ExamReviewInfoItem } from './ExamReviewInfoItem';
import { ExamReviewAccordion } from './ExamReviewAccordion';
import { useExamBasicReviewData } from './use-exam-basic-review-data';
import { hasSchedulableExamSubject } from './schedulable-exam-subjects';
import { reviewCardSx, reviewChipSx, reviewFactsSx } from './exam-review-styles';

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
      <Label variant="filled" color={statusConfig.color as LabelColor} sx={{ py: 0.5, px: 1 }}>
        {statusConfig.label}
      </Label>
    );

  return (
    <ExamReviewAccordion
      title="Basic Details"
      icon={GlobalIcons.notebook}
      onEdit={onEdit}
      status={statusLabel}
    >
      <Grid container spacing={2} alignItems="stretch">
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper variant="outlined" sx={reviewCardSx}>
            <FormSectionHeader
              icon={GlobalIcons.calendar}
              title="Exam Setup"
              titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
              descriptionTooltip="Review the exam name, type, and grading scale selected in Basic Details."
            />
            <Divider sx={{ my: 2 }} />
            <Box
              sx={{
                ...reviewFactsSx,
                '@container (min-width: 560px)': {
                  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                },
              }}
            >
              <ExamReviewInfoItem label="Exam name" value={values.examName || '-'} />
              <ExamReviewInfoItem
                label="Exam type"
                value={values.examTypeName || values.examType || '-'}
              />
              <ExamReviewInfoItem label="Grading scale" value={gradingScaleName} />
              {values.description && (
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <ExamReviewInfoItem label="Description" value={values.description} />
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper variant="outlined" sx={reviewCardSx}>
            <FormSectionHeader
              icon={GlobalIcons.admissionInterest}
              title="Class & Subjects"
              titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
              descriptionTooltip="Review the class, divisions, and subjects included in this exam."
            />
            <Divider sx={{ my: 2 }} />
            <Box sx={reviewFactsSx}>
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
                          sx={reviewChipSx}
                        />
                      ))}
                    </Box>
                  ) : (
                    '-'
                  )
                }
              />
              <Box sx={{ gridColumn: '1 / -1' }}>
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
                            sx={reviewChipSx}
                          />
                        ))}
                      </Box>
                    ) : (
                      '-'
                    )
                  }
                />
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </ExamReviewAccordion>
  );
};

export default ExamBasicReview;
