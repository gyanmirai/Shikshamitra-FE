'use client';

import type { RootState } from 'src/redux/store';
import type { Standards, Organization } from 'src/types/school';

import dayjs from 'dayjs';
import { isNaN } from 'lodash';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import Slider from '@mui/material/Slider';
import { GlobalIcons } from 'src/utils/icons';
import AddIcon from '@mui/icons-material/Add';
import { styled } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import React, { useState, useEffect } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import { TimePicker, renderTimeViewClock } from '@mui/x-date-pickers';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import {
  Box,
  Grid,
  Stack,
  Button,
  Divider,
  TextField,
  Accordion,
  Typography,
  IconButton,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import { getInitialValues } from './initialValues';
import { getValidationSchema } from './validationSchema';

import type { ICreateSlotsFormProps } from './type';

// Update the styled component with modern design
const DayRangeSlider = styled(Slider)(({ theme }) => ({
  maxWidth: 380,
  height: 6,
  padding: '10px 0',
  '& .MuiSlider-track': {
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.palette.primary.main,
    border: 'none',
  },
  '& .MuiSlider-rail': {
    height: 6,
    borderRadius: 3,
    backgroundColor:
      theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.12)' : theme.palette.grey[300],
    opacity: 1,
  },
  '& .MuiSlider-thumb': {
    height: 18,
    width: 18,
    backgroundColor: theme.palette.grey[100],
    border: `2px solid ${theme.palette.grey[400]}`,
    boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
    '&:hover, &.Mui-focusVisible': {
      boxShadow: `0 0 0 6px ${
        theme.palette.mode === 'dark' ? 'rgba(160,160,160,0.25)' : 'rgba(0,0,0,0.08)'
      }`,
    },
    '&.Mui-active': {
      boxShadow: `0 0 0 8px ${
        theme.palette.mode === 'dark' ? 'rgba(160,160,160,0.30)' : 'rgba(0,0,0,0.10)'
      }`,
    },
    '&:before': { display: 'none' },
  },
  '& .MuiSlider-mark': {
    height: 10,
    width: 3,
    borderRadius: 2,
    backgroundColor: theme.palette.grey[400],
    top: '50%',
    transform: 'translateY(-50%)',
    '&.MuiSlider-markActive': {
      backgroundColor: theme.palette.grey[500],
    },
  },
  '& .MuiSlider-markLabel': {
    fontSize: '0.7rem',
    fontWeight: 500,
    color: theme.palette.text.secondary,
    top: 28,
    '&.MuiSlider-markLabelActive': {
      color: theme.palette.text.primary,
      fontWeight: 600,
    },
  },
  '&.Mui-disabled': {
    '& .MuiSlider-track': { backgroundColor: theme.palette.action.disabled },
    '& .MuiSlider-thumb': { borderColor: theme.palette.action.disabled },
  },
}));

const dayMarks = [
  { value: 0, label: 'Mon' },
  { value: 1, label: 'Tue' },
  { value: 2, label: 'Wed' },
  { value: 3, label: 'Thu' },
  { value: 4, label: 'Fri' },
  { value: 5, label: 'Sat' },
];

const CreateSlotsForm: React.FC<ICreateSlotsFormProps> = ({
  open,
  handleClose,
  disabled,
  isEdit,
  data,
}) => {
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [classes, setClasses] = useState<string>('');

  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  useEffect(() => {
    const allClasses =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];
    setAllClass(allClasses);
    setClasses(allClasses[0]?.id || '');
  }, [medium]);

  const formik = useFormik({
    initialValues: getInitialValues(classes, data),
    validationSchema: getValidationSchema('07:00 AM', '12:30 PM'),
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: (values) => {
      shikshaMitraToast.success({
        message: `Lecture slots have been successfully ${isEdit ? 'updated' : 'created'} for ${values.className}.`,
      });
      handleClose?.(null, true);
    },
  });

  // Ensure at least one slot configuration + one slot on mount
  useEffect(() => {
    if (formik.values.slotConfigurations.length === 0) {
      const start = dayjs().hour(7).minute(0).second(0).millisecond(0);
      const firstSlot = {
        id: `0-0`,
        startTime: start,
        endTime: start.add(30, 'minute'),
        slotType: 'period',
        breakType: '',
      };
      formik.setFieldValue('slotConfigurations', [
        {
          id: Date.now().toString(),
          totalSlots: '1',
          weekRange: [0, 5],
          timeSlots: [firstSlot],
          expanded: true,
        },
      ]);
    } else if (
      formik.values.slotConfigurations[0].timeSlots.length === 0 &&
      !formik.values.slotConfigurations[0].totalSlots
    ) {
      // Populate first config with one slot if empty
      const start = dayjs().hour(7).minute(0).second(0).millisecond(0);
      const firstSlot = {
        id: `0-0`,
        startTime: start,
        endTime: start.add(30, 'minute'),
        slotType: 'period',
        breakType: '',
      };
      formik.setFieldValue('slotConfigurations[0].totalSlots', '1');
      formik.setFieldValue('slotConfigurations[0].timeSlots', [firstSlot]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddSlotConfiguration = () => {
    const start = dayjs().hour(7).minute(0).second(0).millisecond(0);
    const firstSlot = {
      id: `${Date.now()}-0`,
      startTime: start,
      endTime: start.add(30, 'minute'),
      slotType: 'period',
      breakType: '',
    };
    const newConfig = {
      id: Date.now().toString(),
      totalSlots: '1',
      weekRange: [0, 5],
      timeSlots: [firstSlot],
      expanded: true,
    };
    formik.setFieldValue('slotConfigurations', [...formik.values.slotConfigurations, newConfig]);
  };

  const handleRemoveSlotConfiguration = (index: number) => {
    if (formik.values.slotConfigurations.length === 1) {
      shikshaMitraToast.error({ message: 'At least one slot configuration is required' });
      return;
    }
    const updated = formik.values.slotConfigurations.filter((_: any, i: number) => i !== index);
    formik.setFieldValue('slotConfigurations', updated);
  };

  const handleTotalSlotsChange = (configIndex: number, value: string) => {
    const slotsCount = parseInt(value, 10);

    // Update totalSlots value
    formik.setFieldValue(`slotConfigurations[${configIndex}].totalSlots`, value);

    // Mark the field as touched to trigger validation
    formik.setFieldTouched(`slotConfigurations[${configIndex}].totalSlots`, true, false);

    // Validate the field immediately
    setTimeout(() => {
      formik.validateField(`slotConfigurations[${configIndex}].totalSlots`);
    }, 0);

    // If invalid, clear timeSlots
    if (!value || isNaN(slotsCount) || slotsCount < 1 || slotsCount > 20) {
      formik.setFieldValue(`slotConfigurations[${configIndex}].timeSlots`, []);
      return;
    }

    // Auto-generate slots
    let currentTime = dayjs().hour(7).minute(0).second(0).millisecond(0);

    const newSlots = Array(slotsCount)
      .fill(null)
      .map((_, index) => {
        const startTime = currentTime;
        const endTime = currentTime.add(30, 'minute');
        currentTime = endTime;
        return {
          id: `${configIndex}-${index}`,
          startTime,
          endTime,
          slotType: 'period',
          breakType: '',
        };
      });

    formik.setFieldValue(`slotConfigurations[${configIndex}].timeSlots`, newSlots);
  };

  const handleToggleAccordion = (configIndex: number) => {
    const currentExpanded = formik.values.slotConfigurations[configIndex].expanded;
    formik.setFieldValue(`slotConfigurations[${configIndex}].expanded`, !currentExpanded);
  };

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 200px)',
          position: 'relative',
        }}
      >
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            p: 2,
            pb: 10,
          }}
        >
          {/* General Information */}
          <Box sx={{ width: '100%', mb: 2 }}>
            <Typography variant="h6" color="primary.main" mb={2}>
              General Information
            </Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <ShakingTextField error={!!(formik.touched.className && formik.errors.className)}>
                <CustomSelect
                  options={allClass}
                  value={formik.values.className}
                  onChange={(val) => formik.setFieldValue('className', val as string)}
                  label="Class *"
                  labelKey="name"
                  valueKey="name"
                  formControlProps={{ fullWidth: true }}
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

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <ShakingTextField error={!!(formik.touched.schoolHours && formik.errors.schoolHours)}>
                <TextField
                  fullWidth
                  label="School Hours *"
                  name="schoolHours"
                  value={formik.values.schoolHours || '07:00 AM - 12:30 PM'}
                  onChange={formik.handleChange}
                  size="small"
                  disabled
                />
              </ShakingTextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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
                  formControlProps={{ fullWidth: true }}
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
          </Grid>

          {/* Add Slot Configuration Button */}
          {!disabled && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, mb: 1 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<AddIcon />}
                onClick={handleAddSlotConfiguration}
              >
                Slots
              </Button>
            </Box>
          )}

          {/* Slot Configurations */}
          {formik.values.slotConfigurations.map(
            (
              config: {
                id: React.Key | null | undefined;
                expanded: boolean | undefined;
                totalSlots: unknown;
                weekRange: number | number[] | undefined;
                timeSlots: any[];
              },
              configIndex: number
            ) => (
              <Accordion
                key={config.id}
                expanded={config.expanded}
                onChange={() => handleToggleAccordion(configIndex)}
                sx={{
                  boxShadow: 1,
                  borderRadius: '12px !important',
                  '&:before': { display: 'none' },
                  border: '1px solid',
                  borderColor: 'divider',
                  mt: 2,
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    '& .MuiAccordionSummary-content': {
                      my: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      gap: 2,
                    },
                  }}
                >
                  {/* Show detailed info when collapsed, simple title when expanded */}
                  {!config.expanded ? (
                    <Stack
                      direction="row"
                      spacing={3}
                      alignItems="center"
                      sx={{ flexWrap: 'wrap', width: '100%' }}
                    >
                      {/* Total Slots */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 120 }}>
                        <Iconify icon="mdi:clock-outline" width={18} color="text.secondary" />
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Total Slots:
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {String(config.totalSlots || 0)}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Active Days */}
                      {Array.isArray(config.weekRange) && config.weekRange.length === 2 && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 120 }}>
                          <Iconify icon="mdi:calendar-week" width={18} color="text.secondary" />
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Active Days:
                            </Typography>
                            <Typography variant="body2" fontWeight={600}>
                              {getDayLabel(config.weekRange[0])} -{' '}
                              {getDayLabel(config.weekRange[1])}
                            </Typography>
                          </Box>
                        </Box>
                      )}

                      {/* Time Range */}
                      {config.timeSlots?.length > 0 && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 150 }}>
                          <Iconify
                            icon="mdi:clock-time-four-outline"
                            width={18}
                            color="text.secondary"
                          />
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Time Range:
                            </Typography>
                            <Typography variant="body2" fontWeight={600}>
                              {dayjs(config.timeSlots[0].startTime).format('hh:mm A')} -{' '}
                              {dayjs(config.timeSlots[config.timeSlots.length - 1].endTime).format(
                                'hh:mm A'
                              )}
                            </Typography>
                          </Box>
                        </Box>
                      )}
                    </Stack>
                  ) : (
                    <Typography variant="subtitle2" fontWeight={600}>
                      Slot Configuration
                    </Typography>
                  )}

                  {formik.values.slotConfigurations.length > 1 && !disabled && (
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveSlotConfiguration(configIndex);
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </AccordionSummary>

                <AccordionDetails sx={{ pt: 0 }}>
                  <Box width="100%">
                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12, md: 5 }}>
                        <Box
                          sx={{
                            px: 2,
                            pt: 1,
                            pb: 2,
                            borderRadius: 2,
                            backgroundColor: (theme) =>
                              theme.palette.mode === 'dark'
                                ? 'rgba(255,255,255,0.02)'
                                : 'rgba(0,0,0,0.02)',
                            border: (theme) =>
                              `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                            <Iconify icon="mdi:calendar-week" width={20} color="primary.main" />
                            <Typography
                              variant="subtitle2"
                              color="primary.main"
                              sx={{ fontWeight: 600 }}
                            >
                              Active Days
                            </Typography>
                          </Box>

                          <Box sx={{ px: 1 }}>
                            <DayRangeSlider
                              value={config.weekRange}
                              marks={dayMarks}
                              min={0}
                              max={5}
                              step={1}
                              track="inverted"
                              onChange={(_, newValue) =>
                                formik.setFieldValue(
                                  `slotConfigurations[${configIndex}].weekRange`,
                                  newValue
                                )
                              }
                              valueLabelDisplay="off"
                              disableSwap
                              disabled={disabled}
                            />
                          </Box>
                        </Box>
                      </Grid>

                      {/* Total Slots */}
                      <Grid size={{ xs: 12, md: 3 }}>
                        <TextField
                          fullWidth
                          label="Total Slots *"
                          type="number"
                          inputProps={{ min: 0, max: 20 }}
                          value={config.totalSlots != null ? String(config.totalSlots) : ''}
                          onChange={(e) => handleTotalSlotsChange(configIndex, e.target.value)}
                          onKeyDown={(e) => {
                            if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault();
                          }}
                          onWheel={(e) => {
                            (e.target as HTMLElement).blur();
                          }}
                          size="small"
                          disabled={disabled || (isEdit && !!data)}
                          error={Boolean(
                            formik.touched.slotConfigurations &&
                            Array.isArray(formik.touched.slotConfigurations) &&
                            formik.touched.slotConfigurations[configIndex] &&
                            typeof formik.touched.slotConfigurations[configIndex] === 'object' &&
                            (formik.touched.slotConfigurations[configIndex] as any)?.totalSlots &&
                            formik.errors.slotConfigurations &&
                            Array.isArray(formik.errors.slotConfigurations) &&
                            formik.errors.slotConfigurations[configIndex] &&
                            typeof formik.errors.slotConfigurations[configIndex] === 'object' &&
                            (formik.errors.slotConfigurations[configIndex] as any)?.totalSlots
                          )}
                          helperText={
                            formik.touched.slotConfigurations &&
                            Array.isArray(formik.touched.slotConfigurations) &&
                            formik.touched.slotConfigurations[configIndex] &&
                            typeof formik.touched.slotConfigurations[configIndex] === 'object' &&
                            (formik.touched.slotConfigurations[configIndex] as any)?.totalSlots &&
                            formik.errors.slotConfigurations &&
                            Array.isArray(formik.errors.slotConfigurations) &&
                            formik.errors.slotConfigurations[configIndex] &&
                            typeof formik.errors.slotConfigurations[configIndex] === 'object'
                              ? ((formik.errors.slotConfigurations[configIndex] as any)
                                  ?.totalSlots as string)
                              : undefined
                          }
                        />
                      </Grid>

                      {/* Slot Times Table - Only show if slots exist */}
                      {config.timeSlots && config.timeSlots.length > 0 && (
                        <Grid size={{ xs: 12 }}>
                          <Divider sx={{ my: 2 }} />
                          <Typography variant="subtitle2" color="primary.main" gutterBottom>
                            Slot Times
                          </Typography>
                          <Box sx={{ overflowX: 'auto', width: '100%' }}>
                            <CustomizableTable
                              tableContainerProps={{
                                sx: { maxHeight: '300px', minWidth: '800px' },
                              }}
                              tableId={`time-schedule-${config.id}`}
                              isSearch={false}
                              isFilter={false}
                              isPagination
                              columns={[
                                {
                                  id: 'startTime',
                                  label: 'Start Time',
                                  minWidth: 150,
                                  render(value, row) {
                                    const rowIndex = config.timeSlots.findIndex(
                                      (s) => s.id === row.id
                                    );
                                    return (
                                      <TimePicker
                                        value={dayjs(value) || null}
                                        format="hh:mm a"
                                        views={['hours', 'minutes']}
                                        disabled={disabled && !isEdit}
                                        ampm
                                        onChange={(newTime) => {
                                          const updated = [...config.timeSlots];
                                          updated[rowIndex].startTime = newTime?.isValid?.()
                                            ? dayjs(newTime)
                                            : null;
                                          formik.setFieldValue(
                                            `slotConfigurations[${configIndex}].timeSlots`,
                                            updated
                                          );
                                        }}
                                        slotProps={{
                                          textField: {
                                            size: 'small',
                                            sx: { width: '135px', mb: 1 },
                                          },
                                        }}
                                        viewRenderers={{
                                          hours: renderTimeViewClock,
                                          minutes: renderTimeViewClock,
                                          seconds: renderTimeViewClock,
                                        }}
                                      />
                                    );
                                  },
                                },
                                {
                                  id: 'endTime',
                                  label: 'End Time',
                                  minWidth: 150,
                                  render(value, row) {
                                    const rowIndex = config.timeSlots.findIndex(
                                      (s) => s.id === row.id
                                    );
                                    const isLast = rowIndex === config.timeSlots.length - 1;
                                    return (
                                      <TimePicker
                                        value={dayjs(value) || null}
                                        disabled={(disabled && !isEdit) || isLast}
                                        format="hh:mm a"
                                        views={['hours', 'minutes']}
                                        ampm
                                        onChange={(newTime) => {
                                          const updated = [...config.timeSlots];
                                          updated[rowIndex].endTime = newTime?.isValid?.()
                                            ? dayjs(newTime)
                                            : null;
                                          formik.setFieldValue(
                                            `slotConfigurations[${configIndex}].timeSlots`,
                                            updated
                                          );
                                        }}
                                        slotProps={{
                                          textField: {
                                            size: 'small',
                                            sx: { width: '140px', mb: 1 },
                                          },
                                        }}
                                        viewRenderers={{
                                          hours: renderTimeViewClock,
                                          minutes: renderTimeViewClock,
                                          seconds: renderTimeViewClock,
                                        }}
                                      />
                                    );
                                  },
                                },
                                {
                                  id: 'totalTime',
                                  label: 'Total Time',
                                  minWidth: 150,
                                  render(_, row) {
                                    const rowIndex = config.timeSlots.findIndex(
                                      (s) => s.id === row.id
                                    );
                                    const startTime = config.timeSlots[rowIndex]?.startTime;
                                    const endTime = config.timeSlots[rowIndex]?.endTime;
                                    let duration = null;
                                    if (startTime && endTime) {
                                      const totalMinutes = dayjs(endTime).diff(
                                        dayjs(startTime),
                                        'minute'
                                      );
                                      duration = dayjs().hour(0).minute(totalMinutes);
                                    }
                                    return (
                                      <TimePicker
                                        value={duration}
                                        format="HH:mm"
                                        views={['hours', 'minutes']}
                                        disabled
                                        slotProps={{
                                          textField: {
                                            size: 'small',
                                            sx: { width: '130px', mb: 1 },
                                          },
                                        }}
                                      />
                                    );
                                  },
                                },

                                {
                                  id: 'slotType',
                                  label: 'Slot Type',
                                  minWidth: 350,
                                  align: 'left',
                                  render(value, row) {
                                    const rowIndex = config.timeSlots.findIndex(
                                      (s) => s.id === row.id
                                    );
                                    return (
                                      <Box sx={{ display: 'flex', gap: 1, minWidth: '320px' }}>
                                        <CustomSelect
                                          label="Slot *"
                                          options={[
                                            { value: 'period', label: 'Period' },
                                            { value: 'break', label: 'Break' },
                                          ]}
                                          disabled={disabled && !isEdit}
                                          value={value}
                                          onChange={(val: any) => {
                                            const updated = [...config.timeSlots];
                                            updated[rowIndex].slotType = val;
                                            if (val !== 'break') updated[rowIndex].breakType = '';
                                            formik.setFieldValue(
                                              `slotConfigurations[${configIndex}].timeSlots`,
                                              updated
                                            );
                                          }}
                                          formControlProps={{
                                            sx: { minWidth: '150px' },
                                            size: 'small',
                                          }}
                                        />
                                        {config.timeSlots[rowIndex]?.slotType === 'break' && (
                                          <CustomSelect
                                            label="Break *"
                                            options={[
                                              { value: 'short', label: 'Short Break' },
                                              { value: 'lunch', label: 'Lunch Break' },
                                            ]}
                                            disabled={disabled && !isEdit}
                                            value={config.timeSlots[rowIndex]?.breakType}
                                            onChange={(val: any) => {
                                              const updated = [...config.timeSlots];
                                              updated[rowIndex].breakType = val;
                                              formik.setFieldValue(
                                                `slotConfigurations[${configIndex}].timeSlots`,
                                                updated
                                              );
                                            }}
                                            formControlProps={{
                                              sx: { minWidth: '150px' },
                                              size: 'small',
                                            }}
                                          />
                                        )}
                                      </Box>
                                    );
                                  },
                                },
                              ]}
                              data={config.timeSlots}
                            />
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                </AccordionDetails>
              </Accordion>
            )
          )}
        </Box>

        {/* Sticky Footer with Buttons */}
        {!disabled && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 10,
              left: 0,
              right: 0,
              bgcolor: 'background.paper',
              borderTop: '1px solid',
              borderColor: 'divider',
              px: 3,
              py: 2,
              display: 'flex',
              gap: 1,
              justifyContent: 'flex-end',
              zIndex: 10,
              boxShadow: '0 -2px 8px rgba(0,0,0,0.08)',
            }}
          >
            <Button
              variant="text"
              size="small"
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
              onClick={() => handleClose?.(null, false)}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<Iconify icon={GlobalIcons.submit} />}
              onClick={() => formik.handleSubmit()}
            >
              Submit
            </Button>
          </Box>
        )}
      </Box>
    </BackPopUpChecked>
  );
};

export default CreateSlotsForm;

export const getDayLabel = (v: number) => dayMarks.find((d) => d.value === v)?.label || '';
