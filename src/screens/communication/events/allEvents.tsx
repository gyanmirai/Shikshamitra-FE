import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useState } from 'react';

import { Search as SearchIcon } from '@mui/icons-material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { Box, Grid, TextField, IconButton, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';

import { CalendarView } from 'src/sections/calendar/view';

const AllEvents = (props: TabComponentType) => {
  const [selectedEvent, setSelectedEvent] = useState('');
  const addEventDialog = useBoolean();
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">Events and Calendar</Typography>
        {/* <Button
          startIcon={<Iconify icon="mdi:plus" />}
          variant="contained"
          onClick={() => {
            addEventDialog.onTrue();
          }}
        >
          Add New Event
        </Button> */}
      </Box>{' '}
      <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
        <CustomSelect
          options={[
            { value: 'schoolWise', label: 'School Wise' },
            { value: 'classWise', label: 'Class Wise' },
            { value: 'extraCurricular', label: 'Extra Curricular' },
          ]}
          value={selectedEvent}
          onChange={(val) => {
            setSelectedEvent(val as string);
          }}
          label="Filter Event"
          formControlProps={{ sx: { minWidth: 200 } }}
        />
        <TextField
          label="Search Event"
          variant="outlined"
          size="small"
          value=""
          onChange={() => {}}
          InputProps={{
            endAdornment: (
              <IconButton size="small">
                <SearchIcon />
              </IconButton>
            ),
          }}
        />
      </Box>
      <CalendarView />
      <CustomDialog
        title="Create New Event"
        open={addEventDialog.value}
        handleClose={addEventDialog.onFalse}
        maxWidth="sm"
      >
        <AddEvent onSubmit={() => {}} />
      </CustomDialog>
    </Box>
  );
};

interface AddEventProps {
  onSubmit: () => void;
}
export default AllEvents;

const AddEvent: React.FC<AddEventProps> = ({ onSubmit }) => {
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <form onSubmit={() => {}}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '300px' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Event Title"
                name="eventTitle"
                //   value={formik.values.title}
                //   onChange={formik.handleChange}
                //   error={formik.touched.title && Boolean(formik.errors.title)}
                //   helperText={formik.touched.title && formik.errors.title}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Event Venue"
                name="eventVenue"
                //   value={formik.values.eventVenue}
                //   onChange={formik.handleChange}
                //   error={formik.touched.eventVenue && Boolean(formik.errors.eventVenue)}
                //   helperText={formik.touched.eventVenue && formik.errors.eventVenue}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <CustomSelect
                label="Select Organizations"
                options={[
                  { value: 'Pre Primary', label: 'Pre Primary' },
                  { value: 'Primary', label: 'Primary' },
                  { value: 'Secondary', label: 'Secondary' },
                  { value: 'Higher Secondary', label: 'Higher Secondary' },
                ]}
                value={[]}
                onChange={(val) => {
                  // formik.setFieldValue('organization', val);
                }}
                multiple
                formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
              />
              {/* {formik.touched.organization && formik.errors.organization && (
              <FormHelperText error>{String(formik.errors.organization)}</FormHelperText>
            )} */}
            </Grid>

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
              <DatePicker
                label="Event Date"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TimePicker
                label="Event Time"
                format="HH:mm"
                onChange={() => {}}
                views={['hours', 'minutes']}
                slotProps={{ textField: { fullWidth: true, size: 'small' } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <CustomSelect
                options={[
                  { value: 'academic', label: 'Academic' },
                  { value: 'cultural', label: 'Cultural' },
                  { value: 'sports', label: 'Sports' },
                  { value: 'Parent Teacher Meeting', label: 'Parent Teacher Meeting' },
                ]}
                value=""
                onChange={(val) => {
                  //   formik.setFieldValue('className', val as string);
                }}
                label="Event Type"
                formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
              />
              {/* {formik.touched.className && formik.errors.className && (
                <FormHelperText error>{formik.errors.className}</FormHelperText>
              )} */}
            </Grid>

            <Grid item xs={12} sm={6}>
              <CustomSelect
                label="Select Audience"
                options={[
                  { value: 'Students', label: 'Students' },
                  { value: 'Parents', label: 'Parents' },
                ]}
                multiple
                value={[]}
                onChange={(val) => {
                  //   formik.setFieldValue('audience', val as string);
                }}
                formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
              />
              {/* {formik.touched.audience && formik.errors.audience && (
                <FormHelperText error>{formik.errors.audience}</FormHelperText>
              )} */}
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Event Description"
                name="description"
                multiline
                // value={formik.values.description}
                // onChange={formik.handleChange}
                // error={formik.touched.description && Boolean(formik.errors.description)}
                // helperText={formik.touched.description && formik.errors.description}
                size="small"
                rows={4}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Event Organizer"
                name="description"
                // value={formik.values.description}
                // onChange={formik.handleChange}
                // error={formik.touched.description && Boolean(formik.errors.description)}
                // helperText={formik.touched.description && formik.errors.description}
                size="small"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Event Budget"
                name="description"
                // value={formik.values.description}
                // onChange={formik.handleChange}
                // error={formik.touched.description && Boolean(formik.errors.description)}
                // helperText={formik.touched.description && formik.errors.description}
                size="small"
              />
            </Grid>
          </Grid>
        </Scrollbar>
      </form>
    </Box>
  );
};
