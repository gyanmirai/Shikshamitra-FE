'use client';

import type { Dayjs } from 'dayjs';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
// eslint-disable-next-line import/no-extraneous-dependencies
import { MuiColorInput } from 'mui-color-input';
import React, { useState, useEffect, useCallback } from 'react';

import { Add } from '@mui/icons-material';
import Grid2 from '@mui/material/Unstable_Grid2';
import { DateTimePicker } from '@mui/x-date-pickers';
import {
  Box,
  List,
  Grid,
  Card,
  Button,
  Switch,
  ListItem,
  TextField,
  Typography,
  IconButton,
  ListItemIcon,
  ListItemText,
  DialogActions,
  DialogContent,
  DialogContentText,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { DetailRow } from 'src/screens/communication/announcement/schoolWiseAnnounsement';

import { Iconify } from 'src/components/iconify';
import { UploadBox } from 'src/components/upload';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

interface Document {
  id: string;
  name: string;
  url: string;
  file?: File;
}

interface TSubjectTable {
  id: number;
  subjectName: string;
  subjectCode: string;
  scheduleDate: Dayjs | null;
  className: string;
  primaryTeacher: string;
  secondaryTeacher: string[] | null;
  documents?: Document[];
  prerequisites: string;
  learningGoal: string;
  subjectColor: string;
  description: string;
  status: string;
}

export const subjectData: TSubjectTable[] = [
  {
    id: 1,
    subjectName: 'Mathematics',
    subjectCode: 'Math01',
    scheduleDate: dayjs('2024-10-28'),
    description: '',
    subjectColor: '#f04622',
    className: '1',
    primaryTeacher: 'Ms. Johnson',
    secondaryTeacher: ['Mr. Smith'],
    prerequisites: 'Basic counting skills',
    learningGoal: 'Develop understanding of numbers, addition, and subtraction.',
    status: 'Publish',
  },
  {
    id: 2,
    subjectName: 'Science',
    subjectCode: 'Sci02',
    scheduleDate: dayjs('2024-10-28'),
    description: '',
    subjectColor: '#4e7dbe',
    className: '2',
    primaryTeacher: 'Mr. Smith',
    secondaryTeacher: ['Ms. Johnson'],
    prerequisites: 'Interest in nature and environment',
    learningGoal: 'Understand basic concepts of earth science and the environment.',
    status: 'Unpublish',
  },
  {
    id: 3,
    subjectName: 'English',
    subjectCode: 'Eng03',
    scheduleDate: dayjs('2024-10-28'),
    description: '',
    subjectColor: '#4e7dbe',
    className: '1',
    primaryTeacher: 'Ms. Johnson',
    secondaryTeacher: ['Mrs. Green'],
    prerequisites: 'Basic reading skills',
    learningGoal: 'Enhance reading comprehension and vocabulary.',
    status: 'Publish',
  },
  {
    id: 4,
    subjectName: 'History',
    subjectCode: 'Hist01',
    scheduleDate: dayjs('2024-10-28'),
    description: '',
    subjectColor: '#7abe4e',
    className: '1',
    primaryTeacher: 'Ms. Johnson',
    secondaryTeacher: ['Mrs. Green'],
    prerequisites: 'Interest in past events',
    learningGoal: 'Learn about important historical events and figures.',
    status: 'Unpublish',
  },
  {
    id: 5,
    subjectName: 'Geography',
    scheduleDate: dayjs('2024-10-28'),
    subjectCode: 'Geo01',
    description: '',
    subjectColor: '#4444',
    className: '3',
    primaryTeacher: 'Ms. Davis',
    secondaryTeacher: ['Mrs. Green'],
    prerequisites: 'Basic map reading skills',
    learningGoal: 'Develop an understanding of world geography and countries.',
    status: 'Publish',
  },
];

const Subject = (props: TabComponentType) => {
  const { searchParams, setSearchParams } = props;
  const [subjectTableData, setSubjectTableData] = useState(subjectData);
  const [filteredData, setFilteredData] = useState<TSubjectTable[]>([]);
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  const [open, setOpen] = useState(false);
  const deleteConfirmDialog = useBoolean();
  const confirmPublishDialog = useBoolean();
  const showSubjectDialog = useBoolean();
  const addBulkDialog = useBoolean();
  const [classes, setClasses] = useState('');

  const [selectedSubject, setSelectedSubject] = useState<TSubjectTable | null>(null);
  const [isEdit, setIsEdit] = useState(false);

  const [pendingStatusChange, setPendingStatusChange] = useState<{
    id: number;
    newValue: string;
  } | null>(null);

  useEffect(() => {
    if (classData?.items?.length) {
      if (!classes) {
        const firstClass = classData.items[0];
        setClasses(firstClass?.id);
      }
      const selectedClass = classData.items.find((c: any) => c.id === classes);
      if (selectedClass) {
        const filtered = subjectTableData.filter((item) => item.className === selectedClass?.name);
        setFilteredData(filtered);
      }
    }
  }, [classData, subjectTableData, setSearchParams, classes]);

  const handleStatusChange = (id: number, value: string) => {
    setPendingStatusChange({ id, newValue: value === 'Publish' ? 'Unpublish' : 'Publish' });
    confirmPublishDialog.onTrue();
  };

  const handleSubmit = (values: TSubjectTable) => {
    if (isEdit) {
      setSubjectTableData(
        subjectTableData.map((subject) => (subject.id === values.id ? values : subject))
      );
    } else {
      setSubjectTableData([...subjectTableData, values]);
    }
    setOpen(false);
    setIsEdit(false);
    setSelectedSubject(null);
  };

  const handleViewSubject = (subject: TSubjectTable) => {
    setSelectedSubject(subject);
    showSubjectDialog.onTrue();
  };

  const handleCloseDialog = () => {
    setOpen(false);
    deleteConfirmDialog.onFalse();
    confirmPublishDialog.onFalse();
    setIsEdit(false);
    setSelectedSubject(null);
  };

  const handleDelete = () => {
    if (selectedSubject) {
      setSubjectTableData(subjectTableData.filter((subject) => subject.id !== selectedSubject.id));
      deleteConfirmDialog.onFalse();
      setSelectedSubject(null);
    }
  };

  const confirmStatusChange = () => {
    if (pendingStatusChange) {
      const { id, newValue } = pendingStatusChange;
      setSubjectTableData((prevSubject) =>
        prevSubject.map((subject) =>
          subject.id === id ? { ...subject, status: newValue } : subject
        )
      );
    }
    confirmPublishDialog.onFalse();
    setPendingStatusChange(null);
  };

  const actions = useCallback(({ popover: pop, row }: any) => <> </>, []);

  return (
    <Box>
      {open ? (
        <>
          <CustomBreadcrumbs
            heading="Subjects"
            links={[
              { name: 'Academic and Assignment' },
              { name: 'Curriculum Management' },
              { name: 'Subjects' },
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
          {/* <CustomDialog
            maxWidth="sm"
            open={dialog.value}
            handleClose={handleCloseDialog}
            title={isEdit ? 'Update Subject' : 'Add Subject'}
          > */}
          <Card>
            <SubjectForm
              onSubmit={handleSubmit}
              onClose={handleCloseDialog}
              data={selectedSubject}
              isEdit={isEdit}
            />{' '}
          </Card>
          {/* </CustomDialog> */}
        </>
      ) : (
        <>
          {' '}
          <CustomBreadcrumbs
            heading="Subjects"
            links={[
              { name: 'Academic and Assignment' },
              { name: 'Curriculum Management' },
              { name: 'Subjects' },
            ]}
            sx={{ px: 1, mb: 2 }}
            action={
              <Button
                startIcon={<Add />}
                size="small"
                variant="contained"
                onClick={() => {
                  setOpen(true);
                  setIsEdit(false);
                  setSelectedSubject(null);
                }}
              >
                Subject
              </Button>
            }
          />
          <CustomSelect
            label="Class"
            name="class"
            isLoading={isLoading}
            options={classData?.items || []}
            valueKey="id"
            labelKey="name"
            formControlProps={{ sx: { width: '150px' } }}
            value={classes}
            onChange={(value) => {
              // setClasses(value);
            }}
          />
          <Grid2 container spacing={3}>
            {classes && (
              <CustomizableTable
                tableId="subject-table"
                columns={[
                  { id: 'subjectCode', label: 'Subject Code', minWidth: '128px', align: 'left' },
                  // {
                  //   id: 'subjectColor',
                  //   label: 'Subject Color',
                  //   minWidth: '130px',
                  //   render(value, row) {
                  //     return (
                  //       <TimelineDot
                  //         sx={{
                  //           bgcolor: value,
                  //           width: '12px',
                  //           height: '12px',
                  //           ml: '30px',
                  //         }}
                  //       />
                  //     );
                  //   },
                  // },
                  {
                    id: 'subjectName',
                    label: 'Subject Name',
                    minWidth: '135px',
                    align: 'left',
                    render(value, row) {
                      return (
                        <Typography variant="caption" color={row.subjectColor}>
                          {value}
                        </Typography>
                      );
                    },
                  },
                  {
                    id: 'primaryTeacher',
                    label: 'Primary Teacher',
                    minWidth: '150px',
                    align: 'left',
                  },
                  {
                    id: 'secondaryTeacher',
                    label: 'Secondary Teacher',
                    minWidth: '170px',
                    align: 'left',
                    render: (value) => (
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {value.map((audience: string, index: number) => (
                          // <Chip key={audience} label={audience} size="small" variant="outlined" />
                          // <Typography
                          //   component="span"
                          //   variant="body2"
                          //   sx={{
                          //     px: 1.0,
                          //     py: 0.5,
                          //     borderRadius: '30px',
                          //     border: `1px solid black`,
                          //     fontSize: '0.75rem',
                          //   }}
                          // >
                          //   {audience}
                          // </Typography>
                          <Typography variant="caption">
                            {audience}
                            {index < value.length - 1 && ' | '}
                          </Typography>
                        ))}
                      </Box>
                    ),
                  },
                  { id: 'prerequisites', label: 'Prerequisites' },
                  { id: 'learningGoal', label: 'Learning Goal', minWidth: '150px', align: 'left' },
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
                    isSort: false,
                    render(value, row) {
                      const subject = subjectTableData.find((s) => s.id === row.id);
                      return (
                        <ThreeDotsActions
                          // actions={(prop) => actions({ ...props, row })}
                          placement="right-top"
                          showViewIcon
                          showEditIcon
                          showDeleteIcon
                          showThreeDots={false}
                          handleViewClick={() => {
                            if (subject) {
                              handleViewSubject(subject);
                            }
                          }}
                          handleEditClick={() => {
                            setSelectedSubject(row as any);
                            setIsEdit(true);
                            setOpen(true);
                          }}
                          handleDeleteClick={() => {
                            setSelectedSubject(row as any);
                            deleteConfirmDialog.onTrue();
                          }}
                        />
                      );
                    },
                  },
                ]}
                data={filteredData}
              />
            )}
          </Grid2>
        </>
      )}

      <CustomDialog
        maxWidth="sm"
        open={deleteConfirmDialog.value}
        handleClose={handleCloseDialog}
        title="Delete Subject"
      >
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete subject {selectedSubject?.subjectName} ?
          </DialogContentText>
        </DialogContent>{' '}
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
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
            this Subject?
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
        title="Subject Details"
        open={showSubjectDialog.value}
        handleClose={() => {
          showSubjectDialog.onFalse();
          setSelectedSubject(null);
        }}
        maxWidth="sm"
      >
        <ViewSubject subject={selectedSubject} />
      </CustomDialog>
    </Box>
  );
};

export default Subject;

interface AddBulkProps {
  selectedClass: string;
}

const AddBulk: React.FC<AddBulkProps> = ({ selectedClass }) => {
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  const [documents, setDocuments] = useState<Document[]>([]);

  const formik = useFormik({
    initialValues: {
      className: selectedClass,
      subjects: [],
    },
    onSubmit: (values) => {
      alert('submit calls');
    },
  });

  const handleFileUpload = (files: File[]) => {
    const newDocs: Document[] = files.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      url: URL.createObjectURL(file),
      file,
    }));
    setDocuments((prev) => [...prev, ...newDocs]);
  };

  const handleRemoveDocument = (docId: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== docId));
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <form onSubmit={formik.handleSubmit}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '300px' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomSelect
                options={classData?.items || []}
                label="Class"
                name="className"
                value={formik.values.className}
                disabled
                labelKey="name"
                valueKey="name"
                onChange={(val) => {}}
                formControlProps={{ sx: { minWidth: 180, width: '100%' } }}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomSelect
                label="Subject"
                name="subjects"
                options={[
                  { value: 'Math', label: 'Math' },
                  { value: 'Science', label: 'Science' },
                  { value: 'English', label: 'English' },
                  { value: 'Gujarati', label: 'Gujarati' },
                ]}
                multiple
                formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                value={formik.values.subjects}
                onChange={(value) => formik.setFieldValue('subjects', value)}
              />
            </Grid>
            <Grid item xs={12}>
              <UploadBox
                onDrop={handleFileUpload}
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
            {documents.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Uploaded Documents
                </Typography>
                <List>
                  {documents.map((doc, index) => (
                    <ListItem
                      key={doc.id}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          onClick={() => handleRemoveDocument(doc.id as unknown as string)}
                        >
                          <Iconify icon="mdi:delete" />
                        </IconButton>
                      }
                    >
                      <ListItemText primary={doc.name} />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            )}
          </Grid>
        </Scrollbar>
        <DialogActions>
          <Button variant="contained" type="submit">
            Submit
          </Button>
        </DialogActions>
      </form>
    </Box>
  );
};

interface ViewSubjectProps {
  subject: TSubjectTable | null;
}
export const ViewSubject: React.FC<ViewSubjectProps> = ({ subject }) => (
  <Box sx={{ p: 2 }}>
    <Scrollbar sx={{ height: '400px' }}>
      <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Iconify icon="mdi:text-subject" className="text-gray-500 w-6 h-6" />
        <Typography variant="h6" className="font-semibold">
          {subject?.subjectName}
        </Typography>
      </Box>

      <hr className="my-6 border-gray-200" />

      <DetailRow
        label="Description"
        icon="mdi:text-box-outline"
        value={
          <Typography variant="body2" className="text-gray-700">
            {subject?.description}
          </Typography>
        }
      />
      <DetailRow
        label="Class"
        icon="mdi:school-outline"
        value={
          <Typography variant="body2" className="text-gray-700">
            {subject?.className}
          </Typography>
        }
      />
      <DetailRow
        label="Subject Color"
        icon="mdi:color"
        value={
          <Typography variant="body2" className="text-gray-700">
            {subject?.subjectColor}
          </Typography>
        }
      />
      <DetailRow
        label="Primary Teacher"
        icon="mdi:teacher"
        value={
          <Typography variant="body2" className="text-gray-700">
            {subject?.primaryTeacher}
          </Typography>
        }
      />
      <DetailRow
        label="Secondary Teacher"
        icon="mdi:teacher"
        value={
          <Typography variant="body2" className="text-gray-700">
            {subject?.secondaryTeacher}
          </Typography>
        }
      />
      <DetailRow
        label="Prerequisites"
        icon="mdi:palette-advanced"
        value={
          <Typography variant="body2" className="text-gray-700">
            {subject?.prerequisites}
          </Typography>
        }
      />
      <DetailRow
        label="Learning Goal"
        icon="mdi:goal"
        value={
          <Typography variant="body2" className="text-gray-700">
            {subject?.learningGoal}
          </Typography>
        }
      />

      {subject?.documents && subject?.documents.length > 0 && (
        <Box mt={2}>
          <Typography variant="subtitle2" gutterBottom>
            Attached Documents
          </Typography>
          <List>
            {subject?.documents.map((doc: any, index: any) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <Iconify icon="mdi:file-document-outline" />
                </ListItemIcon>
                <ListItemText primary={doc.name} />
                <IconButton href={doc.url} target="_blank">
                  <Iconify icon="mdi:download" />
                </IconButton>
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Scrollbar>
  </Box>
);

interface SubjectFormProps {
  onSubmit: (values: TSubjectTable) => void;
  onClose: () => void;
  data: TSubjectTable | null;
  isEdit: boolean;
}

const SubjectForm: React.FC<SubjectFormProps> = ({ onSubmit, onClose, data, isEdit }) => {
  const [subjectColor, setSubjectColor] = useState('');
  const [isDraft, setIsDraft] = useState(!isEdit || (data && data.status === 'Unpublish'));
  const [documents, setDocuments] = useState<Document[]>(data?.documents || []);
  const isPublished = data?.status === 'Publish';

  const validationSchema = Yup.object().shape({
    subjectCode: Yup.string().required('Subject Code is Required'),
    subjectName: Yup.string().required('Subject Name is required'),
    className: Yup.string().required('Class is required'),
    primaryTeacher: Yup.string().required('Primary teacher is required'),
    secondaryTeacher: Yup.array().of(Yup.string()).required('Assigned Teacher is required'), // Changed to array
    learningGoal: Yup.string().required('Learning Goal is required'),
    prerequisites: Yup.string().required('Prerequisites are required'),
    description: Yup.string().required('Description is required'),
    subjectColor: Yup.string().required('Subject Color is required'),
  });

  const formik = useFormik({
    initialValues: {
      subjectCode: data?.subjectCode || '',
      subjectName: data?.subjectName || '',
      scheduleDate: data?.scheduleDate || dayjs(),
      className: data?.className || '',
      primaryTeacher: data?.primaryTeacher || '',
      secondaryTeacher: data?.secondaryTeacher || [],
      learningGoal: data?.learningGoal || '',
      prerequisites: data?.prerequisites || '',
      description: data?.description || '',
      subjectColor: data?.subjectColor || '',
      status: data?.status || 'Unpublish',
    },
    validationSchema,
    onSubmit: (values) => {
      onSubmit({
        ...values,
        id: data?.id || Date.now(),
        status: isDraft ? 'Unpublish' : 'Publish',
        documents,
      });
    },
  });

  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  const handleFileUpload = (files: File[]) => {
    const newDocs: Document[] = files.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      url: URL.createObjectURL(file),
      file,
    }));
    setDocuments((prev) => [...prev, ...newDocs]);
  };

  const handleRemoveDocument = (docId: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== docId));
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <form onSubmit={formik.handleSubmit}>
        <Scrollbar sx={{ p: 2, height: '300px' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <CustomSelect
                options={classData?.items || []}
                label="Class"
                isLoading={isLoading}
                value={formik.values.className}
                labelKey="name"
                valueKey="name"
                onChange={(val) => {
                  formik.setFieldValue('className', val);
                }}
                formControlProps={{ sx: { minWidth: 180, width: '100%' } }}
                error={formik.touched.className && Boolean(formik.errors.className)}
                disabled={isPublished}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Subject Code"
                name="subjectCode"
                size="small"
                value={formik.values.subjectCode}
                onChange={formik.handleChange}
                disabled={isPublished}
                error={formik.touched.subjectCode && Boolean(formik.errors.subjectCode)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Subject Name"
                name="subjectName"
                size="small"
                disabled={isPublished}
                value={formik.values.subjectName}
                onChange={formik.handleChange}
                error={formik.touched.subjectName && Boolean(formik.errors.subjectName)}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <CustomSelect
                label="Primary Teacher"
                options={[
                  { value: 'Jiya', label: 'Jiya' },
                  { value: 'Riya', label: 'Riya' },
                  { value: 'Priya', label: 'Priya' },
                ]}
                name="primaryTeacher"
                value={formik.values.primaryTeacher}
                formControlProps={{ sx: { minWidth: 180, width: '100%' } }}
                onChange={(val) => {
                  formik.setFieldValue('primaryTeacher', val);
                }}
                error={formik.touched.primaryTeacher}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <CustomSelect
                label="Secondary Teacher"
                options={[
                  { value: 'Jiya', label: 'Jiya' },
                  { value: 'Riya', label: 'Riya' },
                  { value: 'Priya', label: 'Priya' },
                ]}
                name="secondaryTeacher"
                multiple
                value={formik.values.secondaryTeacher}
                formControlProps={{ sx: { minWidth: 180, width: '100%' } }}
                onChange={(val) => {
                  formik.setFieldValue('secondaryTeacher', val);
                }}
                error={formik.touched.secondaryTeacher}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <DateTimePicker
                label="Schedule Date"
                value={formik.values.scheduleDate}
                onChange={(value) => {
                  formik.setFieldValue('scheduleDate', value);
                }}
                disabled={isPublished}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                  },
                }}
                disablePast
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <MuiColorInput
                placeholder="Subject Color"
                size="small"
                format="hex"
                value={formik.values.subjectColor}
                onChange={(e) => {
                  formik.setFieldValue('subjectColor', e);
                }}
                disabled={isPublished}
                sx={{
                  minWidth: 180,
                  width: '100%',
                  '& .MuiInputBase-root': {
                    fontSize: '0.875rem', // Smaller font size matching other inputs
                  },
                  '& .MuiInputBase-input::placeholder': {
                    fontSize: '0.875rem', // Smaller font size for placeholder
                  },
                }}
                error={formik.touched.subjectColor && Boolean(formik.errors.subjectColor)}
                helperText={formik.touched.subjectColor && formik.errors.subjectColor}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                multiline
                rows={3}
                disabled={isPublished}
                label="Learning Goals"
                name="learningGoal"
                onChange={formik.handleChange}
                value={formik.values.learningGoal}
                size="small"
                error={formik.touched.learningGoal && Boolean(formik.errors.learningGoal)}
                helperText={formik.touched.learningGoal && formik.errors.learningGoal}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                multiline
                rows={3}
                disabled={isPublished}
                label="Prerequisites or Resources"
                name="prerequisites"
                size="small"
                value={formik.values.prerequisites}
                onChange={formik.handleChange}
                error={formik.touched.prerequisites && Boolean(formik.errors.prerequisites)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                disabled={isPublished}
                label="Description"
                name="description"
                value={formik.values.description}
                onChange={formik.handleChange}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
              />
            </Grid>

            <Grid item xs={12}>
              <UploadBox
                onDrop={handleFileUpload}
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
            {documents.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Uploaded Documents
                </Typography>
                <List>
                  {documents.map((doc, index) => (
                    <ListItem
                      key={doc.id}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          onClick={() => handleRemoveDocument(doc.id as unknown as string)}
                        >
                          <Iconify icon="mdi:delete" />
                        </IconButton>
                      }
                    >
                      <ListItemText primary={doc.name} />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            )}
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
