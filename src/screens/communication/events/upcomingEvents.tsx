import type { Dayjs } from 'dayjs';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import React, { useState } from 'react';

import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import {
  Box,
  Grid,
  Chip,
  Button,
  MenuList,
  MenuItem,
  TextField,
  IconButton,
  Typography,
  DialogActions,
  DialogContent,
  FormHelperText,
  DialogContentText,
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

interface Event {
  id: string;
  eventTitle: string;
  eventVenue: string;
  organization: string[];
  className: string[];
  eventDate: Dayjs;
  eventTime: Dayjs;
  eventType: string;
  audience: string[];
  description: string;
  eventOrganizer: string;
  eventBudget: string;
}

const eventsData: Event[] = [
  {
    id: '1',
    eventTitle: 'Science Exhibition',
    eventVenue: 'Main Hall',
    organization: ['Secondary', 'Higher Secondary'],
    className: ['9'],
    eventDate: dayjs('2024-11-10'),
    eventTime: dayjs('10:00'),
    eventType: 'Academic',
    audience: ['Students', 'Parents'],
    description: 'A science exhibition showcasing various projects from students.',
    eventOrganizer: 'Science Department',
    eventBudget: '5000',
  },
  {
    id: '2',
    eventTitle: 'Annual Sports Day',
    eventVenue: 'Sports Ground',
    organization: ['Primary', 'Secondary'],
    className: ['5'],
    eventDate: dayjs('2024-11-15'),
    eventTime: dayjs('09:00'),
    eventType: 'Sports',
    audience: ['Students', 'Parents', 'Staff'],
    description: 'A day of various sports competitions among classes.',
    eventOrganizer: 'Sports Department',
    eventBudget: '8000',
  },
  {
    id: '3',
    eventTitle: 'Parent-Teacher Meeting',
    eventVenue: 'Classroom A1',
    organization: ['Primary'],
    className: ['3'],
    eventDate: dayjs('2024-11-20'),
    eventTime: dayjs('14:00'),
    eventType: 'Parent Teacher Meeting',
    audience: ['Parents'],
    description: 'Discussion on student performance and upcoming plans for the academic year.',
    eventOrganizer: 'Class Teacher',
    eventBudget: '1000',
  },
  {
    id: '4',
    eventTitle: 'Cultural Fest',
    eventVenue: 'Auditorium',
    organization: ['Secondary', 'Higher Secondary'],
    className: ['10'],
    eventDate: dayjs('2024-12-05'),
    eventTime: dayjs('11:00'),
    eventType: 'Cultural',
    audience: ['Students', 'Parents'],
    description: 'A festival celebrating diverse cultures with performances and exhibitions.',
    eventOrganizer: 'Cultural Committee',
    eventBudget: '7000',
  },
  {
    id: '5',
    eventTitle: 'Workshop on Digital Learning',
    eventVenue: 'Library Hall',
    organization: ['Higher Secondary'],
    className: ['12'],
    eventDate: dayjs('2024-12-15'),
    eventTime: dayjs('12:30'),
    eventType: 'Academic',
    audience: ['Students', 'Staff'],
    description: 'A workshop to enhance digital learning skills among students and teachers.',
    eventOrganizer: 'Cultural Committee',
    eventBudget: '7000',
  },
];

const UpcomingEvents = (props: TabComponentType) => {
  const [event, setEvent] = useState<Event>();
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const [eventTableData, setEventTableData] = useState<Event[]>(eventsData);
  const [deleteEvent, setDeleteEvent] = useState('');
  const openShowDialog = useBoolean();
  const confirm_dialog = useBoolean();
  const addEventDialog = useBoolean();

  const handleEyeClick = (id: string) => {
    const data = eventTableData.find((eve: any) => eve.id === id);
    setEvent(data);
    openShowDialog.onTrue();
  };

  const handleDelete = (id: string) => {
    setEventTableData((prevData) => prevData.filter((eve) => eve.id !== id));
    confirm_dialog.onFalse();
  };

  const handleSubmit = (values: any) => {
    if (editingEvent) {
      console.log('editing announcement---', editingEvent);

      setEventTableData((prevData) =>
        prevData.map((eve) =>
          eve.id === editingEvent.id ? { ...values, id: editingEvent.id } : event
        )
      );
    } else {
      const newEvent = {
        ...values,
        id: String(eventTableData.length + 1),
      };
      setEventTableData((prevData) => [...prevData, newEvent]);
    }
    handleCloseDialog();
  };

  const handleCloseDialog = () => {
    setEditingEvent(null);
    addEventDialog.onFalse();
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Upcoming Events</Typography>
        <Button
          startIcon={<Iconify icon="mdi:plus" />}
          variant="contained"
          onClick={() => {
            addEventDialog.onTrue();
          }}
        >
          Add New Event
        </Button>
      </Box>{' '}
      <CustomizableTable
        columns={[
          { id: 'eventTitle', label: 'Event Title' },
          { id: 'eventVenue', label: 'Event Venue' },
          { id: 'eventType', label: 'Event Type' },
          {
            id: 'eventDate',
            label: 'Date',
            render: (value, row) => (
              <Typography fontSize="12px" gutterBottom>
                {dayjs(value).format('DD MMM YYYY')}
              </Typography>
            ),
          },
          {
            id: 'eventTime',
            label: 'Time',
            render: (value, row) => (
              <Typography fontSize="12px" gutterBottom>
                {dayjs(value).format('HH:mm')}
              </Typography>
            ),
          },
          {
            id: 'audience',
            label: 'Audience',
            render: (value) => (
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {value.map((audience: string) => (
                  <Chip
                    key={audience}
                    label={audience}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            ),
          },
          {
            id: 'organization',
            label: 'Organizations',
            render: (value) => (
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {value.map((org: string) => (
                  <Chip key={org} label={org} size="small" variant="outlined" />
                ))}
              </Box>
            ),
          },
          {
            id: 'className',
            label: 'Class',
            render: (value) => (
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {value.map((className: string) => (
                  <Chip
                    key={className}
                    label={className}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            ),
          },
          {
            id: 'details',
            label: 'View Details',
            render(value, row) {
              return (
                <IconButton
                  onClick={() => {
                    handleEyeClick(row.id);
                  }}
                >
                  <Iconify icon="mdi:eye" />
                </IconButton>
              );
            },
          },
          { id: 'eventOrganizer', label: 'Event Organizer' },
          { id: 'eventBudget', label: 'Event Budget' },
          {
            id: 'action',
            label: 'Action',
            render: (_, row) => (
              <ThreeDotsActions
                placement="right-top"
                actions={({ popover }) => (
                  <MenuList>
                    <MenuItem
                      onClick={() => {
                        addEventDialog.onTrue();
                        setEditingEvent(row);
                      }}
                    >
                      <Iconify icon="mdi:pencil" sx={{ mr: 1 }} />
                      Edit
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        confirm_dialog.onTrue();
                        setDeleteEvent(row.id);
                      }}
                    >
                      <Iconify icon="mdi:delete" sx={{ mr: 1 }} />
                      Delete
                    </MenuItem>
                  </MenuList>
                )}
              />
            ),
          },
        ]}
        data={eventTableData}
      />
      <CustomDialog
        title="Event Details"
        open={openShowDialog.value}
        handleClose={openShowDialog.onFalse}
        maxWidth="sm"
      >
        {event && (
          <Box p={2}>
            <Typography variant="h6" gutterBottom>
              {event.eventTitle}
            </Typography>

            <Box display="flex" flexDirection="column" gap={2}>
              <Typography variant="body1">
                <strong>Organizer:</strong> {event.eventOrganizer}
              </Typography>
              <Typography variant="body1">
                <strong>Date:</strong> {event.eventDate.format('YYYY-MM-DD')}
              </Typography>
              <Typography variant="body1">
                <strong>Time:</strong> {event.eventTime.format('HH:mm')}
              </Typography>
              <Typography variant="body1">
                <strong>Venue:</strong> {event.eventVenue}
              </Typography>
              <Typography variant="body1">
                <strong>Type:</strong> {event.eventType}
              </Typography>
              <Typography variant="body1">
                <strong>Audience:</strong> {event.audience.join(', ')}
              </Typography>
              <Typography variant="body1">
                <strong>Description:</strong> {event.description}
              </Typography>
              <Typography variant="body1">
                <strong>Budget:</strong> ${event.eventBudget.toLocaleString()}
              </Typography>
            </Box>
          </Box>
        )}
      </CustomDialog>
      <CustomDialog
        title="Confirm Delete"
        open={confirm_dialog.value}
        handleClose={() => {
          setDeleteEvent('');
          confirm_dialog.onFalse();
        }}
        maxWidth="sm"
      >
        <DialogContent>
          <DialogContentText>Are you sure to delete this Event?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={confirm_dialog.onFalse} variant="contained" color="error">
            Cancel
          </Button>
          <Button
            onClick={() => {
              handleDelete(deleteEvent);
            }}
            variant="contained"
            color="success"
          >
            Confirm
          </Button>
        </DialogActions>
      </CustomDialog>
      <CustomDialog
        title={editingEvent ? 'Edit Event' : 'Create Event'}
        open={addEventDialog.value}
        handleClose={handleCloseDialog}
        maxWidth="md"
      >
        <AddEvent initialValues={editingEvent} onSubmit={handleSubmit} isEdit={!!editingEvent} />
      </CustomDialog>
    </Box>
  );
};

export default UpcomingEvents;

interface EventFormValues {
  eventTitle: string;
  eventVenue: string;
  organization: string[];
  className: string[];
  eventDate: Dayjs | null;
  eventTime: Dayjs | null;
  eventType: string;
  audience: string[];
  description: string;
  eventOrganizer: string;
  eventBudget: string;
}

interface AddEventProps {
  onSubmit: (values: EventFormValues) => void;
  initialValues?: EventFormValues | null;
  isEdit?: boolean;
}

const AddEvent: React.FC<AddEventProps> = ({ onSubmit, initialValues = null, isEdit = false }) => {
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  const allOrganizations = [
    { value: 'Pre Primary', label: 'Pre Primary' },
    { value: 'Primary', label: 'Primary' },
    { value: 'Secondary', label: 'Secondary' },
    { value: 'Higher Secondary', label: 'Higher Secondary' },
  ];

  const [isAllOrganizationSelected, setIsAllOrganizationSelected] = useState(
    initialValues?.organization?.length === allOrganizations.length
  );

  const [isAllClassesSelected, setIsAllClassesSelected] = useState(
    initialValues?.className?.length === classData?.items?.length
  );

  const handleOrganizationChange = (selectedValues: string[]) => {
    if (selectedValues.includes('all') || selectedValues.includes('deselectAll')) {
      const allOrganizationValues = allOrganizations.map((org) => org.value);
      if (isAllOrganizationSelected) {
        formik.setFieldValue('organization', []);
      } else {
        formik.setFieldValue('organization', allOrganizationValues);
      }
      setIsAllOrganizationSelected(!isAllOrganizationSelected);
    } else {
      formik.setFieldValue('organization', selectedValues);
      setIsAllOrganizationSelected(selectedValues.length === allOrganizations.length);
    }
  };

  const handleClass = (selectedValues: string[]) => {
    const allClassesValues = classData?.items?.map((org: any) => org.name);
    if (selectedValues.includes('all') || selectedValues.includes('deselectAll')) {
      if (isAllClassesSelected) {
        formik.setFieldValue('className', []);
      } else {
        formik.setFieldValue('className', allClassesValues);
      }
      setIsAllClassesSelected(!isAllClassesSelected);
    } else {
      formik.setFieldValue('className', selectedValues);
      setIsAllClassesSelected(selectedValues.length === allClassesValues.length);
    }
  };

  const formik = useFormik({
    initialValues: {
      eventTitle: initialValues?.eventTitle || '',
      eventVenue: initialValues?.eventVenue || '',
      audience: initialValues?.audience || [],
      organization: initialValues?.organization || [],
      className: initialValues?.className || [],
      eventDate: initialValues?.eventDate ? dayjs(initialValues?.eventDate) : null,
      eventTime: initialValues?.eventTime ? dayjs(initialValues?.eventTime) : null,
      eventType: initialValues?.eventType || '',
      description: initialValues?.description || '',
      eventOrganizer: initialValues?.eventOrganizer || '',
      eventBudget: initialValues?.eventBudget || '',
    },
    onSubmit: (values) => {
      console.log('values------', values);
      onSubmit(values);
    },
  });

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <form onSubmit={formik.handleSubmit}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '300px' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Event Title"
                name="eventTitle"
                value={formik.values.eventTitle}
                onChange={formik.handleChange}
                error={formik.touched.eventTitle && Boolean(formik.errors.eventTitle)}
                helperText={formik.touched.eventTitle && formik.errors.eventTitle}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Event Venue"
                name="eventVenue"
                value={formik.values.eventVenue}
                onChange={formik.handleChange}
                error={formik.touched.eventVenue && Boolean(formik.errors.eventVenue)}
                helperText={formik.touched.eventVenue && formik.errors.eventVenue}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <CustomSelect
                label="Select Organizations"
                options={[
                  {
                    value: isAllOrganizationSelected ? 'deselectAll' : 'all',
                    label: isAllOrganizationSelected ? 'Deselect All' : 'All',
                  },
                  ...allOrganizations,
                ]}
                value={formik.values.organization}
                onChange={(val) => {
                  handleOrganizationChange(val as string[]);
                }}
                multiple
                formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
              />
              {formik.touched.organization && formik.errors.organization && (
                <FormHelperText error>{String(formik.errors.organization)}</FormHelperText>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <CustomSelect
                options={[
                  {
                    id: isAllClassesSelected ? 'deselectAll' : 'all',
                    name: isAllClassesSelected ? 'Deselect All' : 'All',
                  },
                  ...(classData?.items || []),
                ]}
                value={formik.values.className}
                onChange={(val) => {
                  handleClass(val as string[]);
                }}
                label="Class"
                isLoading={isLoading}
                multiple
                labelKey="name"
                valueKey="name"
                formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
              />
              {formik.touched.className && formik.errors.className && (
                <FormHelperText error>{formik.errors.className}</FormHelperText>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <DatePicker
                label="Event Date"
                name="eventDate"
                value={formik.values.eventDate}
                onChange={(newValue) => {
                  formik.setFieldValue('eventDate', newValue);
                }}
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
                name="eventTime"
                value={formik.values.eventTime}
                onChange={(newValue) => {
                  formik.setFieldValue('eventTime', newValue);
                }}
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
                value={formik.values.eventType}
                onChange={(val) => {
                  formik.setFieldValue('eventType', val as string);
                }}
                label="Event Type"
                formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
              />
              {formik.touched.eventType && formik.errors.eventType && (
                <FormHelperText error>{formik.errors.eventType}</FormHelperText>
              )}
            </Grid>

            <Grid item xs={12} sm={6}>
              <CustomSelect
                label="Select Audience"
                options={[
                  { value: 'Students', label: 'Students' },
                  { value: 'Parents', label: 'Parents' },
                ]}
                multiple
                value={formik.values.audience}
                onChange={(val) => {
                  formik.setFieldValue('audience', val as string[]);
                }}
                formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
              />
              {formik.touched.audience && formik.errors.audience && (
                <FormHelperText error>{formik.errors.audience}</FormHelperText>
              )}
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Event Description"
                name="description"
                multiline
                value={formik.values.description}
                onChange={formik.handleChange}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
                size="small"
                rows={4}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Event Organizer"
                name="eventOrganizer"
                value={formik.values.eventOrganizer}
                onChange={formik.handleChange}
                error={formik.touched.eventOrganizer && Boolean(formik.errors.eventOrganizer)}
                helperText={formik.touched.eventOrganizer && formik.errors.eventOrganizer}
                size="small"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Event Budget"
                name="eventBudget"
                value={formik.values.eventBudget}
                onChange={formik.handleChange}
                error={formik.touched.eventBudget && Boolean(formik.errors.eventBudget)}
                helperText={formik.touched.eventBudget && formik.errors.eventBudget}
                size="small"
              />
            </Grid>
          </Grid>
        </Scrollbar>
        <DialogActions>
          <Button type="submit" variant="contained">
            {isEdit ? 'Update' : 'Create'} Event
          </Button>
        </DialogActions>
      </form>
    </Box>
  );
};
