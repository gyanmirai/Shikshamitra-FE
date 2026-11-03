'use client';

import React from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { DialogScrollContent } from 'src/components/customDialog';
import { FormSectionCard } from 'src/components/form-section-card';
import { Grid, Alert, Stack, Button, Skeleton } from '@mui/material';
import { useAcademicSetupStandard } from 'src/screens/academic/setup/embedding';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { CapacityBanner } from './components/CapacityBanner';
import { useWeeklyLectureForm } from './hooks/useWeeklyLectureForm';
import { WeeklyLectureTargets } from './components/WeeklyLectureTargets';
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
    isDetailsLoading,
    isCapacityLoading,
    detailsError,
    capacityError,
    subjectsError,
    classContext,
    refetchDetails,
    refetchCapacity,
    refetchSubjects,
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

  const { classId } = formik.values;
  useAcademicSetupStandard(classId);
  const hasClass = !!classId;

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Stack spacing={2}>
          <FormSectionCard
            title="Class Scope"
            icon={GlobalIcons.assigned}
            descriptionTooltip="Choose the class whose weekly subject lecture targets are being configured."
          >
            <Grid container spacing={2}>
              <WeeklyLectureClassPicker
                formik={formik}
                allClass={allClass}
                disabled={disabled}
                isEditLocked={isEdit && !!editData}
              />
            </Grid>
          </FormSectionCard>

          {hasClass &&
            (isDetailsLoading || isCapacityLoading ? (
              <Skeleton
                variant="rounded"
                height={48}
                role="status"
                aria-label="Loading weekly lecture capacity"
              />
            ) : detailsError || capacityError ? (
              <Alert
                severity="error"
                action={
                  <Button
                    type="button"
                    size="small"
                    variant="outlined"
                    color="inherit"
                    startIcon={<Iconify icon={GlobalIcons.refresh} />}
                    onClick={() => {
                      if (detailsError) refetchDetails();
                      if (capacityError) refetchCapacity();
                    }}
                  >
                    Retry
                  </Button>
                }
              >
                Unable to load weekly lecture configuration. Try again.
              </Alert>
            ) : (
              <CapacityBanner
                status={status}
                availableCapacity={availableCapacity}
                requiredLectures={requiredLectures}
                hasSlots={hasSlots}
                classContext={classContext}
                onRefresh={refetchCapacity}
                disabled={isSubmitting}
              />
            ))}

          {hasClass && (
            <WeeklyLectureTargets
              formik={formik}
              isSubjectsLoading={isSubjectsLoading}
              isDetailsLoading={isDetailsLoading}
              detailsError={detailsError}
              subjectsError={subjectsError}
              classContext={classContext}
              refetchSubjects={editData ? refetchDetails : refetchSubjects}
              isSubmitting={isSubmitting}
              disabled={disabled}
              isEdit={isEdit}
              hasEditData={!!editData}
            />
          )}
        </Stack>
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
