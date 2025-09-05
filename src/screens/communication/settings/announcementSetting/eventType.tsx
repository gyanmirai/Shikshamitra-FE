'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import { useState } from 'react';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { UploadBox } from 'src/components/upload';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  Box,
  Grid,
  Switch,
  Button,
  MenuItem,
  MenuList,
  TextField,
  Typography,
  DialogActions,
  DialogContent,
  DialogContentText,
} from '@mui/material';

import { eventTypeValidationSchema } from '../validationSchema';

import type { ISettingEvent, IEventFormProps } from '../type';

const initialEventData: ISettingEvent[] = [
  {
    id: 1,
    eventType: 'High',
    eventTypeDesc: 'Critical updates that require immediate attention.',
    status: 'Publish',
  },
  {
    id: 2,
    eventType: 'Medium',
    eventTypeDesc: 'Important updates that are not urgent but need to be addressed soon.',
    status: 'Publish',
  },
  {
    id: 3,
    eventType: 'Low',
    eventTypeDesc: 'General updates that are informative but not time-sensitive.',
    status: 'UnPublish',
  },
  {
    id: 4,
    eventType: 'Urgent',
    eventTypeDesc: 'Emergency announcements requiring immediate action.',
    status: 'Publish',
  },
  {
    id: 5,
    eventType: 'Informational',
    eventTypeDesc: 'Updates for awareness without immediate action required.',
    status: 'UnPublish',
  },
];

const EventType = (props: TabComponentType) => {
  // Dialog control for the main form
  const dialog = useBoolean();

  // State to manage the event type data list
  const [eventTypeData, setEventTypeData] = useState<ISettingEvent[]>(initialEventData);

  // Dialog controls for publish and delete confirmations
  const confirmPublishDialog = useBoolean();
  const confirmDeleteDialog = useBoolean();

  // State to track if we're in edit mode
  const [isEdit, setIsEdit] = useState(false);

  // State to store the currently selected event for editing
  const [selectedEvent, setSelectedEvent] = useState<ISettingEvent | null>(null);

  // State to manage pending status changes before confirmation
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    id: number;
    newValue: string;
  } | null>(null);

  /**
   * Handles the status change for an event type
   * @param id - The ID of the event type to update
   * @param value - The current status value ('Publish' or 'Unpublish')
   */
  const handleStatusChange = (id: number, value: string) => {
    setPendingStatusChange({ id, newValue: value === 'Publish' ? 'Unpublish' : 'Publish' });
    confirmPublishDialog.onTrue();
  };

  /**
   * Confirms and applies the pending status change to the event type
   */
  const confirmStatusChange = () => {
    if (pendingStatusChange) {
      const { id, newValue } = pendingStatusChange;
      setEventTypeData((prevSubject) =>
        prevSubject.map((event) => (event.id === id ? { ...event, status: newValue } : event))
      );
    }
    confirmPublishDialog.onFalse();
    setPendingStatusChange(null);
  };

  /**
   * Closes all dialogs and resets the selected event
   */
  const handleCloseDialog = () => {
    dialog.onFalse();
    confirmPublishDialog.onFalse();
    confirmDeleteDialog.onFalse();
    setSelectedEvent(null);
  };

  /**
   * Deletes an event type from the list
   * @param comingEvent - The event type to be deleted
   */
  const handleDelete = (comingEvent: any) => {
    setEventTypeData((prevData) => prevData.filter((event) => event.id !== comingEvent.id));
    handleCloseDialog();
  };

  /**
   * Handles form submission for creating or updating an event type
   * @param values - The event type data to be saved
   */
  const handleSubmit = (values: ISettingEvent) => {
    if (isEdit && selectedEvent) {
      setEventTypeData(eventTypeData.map((event) => (event.id === values.id ? values : event)));
    } else {
      setEventTypeData([...eventTypeData, values]);
    }
    dialog.onFalse();
    setIsEdit(false);
    setSelectedEvent(null);
  };
  return (
    <Box>
      <CustomBreadcrumbs
        heading="Event Type"
        links={[
          { name: 'Communication', href: '/communication/dashboard' },
          { name: 'Settings' },
          { name: 'Event Type' },
        ]}
        sx={{ px: 1, mb: 2 }}
        action={
          <Button
            startIcon={<Iconify icon="mdi:plus" />}
            variant="contained"
            size="small"
            onClick={() => {
              dialog.onTrue();
            }}
          >
            Event Type
          </Button>
        }
      />
      <CustomizableTable
        tableId="eventTypeTable"
        columns={[
          { id: 'eventType', label: 'Event Type' },
          { id: 'eventTypeDesc', label: 'Event Type Desc' },
          {
            id: 'status',
            label: 'Publish',
            render: (value: string, row: any) => (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Switch
                  size="small"
                  checked={value === 'Publish'}
                  onChange={() => handleStatusChange(row.id, value as string)}
                />
              </Box>
            ),
          },
          {
            id: 'action',
            label: 'Action',
            render: (_, row) => (
              <ThreeDotsActions
                placement="right-top"
                actions={({ popover }) => (
                  <MenuList>
                    {row.status === 'UnPublish' && (
                      <MenuItem
                        onClick={() => {
                          dialog.onTrue();
                          setSelectedEvent(row as ISettingEvent);
                          setIsEdit(true);
                          popover.onClose();
                        }}
                      >
                        <Iconify icon="mdi:pencil" sx={{ mr: 1 }} />
                        Edit
                      </MenuItem>
                    )}

                    <MenuItem
                      onClick={() => {
                        confirmDeleteDialog.onTrue();
                        setSelectedEvent(row as ISettingEvent);
                        popover.onClose();
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
        data={eventTypeData}
      />

      <CustomDialog
        title={isEdit ? 'Update Event Type' : 'New Event Type'}
        open={dialog.value}
        handleClose={handleCloseDialog}
      >
        <EventForm data={selectedEvent} onSubmit={handleSubmit} isEdit={isEdit} />
      </CustomDialog>

      <CustomDialog
        title="Confirm Publication"
        open={confirmPublishDialog.value}
        handleClose={confirmPublishDialog.onFalse}
        maxWidth="sm"
      >
        <DialogContent>
          <DialogContentText>
            Are you sure to {pendingStatusChange?.newValue === 'Publish' ? 'Publish' : 'Unpublish'}{' '}
            this Category?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} variant="contained" color="error">
            Cancel
          </Button>
          <Button onClick={confirmStatusChange} autoFocus variant="contained" color="success">
            Confirm
          </Button>
        </DialogActions>
      </CustomDialog>

      <CustomDialog
        title="Confirm Delete"
        open={confirmDeleteDialog.value}
        handleClose={handleCloseDialog}
        maxWidth="sm"
      >
        <DialogContent>
          <DialogContentText>Are you sure to delete this Category?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={confirmDeleteDialog.onFalse} variant="contained" color="error">
            Cancel
          </Button>
          <Button
            onClick={() => {
              handleDelete(selectedEvent);
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

// eslint-disable-next-line react/prop-types
const EventForm: React.FC<IEventFormProps> = ({ onSubmit, data = null, isEdit = false }) => {
  // State to track if the event is in draft mode (UnPublish status)
  const [isDraft, setIsDraft] = useState(!isEdit || (data && data.status === 'UnPublish'));

  // Initialize formik form handling
  const formik = useFormik({
    // Set initial form values from existing data or empty strings
    initialValues: {
      eventType: data?.eventType || '',
      eventTypeDesc: data?.eventTypeDesc || '',
    },
    validationSchema: eventTypeValidationSchema,
    // Handle form submission
    onSubmit: (values) => {
      onSubmit({
        ...values,
        id: data?.id || Date.now(), // Use existing ID or generate new timestamp-based ID
        status: isDraft ? 'UnPublish' : 'Publish', // Set status based on draft state
      });
    },
  });
  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <form onSubmit={formik.handleSubmit}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '330px' }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <ShakingTextField error={!!(formik.touched.eventType && formik.errors.eventType)}>
                <TextField
                  fullWidth
                  label="Event Type"
                  name="eventType"
                  size="small"
                  value={formik.values.eventType}
                  onChange={formik.handleChange}
                  error={formik.touched.eventType && Boolean(formik.errors.eventType)}
                />
              </ShakingTextField>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <ShakingTextField
                error={!!(formik.touched.eventTypeDesc && formik.errors.eventTypeDesc)}
              >
                <TextField
                  fullWidth
                  label="Event Type Desc"
                  name="eventTypeDesc"
                  size="small"
                  rows={4}
                  multiline
                  value={formik.values.eventTypeDesc}
                  onChange={formik.handleChange}
                  error={formik.touched.eventTypeDesc && Boolean(formik.errors.eventTypeDesc)}
                />
              </ShakingTextField>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <UploadBox
                onDrop={() => {}}
                placeholder={
                  <Box
                    sx={{
                      gap: 0.5,
                      display: 'flex',
                      alignItems: 'center',
                      color: 'text.disabled',
                      flexDirection: 'column',
                    }}
                  >
                    <Iconify icon="eva:cloud-upload-fill" width={40} />
                    <Typography variant="body2">Upload Document</Typography>
                  </Box>
                }
                sx={{
                  py: 2.5,
                  width: '100%',
                  height: 'auto',
                  borderRadius: 1.5,
                }}
              />
            </Grid>
          </Grid>
        </Scrollbar>
        <DialogActions>
          {isEdit ? (
            <Button
              variant="contained"
              onClick={() => {
                setIsDraft(true);
                formik.handleSubmit();
              }}
            >
              Update
            </Button>
          ) : (
            <>
              <Button
                variant="outlined"
                startIcon={<Iconify icon={GlobalIcons.draftIcon} />}
                onClick={() => {
                  setIsDraft(true);
                  formik.handleSubmit();
                }}
              >
                Save Draft
              </Button>
              <Button
                startIcon={<Iconify icon={GlobalIcons.publish} />}
                type="submit"
                variant="contained"
                onClick={() => {
                  setIsDraft(false);
                  formik.handleSubmit();
                }}
              >
                Publish
              </Button>
            </>
          )}
        </DialogActions>
      </form>
    </Box>
  );
};

export default EventType;
