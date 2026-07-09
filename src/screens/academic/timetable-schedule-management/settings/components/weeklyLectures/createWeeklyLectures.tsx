'use client';

import React from 'react';
import { Box, Chip, Grid, Typography } from '@mui/material';
import { DialogScrollContent } from 'src/components/customDialog';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { CapacityBanner } from './components/CapacityBanner';
import { useWeeklyLectureForm } from './hooks/useWeeklyLectureForm';
import { SubjectListSkeleton } from './components/SubjectListSkeleton';
import { SubjectsLectureTable } from './components/SubjectsLectureTable';
import { WeeklyLectureClassPicker } from './components/WeeklyLectureClassPicker';
import { WeeklyLectureFormActions } from './components/WeeklyLectureFormActions';

import type { ICreateNoOfLectureProps } from './type';

const CreateNoOfLecture: React.FC<ICreateNoOfLectureProps> = ({
  onClose,
  isEdit,
  disabled = false,
  editData,
  selectedClass,
  tableData,
}) => {
  const {
    formik,
    allClass,
    isSubjectsLoading,
    isSubmitting,
    availableCapacity,
    hasSlots,
    requiredLectures,
    status,
  } = useWeeklyLectureForm({
    editData,
    selectedClass,
    tableData,
    onClose,
  });
  const handleCancel = () => onClose?.(null, false);
  const handleSubmit = () => formik.handleSubmit();

  const { classId, className, subjects } = formik.values;
  const hasClass = !!classId;
  const subjectCount = subjects.length;

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={1}>
          <WeeklyLectureClassPicker
            formik={formik}
            allClass={allClass}
            disabled={disabled}
            isEditLocked={isEdit && !!editData}
          />

          {hasClass && (
            <Grid size={{ xs: 12 }}>
              <CapacityBanner
                status={status}
                availableCapacity={availableCapacity}
                requiredLectures={requiredLectures}
                hasSlots={hasSlots}
              />
            </Grid>
          )}

          {/* Contextual metadata — shown once a class is selected and loaded */}
          {hasClass && !isSubjectsLoading && subjectCount > 0 && (
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 0.25, pt: 0.25 }}>
                {className && (
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    {className}
                  </Typography>
                )}
                <Typography variant="caption" color="text.disabled">
                  ·
                </Typography>
                <Chip
                  size="small"
                  label={`${subjectCount} subject${subjectCount !== 1 ? 's' : ''} to configure`}
                  variant="outlined"
                  color="info"
                  sx={{ fontSize: '11px', height: 20 }}
                />
              </Box>
            </Grid>
          )}

          {hasClass &&
            (isSubjectsLoading ? (
              <Grid size={{ xs: 12 }}>
                <SubjectListSkeleton />
              </Grid>
            ) : (
              <Grid size={{ xs: 12 }}>
                <SubjectsLectureTable formik={formik} disabled={disabled} isEdit={isEdit} />
              </Grid>
            ))}
        </Grid>
      </DialogScrollContent>

      {!disabled && (
        <WeeklyLectureFormActions
          isEdit={!!editData}
          isSubmitting={isSubmitting}
          onCancel={handleCancel}
          onSubmit={handleSubmit}
        />
      )}
    </BackPopUpChecked>
  );
};

export default CreateNoOfLecture;
