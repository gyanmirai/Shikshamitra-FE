'use client';

import type { RootState } from 'src/redux/store';
import type { Standards, Organization } from 'src/types/school';

import dayjs from 'dayjs';
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
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { initialValues } from './initialValues';
import { validationSchema } from './validationSchema';

import type { ITimeSlot, ICreateSlotsFormProps } from './type';

const CreateSlotsForm: React.FC<ICreateSlotsFormProps> = ({ open, onClose, disabled }) => {
  // State to store all classes/standards for the selected organization
  const [allClass, setAllClass] = useState<Standards[]>([]);
  // State to store selected class/standard ID
  const [classes, setClasses] = useState<string>('');
  // Get current board, medium and medium setter from global state
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

  const formik = useFormik({
    initialValues,
    validationSchema,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: (values) => {},
  });

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
    formik.setFieldValue('totalSlots', inputValue);

    const slotsCount = parseInt(inputValue, 10);

    if (slotsCount > 0) {
      const newSlots = Array(slotsCount)
        .fill(null)
        .map((_, index) => ({
          id: index,
          startTime: index === 0 ? dayjs('2024-01-01T07:00') : null,
          endTime: index === slotsCount - 1 ? dayjs('2024-01-01T12:30') : null,
          slotType: 'period',
          breakType: '',
        }));

      setTimeSlots(newSlots);
      // Set the timeSlots in formik values
      formik.setFieldValue('timeSlots', newSlots);

      // Trigger validation for all slots
      setTimeout(() => {
        newSlots.forEach((_, index) => {
          formik.setFieldTouched(`timeSlots[${index}].startTime`, true);
          formik.setFieldTouched(`timeSlots[${index}].endTime`, true);
          formik.setFieldTouched(`timeSlots[${index}].slotType`, true);
        });
        formik.validateForm();
      }, 0);

      setShowTable(true);
    } else {
      setTimeSlots([]);
      setShowTable(false);
    }
  };

  // Helper function to check if it's the last row
  const isLastRow = (rowIndex: number) => rowIndex === timeSlots.length - 1;

  // Helper function to check if it's the first row
  const isFirstRow = (rowIndex: number) => rowIndex === 0;

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit}>
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
                  valueKey="id"
                  formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
                  error={formik.touched.className && Boolean(formik.errors.className)}
                  helperText={
                    formik.touched.className && typeof formik.errors.className === 'string'
                      ? formik.errors.className
                      : undefined
                  }
                  disabled={disabled}
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
                  label="Slots From Last Class"
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
                  disabled={disabled}
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
                  value={formik.values.totalSlots}
                  onChange={(e) => {
                    handleCreateSlots(e);
                  }}
                  onKeyDown={(e) => {
                    if (['e', 'E', '+', '-'].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  error={formik.touched.totalSlots && Boolean(formik.errors.totalSlots)}
                  helperText={formik.touched.totalSlots && formik.errors.totalSlots}
                  size="small"
                  disabled={disabled}
                />
              </ShakingTextField>
            </Grid>
          </Grid>

          {formik.values.totalSlots && showTable && (
            <>
              <Typography variant="subtitle2">Slot Times</Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <CustomizableTable
                  tableId="time-schedule-management-setting"
                  isSearch={false}
                  // isShowedDense={false}
                  isFilter={false}
                  isPagination
                  columns={[
                    {
                      id: 'startTime',
                      label: 'Start Time',
                      render(value, row) {
                        const rowIndex = row.id;
                        const fieldPath = `timeSlots[${rowIndex}].startTime`;
                        const isTouched = formik.touched.timeSlots?.[rowIndex]?.startTime;
                        const fieldError =
                          typeof formik.errors.timeSlots?.[rowIndex] === 'object'
                            ? (formik.errors.timeSlots[rowIndex] as any)?.startTime
                            : undefined;

                        return (
                          <Box
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              minWidth: '150px',
                              width: '100%',
                              mb: 1,
                            }}
                          >
                            <ShakingTextField error={!!(isTouched && fieldError)}>
                              <TimePicker
                                value={value || null}
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
                                  updated[rowIndex].startTime = newTime;
                                  formik.setFieldValue('timeSlots', updated);
                                  formik.setFieldTouched(fieldPath, true);
                                  // Trigger validation
                                  setTimeout(() => formik.validateForm(), 0);
                                }}
                                slotProps={{
                                  textField: {
                                    size: 'small',
                                    error: !!(isTouched && fieldError),
                                    helperText: isTouched && fieldError ? fieldError : '',
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
                                  },
                                }}
                                viewRenderers={{
                                  hours: renderTimeViewClock,
                                  minutes: renderTimeViewClock,
                                  seconds: renderTimeViewClock,
                                }}
                                disabled={disabled || isFirstRow(rowIndex)}
                              />
                            </ShakingTextField>
                          </Box>
                        );
                      },
                    },
                    {
                      id: 'endTime',
                      label: 'End Time',
                      render(value, row) {
                        const rowIndex = row.id;
                        const fieldPath = `timeSlots[${rowIndex}].endTime`;
                        const isTouched = formik.touched.timeSlots?.[rowIndex]?.endTime;
                        const fieldError =
                          typeof formik.errors.timeSlots?.[rowIndex] === 'object'
                            ? (formik.errors.timeSlots[rowIndex] as any)?.endTime
                            : undefined;

                        return (
                          <ShakingTextField error={!!(isTouched && fieldError)}>
                            <TimePicker
                              value={value || null}
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
                                formik.setFieldTouched(fieldPath, true);
                                // Trigger validation
                                setTimeout(() => formik.validateForm(), 0);
                              }}
                              slotProps={{
                                textField: {
                                  size: 'small',
                                  error: !!(isTouched && fieldError),
                                  helperText: isTouched && fieldError ? fieldError : '',
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
                                },
                              }}
                              disabled={disabled || isLastRow(rowIndex)}
                            />
                          </ShakingTextField>
                        );
                      },
                    },
                    {
                      id: 'slotType',
                      label: 'Slot Type',
                      render(value, row) {
                        const rowIndex = row.id;
                        const slotTypeFieldPath = `timeSlots[${rowIndex}].slotType`;
                        const breakTypeFieldPath = `timeSlots[${rowIndex}].breakType`;

                        const isSlotTypeTouched = formik.touched.timeSlots?.[rowIndex]?.slotType;
                        const isBreakTypeTouched = formik.touched.timeSlots?.[rowIndex]?.breakType;

                        const slotTypeError =
                          typeof formik.errors.timeSlots?.[rowIndex] === 'object'
                            ? (formik.errors.timeSlots[rowIndex] as any)?.slotType
                            : undefined;

                        const breakTypeError =
                          typeof formik.errors.timeSlots?.[rowIndex] === 'object'
                            ? (formik.errors.timeSlots[rowIndex] as any)?.breakType
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
                                  formik.setFieldTouched(slotTypeFieldPath, true);
                                  // Trigger validation
                                  setTimeout(() => formik.validateForm(), 0);
                                }}
                                error={!!(isSlotTypeTouched && slotTypeError)}
                                helperText={isSlotTypeTouched && slotTypeError ? slotTypeError : ''}
                                formControlProps={{ sx: { minWidth: '150px' } }}
                                disabled={disabled}
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
                                    formik.setFieldTouched(breakTypeFieldPath, true);
                                    // Trigger validation
                                    setTimeout(() => formik.validateForm(), 0);
                                  }}
                                  error={!!(isBreakTypeTouched && breakTypeError)}
                                  helperText={
                                    isBreakTypeTouched && breakTypeError ? breakTypeError : ''
                                  }
                                  formControlProps={{ sx: { minWidth: '150px' } }}
                                  disabled={disabled}
                                />
                              </ShakingTextField>
                            )}
                          </Box>
                        );
                      },
                    },
                  ]}
                  data={timeSlots}
                />
              </Box>
            </>
          )}
        </Box>
        {!disabled && (
          <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
            <Button
              type="submit"
              startIcon={<Iconify icon={GlobalIcons.eye} />}
              variant="outlined"
              disabled={disabled}
              size="small"
            >
              Preview
            </Button>
            <Button
              startIcon={<Iconify icon={GlobalIcons.submit} />}
              type="submit"
              size="small"
              variant="contained"
            >
              Submit
            </Button>
          </DialogActions>
        )}
      </form>
    </BackPopUpChecked>
  );
};

export default CreateSlotsForm;
