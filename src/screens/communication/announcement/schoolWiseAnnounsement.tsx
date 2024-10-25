import type { Dayjs } from 'dayjs';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useState } from 'react';

import { DateTimePicker } from '@mui/x-date-pickers';
import {
  Box,
  Grid,
  Switch,
  Button,
  MenuList,
  MenuItem,
  TextField,
  Typography,
  DialogActions,
  DialogContent,
  FormHelperText,
  FormControlLabel,
  DialogContentText,
  // eslint-disable-next-line import/no-duplicates
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { UploadBox } from 'src/components/upload';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

interface Announcement {
  id: string;
  title: string;
  description: string;
  audience: string;
  date: Dayjs;
  status: string;
  isScheduled: boolean;
}

const SchoolWiseAnnounsementInitialData: Announcement[] = [
  {
    id: '1',
    title: 'School Assembly',
    description: 'School assembly will be held on Monday at 8 AM.',
    audience: 'All Students',
    date: dayjs('2025-10-30'),
    status: 'Published',
    isScheduled: false,
  },
  {
    id: '2',
    title: 'Parent-Teacher Meeting',
    description: 'PTM scheduled for all classes on the coming Saturday.',
    audience: 'Parents',
    date: dayjs('2024-11-02'),
    status: 'Scheduled',
    isScheduled: true,
  },
  {
    id: '3',
    title: 'Annual Sports Day',
    description: 'Annual Sports Day event scheduled for 15th November.',
    audience: 'All Students',
    date: dayjs('2024-11-15'),
    status: 'Published',
    isScheduled: false,
  },
];

const SchoolWiseAnnounsement = (props: TabComponentType) => {
  const [editingAnnouncement, setEditingAnnouncement] = useState<any | null>(null);
  const addAnounsmentDialog = useBoolean();
  const [deleteAnnouncement, setDeleteAnnouncement] = useState('');
  const confirm_dialog = useBoolean();

  const [announcementTableData, setAnnouncementTableData] = useState<Announcement[]>(
    SchoolWiseAnnounsementInitialData
  );

  const handleDelete = (id: string) => {
    setAnnouncementTableData((prevData) =>
      prevData.filter((announcement) => announcement.id !== id)
    );
  };

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

  const handleCloseDialog = () => {
    setEditingAnnouncement(null);
    addAnounsmentDialog.onFalse();
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">School Wise Announcement</Typography>
        <Button
          startIcon={<Iconify icon="mdi:plus" />}
          variant="contained"
          onClick={() => {
            addAnounsmentDialog.onTrue();
          }}
        >
          Add New Announcement
        </Button>
      </Box>

      <CustomizableTable
        columns={[
          { id: 'title', label: 'Title' },
          {
            id: 'date',
            label: 'Date',
            render: (value, row) => (
              <Typography fontSize="12px" gutterBottom>
                {dayjs(value).format('DD MMM YYYY')}
              </Typography>
            ),
          },
          { id: 'audience', label: 'Audience' },
          {
            id: 'status',
            label: 'Status',
            render: (value, row) => (
              <Label variant="soft" color={value === 'Published' ? 'primary' : 'warning'}>
                {value}
              </Label>
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
                    <MenuItem
                      onClick={() => {
                        addAnounsmentDialog.onTrue();
                        setEditingAnnouncement(row);
                      }}
                    >
                      <Iconify icon="mdi:pencil" sx={{ mr: 1 }} />
                      Edit
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        setDeleteAnnouncement(row.id);
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
        data={announcementTableData}
      />

      <CustomDialog
        title={editingAnnouncement ? 'Edit Announcement' : 'Create Announcement'}
        open={addAnounsmentDialog.value}
        handleClose={handleCloseDialog}
      >
        <AnnouncementForm
          initialValues={editingAnnouncement}
          onSubmit={handleSubmit}
          isEdit={!!editingAnnouncement}
        />
      </CustomDialog>

      <CustomDialog
        title="Confirm Delete"
        open={confirm_dialog.value}
        handleClose={confirm_dialog.onFalse}
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
    </Box>
  );
};

export default SchoolWiseAnnounsement;

interface AnnouncementFormValues {
  title: string;
  description: string;
  audience: string;
  date: Dayjs | null;
  status: string;
  isScheduled: boolean;
}

interface AnnouncementFormProps {
  onSubmit: (values: AnnouncementFormValues) => void;
  initialValues?: AnnouncementFormValues | null;
  isEdit?: boolean;
}

const AnnouncementForm: React.FC<AnnouncementFormProps> = ({
  onSubmit,
  initialValues = null,
  isEdit = false,
}) => {
  const determineStatus = (isScheduled: boolean, selectedDate: Dayjs | null) => {
    if (!isScheduled) return 'Published';
    if (!selectedDate) return 'Scheduled';

    const now = dayjs();
    return selectedDate.isAfter(now) ? 'Scheduled' : 'Published';
  };

  const validationSchema = Yup.object({
    title: Yup.string().required('Title is required').min(3, 'Title must be at least 3 characters'),
    description: Yup.string()
      .required('Description is required')
      .min(10, 'Description must be at least 10 characters'),
    audience: Yup.string().required('Audience is required'),
    date: Yup.mixed().required('Date is required'),
  });

  const formik = useFormik({
    initialValues: {
      title: initialValues?.title || '',
      description: initialValues?.description || '',
      audience: initialValues?.audience || '',
      date: initialValues?.date || dayjs(),
      status: initialValues?.status || 'Published',
      isScheduled: initialValues?.isScheduled || false,
    },
    validationSchema,
    onSubmit: (values) => {
      onSubmit({
        ...values,
        date: values.isScheduled ? values.date : dayjs(),
        status: determineStatus(values.isScheduled, values.date),
      });
    },
  });

  const handleDateChange = (newDate: Dayjs | null) => {
    if (newDate) {
      const newStatus = determineStatus(formik.values.isScheduled, newDate);
      formik.setValues({
        ...formik.values,
        date: newDate,
        status: newStatus,
      });
    }
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <form onSubmit={formik.handleSubmit}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '250px' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
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
            <Grid item xs={12}>
              <CustomSelect
                label="Select Audience"
                options={[
                  { value: 'Staff', label: 'Staff' },
                  { value: 'Students', label: 'Students' },
                  { value: 'Parents', label: 'Parents' },
                  { value: 'All', label: 'All' },
                ]}
                value={formik.values.audience}
                onChange={(val) => {
                  formik.setFieldValue('audience', val as string);
                }}
                formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
              />
              {formik.touched.audience && formik.errors.audience && (
                <FormHelperText>{formik.errors.audience}</FormHelperText>
              )}
            </Grid>
            <Grid item xs={12}>
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
              <Grid item xs={12}>
                <DateTimePicker
                  label="Schedule Date & Time"
                  value={formik.values.date}
                  onChange={handleDateChange}
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                      error: formik.touched.date && Boolean(formik.errors.date),
                    },
                  }}
                  disablePast
                />
                {formik.touched.date && formik.errors.date && (
                  <FormHelperText error>{String(formik.errors.date)}</FormHelperText>
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
                    <Typography variant="body2">Drag Your Document</Typography>
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
          <Button type="submit" variant="contained">
            {isEdit ? 'Update' : 'Create'} Announcement
          </Button>
        </DialogActions>
      </form>
    </Box>
  );
};
