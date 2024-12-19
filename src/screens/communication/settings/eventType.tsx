import type { TabComponentType } from 'src/screens/hr/leave-request';

import { useState } from 'react';
import { useFormik } from 'formik';

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

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import { UploadBox } from 'src/components/upload';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

interface TEvent {
  id: number;
  eventType: string;
  eventTypeDesc: string;
  status: string;
}

const initialEventData: TEvent[] = [
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
  const dialog = useBoolean();
  const [eventTypeData, setEventTypeData] = useState<TEvent[]>(initialEventData);
  const confirmPublishDialog = useBoolean();
  const confirmDeleteDialog = useBoolean();

  const [isEdit, setIsEdit] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<TEvent | null>(null);
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    id: number;
    newValue: string;
  } | null>(null);

  const handleStatusChange = (id: number, value: string) => {
    setPendingStatusChange({ id, newValue: value === 'Publish' ? 'Unpublish' : 'Publish' });
    confirmPublishDialog.onTrue();
  };

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

  const handleCloseDialog = () => {
    dialog.onFalse();
    confirmPublishDialog.onFalse();
    confirmDeleteDialog.onFalse();
    setSelectedEvent(null);
  };

  const handleDelete = (comingEvent: any) => {
    setEventTypeData((prevData) => prevData.filter((event) => event.id !== comingEvent.id));
    handleCloseDialog();
  };

  const handleSubmit = (values: TEvent) => {
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
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box display="flex" justifyContent="flex-end" alignItems="flex-end" mb={3}>
        <Box display="flex" gap={2}>
          <Button
            startIcon={<Iconify icon="mdi:plus" />}
            variant="contained"
            onClick={() => {
              dialog.onTrue();
            }}
          >
            Add Event Type
          </Button>
        </Box>
      </Box>
      <CustomizableTable
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
                          setSelectedEvent(row as TEvent);
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
                        setSelectedEvent(row as TEvent);
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

interface EventFormProps {
  onSubmit: (values: TEvent) => void;
  data?: TEvent | null;
  isEdit?: boolean;
}

// eslint-disable-next-line react/prop-types
const EventForm: React.FC<EventFormProps> = ({ onSubmit, data = null, isEdit = false }) => {
  const [isDraft, setIsDraft] = useState(!isEdit || (data && data.status === 'Unpublish'));

  const formik = useFormik({
    initialValues: {
      eventType: data?.eventType || '',
      eventTypeDesc: data?.eventTypeDesc || '',
    },
    onSubmit: (values) => {
      onSubmit({
        ...values,
        id: data?.id || Date.now(),
        status: isDraft ? 'Unpublish' : 'Publish',
      });
    },
  });

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <form onSubmit={formik.handleSubmit}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '270px' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Event Type"
                name="eventType"
                size="small"
                value={formik.values.eventType}
                onChange={formik.handleChange}
                error={formik.touched.eventType && Boolean(formik.errors.eventType)}
              />
            </Grid>

            <Grid item xs={12}>
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
            </Grid>
            <Grid item xs={12}>
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
                onClick={() => {
                  setIsDraft(true);
                  formik.handleSubmit();
                }}
              >
                Save Draft
              </Button>
              <Button
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
