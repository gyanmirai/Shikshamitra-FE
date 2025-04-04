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
  DialogActions,
  DialogContent,
  FormHelperText,
  InputAdornment,
  FormControlLabel,
  DialogContentText,
  // eslint-disable-next-line import/no-duplicates
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSearchParam } from 'src/hooks/use-search-param';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { UploadBox } from 'src/components/upload';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

interface Announcement {
  id: string;
  title: string;
  description: string;
  audience: string[];
  organization: string[];
  publishDate: Dayjs;
  expiryDate: Dayjs;
  status: string;
  category: string;
  importance_level: string;
  link: string;
  notification_preferences: string[];
  isScheduled: boolean;
}

const SchoolWiseAnnouncementInitialData: Announcement[] = [
  {
    id: '1',
    title: 'Midterm Exam Schedule Released',
    description:
      'The schedule for the midterm exams is now available. Please review the dates and times for each subject.',
    audience: ['All Students', 'Parents', 'Teachers'],
    organization: ['Primary', 'Pre Primary'],
    publishDate: dayjs('2024-10-25'),
    expiryDate: dayjs('2024-11-10'),
    status: 'Published',
    category: 'Academic',
    importance_level: 'High',
    link: 'https://schoolportal.edu/exam-schedule',
    notification_preferences: ['Email'],
    isScheduled: false,
  },
  {
    id: '2',
    title: 'Annual School Picnic',
    description:
      'Join us for the annual school picnic at Riverside Park. Enjoy games, activities, and a fun day out with friends!',
    audience: ['All Students', 'Teachers', 'Staff'],
    organization: ['Primary', 'Pre Primary'],
    publishDate: dayjs('2024-11-05'),
    expiryDate: dayjs('2024-11-07'),
    status: 'Scheduled',
    category: 'Extracurricular',
    importance_level: 'Medium',
    link: 'https://schoolportal.edu/picnic-info',
    notification_preferences: ['App Notification'],
    isScheduled: true,
  },
  {
    id: '3',
    title: 'Staff Meeting',
    description:
      'All staff are required to attend the upcoming staff meeting to discuss the new curriculum and school policies.',
    audience: ['Staff'],
    organization: ['Primary', 'Pre Primary'],
    publishDate: dayjs('2024-10-28'),
    expiryDate: dayjs('2024-10-28'),
    status: 'Published',
    category: 'Administrative',
    importance_level: 'High',
    link: '',
    notification_preferences: ['SMS'],
    isScheduled: false,
  },
  {
    id: '4',
    title: 'Science Fair Participation',
    description:
      'Students interested in participating in the annual Science Fair should submit their entries by the end of this month.',
    audience: ['Students', 'Teachers'],
    organization: ['Primary', 'Pre Primary'],
    publishDate: dayjs('2024-10-30'),
    expiryDate: dayjs('2024-11-30'),
    status: 'Scheduled',
    category: 'Extracurricular',
    importance_level: 'Medium',
    link: 'https://schoolportal.edu/science-fair',
    notification_preferences: ['Email'],
    isScheduled: false,
  },
];

export const getImportanceLevelColor = (level: string) => {
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

const SchoolWiseAnnounsement = (props: TabComponentType) => {
  // Controls form visibility through URL search parameters
  const [params, setParams] = useSearchParam({ isForm: 'false' });
  // Stores the announcement being edited
  const [editingAnnouncement, setEditingAnnouncement] = useState<any | null>(null);
  // Stores the announcement being viewed in detail
  const [viewAnnouncement, setViewAnnouncement] = useState<any | null>(null);
  // Controls the visibility of view announcement dialog
  const view_dialog = useBoolean();
  // Stores the ID of announcement to be deleted
  const [deleteAnnouncement, setDeleteAnnouncement] = useState('');
  // Controls the visibility of delete confirmation dialog
  const confirm_dialog = useBoolean();
  // Controls the visibility of publish modal
  const publish_modal = useBoolean();
  // Stores the announcement being published
  const [publishingAnnouncement, setPublishingAnnouncement] = useState<any | null>(null);

  // Stores the main table data for announcements
  const [announcementTableData, setAnnouncementTableData] = useState<Announcement[]>(
    SchoolWiseAnnouncementInitialData
  );
  /**
   * Deletes an announcement from the table data based on the provided ID
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
   * If editing, updates the existing announcement
   * If creating new, adds a new announcement to the table
   * @param values - The form values to be submitted
   */
  const handleSubmit = (values: any) => {
    if (editingAnnouncement) {
      console.log('editing announcement---', editingAnnouncement);

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
   * Closes all dialogs and resets form-related states
   * Clears editing announcement, publishing announcement and closes modals
   */
  const handleCloseDialog = () => {
    setEditingAnnouncement(null);
    setParams({ isForm: 'false' });
    publish_modal.onFalse();
    setPublishingAnnouncement(null);
  };

  /**
   * Publishes an announcement by updating its status and related fields
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
  const links =
    params.isForm === 'true'
      ? [
          { name: 'Communication', href: '/communication/dashboard' },
          { name: 'Announcements' },
          { name: 'School Wise Announcement' },
          { name: 'Announcement Form' },
        ]
      : [
          { name: 'Communication', href: '/communication/dashboard' },
          { name: 'Announcements' },
          { name: 'School Wise Announcement' },
        ];

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Schedule Exam"
        description={
          params.isForm === 'true'
            ? 'Create or update school-wide announcements with important messages, event details, or notifications. Share information efficiently with students, teachers, and staff.'
            : 'View and manage all school-wide announcements, including message content, target audience, and publication status. Add new announcements, update existing ones, or remove them as needed.'
        }
        links={links}
        sx={{ px: 1, mb: 2 }}
        action={
          <Button
            size="small"
            startIcon={params.isForm === 'true' ? <Iconify icon="eva:arrow-back-fill" /> : <Add />}
            variant="contained"
            onClick={
              params.isForm === 'true'
                ? () => handleCloseDialog
                : () => {
                    setParams({ isForm: 'true' });
                  }
            }
          >
            {params.isForm === 'true' ? 'Back' : 'School Wise Announcement'}
          </Button>
        }
      />
      {params.isForm === 'true' ? (
        <Card>
          <AnnouncementForm
            initialValues={editingAnnouncement}
            onSubmit={handleSubmit}
            isEdit={!!editingAnnouncement}
          />
        </Card>
      ) : (
        <CustomizableTable
          tableId="school-wise-announcement-table"
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
                      setParams({ isForm: 'true' });
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
          <Button onClick={confirm_dialog.onFalse} variant="contained" color="error">
            Cancel
          </Button>
          <Button
            onClick={() => {
              handleDelete(deleteAnnouncement);
            }}
            variant="contained"
            color="success"
          >
            Confirm
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
          <Button
            onClick={() => {
              publish_modal.onFalse();
              setPublishingAnnouncement(null);
            }}
            variant="outlined"
            color="error"
          >
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

export default SchoolWiseAnnounsement;

/**
 * Interface representing the form values for an announcement
 * @property {string} title - The title of the announcement
 * @property {string} description - The detailed description of the announcement
 * @property {string} status - Current status of the announcement
 * @property {string[]} audience - Array of selected audience groups
 * @property {string[]} organization - Array of selected organizations
 * @property {Dayjs | null} publishDate - Date when the announcement should be published
 * @property {Dayjs | null} expiryDate - Date when the announcement should expire
 * @property {string} category - Category of the announcement
 * @property {string} importance_level - Priority level of the announcement
 * @property {string} link - Optional URL associated with the announcement
 * @property {string[]} notification_preferences - Selected notification methods
 * @property {boolean} isScheduled - Whether the announcement is scheduled for later
 */
interface AnnouncementFormValues {
  title: string;
  description: string;
  status: string;
  audience: string[];
  organization: string[];
  publishDate: Dayjs | null;
  expiryDate: Dayjs | null;
  category: string;
  importance_level: string;
  link: string;
  notification_preferences: string[];
  isScheduled: boolean;
}

/**
 * Props interface for the AnnouncementForm component
 * @property {function} onSubmit - Handler function called when form is submitted
 * @property {AnnouncementFormValues | null} initialValues - Initial values for the form, optional
 * @property {boolean} isEdit - Flag indicating if form is in edit mode
 */
interface AnnouncementFormProps {
  onSubmit: (values: AnnouncementFormValues) => void;
  initialValues?: AnnouncementFormValues | null;
  isEdit?: boolean;
}

const validationSchema = Yup.object({
  title: Yup.string()
    .required('Title is required')
    .min(3, 'Title must be at least 3 characters long'),

  description: Yup.string()
    .required('Description is required')
    .min(10, 'Description must be at least 10 characters long'),

  status: Yup.string().required('Status is required'),

  audience: Yup.array()
    .of(Yup.string())
    .min(1, 'At least one audience must be selected')
    .required('Audience is required'),

  organization: Yup.array()
    .of(Yup.string())
    .min(1, 'At least one organization must be selected')
    .required('Organization is required'),

  publishDate: Yup.date()
    .nullable()
    .required('Publish date is required')
    .typeError('Invalid date format'),

  expiryDate: Yup.date()
    .nullable()
    .min(Yup.ref('publishDate'), 'Expiry date must be after the publish date')
    .typeError('Invalid date format'),

  category: Yup.string().required('Category is required'),

  importance_level: Yup.string().required('Importance level is required'),

  link: Yup.string().url('Enter a valid URL').optional(),

  notification_preferences: Yup.array()
    .of(Yup.string())
    .min(1, 'Select at least one notification preference')
    .required('Notification preferences are required'),

  isScheduled: Yup.boolean(),
});

const AnnouncementForm: React.FC<AnnouncementFormProps> = ({
  onSubmit,
  initialValues = null,
  isEdit = false,
}) => {
  // List of available organizations/schools
  const allOrganizations = [
    { value: 'Pre Primary', label: 'Pre Primary' },
    { value: 'Primary', label: 'Primary' },
    { value: 'Secondary', label: 'Secondary' },
    { value: 'Higher Secondary', label: 'Higher Secondary' },
  ];

  // State to track if all organizations are selected
  const [isAllSelected, setIsAllSelected] = useState(
    initialValues?.organization?.length === allOrganizations.length
  );

  /**
   * Determines the status of the announcement based on scheduling and publish date
   * @param isScheduled - Boolean indicating if announcement is scheduled
   * @param selectedDate - Selected publish date
   * @returns 'Published' if not scheduled or date is in past, 'Scheduled' if date is in future
   */
  const determineStatus = (isScheduled: boolean, selectedDate: Dayjs | null) => {
    if (!isScheduled) return 'Published';
    if (!selectedDate) return 'Scheduled';

    const now = dayjs();
    return selectedDate.isAfter(now) ? 'Scheduled' : 'Published';
  };

  const formik = useFormik({
    initialValues: {
      title: initialValues?.title || '',
      description: initialValues?.description || '',
      status: initialValues?.status || '',
      audience: initialValues?.audience || [],
      organization: initialValues?.organization || [],
      publishDate: initialValues?.publishDate ? dayjs(initialValues?.publishDate) : dayjs(),
      expiryDate: initialValues?.expiryDate ? dayjs(initialValues?.expiryDate) : null,
      category: initialValues?.category || '',
      importance_level: initialValues?.importance_level || '',
      link: initialValues?.link || '',
      notification_preferences: initialValues?.notification_preferences || [],
      isScheduled: initialValues?.isScheduled || false,
    },
    validationSchema,
    onSubmit: (values) => {
      console.log('values------', values);

      onSubmit({
        ...values,
        publishDate: values.isScheduled ? values.publishDate : dayjs(),
        status: determineStatus(values.isScheduled, values.publishDate),
      });
    },
  });

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

  const handleOrganizationChange = (selectedValues: string[]) => {
    if (selectedValues.includes('all') || selectedValues.includes('deselectAll')) {
      const allOrganizationValues = allOrganizations.map((org) => org.value);
      if (isAllSelected) {
        formik.setFieldValue('organization', []);
      } else {
        formik.setFieldValue('organization', allOrganizationValues);
      }
      setIsAllSelected(!isAllSelected);
    } else {
      formik.setFieldValue('organization', selectedValues);
      setIsAllSelected(selectedValues.length === allOrganizations.length);
    }
  };

  const handleNotificationPreferenceChange = (preference: string) => {
    const currentPreferences = formik.values.notification_preferences;
    const updatedPreferences = currentPreferences.includes(preference)
      ? currentPreferences.filter((p) => p !== preference)
      : [...currentPreferences, preference];

    formik.setFieldValue('notification_preferences', updatedPreferences);
  };
  console.log('formik error====', formik.errors);

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <form onSubmit={formik.handleSubmit}>
        <Scrollbar sx={{ p: 2, height: '450px' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
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
            </Grid>

            <Grid item xs={12} md={6}>
              <CustomSelect
                label="Select Organizations"
                options={[
                  {
                    value: isAllSelected ? 'deselectAll' : 'all',
                    label: isAllSelected ? 'Deselect All' : 'All',
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
                label="Select Audience"
                options={[
                  { value: 'Staff', label: 'Staff' },
                  { value: 'Students', label: 'Students' },
                  { value: 'Parents', label: 'Parents' },
                ]}
                multiple
                value={formik.values.audience}
                onChange={(val) => {
                  formik.setFieldValue('audience', val);
                }}
                formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
              />
              {formik.touched.audience && formik.errors.audience && (
                <FormHelperText>{formik.errors.audience}</FormHelperText>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <DateTimePicker
                label="Expiry Date & Time"
                value={formik.values.expiryDate}
                onChange={handleDateChange}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    error: formik.touched.expiryDate && Boolean(formik.errors.expiryDate),
                  },
                }}
                disablePast
              />
              {formik.touched.expiryDate && formik.errors.expiryDate && (
                <FormHelperText error>{String(formik.errors.expiryDate)}</FormHelperText>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
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
              />
              {formik.touched.category && formik.errors.category && (
                <FormHelperText>{formik.errors.category}</FormHelperText>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <CustomSelect
                label="Importance Level"
                options={[
                  { value: 'urgent', label: 'Urgent' },
                  { value: 'critical', label: 'Critical' },
                ]}
                placeholder="Announcement Importance level"
                value={formik.values.importance_level}
                onChange={(val) => {
                  formik.setFieldValue('importance_level', val);
                }}
                formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
              />
              {formik.touched.importance_level && formik.errors.importance_level && (
                <FormHelperText>{formik.errors.importance_level}</FormHelperText>
              )}
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
                <DateTimePicker
                  label="Schedule Date & Time"
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
                {formik.touched.publishDate && formik.errors.publishDate && (
                  <FormHelperText error>{String(formik.errors.publishDate)}</FormHelperText>
                )}
              </Grid>
            )}

            <Grid item xs={12}>
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
      </form>
    </Box>
  );
};

export const DetailRow = ({ label, value, icon }: any) => (
  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
    {icon && (
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Iconify icon={icon} className="text-gray-500 w-full h-full" />
        <Typography variant="subtitle2" className="text-gray-600 mb-1">
          {label}
        </Typography>
      </Box>
    )}
    <Box sx={{ pb: 2, pl: 4.5 }}>
      <Box>{value}</Box>
    </Box>
  </Box>
);

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
        label="Organizations"
        icon="mdi:office-building-outline"
        value={
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {announcement?.organization?.map((org: any) => (
              <Chip key={org} label={org} size="small" variant="outlined" />
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
