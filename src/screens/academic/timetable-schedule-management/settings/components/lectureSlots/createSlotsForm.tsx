'use client';

import type { FormikErrors } from 'formik';
import type { RootState } from 'src/redux/store';
import type { Standards, Organization } from 'src/types/school';

import dayjs from 'dayjs';
import { isNaN } from 'lodash';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import React, { useState, useEffect } from 'react';

import { TimePicker, renderTimeViewClock } from '@mui/x-date-pickers';
import { Box, Grid, Button, TextField, Typography, DialogActions } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import { DialogScrollContent } from 'src/components/customDialog';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { getInitialValues } from './initialValues';
import { validationSchema } from './validationSchema';

import type { ITimeSlot, ICreateSlotsFormProps } from './type';

const CreateSlotsForm: React.FC<ICreateSlotsFormProps> = ({
  open,
  handleClose,
  disabled,
  isEdit,
  data,
}) => {
  // State to store all classes/standards for the selected organization
  const [allClass, setAllClass] = useState<Standards[]>([]);
  // State to store selected class/standard ID
  const [classes, setClasses] = useState<string>('');
  console.log('data------', data);

  // Get current board, medium and medium setter from global state for managing education settings
  const {
    currentBoard,
    currentMedium: medium,
    setCurrentMedium: setMedium,
  } = useSelector((state: RootState) => state.globalState);

  // Update classes when organization changes
  useEffect(() => {
    // Flatten the list of standards from all stages
    const allClasses =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];

    setAllClass(allClasses);
    setClasses(allClasses[0]?.id || '');
  }, [medium]);

  useEffect(() => {
    if ((isEdit || disabled) && data?.timeSlots?.length > 0) {
      setShowTable(true);
    }
  }, [isEdit, disabled, data]);

  const formik = useFormik({
    initialValues: getInitialValues(classes, data),
    // enableReinitialize: true,
    validationSchema,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: (values) => {},
  });

  console.log('formik vluess------', formik.values);

  // State for managing total number of slots
  const [totalSlots, setTotalSlots] = useState('');
  // State for controlling table visibility
  const [showTable, setShowTable] = useState(false);
  // State for storing time slot data
  const [timeSlots, setTimeSlots] = useState<ITimeSlot[]>([]);

  /**
   * Creates empty time slots based on the total slots entered
   * Initializes each slot with default values
   */
  const handleCreateSlots = (e: any) => {
    const inputValue = e.target.value;
    const slotsCount = parseInt(inputValue, 10);

    formik.setFieldValue('totalSlots', inputValue);
    formik.setFieldTouched('totalSlots', false);

    // Block invalid or empty input
    if (!inputValue || isNaN(slotsCount) || slotsCount < 1 || slotsCount > 20) {
      formik.setFieldValue('timeSlots', []);
      setShowTable(false);
      return;
    }

    const newSlots = Array(slotsCount)
      .fill(null)
      .map((_, index) => ({
        id: index,
        startTime: index === 0 ? dayjs('2024-01-01T07:00') : null,
        endTime: index === slotsCount - 1 ? dayjs('2024-01-01T12:30') : null,
        slotType: 'period',
        breakType: '',
      }));

    formik.setFieldValue('timeSlots', newSlots);
    setShowTable(true);
  };

  // Helper function to check if it's the last row
  const isLastRow = (rowIndex: number) => rowIndex === formik.values.timeSlots.length - 1;

  // Helper function to check if it's the first row
  const isFirstRow = (rowIndex: number) => rowIndex === 0;

  return (
    // <form onSubmit={formik.handleSubmit} noValidate>
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Box
          sx={{
            flexGrow: 1,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            p: 2,
            minHeight: 0, // Allow shrinking
            height: '100%', // Take full available height
          }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <ShakingTextField error={!!(formik.touched.className && formik.errors.className)}>
                <CustomSelect
                  options={allClass}
                  value={formik.values.className}
                  onChange={(val) => formik.setFieldValue('className', val as string)}
                  label="Class *"
                  labelKey="name"
                  valueKey="name"
                  formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
                  error={formik.touched.className && Boolean(formik.errors.className)}
                  helperText={
                    formik.touched.className && typeof formik.errors.className === 'string'
                      ? formik.errors.className
                      : undefined
                  }
                  disabled={disabled || (isEdit && !!data)}
                />
              </ShakingTextField>
            </Grid>

            <Grid item xs={12} md={3}>
              <ShakingTextField error={!!(formik.touched.schoolHours && formik.errors.schoolHours)}>
                <TextField
                  fullWidth
                  label="School Hours *"
                  name="schoolHours"
                  value={formik.values.schoolHours || '07:00 - 12:30'}
                  onChange={formik.handleChange}
                  size="small"
                  disabled
                />
              </ShakingTextField>
            </Grid>

            <Grid item xs={12} md={3}>
              <ShakingTextField
                error={!!(formik.touched.previousClassSlots && formik.errors.previousClassSlots)}
              >
                <CustomSelect
                  options={allClass}
                  value={formik.values.previousClassSlots}
                  onChange={(val) => formik.setFieldValue('previousClassSlots', val as string)}
                  label="Slots From Other Class"
                  labelKey="name"
                  valueKey="name"
                  formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
                  error={
                    formik.touched.previousClassSlots && Boolean(formik.errors.previousClassSlots)
                  }
                  helperText={
                    formik.touched.previousClassSlots &&
                    typeof formik.errors.previousClassSlots === 'string'
                      ? formik.errors.previousClassSlots
                      : undefined
                  }
                  disabled={disabled || (isEdit && !!data)}
                />
              </ShakingTextField>
            </Grid>

            <Grid item xs={12} md={3}>
              <ShakingTextField error={!!(formik.touched.totalSlots && formik.errors.totalSlots)}>
                <TextField
                  fullWidth
                  label="Total Slots *"
                  name="totalSlots"
                  type="number"
                  inputProps={{ min: 0, max: 20 }}
                  value={formik.values.totalSlots}
                  onChange={(e) => {
                    handleCreateSlots(e);
                  }}
                  onKeyDown={(e) => {
                    if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  error={formik.touched.totalSlots && Boolean(formik.errors.totalSlots)}
                  helperText={(formik.touched.totalSlots && formik.errors.totalSlots) as string}
                  size="small"
                  disabled={disabled || (isEdit && !!data)}
                />
              </ShakingTextField>
            </Grid>
          </Grid>

          {showTable && formik.values.timeSlots.length > 0 && (
            <>
              <Typography variant="subtitle2" mt={2}>
                Slot Times
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <CustomizableTable
                  tableContainerProps={{ sx: { maxHeight: '300px' } }}
                  tableId="time-schedule-management-setting"
                  // noDataText={<>No Subject&apos;s weekly lectures Found </>}
                  isSearch={false}
                  // isShowedDense={false}
                  isFilter={false}
                  isPagination
                  columns={[
                    {
                      id: 'startTime',
                      label: 'Start Time',
                      isFilter: false,
                      isSort: false,
                      render(value, row) {
                        const rowIndex = row.id;
                        const fieldPath = `timeSlots[${rowIndex}].startTime`;
                        const isTouched =
                          Array.isArray(formik.touched.timeSlots) &&
                          formik.touched.timeSlots[rowIndex]?.startTime;

                        const fieldError =
                          Array.isArray(formik.errors.timeSlots) &&
                          typeof formik.errors.timeSlots[rowIndex] === 'object'
                            ? (formik.errors.timeSlots[rowIndex] as FormikErrors<any>)?.startTime
                            : undefined;

                        return (
                          <ShakingTextField error={!!(isTouched && fieldError)}>
                            <TimePicker
                              value={value || null}
                              format="hh:mm a"
                              views={['hours', 'minutes']}
                              disabled={(disabled && !isEdit) || isFirstRow(rowIndex)}
                              ampm
                              onChange={(newTime) => {
                                const updated = [...formik.values.timeSlots];
                                if (!updated[rowIndex]) {
                                  updated[rowIndex] = {
                                    id: rowIndex,
                                    startTime: null,
                                    endTime: null,
                                    slotType: 'period',
                                    breakType: '',
                                  };
                                }

                                updated[rowIndex].startTime = newTime;
                                formik.setFieldValue('timeSlots', updated);
                                // formik.setFieldTouched(fieldPath, true);
                                // Trigger validation
                                setTimeout(() => formik.validateForm(), 0);
                              }}
                              slotProps={{
                                textField: {
                                  size: 'small',
                                  error: !!(isTouched && fieldError),
                                  helperText: (isTouched && fieldError ? fieldError : '') as string,
                                  FormHelperTextProps: {
                                    sx: {
                                      margin: 0,
                                      marginTop: '4px',
                                      lineHeight: '1.25rem',
                                      whiteSpace: 'normal',
                                    },
                                  },
                                  InputLabelProps: {
                                    sx: { lineHeight: '1.2em' },
                                  },
                                  sx: { minWidth: '100px', width: '100%', mb: 1 },
                                },
                              }}
                              viewRenderers={{
                                hours: renderTimeViewClock,
                                minutes: renderTimeViewClock,
                                seconds: renderTimeViewClock,
                              }}
                              // disabled={disabled || isFirstRow(rowIndex)}
                            />
                          </ShakingTextField>
                        );
                      },
                    },
                    {
                      id: 'endTime',
                      label: 'End Time',
                      isFilter: false,
                      isSort: false,
                      render(value, row) {
                        const rowIndex = row.id;
                        const fieldPath = `timeSlots[${rowIndex}].endTime`;
                        const isTouched =
                          Array.isArray(formik.touched.timeSlots) &&
                          formik.touched.timeSlots[rowIndex]?.endTime;

                        const fieldError =
                          Array.isArray(formik.errors.timeSlots) &&
                          typeof formik.errors.timeSlots[rowIndex] === 'object'
                            ? (formik.errors.timeSlots[rowIndex] as FormikErrors<any>)?.endTime
                            : undefined;

                        return (
                          <ShakingTextField error={!!(isTouched && fieldError)}>
                            <TimePicker
                              value={value || null}
                              disabled={(disabled && !isEdit) || isLastRow(rowIndex)}
                              viewRenderers={{
                                hours: renderTimeViewClock,
                                minutes: renderTimeViewClock,
                                seconds: renderTimeViewClock,
                              }}
                              format="hh:mm a"
                              views={['hours', 'minutes']}
                              ampm
                              onChange={(newTime) => {
                                const updated = [...formik.values.timeSlots];
                                if (!updated[rowIndex]) {
                                  updated[rowIndex] = {
                                    id: rowIndex,
                                    startTime: null,
                                    endTime: null,
                                    slotType: 'period',
                                    breakType: '',
                                  };
                                }
                                updated[rowIndex].endTime = newTime;
                                formik.setFieldValue('timeSlots', updated);
                                // formik.setFieldTouched(fieldPath, true);
                                // Trigger validation
                                setTimeout(() => formik.validateForm(), 0);
                              }}
                              slotProps={{
                                textField: {
                                  size: 'small',
                                  error: !!(isTouched && fieldError),
                                  helperText: (isTouched && fieldError ? fieldError : '') as string,
                                  FormHelperTextProps: {
                                    sx: {
                                      margin: 0,
                                      marginTop: '4px',
                                      lineHeight: '1.25rem',
                                      whiteSpace: 'normal',
                                    },
                                  },
                                  InputLabelProps: {
                                    sx: { lineHeight: '1.2em' },
                                  },
                                  sx: { minWidth: '100px', width: '100%', mb: 1 },
                                },
                              }}
                            />
                          </ShakingTextField>
                        );
                      },
                    },
                    {
                      id: 'slotType',
                      label: 'Slot Type',
                      isFilter: false,
                      isSort: false,
                      render(value, row) {
                        const rowIndex = row.id;
                        const slotTypeFieldPath = `timeSlots[${rowIndex}].slotType`;
                        const breakTypeFieldPath = `timeSlots[${rowIndex}].breakType`;

                        const isSlotTypeTouched =
                          Array.isArray(formik.touched.timeSlots) &&
                          formik.touched.timeSlots[rowIndex]?.slotType;

                        const isBreakTypeTouched =
                          Array.isArray(formik.touched.timeSlots) &&
                          formik.touched.timeSlots[rowIndex]?.breakType;

                        const slotTypeError =
                          Array.isArray(formik.errors.timeSlots) &&
                          typeof formik.errors.timeSlots[rowIndex] === 'object'
                            ? (formik.errors.timeSlots[rowIndex] as FormikErrors<any>)?.slotType
                            : undefined;

                        const breakTypeError =
                          Array.isArray(formik.errors.timeSlots) &&
                          typeof formik.errors.timeSlots[rowIndex] === 'object'
                            ? (formik.errors.timeSlots[rowIndex] as FormikErrors<any>)?.breakType
                            : undefined;

                        return (
                          <Box sx={{ display: 'flex', gap: 1, minWidth: '300px' }}>
                            <ShakingTextField error={!!(isSlotTypeTouched && slotTypeError)}>
                              <CustomSelect
                                label="Slot *"
                                options={[
                                  { value: 'period', label: 'Period' },
                                  { value: 'break', label: 'Break' },
                                ]}
                                disabled={disabled && !isEdit}
                                value={value}
                                onChange={(val: any) => {
                                  const updated = [...formik.values.timeSlots];
                                  if (!updated[rowIndex]) {
                                    updated[rowIndex] = {
                                      id: rowIndex,
                                      startTime: null,
                                      endTime: null,
                                      slotType: 'period',
                                      breakType: '',
                                    };
                                  }

                                  updated[rowIndex].slotType = val;
                                  // Reset breakType when changing from break to period
                                  if (val !== 'break') {
                                    updated[rowIndex].breakType = '';
                                  }
                                  formik.setFieldValue('timeSlots', updated);
                                  // formik.setFieldTouched(slotTypeFieldPath, true);
                                  // Trigger validation
                                  setTimeout(() => formik.validateForm(), 0);
                                }}
                                error={!!(isSlotTypeTouched && slotTypeError)}
                                helperText={
                                  (isSlotTypeTouched && slotTypeError
                                    ? slotTypeError
                                    : '') as string
                                }
                                formControlProps={{
                                  sx: {
                                    minWidth: '150px',
                                    width: '100%',
                                    mb: 1,
                                  },
                                }}
                              />
                            </ShakingTextField>

                            {value === 'break' && (
                              <ShakingTextField error={!!(isBreakTypeTouched && breakTypeError)}>
                                <CustomSelect
                                  label="Break Type *"
                                  options={[
                                    { value: 'lunch', label: 'Lunch Break' },
                                    { value: 'short', label: 'Short Break' },
                                    { value: 'recess', label: 'Recess' },
                                    { value: 'prayer', label: 'Prayer Break' },
                                  ]}
                                  value={row.breakType || ''}
                                  onChange={(val: any) => {
                                    const updated = [...formik.values.timeSlots];
                                    if (!updated[rowIndex]) {
                                      updated[rowIndex] = {
                                        id: rowIndex,
                                        startTime: null,
                                        endTime: null,
                                        slotType: 'period',
                                        breakType: '',
                                      };
                                    }
                                    updated[rowIndex].breakType = val;
                                    formik.setFieldValue('timeSlots', updated);
                                    // formik.setFieldTouched(breakTypeFieldPath, true);
                                    // Trigger validation
                                    setTimeout(() => formik.validateForm(), 0);
                                  }}
                                  error={!!(isBreakTypeTouched && breakTypeError)}
                                  helperText={
                                    (isBreakTypeTouched && breakTypeError
                                      ? breakTypeError
                                      : '') as string
                                  }
                                  formControlProps={{
                                    sx: {
                                      minWidth: '150px',
                                      width: '100%',
                                      mb: 1,
                                    },
                                  }}
                                  disabled={disabled}
                                />
                              </ShakingTextField>
                            )}
                          </Box>
                        );
                      },
                    },
                  ]}
                  data={formik.values.timeSlots}
                />
              </Box>
            </>
          )}
        </Box>
      </DialogScrollContent>
      {!disabled && (
        <DialogActions>
          <Button
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
            variant="outlined"
            // disabled={disabled}
            size="small"
            onClick={() => {
              handleClose?.(null, false);
            }}
          >
            Cancel
          </Button>
          <Button
            startIcon={
              <Iconify
                icon={isEdit ? GlobalIcons.edit : GlobalIcons.submit}
                width={isEdit ? 16 : 20}
                height={isEdit ? 16 : 20}
              />
            }
            form="dialog-form"
            onClick={() => formik.handleSubmit()}
            size="small"
            variant="contained"
          >
            {isEdit ? 'Update' : 'Submit'}
            {/* {isEdit ? 'Update' : 'Submit'} */}
          </Button>
        </DialogActions>
      )}
    </BackPopUpChecked>
    // </form>
  );
};

export default CreateSlotsForm;
