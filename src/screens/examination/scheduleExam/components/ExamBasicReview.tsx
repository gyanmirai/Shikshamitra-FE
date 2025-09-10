import type { FormikProps } from 'formik';
import type { RootState } from 'src/redux/store';
import type { Division } from 'src/types/school';

import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Box, Grid, Chip, Typography } from '@mui/material';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';

import type { IExamFormValues } from '../type';

const ExamBasicReview = ({ formik }: { formik: FormikProps<IExamFormValues> }) => {
  console.log('formik values---', formik.values);
  // Get current board, medium and medium setter from global state
  // Get current board, medium and medium setter from global state
  const {
    currentBoard,
    currentMedium: medium,
    setCurrentMedium: setMedium,
  } = useSelector((state: RootState) => state.globalState);

  // Extract values from formik for easier access
  const { values } = formik;

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

  return (
    <SectionCard title="Basic Details">
      {/* Left Column */}
      <Grid size={12}>
        <Box display="flex" gap={3} alignItems="flex-start">
          {/* Exam Type */}
          <Box display="flex" alignItems="flex-start" gap={1} minWidth={200}>
            <Iconify icon="mdi:clipboard-text-outline" width={20} />
            <Box display="flex" flexDirection="column">
              <Typography variant="subtitle2" color="text.secondary">
                Exam Type
              </Typography>
              <Typography variant="body2" fontWeight="500">
                {values.examType}
              </Typography>
            </Box>
          </Box>

          {/* Subjects */}
          <Box display="flex" alignItems="flex-start" gap={1} minWidth={250}>
            <Iconify icon="mdi:book-open-variant" width={20} />
            <Box display="flex" flexDirection="column">
              <Typography variant="subtitle2" color="text.secondary">
                Subjects
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={0.5}>
                {values.selectedSubjects.map((subject) => (
                  <Chip
                    key={subject}
                    label={subject}
                    size="small"
                    variant="soft"
                    sx={{ fontSize: '0.75rem' }}
                  />
                ))}
              </Box>
            </Box>
          </Box>

          {/* Class */}
          <Box display="flex" alignItems="flex-start" gap={1} minWidth={150}>
            <Iconify icon="mdi:school-outline" width={20} />
            <Box display="flex" flexDirection="column">
              <Typography variant="subtitle2" color="text.secondary">
                Class
              </Typography>
              <Typography variant="body2" fontWeight="500">
                {className}
              </Typography>
            </Box>
          </Box>

          {/* Exam Name */}
          <Box display="flex" alignItems="flex-start" gap={1} minWidth={200}>
            <Iconify icon="mdi:format-title" width={20} />
            <Box display="flex" flexDirection="column">
              <Typography variant="subtitle2" color="text.secondary">
                Exam Name
              </Typography>
              <Typography variant="body2" fontWeight="500">
                {values.examName}
              </Typography>
            </Box>
          </Box>

          {/* Division */}
          <Box display="flex" alignItems="flex-start" gap={1} minWidth={150}>
            <Iconify icon="mdi:view-grid-outline" width={20} />
            <Box display="flex" flexDirection="column">
              <Typography variant="subtitle2" color="text.secondary">
                Division
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={0.5}>
                {divisions.map((division: Division) => (
                  <Chip
                    key={division.id}
                    label={division.name}
                    size="small"
                    variant="soft"
                    sx={{ fontSize: '0.75rem' }}
                  />
                ))}
              </Box>
            </Box>
          </Box>

          {/* Status */}
          {values.status !== undefined && (
            <Box display="flex" alignItems="flex-start" gap={1} minWidth={150}>
              <Iconify icon="mdi:information-outline" width={20} />
              <Box display="flex" flexDirection="column">
                <Typography variant="subtitle2" color="text.secondary">
                  Status
                </Typography>
                <Label
                  color={
                    values.status === 1 ? 'success' : values.status === 0 ? 'warning' : 'error'
                  }
                  variant="soft"
                >
                  {values.status === 1 ? 'Active' : values.status === 0 ? 'Draft' : 'Cancelled'}
                </Label>
              </Box>
            </Box>
          )}
        </Box>

        {/* Description - Full Width */}
        {values.description && (
          <Box display="flex" flexDirection="column" gap={1} mt={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <Iconify icon="mdi:text-box-outline" width={20} />
              <Typography variant="subtitle2" color="text.secondary">
                Description
              </Typography>
            </Box>
            <Typography variant="body2">{values.description}</Typography>
          </Box>
        )}
      </Grid>
    </SectionCard>
  );
};

export default ExamBasicReview;
