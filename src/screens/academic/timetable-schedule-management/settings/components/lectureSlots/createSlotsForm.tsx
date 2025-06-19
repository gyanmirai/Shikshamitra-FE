'use client';

import type { Dayjs } from 'dayjs';
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
        }));

      setTimeSlots(newSlots);
      setShowTable(true);
    }
  };

  /**
   * Updates the start or end time for a specific slot
   * @param time - The selected time value
   * @param slotIndex - Index of the slot to update
   * @param type - Whether updating start or end time
   */
  const handleTimeChange = (
    time: Dayjs | null,
    slotIndex: number,
    type: 'startTime' | 'endTime'
  ) => {
    setTimeSlots((prevSlots) => {
      const newSlots = [...prevSlots];
      newSlots[slotIndex] = {
        ...newSlots[slotIndex],
        [type]: time,
      };
      return newSlots;
    });
  };

  /**
   * Updates the slot type (period/break) for a specific slot
   * @param value - The selected slot type
   * @param slotIndex - Index of the slot to update
   */
  const handleSlotTypeChange = (value: any, slotIndex: number) => {
    setTimeSlots((prevSlots) => {
      const newSlots = [...prevSlots];
      newSlots[slotIndex] = {
        ...newSlots[slotIndex],
        slotType: value,
        // Reset breakType when changing slot type
        breakType: value === 'break' ? '' : undefined,
      };
      return newSlots;
    });
  };

  /**
   * Updates the break type for a specific slot
   * @param value - The selected break type
   * @param slotIndex - Index of the slot to update
   */
  const handleBreakTypeChange = (value: any, slotIndex: number) => {
    setTimeSlots((prevSlots) => {
      const newSlots = [...prevSlots];
      newSlots[slotIndex] = {
        ...newSlots[slotIndex],
        breakType: value,
      };
      return newSlots;
    });
  };
  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <Box display="flex" flexDirection="column" gap={2}>
        <form onSubmit={formik.handleSubmit}>
          <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '400px' }}>
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
                    error={formik.touched.schoolHours && Boolean(formik.errors.schoolHours)}
                    helperText={formik.touched.schoolHours && formik.errors.schoolHours}
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
                    label="Previous Class Slots"
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
                    error={formik.touched.totalSlots && Boolean(formik.errors.totalSlots)}
                    helperText={formik.touched.totalSlots && formik.errors.totalSlots}
                    size="small"
                    disabled={disabled}
                  />
                </ShakingTextField>
              </Grid>
            </Grid>

            {showTable && (
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
                          <TimePicker
                            value={value}
                            viewRenderers={{
                              hours: renderTimeViewClock,
                              minutes: renderTimeViewClock,
                              seconds: renderTimeViewClock,
                            }}
                            onChange={(newTime) => handleTimeChange(newTime, row.id, 'startTime')}
                            slotProps={{ textField: { size: 'small' } }}
                            disabled={disabled}
                          />
                        );
                      },
                    },
                    {
                      id: 'endTime',
                      label: 'End Time',
                      render(value, row) {
                        return (
                          <TimePicker
                            value={value}
                            viewRenderers={{
                              hours: renderTimeViewClock,
                              minutes: renderTimeViewClock,
                              seconds: renderTimeViewClock,
                            }}
                            onChange={(newTime) => handleTimeChange(newTime, row.id, 'endTime')}
                            slotProps={{ textField: { size: 'small' } }}
                            disabled={disabled}
                          />
                        );
                      },
                    },
                    {
                      id: 'slotType',
                      label: 'Slot Type',
                      render(value, row) {
                        return (
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <CustomSelect
                              label="Slot"
                              options={[
                                { value: 'period', label: 'Period' },
                                { value: 'break', label: 'Break' },
                              ]}
                              value={value}
                              onChange={(val: any) => handleSlotTypeChange(val, row.id)}
                              formControlProps={{ sx: { minWidth: '150px' } }}
                              disabled={disabled}
                            />
                            {value === 'break' && (
                              <CustomSelect
                                label="Break Type"
                                options={[
                                  { value: 'lunch', label: 'Lunch Break' },
                                  { value: 'short', label: 'Short Break' },
                                  { value: 'recess', label: 'Recess' },
                                  { value: 'prayer', label: 'Prayer Break' },
                                ]}
                                value={row.breakType || ''}
                                onChange={(val: any) => handleBreakTypeChange(val, row.id)}
                                formControlProps={{ sx: { minWidth: '150px' } }}
                                disabled={disabled}
                              />
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

          <DialogActions sx={{ flexShrink: 0, p: 2 }}>
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
        </form>
      </Box>
    </BackPopUpChecked>
  );
};
export default CreateSlotsForm;
