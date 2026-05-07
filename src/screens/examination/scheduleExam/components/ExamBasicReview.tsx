import type { FormikProps } from 'formik';
import type { RootState } from 'src/redux/store';
import type { Division } from 'src/types/school';
import type { LabelColor } from 'src/components/label';

import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { varAlpha } from 'src/theme/styles';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Box, Card, Grid, Chip, Button, Divider, Typography } from '@mui/material';
import {
  Class,
  School,
  Article,
  Subject,
  Description,
  CastForEducation,
} from '@mui/icons-material';

import type { IExamFormValues } from '../type';

// ----------------------------------------------------------------------

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

const InfoItem = ({ icon, label, value }: InfoItemProps) => (
  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
    <Box
      sx={{
        width: 40,
        height: 40,
        borderRadius: 1.5,
        bgcolor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.08),
        color: 'primary.main',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {React.cloneElement(icon as React.ReactElement<any>, { sx: { fontSize: 20 } })}
    </Box>
    <Box sx={{ minWidth: 0, flex: 1 }}>
      <Typography
        variant="caption"
        sx={{ color: 'text.secondary', display: 'block', mb: 0.5, fontWeight: 500 }}
      >
        {label}
      </Typography>
      <Box
        component="div"
        sx={{
          typography: 'subtitle2',
          fontWeight: 600,
          color: 'text.primary',
          wordBreak: 'break-word',
        }}
      >
        {value}
      </Box>
    </Box>
  </Box>
);

// ----------------------------------------------------------------------

const ExamBasicReview = ({
  formik,
  onEdit,
}: {
  formik: FormikProps<IExamFormValues>;
  onEdit?: () => void;
}) => {
  // Get current board, medium and medium setter from global state
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  // Extract values from formik for easier access
  const { values } = formik;

  console.log('ExamBasicReview values:', values);

  // Get all classes by flattening the standards array from each education medium stage
  const allClass = useMemo(
    () => medium?.educationMediumStages?.flatMap((stage: any) => stage.standards || []) || [],
    [medium]
  );

  // Find the name of the selected class based on className ID from formik values
  const className = useMemo(() => {
    const selectedClass = allClass.find((cls: any) => cls.id === formik.values.className);
    return selectedClass?.name || '';
  }, [allClass, formik.values.className]);

  // Get divisions for the selected class and filter them based on selected division IDs in formik values
  const divisions = useMemo(() => {
    const classDivisions =
      allClass.find((cls: any) => cls.id === formik.values.className)?.divisions || [];
    return classDivisions.filter((division: any) => formik.values.divisions.includes(division.id));
  }, [allClass, formik.values.className, formik.values.divisions]);

  // Determine status color/label
  const statusConfig = useMemo(() => {
    if (values.status === 1) return { color: 'success', label: 'Active' };
    if (values.status === 0) return { color: 'warning', label: 'Draft' };
    return { color: 'error', label: 'Cancelled' };
  }, [values.status]);

  return (
    <Card
      sx={{
        borderRadius: 2,
        boxShadow: (theme) =>
          theme.customShadows?.card ||
          '0 0 2px 0 rgba(145, 158, 171, 0.2), 0 12px 24px -4px rgba(145, 158, 171, 0.12)',
        border: (theme) => `1px solid ${varAlpha(theme.palette.grey['500Channel'], 0.12)}`,
        overflow: 'hidden',
        mb: 2,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.04),
          borderBottom: (theme) => `1px dashed ${varAlpha(theme.palette.grey['500Channel'], 0.2)}`,
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              bgcolor: 'common.white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: (theme) =>
                `0 4px 8px ${varAlpha(theme.palette.primary.mainChannel, 0.16)}`,
              border: (theme) => `1px solid ${varAlpha(theme.palette.primary.mainChannel, 0.1)}`,
            }}
          >
            <Iconify icon="healthicons:i-exam-multiple-choice" width={24} color="primary.main" />
          </Box>

          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              Basic Details
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              Exam configuration and schedule info
            </Typography>
          </Box>
        </Box>

        {/* NON-BREAKING: right-side actions — Edit link + status badge */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {onEdit && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<Iconify icon="eva:edit-2-fill" width={16} />}
              onClick={onEdit}
              sx={{ fontSize: '0.75rem' }}
            >
              Edit
            </Button>
          )}
          {values.status !== undefined && (
            <Label
              variant="filled"
              color={statusConfig.color as LabelColor}
              sx={{ textTransform: 'uppercase', py: 0.5, px: 1 }}
            >
              {statusConfig.label}
            </Label>
          )}
        </Box>
      </Box>

      {/* Body */}
      <Box sx={{ p: 2 }}>
        <Grid container spacing={3}>
          {/* Exam Name */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <InfoItem icon={<Description />} label="Exam Name" value={values.examName || '-'} />
          </Grid>

          {/* Exam Type */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <InfoItem
              icon={<Article />}
              label="Exam Type"
              value={values.examTypeName || values.examType || '-'}
            />
          </Grid>

          {/* Class */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <InfoItem icon={<Class />} label="Class" value={className || '-'} />
          </Grid>

          {/* Division (List) */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <InfoItem
              icon={<School />}
              label="Division"
              value={
                divisions.length > 0 ? (
                  <Box display="flex" flexWrap="wrap" gap={0.5}>
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

          <Grid size={{ xs: 12 }}>
            <Divider sx={{ borderStyle: 'dashed' }} />
          </Grid>

          {/* Subjects (List) */}
          <Grid size={{ xs: 12, md: 6 }}>
            <InfoItem
              icon={<Subject />}
              label="Subjects"
              value={
                values.subjects.length > 0 ? (
                  <Box display="flex" flexWrap="wrap" gap={0.5}>
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
              <InfoItem
                icon={<CastForEducation />} // Or another suitable icon
                label="Description"
                value={values.description}
              />
            </Grid>
          )}
        </Grid>
      </Box>
    </Card>
  );
};

export default ExamBasicReview;
