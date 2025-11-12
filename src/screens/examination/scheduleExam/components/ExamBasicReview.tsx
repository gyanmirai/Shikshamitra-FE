import type { FormikProps } from 'formik';
import type { RootState } from 'src/redux/store';
import type { Division } from 'src/types/school';

import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
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
        <Box display="flex" gap={10} alignItems="flex-start">
          {/* Exam Type */}

          <Box display="flex" flexDirection="column">
            <Typography variant="body2" color="text.secondary">
              Exam Type
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {values.examType || '-'}
            </Typography>
          </Box>

          {/* Subjects */}

          <Box display="flex" flexDirection="column">
            <Typography variant="body2" color="text.secondary">
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

          {/* Class */}

          <Box display="flex" flexDirection="column">
            <Typography variant="body2" color="text.secondary">
              Class
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {className || '-'}
            </Typography>
          </Box>

          {/* Exam Name */}

          <Box display="flex" flexDirection="column">
            <Typography variant="body2" color="text.secondary">
              Exam Name
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {values.examName || '-'}
            </Typography>
          </Box>

          {/* Division */}

          <Box display="flex" flexDirection="column">
            <Typography variant="body2" color="text.secondary">
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

          {/* Status */}
          {values.status !== undefined && (
            <Box display="flex" flexDirection="column">
              <Typography variant="body2" color="text.secondary">
                Status
              </Typography>
              <Label
                color={values.status === 1 ? 'success' : values.status === 0 ? 'warning' : 'error'}
                variant="soft"
              >
                {values.status === 1 ? 'Active' : values.status === 0 ? 'Draft' : 'Cancelled'}
              </Label>
            </Box>
          )}
        </Box>

        {/* Description - Full Width */}
        {values.description && (
          <Box display="flex" flexDirection="column" gap={1} mt={2}>
            <Typography variant="body2" color="text.secondary">
              Description
            </Typography>

            <Typography variant="body1" fontWeight="medium">
              {values.description || '-'}
            </Typography>
          </Box>
        )}
      </Grid>
    </SectionCard>
  );
};

export default ExamBasicReview;
