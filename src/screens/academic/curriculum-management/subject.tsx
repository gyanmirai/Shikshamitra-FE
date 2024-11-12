import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
// eslint-disable-next-line import/no-extraneous-dependencies
import { MuiColorInput } from 'mui-color-input';
import React, { useState, useEffect } from 'react';

import { Add } from '@mui/icons-material';
import Grid2 from '@mui/material/Unstable_Grid2';
import { DateTimePicker } from '@mui/x-date-pickers';
import {
  Box,
  List,
  Grid,
  Chip,
  Button,
  Switch,
  MenuItem,
  MenuList,
  ListItem,
  TextField,
  Typography,
  IconButton,
  ListItemIcon,
  ListItemText,
  DialogActions,
  DialogContent,
  FormHelperText,
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
    subjectColor: '#0000',
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
    subjectColor: '#0111',
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
    subjectColor: '#0333',
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
    subjectColor: '#4444',
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

const Subject = ({
  searchParams,
  setSearchParams,
}: {
  searchParams: Record<string, string>;
  setSearchParams: (obj: Record<string, any>) => void;
}) => {
  const [subjectTableData, setSubjectTableData] = useState(subjectData);
  const [filteredData, setFilteredData] = useState<TSubjectTable[]>([]);
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  console.log('filteredData--', filteredData);

  const dialog = useBoolean();
  const deleteConfirmDialog = useBoolean();
  const confirmPublishDialog = useBoolean();
  const showSubjectDialog = useBoolean();
  const addBulkDialog = useBoolean();

  const [selectedSubject, setSelectedSubject] = useState<TSubjectTable | null>(null);
  const [isEdit, setIsEdit] = useState(false);

  const [pendingStatusChange, setPendingStatusChange] = useState<{
    id: number;
    newValue: string;
  } | null>(null);

  useEffect(() => {
    if (classData?.items?.length) {
      if (!searchParams.classId) {
        const firstClass = classData.items[0];
        setSearchParams({
          classId: firstClass.id,
        });
      }
      const selectedClass = classData.items.find((c: any) => c.id === searchParams.classId);
      if (selectedClass) {
        const filtered = subjectTableData.filter((item) => item.className === selectedClass?.name);
        setFilteredData(filtered);
      }
    }
  }, [searchParams.classId, classData, subjectTableData, setSearchParams]);

  const handleStatusChange = (id: number, value: string) => {
    setPendingStatusChange({ id, newValue: value === 'Publish' ? 'Unpublish' : 'Publish' });
    confirmPublishDialog.onTrue();
  };

  const handleSubmit = (values: TSubjectTable) => {
    console.log('values---', values);

    if (isEdit) {
      setSubjectTableData(
        subjectTableData.map((subject) => (subject.id === values.id ? values : subject))
      );
    } else {
      setSubjectTableData([...subjectTableData, values]);
    }
    dialog.onFalse();
    setIsEdit(false);
    setSelectedSubject(null);
  };

  const handleViewSubject = (subject: TSubjectTable) => {
    setSelectedSubject(subject);
    showSubjectDialog.onTrue();
  };

  const handleCloseDialog = () => {
    dialog.onFalse();
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

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h6">Subject Management</Typography>
        <Button
          startIcon={<Add />}
          variant="contained"
          onClick={() => {
            dialog.onTrue();
            setIsEdit(false);
            setSelectedSubject(null);
          }}
        >
          Add Subject
        </Button>
      </Box>
      <CustomSelect
        label="Class"
        name="class"
        isLoading={isLoading}
        options={classData?.items || []}
        valueKey="id"
        labelKey="name"
        formControlProps={{ sx: { width: '200px' } }}
        value={searchParams?.classId || ''}
        onChange={(value) => {
          setSearchParams({
            classId: value as string,
          });
        }}
      />
      <Grid2 container spacing={3}>
        {searchParams?.classId && (
          <CustomizableTable
            columns={[
              { id: 'className', label: 'Class' },
              { id: 'subjectCode', label: 'Subject Code' },
              { id: 'subjectName', label: 'Subject Name' },
              { id: 'subjectColor', label: 'Subject Color' },
              { id: 'primaryTeacher', label: 'Primary Teacher' },
              {
                id: 'secondaryTeacher',
                label: 'Secondary Teacher',
                render: (value) => (
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {value.map((audience: string) => (
                      <Chip key={audience} label={audience} size="small" variant="outlined" />
                    ))}
                  </Box>
                ),
              },
              { id: 'prerequisites', label: 'Prerequisites' },
              { id: 'learningGoal', label: 'Learning Goal' },
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
                id: 'viewChapters',
                label: 'View Details',
                render: (_, row) => {
                  const subject = subjectTableData.find((s) => s.id === row.id);
                  return (
                    <IconButton onClick={() => subject && handleViewSubject(subject)} sx={{}}>
                      <Iconify icon="mdi:eye" />
                    </IconButton>
                  );
                },
              },
              {
                id: 'action',
                label: 'Action',
                isSort: false,
                render: (value, row) => (
                  <ThreeDotsActions
                    placement="right-top"
                    actions={({ popover: pop }) => (
                      <MenuList>
                        {row.status === 'Unpublish' && (
                          <MenuItem
                            onClick={() => {
                              setSelectedSubject(row as any);
                              setIsEdit(true);
                              dialog.onTrue();
                            }}
                          >
                            <Iconify icon="solar:pen-bold" sx={{ height: '16px', width: '16px' }} />
                            Edit
                          </MenuItem>
                        )}
                        {row.status === 'Publish' && (
                          <MenuItem
                            onClick={() => {
                              setSelectedSubject(row as any);
                              deleteConfirmDialog.onTrue();
                              pop.onClose();
                            }}
                            sx={{ color: 'error.main' }}
                          >
                            <Iconify
                              icon="solar:trash-bin-trash-bold"
                              sx={{ height: '16px', width: '16px' }}
                            />
                            Delete
                          </MenuItem>
                        )}
                      </MenuList>
                    )}
                  />
                ),
              },
            ]}
            data={filteredData}
          />
        )}
      </Grid2>

      <CustomDialog
        maxWidth="sm"
        open={dialog.value}
        handleClose={handleCloseDialog}
        title={isEdit ? 'Update Subject' : 'Add Subject'}
      >
        <SubjectForm
          onSubmit={handleSubmit}
          onClose={dialog.onFalse}
          data={selectedSubject}
          isEdit={isEdit}
        />{' '}
      </CustomDialog>

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
  console.log('selected class----', selectedClass);

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
      subjectColor: data?.subjectColor || '#000000',
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
  console.log('error--', formik.errors);

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
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '300px' }}>
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
                error={formik.touched.subjectCode && Boolean(formik.errors.subjectCode)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Subject Name"
                name="subjectName"
                size="small"
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
                label=""
                value={formik.values.scheduleDate}
                onChange={(value) => {
                  formik.setFieldValue('scheduleDate', value);
                }}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    error: formik.touched.scheduleDate && Boolean(formik.errors.scheduleDate),
                  },
                }}
                disablePast
              />
              {formik.touched.scheduleDate && formik.errors.scheduleDate && (
                <FormHelperText error>{String(formik.errors.scheduleDate)}</FormHelperText>
              )}
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
