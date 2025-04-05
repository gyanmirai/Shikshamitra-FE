'use client';

import type { Dayjs } from 'dayjs';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import React, { useState } from 'react';

import { DateTimePicker } from '@mui/x-date-pickers';
import {
  Box,
  Card,
  Grid,
  Chip,
  Button,
  TextField,
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
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

interface Event {
  id: string;
  eventTitle: string;
  eventVenue: string;
  organization: string[];
  className: string[];
  eventStartDate: Dayjs;
  eventEndDate: Dayjs;
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
    eventStartDate: dayjs('2024-11-10T10:00'),
    eventEndDate: dayjs('2024-11-10T14:00'),
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
    eventStartDate: dayjs('2024-11-15T09:00'),
    eventEndDate: dayjs('2024-11-15T17:00'),
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
    eventStartDate: dayjs('2024-11-20T14:00'),
    eventEndDate: dayjs('2024-11-20T16:00'),
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
    eventStartDate: dayjs('2024-12-05T11:00'),
    eventEndDate: dayjs('2024-12-05T18:00'),
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
    eventStartDate: dayjs('2024-12-15T12:30'),
    eventEndDate: dayjs('2024-12-15T16:30'),
    eventType: 'Academic',
    audience: ['Students', 'Staff'],
    description: 'A workshop to enhance digital learning skills among students and teachers.',
    eventOrganizer: 'Cultural Committee',
    eventBudget: '7000',
  },
];

const UpcomingEvents = (props: TabComponentType) => {
  // State to store the selected event details
  const [event, setEvent] = useState<Event>();
  // State to store the event being edited
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  // State to store the list of events
  const [eventTableData, setEventTableData] = useState<Event[]>(eventsData);
  // State to store the ID of event to be deleted
  const [deleteEvent, setDeleteEvent] = useState('');
  // Custom hook for handling show dialog visibility
  const openShowDialog = useBoolean();
  // Custom hook for handling confirmation dialog visibility
  const confirm_dialog = useBoolean();
  // State to control add/edit event form dialog
  const [open, setOpen] = useState(false);

  // Handler for viewing event details
  const handleEyeClick = (id: string) => {
    const data = eventTableData.find((eve: any) => eve.id === id);
    setEvent(data);
    openShowDialog.onTrue();
  };

  // Handler for deleting an event
  const handleDelete = (id: string) => {
    setEventTableData((prevData) => prevData.filter((eve) => eve.id !== id));
    confirm_dialog.onFalse();
  };

  // Handler for submitting event form (both add and edit)
  const handleSubmit = (values: any) => {
    if (editingEvent) {
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

  // Handler for closing the add/edit event dialog
  const handleCloseDialog = () => {
    setEditingEvent(null);
    setOpen(false);
  };
  return (
    <Box>
      {open ? (
        <>
          <CustomBreadcrumbs
            heading="Upcoming Events"
            links={[
              { name: 'Communication', href: '/communication/dashboard' },
              { name: 'Events' },
              { name: 'Upcoming Events' },
              { name: 'Event Form' },
            ]}
            sx={{ px: 1, mb: 2 }}
            action={
              <Button
                variant="contained"
                size="small"
                startIcon={<Iconify icon="eva:arrow-back-fill" />}
                onClick={handleCloseDialog}
              >
                Back
              </Button>
            }
          />
          <Card>
            <AddEvent
              initialValues={editingEvent}
              onSubmit={handleSubmit}
              isEdit={!!editingEvent}
            />
          </Card>
        </>
      ) : (
        <>
          <CustomBreadcrumbs
            heading="Upcoming Events"
            links={[
              { name: 'Communication', href: '/communication/dashboard' },
              { name: 'Events' },
              { name: 'Upcoming Events' },
            ]}
            sx={{ px: 1, mb: 2 }}
            action={
              <Button
                startIcon={<Iconify icon="mdi:plus" />}
                variant="contained"
                size="small"
                onClick={() => {
                  setOpen(true);
                }}
              >
                Event
              </Button>
            }
          />
          <CustomizableTable
            tableId="event-table"
            columns={[
              { id: 'eventTitle', label: 'Event Title', minWidth: '180px', align: 'left' },
              { id: 'eventVenue', label: 'Event Venue', minWidth: '180px', align: 'left' },
              { id: 'eventType', label: 'Event Type', minWidth: '180px', align: 'left' },
              {
                id: 'eventStartDate',
                label: 'Start Date',
                minWidth: '180px',
                align: 'left',
                render: (value, row) => (
                  <Typography fontSize="12px" gutterBottom>
                    {dayjs(value).format('DD MMM YYYY')}
                  </Typography>
                ),
              },
              {
                id: 'eventEndDate',
                label: 'End Date',
                minWidth: '180px',
                align: 'left',
                render: (value, row) => (
                  <Typography fontSize="12px" gutterBottom>
                    {dayjs(value).format('DD MMM YYYY')}
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
              { id: 'eventOrganizer', label: 'Event Organizer', minWidth: '200px', align: 'left' },
              { id: 'eventBudget', label: 'Event Budget', minWidth: '180px', align: 'left' },
              {
                id: 'action',
                label: 'Action',
                isSort: false,
                render(value, row) {
                  return (
                    <ThreeDotsActions
                      // actions={(prop) => actions({ ...props, row })}
                      placement="right-top"
                      showEditIcon
                      showDeleteIcon
                      showViewIcon
                      showThreeDots={false}
                      handleEditClick={() => {
                        setOpen(true);
                        setEditingEvent(row);
                      }}
                      handleDeleteClick={() => {
                        confirm_dialog.onTrue();
                        setDeleteEvent(row.id);
                      }}
                      handleViewClick={() => {
                        handleEyeClick(row.id);
                      }}
                    />
                  );
                },
              },
            ]}
            data={eventTableData}
          />
        </>
      )}

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
                <strong>Start Date:</strong> {event.eventStartDate.format('YYYY-MM-DD')}
              </Typography>
              <Typography variant="body1">
                <strong>End Date:</strong> {event.eventEndDate.format('HH:mm')}
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
    </Box>
  );
};

export default UpcomingEvents;

/**
 * Interface representing the form values for an event
 * @property {string} eventTitle - The title of the event
 * @property {string} eventVenue - The venue where the event will be held
 * @property {string[]} organization - Array of organizations involved in the event
 * @property {string[]} className - Array of class names participating in the event
 * @property {Dayjs | null} eventStartDate - Start date and time of the event
 * @property {Dayjs | null} eventEndDate - End date and time of the event
 * @property {string} eventType - Type or category of the event
 * @property {string[]} audience - Array of target audience groups for the event
 * @property {string} description - Detailed description of the event
 * @property {string} eventOrganizer - Name of the event organizer
 * @property {string} eventBudget - Budget allocated for the event
 */
interface EventFormValues {
  eventTitle: string;
  eventVenue: string;
  organization: string[];
  className: string[];
  eventStartDate: Dayjs | null;
  eventEndDate: Dayjs | null;
  eventType: string;
  audience: string[];
  description: string;
  eventOrganizer: string;
  eventBudget: string;
}

/**
 * Props interface for the AddEvent component
 * @property {function} onSubmit - Callback function to handle form submission
 * @property {EventFormValues | null} initialValues - Initial values for the form fields
 * @property {boolean} isEdit - Flag indicating if the form is in edit mode
 */
interface AddEventProps {
  onSubmit: (values: EventFormValues) => void;
  initialValues?: EventFormValues | null;
  isEdit?: boolean;
}
const AddEvent: React.FC<AddEventProps> = ({ onSubmit, initialValues = null, isEdit = false }) => {
  /**
   * Custom hook to fetch class data using the useGetClassQuery mutation
   */
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  /**
   * Array of predefined organization options with their values and labels
   */
  const allOrganizations = [
    { value: 'Pre Primary', label: 'Pre Primary' },
    { value: 'Primary', label: 'Primary' },
    { value: 'Secondary', label: 'Secondary' },
    { value: 'Higher Secondary', label: 'Higher Secondary' },
  ];

  /**
   * State to track if all organizations are selected
   * Initialized based on if initial organization values length matches total organizations
   */
  const [isAllOrganizationSelected, setIsAllOrganizationSelected] = useState(
    initialValues?.organization?.length === allOrganizations.length
  );

  /**
   * State to track if all classes are selected
   * Initialized based on if initial class values length matches total classes
   */
  const [isAllClassesSelected, setIsAllClassesSelected] = useState(
    initialValues?.className?.length === classData?.items?.length
  );

  /**
   * Handles changes in organization selection
   * @param selectedValues - Array of selected organization values
   * If 'all' or 'deselectAll' is selected:
   * - Toggles between selecting all organizations or none
   * For normal selection:
   * - Updates selected organizations and checks if all are selected
   */
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

  /**
   * Handles changes in class selection
   * @param selectedValues - Array of selected class values
   * If 'all' or 'deselectAll' is selected:
   * - Toggles between selecting all classes or none
   * For normal selection:
   * - Updates selected classes and checks if all are selected
   */
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
      eventStartDate: initialValues?.eventStartDate ? dayjs(initialValues?.eventStartDate) : null,
      eventEndDate: initialValues?.eventEndDate ? dayjs(initialValues?.eventEndDate) : null,
      eventType: initialValues?.eventType || '',
      description: initialValues?.description || '',
      eventOrganizer: initialValues?.eventOrganizer || '',
      eventBudget: initialValues?.eventBudget || '',
    },
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <form onSubmit={formik.handleSubmit}>
        <Scrollbar sx={{ p: 2, height: '450px' }}>
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
              <DateTimePicker
                label="Event Start Date"
                name="eventStartDate"
                value={formik.values.eventStartDate}
                onChange={(newValue) => {
                  formik.setFieldValue('eventStartDate', newValue);
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
              <DateTimePicker
                label="Event End Date"
                name="eventEndDate"
                value={formik.values.eventEndDate}
                onChange={(newValue) => {
                  formik.setFieldValue('eventEndDate', newValue);
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
            {isEdit ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Box>
  );
};
