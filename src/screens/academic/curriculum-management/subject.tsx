import { useFormik } from 'formik';
import React, { useState } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { MuiColorInput } from 'mui-color-input';

import { Add } from '@mui/icons-material';
import {
  Box,
  Grid,
  Button,
  Switch,
  MenuItem,
  MenuList,
  TextField,
  Typography,
  IconButton,
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

interface TSubjectTable {
  id: number;
  subjectName: string;
  className: string;
  assignTeacher: string;
  prerequisites: string;
  learningGoal: string;
  subjectColor: string;
  description: string;
  status: string;
}

const subjectData: TSubjectTable[] = [
  {
    id: 1,
    subjectName: 'Mathematics',
    description: '',
    subjectColor: '',
    className: '1',
    assignTeacher: 'Mr. Smith',
    prerequisites: 'Basic counting skills',
    learningGoal: 'Develop understanding of numbers, addition, and subtraction.',
    status: 'Publish',
  },
  {
    id: 2,
    subjectName: 'Science',
    description: '',
    subjectColor: '',
    className: '2',
    assignTeacher: 'Ms. Johnson',
    prerequisites: 'Interest in nature and environment',
    learningGoal: 'Understand basic concepts of earth science and the environment.',
    status: 'Unpublish',
  },
  {
    id: 3,
    subjectName: 'English',
    description: '',
    subjectColor: '',
    className: '1',
    assignTeacher: 'Mrs. Green',
    prerequisites: 'Basic reading skills',
    learningGoal: 'Enhance reading comprehension and vocabulary.',
    status: 'Publish',
  },
  {
    id: 4,
    subjectName: 'History',
    description: '',
    subjectColor: '',
    className: '1',
    assignTeacher: 'Mr. Brown',
    prerequisites: 'Interest in past events',
    learningGoal: 'Learn about important historical events and figures.',
    status: 'Unpublish',
  },
  {
    id: 5,
    subjectName: 'Geography',
    description: '',
    subjectColor: '',
    className: '3',
    assignTeacher: 'Ms. Davis',
    prerequisites: 'Basic map reading skills',
    learningGoal: 'Develop an understanding of world geography and countries.',
    status: 'Publish',
  },
];

const Subject = () => {
  const [subjectTableData, setSubjectTableData] = useState(subjectData);
  const [selectedClass, setSelectedClass] = useState('');
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  const dialog = useBoolean();
  const deleteConfirmDialog = useBoolean();
  const confirmPublishDialog = useBoolean();
  const showSubjectDialog = useBoolean();

  const [selectedSubject, setSelectedSubject] = useState<TSubjectTable | null>(null);
  const [isEdit, setIsEdit] = useState(false);

  const [pendingStatusChange, setPendingStatusChange] = useState<{
    id: number;
    newValue: string;
  } | null>(null);

  const filteredData = selectedClass
    ? subjectTableData.filter((item) => item.className === selectedClass)
    : [];

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
        valueKey="name"
        labelKey="name"
        formControlProps={{ sx: { width: '200px' } }}
        value={selectedClass}
        onChange={(value) => {
          setSelectedClass(value as string);
        }}
      />

      {selectedClass && (
        <CustomizableTable
          columns={[
            { id: 'subjectName', label: 'Subject Name' },
            { id: 'className', label: 'Class' },
            { id: 'assignTeacher', label: 'Assign Teacher' },
            { id: 'prerequisites', label: 'Prerequisites' },
            { id: 'learningGoal', label: 'Learning Goal' },
            {
              id: 'status',
              label: 'Status',
              render: (value: string, row: any) => (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography sx={{ mr: 2 }} fontSize={11}>
                    Unpublish
                  </Typography>
                  <Switch
                    size="small"
                    checked={value === 'Publish'}
                    onChange={() => handleStatusChange(row.id, value as string)}
                  />
                  <Typography sx={{ ml: 2 }} fontSize={11}>
                    Publish
                  </Typography>
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
      <CustomDialog
        maxWidth="sm"
        open={dialog.value}
        handleClose={handleCloseDialog}
        title={isEdit ? 'Add Subject' : 'Update Subject'}
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
            Are you sure to {pendingStatusChange?.newValue === 'Publish' ? 'Publish' : 'UnPublish'}{' '}
            this course?
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

interface ViewSubjectProps {
  subject: TSubjectTable | null;
}
const ViewSubject: React.FC<ViewSubjectProps> = ({ subject }) => (
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
        label="Assigned Teacher"
        icon="mdi:teacher"
        value={
          <Typography variant="body2" className="text-gray-700">
            {subject?.assignTeacher}
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

  const formik = useFormik({
    initialValues: {
      subjectName: data?.subjectName || '',
      className: data?.className || '',
      assignTeacher: data?.assignTeacher || '',
      learningGoal: data?.learningGoal || '',
      prerequisites: data?.prerequisites || '',
      description: data?.description || '',
      subjectColor: data?.subjectColor || '#000000',
      status: data?.status || 'Unpublish',
    },
    onSubmit: (values) => {
      onSubmit({
        ...values,
        id: data?.id || Date.now(),
        status: isDraft ? 'Unpublish' : 'Publish',
      });
    },
  });

  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <form onSubmit={formik.handleSubmit}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '300px' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
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
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Subject Name"
                name="subjectName"
                size="small"
                value={formik.values.subjectName}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <CustomSelect
                label="Assigned Teacher"
                options={[
                  { value: 'Jiya', label: 'Jiya' },
                  { value: 'Riya', label: 'Riya' },
                  { value: 'Priya', label: 'Priya' },
                ]}
                name="assignTeacher"
                value={formik.values.assignTeacher}
                formControlProps={{ sx: { minWidth: 180, width: '100%' } }}
                onChange={(val) => {
                  formik.setFieldValue('assignTeacher', val);
                }}
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
