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
import { Scrollbar } from 'src/components/scrollbar';
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
      formik.setFieldValue('timeSlots', newSlots);

      // Trigger validation for all slots
      // newSlots.forEach((_, index) => {
      //   formik.setFieldTouched(`timeSlots[${index}].startTime`, true);
      //   formik.setFieldTouched(`timeSlots[${index}].endTime`, true);
      //   formik.setFieldTouched(`timeSlots[${index}].slotType`, true);
      // });

      setShowTable(true);
    }
  };

  /**
   * Updates the start or end time for a specific slot
   * @param time - The selected time value
   * @param slotIndex - Index of the slot to update
   * @param type - Whether updating start or end time
   */
  // const handleTimeChange = (
  //   time: Dayjs | null,
  //   slotIndex: number,
  //   type: 'startTime' | 'endTime'
  // ) => {
  //   setTimeSlots((prevSlots) => {
  //     const newSlots = [...prevSlots];
  //     newSlots[slotIndex] = {
  //       ...newSlots[slotIndex],
  //       [type]: time,
  //     };
  //     return newSlots;
  //   });
  // };

  /**
   * Updates the slot type (period/break) for a specific slot
   * @param value - The selected slot type
   * @param slotIndex - Index of the slot to update
   */
  // const handleSlotTypeChange = (value: any, slotIndex: number) => {
  //   setTimeSlots((prevSlots) => {
  //     const newSlots = [...prevSlots];
  //     newSlots[slotIndex] = {
  //       ...newSlots[slotIndex],
  //       slotType: value,
  //       // Reset breakType when changing slot type
  //       breakType: value === 'break' ? '' : undefined,
  //     };
  //     return newSlots;
  //   });
  // };

  /**
   * Updates the break type for a specific slot
   * @param value - The selected break type
   * @param slotIndex - Index of the slot to update
   */
  // const handleBreakTypeChange = (value: any, slotIndex: number) => {
  //   setTimeSlots((prevSlots) => {
  //     const newSlots = [...prevSlots];
  //     newSlots[slotIndex] = {
  //       ...newSlots[slotIndex],
  //       breakType: value,
  //     };
  //     return newSlots;
  //   });
  // };
  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <Box display="flex" flexDirection="column" gap={2}>
        <form onSubmit={formik.handleSubmit}>
          <Scrollbar sx={{ p: 2, height: '400px' }}>
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
                <ShakingTextField
                  error={!!(formik.touched.schoolHours && formik.errors.schoolHours)}
                >
                  <TextField
                    fullWidth
                    label="School Hours *"
                    name="schoolHours"
                    value={formik.values.schoolHours || '07:00 - 12:30'}
                    onChange={formik.handleChange}
                    // error={formik.touched.schoolHours && Boolean(formik.errors.schoolHours)}
                    // helperText={formik.touched.schoolHours && formik.errors.schoolHours}
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
                    label="Slots From Previous Class	"
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
                    // placeholder="Enter Total Slots"
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

            {formik.values.totalSlots && (
              <>
                <Typography variant="subtitle2" sx={{ mt: 2 }}>
                  Slot Times
                </Typography>
                <CustomizableTable
                  tableId="time-schedule-management-setting"
                  isSearch={false}
                  isShowedDense={false}
                  isFilter={false}
                  columns={[
                    {
                      id: 'startTime',
                      label: 'Start Time',
                      render(value, row) {
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
                            <ShakingTextField
                              error={
                                !!(formik.touched.timeSlots?.[row.id]?.startTime &&
                                typeof formik.errors.timeSlots?.[row.id] === 'object'
                                  ? (formik.errors.timeSlots[row.id] as any).startTime
                                  : undefined)
                              }
                            >
                              <TimePicker
                                value={value || null}
                                format="hh:mm a"
                                views={['hours', 'minutes']}
                                ampm
                                onChange={(newTime) => {
                                  const updated = [...formik.values.timeSlots];

                                  // Ensure the slot exists with all required fields
                                  if (!updated[row.id]) {
                                    updated[row.id] = {
                                      id: row.id,
                                      startTime: null,
                                      endTime: null,
                                      slotType: 'period',
                                      breakType: '', // optional, depending on your type
                                    };
                                  }

                                  updated[row.id].startTime = newTime;

                                  formik.setFieldValue('timeSlots', updated);
                                  // formik.setFieldTouched(`timeSlots[${row.id}].startTime`, true);
                                }}
                                slotProps={{
                                  textField: {
                                    size: 'small',
                                    placeholder: 'hh:mm', // ✅ Custom placeholder shown when empty
                                    inputProps: {
                                      placeholder: 'hh:mm', // ✅ Prevents weird raw input like hh:mm aa
                                    },
                                    error:
                                      typeof formik.errors.timeSlots?.[row.id] === 'object' &&
                                      !!(formik.errors.timeSlots?.[row.id] as any)?.startTime &&
                                      !!formik.touched.timeSlots?.[row.id]?.startTime,
                                    helperText:
                                      formik.touched.timeSlots?.[row.id]?.startTime &&
                                      typeof formik.errors.timeSlots?.[row.id] === 'object'
                                        ? (formik.errors.timeSlots?.[row.id] as any)?.startTime
                                        : '',
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
                                disabled={disabled}
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
                        return (
                          <ShakingTextField
                            error={
                              !!(formik.touched.timeSlots?.[row.id]?.endTime &&
                              typeof formik.errors.timeSlots?.[row.id] === 'object'
                                ? (formik.errors.timeSlots[row.id] as any).endTime
                                : undefined)
                            }
                          >
                            <TimePicker
                              value={value || null}
                              viewRenderers={{
                                hours: renderTimeViewClock,
                                minutes: renderTimeViewClock,
                                seconds: renderTimeViewClock,
                              }}
                              format="HH:mm a"
                              views={['hours', 'minutes']}
                              ampm
                              onChange={(newTime) => {
                                const updated = [...formik.values.timeSlots];
                                updated[row.id].endTime = newTime;
                                formik.setFieldValue('timeSlots', updated);
                                formik.setFieldTouched(`timeSlots[${row.id}].endTime`, true);
                              }}
                              slotProps={{
                                textField: {
                                  size: 'small',
                                  placeholder: 'hh:mm', // ✅ Custom placeholder shown when empty
                                  inputProps: {
                                    placeholder: 'hh:mm', // ✅ Prevents weird raw input like hh:mm aa
                                  },
                                  error:
                                    typeof formik.errors.timeSlots?.[row.id] === 'object' &&
                                    !!(formik.errors.timeSlots?.[row.id] as any)?.endTime &&
                                    !!formik.touched.timeSlots?.[row.id]?.endTime,
                                  helperText:
                                    formik.touched.timeSlots?.[row.id]?.endTime &&
                                    typeof formik.errors.timeSlots?.[row.id] === 'object'
                                      ? (formik.errors.timeSlots?.[row.id] as any)?.endTime
                                      : '',
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
                              disabled={disabled}
                            />
                          </ShakingTextField>
                        );
                      },
                    },
                    {
                      id: 'slotType',
                      label: 'Slot Type',
                      render(value, row) {
                        return (
                          <Box sx={{ display: 'flex', gap: 1, minWidth: '300px' }}>
                            <ShakingTextField
                              error={
                                !!(formik.touched.timeSlots?.[row.id]?.slotType &&
                                typeof formik.errors.timeSlots?.[row.id] === 'object'
                                  ? (formik.errors.timeSlots[row.id] as any).slotType
                                  : undefined)
                              }
                            >
                              <CustomSelect
                                label="Slot *"
                                options={[
                                  { value: 'period', label: 'Period' },
                                  { value: 'break', label: 'Break' },
                                ]}
                                value={value}
                                onChange={(val: any) => {
                                  const updated = [...formik.values.timeSlots];
                                  updated[row.id].slotType = val;
                                  formik.setFieldValue('timeSlots', updated);
                                  // formik.setFieldTouched(`timeSlots[${row.id}].slotType`, true);
                                }}
                                error={
                                  typeof formik.errors.timeSlots?.[row.id] === 'object' &&
                                  !!(formik.errors.timeSlots?.[row.id] as any)?.slotType &&
                                  !!formik.touched.timeSlots?.[row.id]?.slotType
                                }
                                helperText={
                                  formik.touched.timeSlots?.[row.id]?.slotType &&
                                  typeof formik.errors.timeSlots?.[row.id] === 'object'
                                    ? (formik.errors.timeSlots?.[row.id] as any)?.slotType
                                    : ''
                                }
                                formControlProps={{ sx: { minWidth: '150px' } }}
                                disabled={disabled}
                              />
                            </ShakingTextField>

                            {value === 'break' && (
                              <ShakingTextField
                                error={
                                  !!(formik.touched.timeSlots?.[row.id]?.breakType &&
                                  typeof formik.errors.timeSlots?.[row.id] === 'object'
                                    ? (formik.errors.timeSlots[row.id] as any).breakType
                                    : undefined)
                                }
                              >
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
                                    updated[row.id].breakType = val;
                                    formik.setFieldValue('timeSlots', updated);
                                    // formik.setFieldTouched(`timeSlots[${row.id}].breakType`, true);
                                  }}
                                  error={
                                    typeof formik.errors.timeSlots?.[row.id] === 'object' &&
                                    !!(formik.errors.timeSlots?.[row.id] as any)?.breakType &&
                                    !!formik.touched.timeSlots?.[row.id]?.breakType
                                  }
                                  helperText={
                                    formik.touched.timeSlots?.[row.id]?.breakType &&
                                    typeof formik.errors.timeSlots?.[row.id] === 'object'
                                      ? (formik.errors.timeSlots?.[row.id] as any)?.breakType
                                      : ''
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
              </>
            )}
          </Scrollbar>

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
                {/* {isEdit ? 'Update' : 'Submit'} */}
                Submit
              </Button>
              {/* <SubmitButton size="small" disabled={disabled} /> */}
            </DialogActions>
          )}
        </form>
      </Box>
    </BackPopUpChecked>
  );
};
export default CreateSlotsForm;
