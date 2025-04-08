'use client';

import type { Dayjs } from 'dayjs';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useState } from 'react';

import { Add } from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers';
import {
  Box,
  Grid,
  Chip,
  Card,
  Switch,
  Button,
  Checkbox,
  TextField,
  Typography,
  DialogContent,
  DialogActions,
  FormHelperText,
  InputAdornment,
  FormControlLabel,
  DialogContentText,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { UploadBox } from 'src/components/upload';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { DetailRow } from './schoolWiseAnnounsement';

interface Announcement {
  id: string;
  title: string;
  description: string;
  audience: string[];
  publishDate: Dayjs;
  expiryDate: Dayjs;
  className: string[];
  division: string[];
  status: string;
  category: string;
  importance_level: string;
  link: string;
  notification_preferences: string[];
  isScheduled: boolean;
}

const ClassWiseAnnouncementInitialData: Announcement[] = [
  {
    id: '1',
    title: 'School Assembly',
    description: 'The school assembly will be held on Monday at 8 AM in the main hall.',
    audience: ['All Students'],
    publishDate: dayjs('2024-10-28'),
    expiryDate: dayjs('2024-10-30'),
    className: ['1'],
    division: ['A', 'B'],
    status: 'Published',
    category: 'General',
    importance_level: 'High',
    link: 'https://schoolwebsite.com/assembly',
    notification_preferences: ['Email', 'App Notification'],
    isScheduled: false,
  },
  {
    id: '2',
    title: 'Parent-Teacher Meeting',
    description:
      'PTM scheduled for all classes on the coming Saturday to discuss academic progress.',
    audience: ['Parents'],
    publishDate: dayjs('2024-10-25'),
    expiryDate: dayjs('2024-11-02'),
    className: ['3'],
    division: ['A', 'B', 'C'],
    status: 'Scheduled',
    category: 'Academic',
    importance_level: 'Urgent',
    link: 'https://schoolwebsite.com/ptm',
    notification_preferences: ['SMS', 'App Notification'],
    isScheduled: true,
  },
  {
    id: '3',
    title: 'Annual Sports Day',
    description:
      'Join us for the Annual Sports Day event on November 15. All students are encouraged to participate.',
    audience: ['Students'],
    publishDate: dayjs('2024-10-20'),
    expiryDate: dayjs('2024-11-16'),
    className: ['5'],
    division: ['A', 'B', 'C', 'D'],
    status: 'Published',
    category: 'Extracurricular',
    importance_level: 'Normal',
    link: 'https://schoolwebsite.com/sportsday',
    notification_preferences: ['Email'],
    isScheduled: false,
  },
  {
    id: '4',
    title: 'Science Exhibition',
    description:
      'The annual science exhibition will be held on December 5. Projects from all students are welcome.',
    audience: ['Students', 'Parents'],
    publishDate: dayjs('2024-11-01'),
    expiryDate: dayjs('2024-12-06'),
    className: ['7'],
    division: ['A', 'B'],
    status: 'Scheduled',
    category: 'Extracurricular',
    importance_level: 'High',
    link: 'https://schoolwebsite.com/scienceexhibition',
    notification_preferences: ['App Notification'],
    isScheduled: true,
  },
  {
    id: '5',
    title: 'Library Orientation',
    description:
      'Orientation session for the new library system. Attendance is mandatory for all new students.',
    audience: ['Students'],
    publishDate: dayjs('2024-10-15'),
    expiryDate: dayjs('2024-10-17'),
    className: ['1'],
    division: ['A', 'B'],
    status: 'Published',
    category: 'Administrative',
    importance_level: 'Normal',
    link: 'https://schoolwebsite.com/libraryorientation',
    notification_preferences: ['Email', 'SMS'],
    isScheduled: false,
  },
];

const ClassWiseAnnounsement = (props: TabComponentType) => {
  // Query hook to fetch class data
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  // Modal state for publish announcement dialog
  const publish_modal = useBoolean();
  // State to store the announcement being published
  const [publishingAnnouncement, setPublishingAnnouncement] = useState<any | null>(null);
  // State to store the ID of announcement to be deleted
  const [deleteAnnouncement, setDeleteAnnouncement] = useState('');
  // State to store the announcement being edited
  const [editingAnnouncement, setEditingAnnouncement] = useState<any | null>(null);
  // State to store the selected class filter
  const [selectedClass, setSelectedClass] = useState<string>('All Classes');
  // Modal state for confirmation dialog
  const confirm_dialog = useBoolean();

  const [open, setOpen] = useState(false);
  // State to store the announcement being viewed
  const [viewAnnouncement, setViewAnnouncement] = useState<any | null>(null);
  // Modal state for view announcement dialog
  const view_dialog = useBoolean();
  const [announcementTableData, setAnnouncementTableData] = useState<Announcement[]>(
    ClassWiseAnnouncementInitialData
  );
  /**
   * Handles the deletion of an announcement by its ID
   * Removes the announcement from the table data and closes the confirmation dialog
   * @param id - The ID of the announcement to delete
   */
  const handleDelete = (id: string) => {
    setAnnouncementTableData((prevData) =>
      prevData.filter((announcement) => announcement.id !== id)
    );
    confirm_dialog.onFalse();
  };

  /**
   * Handles the submission of announcement form data
   * Updates existing announcement if editing, or creates a new announcement
   * @param values - The form values containing announcement data
   */
  const handleSubmit = (values: any) => {
    if (editingAnnouncement) {
      setAnnouncementTableData((prevData) =>
        prevData.map((announcement) =>
          announcement.id === editingAnnouncement.id
            ? { ...values, id: editingAnnouncement.id }
            : announcement
        )
      );
    } else {
      const newAnnouncement = {
        ...values,
        id: String(announcementTableData.length + 1),
      };
      setAnnouncementTableData((prevData) => [...prevData, newAnnouncement]);
    }
    handleCloseDialog();
  };

  /**
   * Handles closing of dialogs and resetting related states
   * Resets editing announcement, form params, publishing announcement and modal
   */
  const handleCloseDialog = () => {
    setEditingAnnouncement(null);
    setOpen(false);
    setPublishingAnnouncement(null);
    publish_modal.onFalse();
  };

  /**
   * Handles publishing of an announcement
   * Updates the announcement status to Published and sets current publish date
   * @param announcement - The announcement object to be published
   */
  const handlePublish = (announcement: any) => {
    setAnnouncementTableData((prevData) =>
      prevData.map((item) =>
        item.id === announcement.id
          ? {
              ...item,
              status: 'Published',
              publishDate: dayjs(),
              isScheduled: false,
            }
          : item
      )
    );
    publish_modal.onFalse();
    setPublishingAnnouncement(null);
  };

  /**
   * Returns color configuration based on importance level
   * Provides background, text and border colors for different importance levels
   * @param level - The importance level string
   * @returns Object containing bg, text and border color values
   */
  const getImportanceLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'urgent':
        return {
          bg: '#FEE2E2',
          text: '#DC2626',
          border: '#FECACA',
        };
      case 'critical':
        return {
          bg: '#FFEDD5',
          text: '#EA580C',
          border: '#FED7AA',
        };
      case 'high':
        return {
          bg: '#FEF3C7',
          text: '#D97706',
          border: '#FDE68A',
        };
      case 'medium':
        return {
          bg: '#E0F2FE',
          text: '#0284C7',
          border: '#BAE6FD',
        };
      case 'low':
        return {
          bg: '#DCFCE7',
          text: '#16A34A',
          border: '#BBF7D0',
        };
      case 'informational':
        return {
          bg: '#F3F4F6',
          text: '#4B5563',
          border: '#E5E7EB',
        };
      default:
        return {
          bg: '#F3F4F6',
          text: '#4B5563',
          border: '#E5E7EB',
        };
    }
  };

  const links = open
    ? [
        { name: 'Communication', href: '/communication/dashboard' },
        { name: 'Announcements' },
        { name: 'Class Wise Announcement' },
        { name: 'Announcement Form' },
      ]
    : [
        { name: 'Communication', href: '/communication/dashboard' },
        { name: 'Announcements' },
        { name: 'Class Wise Announcement' },
      ];

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Class Wise Announcement"
        description={
          open
            ? 'Create or update class-wide announcements with important messages, event details, or notifications. Share information efficiently with students, teachers, and staff.'
            : 'View and manage all class-wide announcements, including message content, target audience, and publication status. Add new announcements, update existing ones, or remove them as needed.'
        }
        links={links}
        sx={{ px: 1, mb: 2 }}
        action={
          <Button
            size="small"
            startIcon={open ? <Iconify icon="eva:arrow-back-fill" /> : <Add />}
            variant="contained"
            onClick={
              open
                ? () => handleCloseDialog()
                : () => {
                    setOpen(true);
                  }
            }
          >
            {open ? 'Back' : 'Class Wise Announcement'}
          </Button>
        }
      />
      {open ? (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
          <AnnouncementForm
            initialValues={editingAnnouncement}
            onSubmit={handleSubmit}
            isEdit={!!editingAnnouncement}
          />
        </Card>
      ) : (
        <CustomizableTable
          tableId="class-specific-announcement-table"
          columns={[
            { id: 'title', label: 'Title' },
            {
              id: 'publishDate',
              label: 'Publish Date',
              minWidth: '180px',
              align: 'left',
              render: (value, row) => (
                <Typography fontSize="12px" gutterBottom>
                  {dayjs(value).format('DD MMM YYYY')}
                </Typography>
              ),
            },
            {
              id: 'expiryDate',
              label: 'Expiry Date',
              minWidth: '180px',
              align: 'left',
              render: (value, row) => (
                <Typography fontSize="12px" gutterBottom>
                  {dayjs(value).format('DD MMM YYYY')}
                </Typography>
              ),
            },
            {
              id: 'className',
              label: 'Class',
              render: (value) => (
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {value.map((className: string) => (
                    <Chip key={className} label={className} size="small" variant="outlined" />
                  ))}
                </Box>
              ),
            },
            {
              id: 'division',
              label: 'Division',
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
              id: 'importance_level',
              label: 'Importance',
              render: (value) => {
                const colors = getImportanceLevelColor(value);
                return (
                  <Typography
                    component="span"
                    variant="body2"
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      borderRadius: '16px',
                      backgroundColor: colors.bg,
                      color: colors.text,
                      border: `1px solid ${colors.border}`,
                      fontSize: '0.75rem',
                      fontWeight: 500,
                    }}
                  >
                    {value}
                  </Typography>
                );
              },
            },
            {
              id: 'audience',
              label: 'Audience',
              render: (value) => (
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {value.map((audience: string) => (
                    <Chip key={audience} label={audience} size="small" variant="outlined" />
                  ))}
                </Box>
              ),
            },
            {
              id: 'status',
              label: 'Status',
              render: (value, row) =>
                value === 'Published' ? (
                  <Label variant="soft" color="primary">
                    {value}
                  </Label>
                ) : (
                  <Label
                    variant="soft"
                    color="warning"
                    onClick={() => {
                      publish_modal.onTrue();
                      setPublishingAnnouncement(row);
                    }}
                    sx={{ cursor: 'pointer' }}
                  >
                    {value}
                  </Label>
                ),
            },
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
                      setEditingAnnouncement(row);
                    }}
                    handleDeleteClick={() => {
                      confirm_dialog.onTrue();
                      setDeleteAnnouncement(row.id);
                    }}
                    handleViewClick={() => {
                      view_dialog.onTrue();
                      setViewAnnouncement(row);
                    }}
                  />
                );
              },
            },
          ]}
          data={announcementTableData}
        />
      )}

      <CustomDialog
        title="Confirm Delete"
        open={confirm_dialog.value}
        handleClose={() => {
          setDeleteAnnouncement('');
          confirm_dialog.onFalse();
        }}
        maxWidth="sm"
      >
        <DialogContent>
          <DialogContentText>Are you sure to delete this Announcement?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={confirm_dialog.onFalse} variant="contained">
            Cancel
          </Button>
          <Button
            onClick={() => {
              handleDelete(deleteAnnouncement);
            }}
            variant="contained"
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </CustomDialog>

      <CustomDialog
        title="Do you want to publish this announcement ?"
        open={publish_modal.value}
        handleClose={handleCloseDialog}
        maxWidth="sm"
      >
        <DialogContent>
          {publishingAnnouncement && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="h5">Announcement Details</Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="subtitle2">Title</Typography>
                <Typography>{publishingAnnouncement.title}</Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="subtitle2">Description</Typography>
                <Typography>{publishingAnnouncement.description}</Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="subtitle2">Audience</Typography>
                <Typography>{publishingAnnouncement.audience}</Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="subtitle2">Scheduled Date</Typography>
                <Typography>
                  {dayjs(publishingAnnouncement.date).format('DD MMM YYYY, hh:mm A')}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} variant="outlined" color="error">
            Cancel
          </Button>
          <Button
            onClick={() => handlePublish(publishingAnnouncement)}
            variant="contained"
            color="primary"
          >
            Publish Now
          </Button>
        </DialogActions>
      </CustomDialog>

      <CustomDialog
        title="Announcement Details"
        open={view_dialog.value}
        handleClose={() => {
          setViewAnnouncement(null);
          view_dialog.onFalse();
        }}
        maxWidth="md"
      >
        <DialogContent>
          <AnnouncementDetails announcement={viewAnnouncement} />
        </DialogContent>
        <DialogActions>
          <Button onClick={view_dialog.onFalse} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </CustomDialog>
    </Box>
  );
};

export default ClassWiseAnnounsement;

interface AnnouncementFormValues {
  title: string;
  description: string;
  audience: string[];
  publishDate: Dayjs | null;
  expiryDate: Dayjs | null;
  className: string[];
  division: string[];
  status: string;
  category: string;
  importance_level: string;
  link: string;
  notification_preferences: string[];
  isScheduled: boolean;
}

interface AnnouncementFormProps {
  onSubmit: (values: AnnouncementFormValues) => void;
  initialValues?: AnnouncementFormValues | null;
  isEdit?: boolean;
}

interface FormikInitialValues {
  title: string;
  description: string;
  audience: string[];
  publishDate: Dayjs | null;
  expiryDate: Dayjs | null;
  className: string[];
  division: string[];
  status: string;
  category: string;
  importance_level: string;
  link: string;
  notification_preferences: string[];
  isScheduled: boolean;
}

const AnnouncementForm: React.FC<AnnouncementFormProps> = ({
  onSubmit,
  initialValues = null,
  isEdit = false,
}) => {
  // Determines the announcement status based on scheduling and date
  // Returns 'Published' if not scheduled, 'Scheduled' if date is in future
  const determineStatus = (isScheduled: boolean, selectedDate: Dayjs | null) => {
    if (!isScheduled) return 'Published';
    if (!selectedDate) return 'Scheduled';

    const now = dayjs();
    return selectedDate.isAfter(now) ? 'Scheduled' : 'Published';
  };

  // Available division options for the announcement
  const divisionOption = [
    { value: 'A', label: 'A' },
    { value: 'B', label: 'B' },
    { value: 'C', label: 'C' },
    { value: 'D', label: 'D' },
  ];

  // Track if all divisions are selected by comparing initial division length with available options
  const [isAllSelected, setIsAllSelected] = useState(
    initialValues?.division?.length === divisionOption.length
  );

  const validationSchema = Yup.object().shape({
    title: Yup.string().required('Title is required'),
    description: Yup.string().required('Description is required'),
    audience: Yup.array().min(1, 'At least one audience is required'),
    className: Yup.array().min(1, 'At least one class must be selected'),
    division: Yup.array().min(1, 'At least one division must be selected'),
    category: Yup.string().required('Category is required'),
    importance_level: Yup.string().required('Importance level is required'),
    link: Yup.string().url('Must be a valid URL').nullable(),
    notification_preferences: Yup.array(),
    isScheduled: Yup.boolean(),

    publishDate: Yup.date()
      .nullable()
      .when('isScheduled', (isScheduled, schema) =>
        isScheduled
          ? schema
              .required('Schedule Date & Time is required')
              .min(new Date(), 'Schedule Date & Time must be in the future')
          : schema.nullable()
      ),

    expiryDate: Yup.date()
      .nullable()
      .min(Yup.ref('publishDate'), 'Expiry Date must be after Schedule Date & Time')
      .required('Expiry Date is required'),

    status: Yup.string().oneOf(['Published', 'Draft'], 'Invalid status'),
  });

  const formik = useFormik<FormikInitialValues>({
    initialValues: {
      title: initialValues?.title || '',
      description: initialValues?.description || '',
      audience: initialValues?.audience || [],
      className: initialValues?.className || [],
      division: initialValues?.division || [],
      publishDate: initialValues?.publishDate
        ? dayjs(initialValues?.publishDate)
        : dayjs().add(1, 'hours'),
      expiryDate: initialValues?.expiryDate ? dayjs(initialValues?.expiryDate) : null,
      category: initialValues?.category || '',
      importance_level: initialValues?.importance_level || '',
      link: initialValues?.link || '',
      notification_preferences: initialValues?.notification_preferences || [],
      isScheduled: initialValues?.isScheduled || false,
      status: initialValues?.status || 'Published',
    },
    validationSchema,
    onSubmit: (values) => {
      onSubmit({
        ...values,
        publishDate: values.isScheduled ? values.publishDate : dayjs(),
        status: determineStatus(values.isScheduled, values.publishDate),
      });
    },
  });

  /**
   * Fetches class data using a custom hook that combines query and mutation functionality
   * @returns {Object} An object containing class data and loading state
   * @property {Array} data - The fetched class data
   * @property {boolean} isLoading - Loading state indicator
   */
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  /**
   * Handles changes to the publish date and updates the announcement status accordingly
   * @param newDate - The new date selected by the user
   */
  const handleDateChange = (newDate: Dayjs | null) => {
    if (newDate) {
      const newStatus = determineStatus(formik.values.isScheduled, newDate);
      formik.setValues({
        ...formik.values,
        publishDate: newDate,
        status: newStatus,
      });
    }
  };

  /**
   * Toggles notification preferences by adding or removing them from the selected preferences array
   * @param preference - The notification preference to toggle
   */
  const handleNotificationPreferenceChange = (preference: string) => {
    const currentPreferences = formik.values.notification_preferences;
    const updatedPreferences = currentPreferences.includes(preference)
      ? currentPreferences.filter((p) => p !== preference)
      : [...currentPreferences, preference];

    formik.setFieldValue('notification_preferences', updatedPreferences);
  };

  /**
   * Handles division selection changes including select all/deselect all functionality
   * @param selectedValues - Array of selected division values
   */
  const handleDivisionChange = (selectedValues: string[]) => {
    if (selectedValues.includes('all') || selectedValues.includes('deselectAll')) {
      const allDivision = divisionOption.map((org) => org.value);
      if (isAllSelected) {
        formik.setFieldValue('division', []);
      } else {
        formik.setFieldValue('division', allDivision);
      }
      setIsAllSelected(!isAllSelected);
    } else {
      formik.setFieldValue('division', selectedValues);
      setIsAllSelected(selectedValues.length === divisionOption.length);
    }
  };
  return (
    <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
      <Box display="flex" flexDirection="column" gap={2} height="100%">
        <Scrollbar sx={{ p: 2, height: '100%' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <ShakingTextField error={!!(formik.touched.title && formik.errors.title) || false}>
                <TextField
                  fullWidth
                  label="Title"
                  name="title"
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  error={formik.touched.title && Boolean(formik.errors.title)}
                  helperText={formik.touched.title && formik.errors.title}
                  size="small"
                />
              </ShakingTextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <ShakingTextField
                error={!!(formik.touched.className && formik.errors.className) || false}
              >
                <CustomSelect
                  options={classData?.items || []}
                  value={formik.values.className}
                  onChange={(val) => {
                    formik.setFieldValue('className', val);
                  }}
                  label="Class"
                  isLoading={isLoading}
                  multiple
                  labelKey="name"
                  valueKey="name"
                  formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
                  error={formik.touched.className && Boolean(formik.errors.className)}
                  helperText={
                    Array.isArray(formik.errors.className)
                      ? formik.errors.className.join(', ')
                      : (formik.touched.className && formik.errors.className) || undefined
                  }
                />
              </ShakingTextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <ShakingTextField
                error={!!(formik.touched.division && formik.errors.division) || false}
              >
                <CustomSelect
                  label="Select Divisions"
                  options={[
                    {
                      value: isAllSelected ? 'deselectAll' : 'all',
                      label: isAllSelected ? 'Deselect All' : 'All',
                    },
                    ...divisionOption,
                  ]}
                  value={formik.values.division}
                  onChange={(val) => {
                    handleDivisionChange(val as string[]);
                  }}
                  multiple
                  formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
                  error={formik.touched.division && Boolean(formik.errors.division)}
                  helperText={
                    Array.isArray(formik.errors.division)
                      ? formik.errors.division.join(', ')
                      : (formik.touched.division && formik.errors.division) || undefined
                  }
                />
              </ShakingTextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <ShakingTextField
                error={!!(formik.touched.audience && formik.errors.audience) || false}
              >
                <CustomSelect
                  label="Select Audience"
                  options={[
                    { value: 'Students', label: 'Students' },
                    { value: 'Parents', label: 'Parents' },
                  ]}
                  multiple
                  value={formik.values.audience}
                  onChange={(val) => {
                    formik.setFieldValue('audience', val);
                  }}
                  formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
                  error={formik.touched.audience && Boolean(formik.errors.audience)}
                  helperText={
                    Array.isArray(formik.errors.audience)
                      ? formik.errors.audience.join(', ')
                      : (formik.touched.audience && formik.errors.audience) || undefined
                  }
                />
              </ShakingTextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <ShakingTextField
                error={!!(formik.touched.expiryDate && formik.errors.expiryDate) || false}
              >
                <DateTimePicker
                  label="Expiry Date & Time"
                  value={formik.values.expiryDate}
                  onChange={(value) => {
                    formik.setFieldValue('expiryDate', value);
                  }}
                  format="DD-MM-YYYY HH:mm"
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                      error: formik.touched.expiryDate && Boolean(formik.errors.expiryDate),
                      helperText: formik.touched.expiryDate && formik.errors.expiryDate,
                    },
                  }}
                  disablePast
                />
              </ShakingTextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <ShakingTextField
                error={!!(formik.touched.category && formik.errors.category) || false}
              >
                <CustomSelect
                  label="Select Category"
                  options={[
                    { value: 'academic', label: 'Academic' },
                    { value: 'administrative', label: 'Administrative' },
                    { value: 'extracurriculam', label: 'Extracurriculam' },
                  ]}
                  value={formik.values.category}
                  onChange={(val) => {
                    formik.setFieldValue('category', val);
                  }}
                  formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
                  error={formik.touched.category && Boolean(formik.errors.category)}
                  helperText={(formik.touched.category && formik.errors.category) || undefined}
                />
              </ShakingTextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <ShakingTextField
                error={
                  !!(formik.touched.importance_level && formik.errors.importance_level) || false
                }
              >
                <CustomSelect
                  label="Importance Level"
                  options={[
                    { value: 'urgent', label: 'Urgent' },
                    { value: 'critical', label: 'Critical' },
                    { value: 'high', label: 'High' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'low', label: 'Low' },
                    { value: 'informational', label: 'Informational' },
                  ]}
                  placeholder="Announcement Importance level"
                  value={formik.values.importance_level}
                  onChange={(val) => {
                    formik.setFieldValue('importance_level', val);
                  }}
                  formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
                  error={formik.touched.importance_level && Boolean(formik.errors.importance_level)}
                  helperText={
                    (formik.touched.importance_level && formik.errors.importance_level) || undefined
                  }
                />
              </ShakingTextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.isScheduled}
                    onChange={(e) => {
                      formik.setFieldValue('isScheduled', e.target.checked);
                    }}
                  />
                }
                label="Schedule Announcement"
              />
            </Grid>
            {formik.values.isScheduled && (
              <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={!!(formik.touched.className && formik.errors.className) || false}
                >
                  <DateTimePicker
                    label="Schedule Date & Time"
                    format="DD-MM-YYYY HH:mm"
                    value={formik.values.publishDate}
                    onChange={handleDateChange}
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                        error: formik.touched.publishDate && Boolean(formik.errors.publishDate),
                      },
                    }}
                    disablePast
                  />
                </ShakingTextField>
              </Grid>
            )}

            <Grid item xs={12}>
              <ShakingTextField
                error={!!(formik.touched.description && formik.errors.description) || false}
              >
                <TextField
                  fullWidth
                  label="Announcement Description"
                  name="description"
                  multiline
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  error={formik.touched.description && Boolean(formik.errors.description)}
                  helperText={formik.touched.description && formik.errors.description}
                  size="small"
                  rows={4}
                />
              </ShakingTextField>
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

            <Grid item xs={12} md={6}>
              <ShakingTextField error={!!(formik.touched.link && formik.errors.link) || false}>
                <TextField
                  fullWidth
                  label="Link"
                  name="link"
                  value={formik.values.link}
                  onChange={formik.handleChange}
                  error={formik.touched.link && Boolean(formik.errors.link)}
                  helperText={formik.touched.link && formik.errors.link}
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify icon="typcn:attachment" />
                      </InputAdornment>
                    ),
                  }}
                />
              </ShakingTextField>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Notification Preferences
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formik.values.notification_preferences.includes('email')}
                      onChange={() => handleNotificationPreferenceChange('email')}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Iconify icon="mdi:email-outline" />
                      <Typography variant="body2">Email</Typography>
                    </Box>
                  }
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formik.values.notification_preferences.includes('sms')}
                      onChange={() => handleNotificationPreferenceChange('sms')}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Iconify icon="mdi:message-outline" />
                      <Typography variant="body2">SMS</Typography>
                    </Box>
                  }
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formik.values.notification_preferences.includes('app')}
                      onChange={() => handleNotificationPreferenceChange('app')}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Iconify icon="mdi:bell-outline" />
                      <Typography variant="body2">App Notification</Typography>
                    </Box>
                  }
                />
              </Box>
              {formik.touched.notification_preferences &&
                formik.errors.notification_preferences && (
                  <FormHelperText error>
                    {String(formik.errors.notification_preferences)}
                  </FormHelperText>
                )}
            </Grid>
          </Grid>
        </Scrollbar>
        <DialogActions>
          <Button type="submit" variant="contained">
            {isEdit ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Box>
    </form>
  );
};

const AnnouncementDetails = ({ announcement }: any) => (
  <Box>
    <Scrollbar sx={{ height: '400px' }}>
      <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Iconify icon="mdi:bullhorn-outline" className="text-gray-500 w-6 h-6" />
        <Typography variant="h6" className="font-semibold">
          {announcement?.title}
        </Typography>
      </Box>

      <hr className="my-6 border-gray-200" />

      <DetailRow
        label="Description"
        icon="mdi:text-box-outline"
        value={
          <Typography variant="body2" className="text-gray-700">
            {announcement?.description}
          </Typography>
        }
      />

      <DetailRow
        label="Class"
        icon="mdi:school-outline"
        value={
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {announcement?.className?.map((data: any) => (
              <Chip key={data} label={`Class ${data}`} size="small" variant="outlined" />
            ))}
          </Box>
        }
      />

      <DetailRow
        label="Division"
        icon="mdi:account-group-outline"
        value={
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {announcement?.division?.map((div: any) => (
              <Chip key={div} label={`Division ${div}`} size="small" variant="outlined" />
            ))}
          </Box>
        }
      />

      <DetailRow
        label="Target Audience"
        icon="mdi:account-group-outline"
        value={
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {announcement?.audience?.map((aud: any) => (
              <Chip key={aud} label={aud} size="small" variant="outlined" />
            ))}
          </Box>
        }
      />

      <DetailRow
        label="Notification Preferences"
        icon="mdi:bell-outline"
        value={
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {announcement?.notification_preferences?.map((pref: any) => (
              <Chip key={pref} label={pref} size="small" variant="outlined" />
            ))}
          </Box>
        }
      />

      <Box className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <DetailRow
          label="Publish Date"
          icon="mdi:calendar-outline"
          value={
            <Typography variant="body2" className="text-gray-700">
              {new Date(announcement?.publishDate).toLocaleString()}
            </Typography>
          }
        />

        <DetailRow
          label="Expiry Date"
          icon="mdi:calendar-clock-outline"
          value={
            <Typography variant="body2" className="text-gray-700">
              {new Date(announcement?.expiryDate).toLocaleString()}
            </Typography>
          }
        />

        <DetailRow
          label="Category"
          icon="mdi:folder-outline"
          value={
            <Typography
              component="span"
              variant="body2"
              className="px-3 py-1 rounded-full bg-purple-50 text-purple-600 border border-purple-200"
            >
              {announcement?.category}
            </Typography>
          }
        />

        <DetailRow
          label="Importance Level"
          icon="mdi:flag-outline"
          value={
            <Typography
              component="span"
              variant="body2"
              className={`px-3 py-1 rounded-full ${
                announcement?.importance_level === 'High'
                  ? 'bg-red-50 text-red-600 border border-red-200'
                  : 'bg-yellow-50 text-yellow-600 border border-yellow-200'
              }`}
            >
              {announcement?.importance_level}
            </Typography>
          }
        />

        <DetailRow
          label="Status"
          icon="mdi:information-outline"
          value={
            <Typography
              component="span"
              variant="body2"
              className={`px-3 py-1 rounded-full ${
                announcement?.status === 'Published'
                  ? 'bg-green-50 text-green-600 border border-green-200'
                  : 'bg-yellow-50 text-yellow-600 border border-yellow-200'
              }`}
            >
              {announcement?.status}
            </Typography>
          }
        />
      </Box>

      {announcement?.link && (
        <DetailRow
          label="External Link"
          icon="mdi:link-variant"
          value={
            <Typography
              component="a"
              variant="body2"
              href={announcement.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {announcement.link}
            </Typography>
          }
        />
      )}
    </Scrollbar>
  </Box>
);
