'use client';

import type { Dayjs } from 'dayjs';

import React, { useState, useCallback } from 'react';

import { Add } from '@mui/icons-material';
import { TimePicker, renderTimeViewClock } from '@mui/x-date-pickers';
import {
  Box,
  Grid,
  Button,
  MenuList,
  MenuItem,
  TextField,
  Typography,
  DialogActions,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

const LectureSlots = () => {
  const createSlotsDialog = useBoolean();
  const assignSlotsDialog = useBoolean();

  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <>
        {' '}
        <MenuList>
          <MenuItem
            onClick={() => {
              assignSlotsDialog.onTrue();
            }}
          >
            <Iconify icon="mdi:arrow-right-bold" />
            Assign to other class
          </MenuItem>
        </MenuList>
      </>
    ),
    [assignSlotsDialog]
  );
  return (
    <Box>
      <Box display="flex" gap={2} alignItems="center" justifyContent="flex-end" sx={{ mb: 1 }}>
        <Button
          startIcon={<Iconify icon="mdi:plus" />}
          variant="contained"
          size="small"
          onClick={createSlotsDialog.onTrue}
        >
          Create Slots
        </Button>
      </Box>
      <CustomizableTable
        tableId="time-schedule-management-setting-table"
        columns={[
          { id: 'className', label: 'Class' },
          { id: 'periodSlots', label: 'Period Slots' },
          { id: 'breakSlots', label: 'Break Slots' },
          {
            id: 'actions',
            label: 'Actions',
            isSort: false,
            render(value, row) {
              return (
                <ThreeDotsActions
                  actions={(prop) => actions({ ...prop, row })}
                  showEditIcon
                  showViewIcon
                  handleViewClick={() => {}}
                  handleEditClick={() => {}}
                  placement="right-top"
                />
              );
            },
          },
        ]}
        data={[
          {
            id: 1,
            className: 'Class 1',
            periodSlots: 6, // Number of periods
            breakSlots: 2, // Number of breaks
          },
          {
            id: 2,
            className: 'Class 2',
            periodSlots: 5,
            breakSlots: 1,
          },
          {
            id: 3,
            className: 'Class 3',
            periodSlots: 7,
            breakSlots: 2,
          },
        ]}
      />

      <CustomDialog
        title="Create Slots"
        open={createSlotsDialog.value}
        handleClose={createSlotsDialog.onFalse}
        maxWidth="md"
      >
        <CreateSlotsForm
        // onSave={handleSave}
        // dialogValue={dialog.value}
        // onClose={closeDialog}
        // data={selectedEntry}
        // isEdit={isEdit}
        // allData={roomData}
        />
      </CustomDialog>

      <CustomDialog
        title="Assign this slot to another classes"
        open={assignSlotsDialog.value}
        handleClose={assignSlotsDialog.onFalse}
      >
        <AssignSlots />
      </CustomDialog>
    </Box>
  );
};

export default LectureSlots;

const AssignSlots = () => {
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });
  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <form onSubmit={() => {}}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '100px' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomSelect
                options={classData?.items || []}
                value={[]}
                onChange={(val) => {
                  //   formik.setFieldValue('className', val as string);
                }}
                label="Class"
                // isLoading={isLoading}
                multiple
                labelKey="name"
                valueKey="name"
                formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
              />
              {/* {formik.touched.className && formik.errors.className && (
                <FormHelperText error>{formik.errors.className}</FormHelperText>
              )} */}
            </Grid>
          </Grid>
        </Scrollbar>
        <DialogActions>
          <Button type="submit" variant="contained">
            Save
          </Button>
        </DialogActions>
      </form>
    </Box>
  );
};

interface TimeSlot {
  id: number;
  startTime: Dayjs | null;
  endTime: Dayjs | null;
  slotType: string;
  breakType?: string; // Optional field for break type
}

const CreateSlotsForm = () => {
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });
  const [totalSlots, setTotalSlots] = useState('');
  const [showTable, setShowTable] = useState(false);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  const handleCreateSlots = () => {
    const slotsCount = parseInt(totalSlots, 10);
    if (slotsCount > 0) {
      const newSlots = Array(slotsCount)
        .fill(null)
        .map((_, index) => ({
          id: index,
          startTime: null,
          endTime: null,
          slotType: 'period', // default value
        }));
      setTimeSlots(newSlots);
      setShowTable(true);
    }
  };

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
    <Box display="flex" flexDirection="column" gap={2}>
      <form onSubmit={() => {}}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '400px' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <CustomSelect
                options={classData?.items || []}
                value=""
                onChange={(val) => {
                  //   formik.setFieldValue('className', val as string);
                }}
                label="Class"
                // isLoading={isLoading}
                labelKey="name"
                valueKey="name"
                formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
              />
              {/* {formik.touched.className && formik.errors.className && (
                  <FormHelperText error>{formik.errors.className}</FormHelperText>
                )} */}
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="School Hours"
                name="schoolHours"
                //   value={formik.values.eventVenue}
                //   onChange={formik.handleChange}
                //   error={formik.touched.eventVenue && Boolean(formik.errors.eventVenue)}
                //   helperText={formik.touched.eventVenue && formik.errors.eventVenue}
                size="small"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <CustomSelect
                options={classData?.items || []}
                value=""
                onChange={(val) => {
                  //   formik.setFieldValue('className', val as string);
                }}
                label="Previous Class Slots"
                // isLoading={isLoading}
                labelKey="name"
                valueKey="name"
                formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
              />
              {/* {formik.touched.className && formik.errors.className && (
                  <FormHelperText error>{formik.errors.className}</FormHelperText>
                )} */}
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Total Slots"
                name="totalSlots"
                type="number"
                value={totalSlots}
                onChange={(e) => setTotalSlots(e.target.value)}
                size="small"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Button
                startIcon={<Add />}
                size="small"
                variant="contained"
                onClick={handleCreateSlots}
              >
                Create Slots
              </Button>
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
                            onChange={(val: any) => {
                              handleSlotTypeChange(val, row.id);
                            }}
                            formControlProps={{ sx: { minWidth: '150px' } }}
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
                              onChange={(val: any) => {
                                handleBreakTypeChange(val, row.id);
                              }}
                              formControlProps={{ sx: { minWidth: '150px' } }}
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
        <DialogActions>
          <Button type="submit" variant="contained">
            Save
          </Button>
        </DialogActions>
      </form>
    </Box>
  );
};
