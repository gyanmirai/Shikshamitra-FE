import type { FormikProps } from 'formik';
import type { Division } from 'src/types/school';
import type { LabelColor } from 'src/components/label';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Box, Grid, Chip, Divider } from '@mui/material';
import {
  Class,
  School,
  Article,
  Subject,
  Description,
  CastForEducation,
} from '@mui/icons-material';

import { ExamReviewInfoItem } from './ExamReviewInfoItem';
import { ExamReviewAccordion } from './ExamReviewAccordion';
import { useExamBasicReviewData } from './use-exam-basic-review-data';

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
      description="Exam configuration and schedule info"
      icon="healthicons:i-exam-multiple-choice"
      onEdit={onEdit}
      status={statusLabel}
    >
      <Grid container spacing={1}>
        {/* Exam Name */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <ExamReviewInfoItem
            icon={<Description />}
            label="Exam Name"
            value={values.examName || '-'}
          />
        </Grid>

        {/* Exam Type */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <ExamReviewInfoItem
            icon={<Article />}
            label="Exam Type"
            value={values.examTypeName || values.examType || '-'}
          />
        </Grid>

        {/* Class */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <ExamReviewInfoItem icon={<Class />} label="Class" value={className || '-'} />
        </Grid>

        {/* Division (List) */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <ExamReviewInfoItem
            icon={<School />}
            label="Division"
            value={
              divisions.length > 0 ? (
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {divisions.map((division: Division) => (
                    <Chip
                      key={division.id}
                      label={division.name}
                      size="small"
                      variant="soft"
                      sx={{ fontSize: '0.75rem', height: 24 }}
                    />
                  ))}
                </Box>
              ) : (
                '-'
              )
            }
          />
        </Grid>

        {/* Grading Scale */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <ExamReviewInfoItem
            icon={<Iconify icon="solar:ranking-bold-duotone" />}
            label="Grading Scale"
            value={gradingScaleName}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Divider sx={{ borderStyle: 'dashed' }} />
        </Grid>

        {/* Subjects (List) */}
        <Grid size={{ xs: 12, md: 6 }}>
          <ExamReviewInfoItem
            icon={<Subject />}
            label="Subjects"
            value={
              values.subjects.length > 0 ? (
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {values.subjects.map((subject) => (
                    <Chip
                      key={subject.subjectId}
                      label={subject.subjectName}
                      size="small"
                      variant="soft"
                      sx={{ fontSize: '0.75rem', height: 24 }}
                    />
                  ))}
                </Box>
              ) : (
                '-'
              )
            }
          />
        </Grid>

        {/* Description */}
        {values.description && (
          <Grid size={{ xs: 12, md: 6 }}>
            <ExamReviewInfoItem
              icon={<CastForEducation />} // Or another suitable icon
              label="Description"
              value={values.description}
            />
          </Grid>
        )}
      </Grid>
    </ExamReviewAccordion>
  );
};

export default ExamBasicReview;
