import type { Dayjs } from 'dayjs';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import React, { useState } from 'react';

import { Add } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import Grid2 from '@mui/material/Unstable_Grid2/Grid2';
import {
  Box,
  Grid,
  Button,
  Switch,
  MenuItem,
  MenuList,
  Typography,
  DialogActions,
  DialogContent,
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

import { ViewSubject } from './subject';

interface TSubject {
  name: string;
  color: string;
}

// interface Document {
//   id: string;
//   name: string;
//   url: string;
//   file?: File;
// }

interface TCurriculum {
  id: number;
  className: string;
  subjects: TSubject[];
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  // documents?: Document[];
  status: string;
}

const CurriculumData: TCurriculum[] = [
  {
    id: 1,
    className: '1',
    subjects: [
      { name: 'Math', color: '#0077b6' },
      { name: 'Science', color: '#8e44ad' },
      { name: 'English', color: '#2980b9' },
      { name: 'Gujarati', color: '#e74c3c' },
    ],
    startDate: dayjs('2024-10-28'),
    endDate: dayjs('2024-12-28'),
    status: 'Unpublish',
  },
  {
    id: 2,
    className: '2',
    subjects: [
      { name: 'Math', color: '#0077b6' },
      { name: 'Science', color: '#8e44ad' },
      { name: 'English', color: '#2980b9' },
      { name: 'Gujarati', color: '#e74c3c' },
    ],
    startDate: dayjs('2023-10-28'),
    endDate: dayjs('2024-10-20'),
    status: 'Publish',
  },
  {
    id: 3,
    className: '3',
    subjects: [
      { name: 'Math', color: '#0077b6' },
      { name: 'Science', color: '#8e44ad' },
      { name: 'English', color: '#2980b9' },
      { name: 'Gujarati', color: '#e74c3c' },
    ],
    startDate: dayjs('2024-10-11'),
    endDate: dayjs('2024-10-28'),
    status: 'Unpublish',
  },
];

const subjectData = {
  id: 1,
  subjectName: 'Mathematics',
  subjectCode: 'Math01',
  scheduleDate: dayjs('2024-10-28'),
  description: '',
  subjectColor: '',
  className: '1',
  primaryTeacher: 'Ms. Johnson',
  secondaryTeacher: ['Mr. Smith'],
  prerequisites: 'Basic counting skills',
  learningGoal: 'Develop understanding of numbers, addition, and subtraction.',
  status: 'Publish',
};

const CurriculumOverview = (props: TabComponentType) => {
  const { setSearchParams } = props;
  const [curriculumTableData, setCurriculumTableData] = useState<TCurriculum[]>(CurriculumData);
  const [selectedCurriculum, setSelectedCurriculum] = useState<TCurriculum | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const dialog = useBoolean();
  const showDialog = useBoolean();
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    id: number;
    newValue: string;
  } | null>(null);
  const confirmPublishDialog = useBoolean();

  const handleCloseDialog = () => {
    dialog.onFalse();
    setSelectedCurriculum(null);
    setIsEdit(false);
    confirmPublishDialog.onFalse();
  };

  const handleEditCurriculum = (curriculum: any) => {
    setSelectedCurriculum(curriculum);
    setIsEdit(true);
    dialog.onTrue();
  };

  const confirmStatusChange = () => {
    if (pendingStatusChange) {
      const { id, newValue } = pendingStatusChange;
      setCurriculumTableData((curriculum) =>
        curriculum.map((curr) => (curr.id === id ? { ...curr, status: newValue } : curr))
      );
    }
    confirmPublishDialog.onFalse();
    setPendingStatusChange(null);
  };

  const handleSubmit = (values: any) => {
    // const newCurriculum: TCurriculum = {
    //   className: values.className,
    //   subjects: values.subjects.map((name: string) => ({
    //     name,
    //     color:
    //       CurriculumData.find((c) => c.subjects.some((s) => s.name === name))?.subjects.find(
    //         (s) => s.name === name
    //       )?.color || '#000',
    //   })),
    //   startDate: values.startDate,
    //   endDate: values.endDate,
    //   documents: values.documents || [],
    //   status: isDraft ? 'Unpublish' : 'Publish',
    // };
    console.log('values----', values);

    if (isEdit) {
      setCurriculumTableData((prev) =>
        prev.map((curr) => (curr.id === selectedCurriculum!.id ? values : curr))
      );
    } else {
      setCurriculumTableData((prev) => [...prev, values]);
    }

    handleCloseDialog();
  };

  const handleStatusChange = (id: number, value: string) => {
    setPendingStatusChange({ id, newValue: value === 'Publish' ? 'Unpublish' : 'Publish' });
    confirmPublishDialog.onTrue();
  };

  const handleSubjectClick = () => {};

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h6">Curriculum Management</Typography>
        <Button
          startIcon={<Add />}
          variant="contained"
          onClick={() => {
            setIsEdit(false);
            setSelectedCurriculum(null);
            dialog.onTrue();
          }}
        >
          Add Curriculum
        </Button>
      </Box>
      <Grid2 container spacing={3}>
        {/* <Grid2 xs={12} md={6} lg={6}>
        <Card sx={{ p: 3, height: '100%' }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography component="span" variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
              Curriculum Overview
            </Typography>
            <CustomSelect
              label="Class"
              options={[]}
              value=""
              onChange={() => {}}
              formControlProps={{ sx: { minWidth: 120, bgcolor: 'white' } }}
            />
          </Box>

          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              sx={{ bgcolor: 'white', borderRadius: 1, p: 2, boxShadow: 1 }}
            >
              <Typography component="span" variant="h6">
                Subjects
              </Typography>
              <Typography component="span" variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                12
              </Typography>
            </Box>
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              sx={{ bgcolor: 'white', borderRadius: 1, p: 2, boxShadow: 1 }}
            >
              <Typography component="span" variant="h6">
                Teachers
              </Typography>
              <Typography component="span" variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                12
              </Typography>
            </Box>
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              sx={{ bgcolor: 'white', borderRadius: 1, p: 2, boxShadow: 1 }}
            >
              <Typography component="span" variant="h6">
                Topics Covered
              </Typography>
              <Typography component="span" variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                12
              </Typography>
            </Box>
          </Box>
        </Card>
      </Grid2> */}
        {/* <Grid2 xs={12}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography component="span" variant="h6" gutterBottom>
              Class-wise Curriculum Grid
            </Typography>
            <CustomSelect
              label="class"
              options={[]}
              value=""
              onChange={() => {}}
              formControlProps={{ sx: { minWidth: 120 } }}
            />
          </Box>
          <CustomizableTable
            columns={[
              { id: 'grade', label: 'Grade' },
              { id: 'maths', label: 'Maths' },
              { id: 'science', label: 'Science' },
              { id: 'english', label: 'English' },
              { id: 'gujarati', label: 'Gujarati' },
            ]}
            data={[
              {
                grade: '1st',
                maths: 'Numbers',
                science: 'Plants',
                english: 'Alphabets',
                gujarati: 'વર્ણમાળા',
              },
              {
                grade: '2nd',
                maths: 'Addition',
                science: 'Animals',
                english: 'Grammar',
                gujarati: 'શબ્દો',
              },
              {
                grade: '3rd',
                maths: 'Multiplication',
                science: 'Human Body',
                english: 'Comprehension',
                gujarati: 'વાક્યો',
              },
              {
                grade: '4th',
                maths: 'Fractions',
                science: 'Environment',
                english: 'Writing',
                gujarati: 'નિબંધ',
              },
              {
                grade: '5th',
                maths: 'Geometry',
                science: 'Matter',
                english: 'Literature',
                gujarati: 'કવિતા',
              },
            ]}
          />
        </Grid2> */}
        <CustomizableTable
          columns={[
            { id: 'className', label: 'Class' },
            {
              id: 'startDate',
              label: 'Start Date',
              render: (value, row) => (
                <Typography fontSize="12px" gutterBottom>
                  {dayjs(value).format('DD MMM YYYY')}
                </Typography>
              ),
            },
            {
              id: 'endDate',
              label: 'End Date',
              render: (value, row) => (
                <Typography fontSize="12px" gutterBottom>
                  {dayjs(value).format('DD MMM YYYY')}
                </Typography>
              ),
            },
            ...curriculumTableData[0].subjects.map((_, index) => ({
              id: `subject${index + 1}`,
              label: `Subject ${index + 1}`,
              render: (value: any, row: any) => {
                // Cast the row back to TCurriculum since we know its actual type
                const curriculumRow = row as TCurriculum;
                return (
                  <Typography
                    component="span"
                    variant="body2"
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      borderRadius: '16px',
                      color: curriculumRow.subjects[index]?.color,
                      border: `1px solid ${curriculumRow.subjects[index]?.color}`,
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      showDialog.onTrue();
                    }}
                  >
                    {curriculumRow.subjects[index]?.name
                      ? curriculumRow.subjects[index]?.name
                      : '-'}
                  </Typography>
                );
              },
            })),
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
              render: (value, row) => (
                <ThreeDotsActions
                  placement="right-top"
                  actions={({ popover: pop }) => (
                    <MenuList>
                      {row.status === 'Unpublish' && (
                        <MenuItem
                          onClick={() => {
                            handleEditCurriculum(row);
                          }}
                        >
                          <Iconify icon="solar:pen-bold" sx={{ height: '16px', width: '16px' }} />
                          Edit
                        </MenuItem>
                      )}
                    </MenuList>
                  )}
                />
              ),
            },
          ]}
          data={curriculumTableData}
        />
      </Grid2>

      <CustomDialog
        maxWidth="sm"
        open={dialog.value}
        handleClose={handleCloseDialog}
        title={isEdit ? 'Update Curriculum' : 'Add Curriculum'}
      >
        <CurriculumForm
          setSearchParams={setSearchParams}
          onSubmit={handleSubmit}
          onClose={handleCloseDialog}
          isEdit={isEdit}
          data={selectedCurriculum}
        />
      </CustomDialog>

      <CustomDialog
        title="Subject Details"
        open={showDialog.value}
        handleClose={() => {
          showDialog.onFalse();
        }}
        maxWidth="sm"
      >
        <ViewSubject subject={subjectData} />
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
    </Box>
  );
};

export default CurriculumOverview;

interface CurriculumFormProps {
  setSearchParams: any;
  onSubmit: (values: TCurriculum) => void;
  onClose: () => void;
  data: TCurriculum | null;
  isEdit: boolean;
}

const CurriculumForm: React.FC<CurriculumFormProps> = ({
  setSearchParams,
  onSubmit,
  onClose,
  data,
  isEdit,
}) => {
  // const [documents, setDocuments] = useState<Document[]>(data?.documents || []);
  const [isDraft, setIsDraft] = useState(!isEdit || (data && data.status === 'Unpublish'));
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  const formik = useFormik({
    initialValues: {
      className: data?.className || '',
      subjects: data?.subjects.map((subject) => subject.name) || [],
      startDate: data?.startDate ? dayjs(data?.startDate) : dayjs(),
      endDate: data?.endDate ? dayjs(data?.endDate) : null,
      status: data?.status || 'Unpublish',
    },
    onSubmit: (values) => {
      const formData = {
        ...values,
        id: data?.id || Date.now(),
        status: isDraft ? 'Unpublish' : 'Publish',
        subjects: values.subjects.map((name: string) => ({
          name,
          color: '#000',
        })),
        // documents,
      };
      onSubmit(formData);
      onClose();
    },
  });

  // const handleFileUpload = (files: File[]) => {
  //   const newDocs: Document[] = files.map((file) => ({
  //     id: Math.random().toString(36).substr(2, 9),
  //     name: file.name,
  //     url: '',
  //     file,
  //   }));
  //   setDocuments((prev) => [...prev, ...newDocs]);
  // };

  // const handleRemoveDocument = (docId: string) => {
  //   setDocuments((prev) => prev.filter((doc) => doc.id !== docId));
  // };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <form onSubmit={formik.handleSubmit}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '180px' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <CustomSelect
                label="Class"
                options={classData?.items || []}
                value={formik.values.className}
                isLoading={isLoading}
                labelKey="name"
                valueKey="name"
                onChange={(val) => {
                  formik.setFieldValue('className', val);
                }}
                formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <CustomSelect
                label="Predefined Template"
                name="predefinedTemplate"
                options={[
                  { value: 'MathTemplate', label: 'Math Template' },
                  { value: 'ScienceTemplate', label: 'Science Template' },
                  { value: 'EnglishTemplate', label: 'English Template' },
                  { value: 'GujaratiTemplate', label: 'Gujarati Template' },
                ]}
                value=""
                formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                onChange={(value) => {}}
              />
              <Typography
                onClick={() => {
                  setSearchParams?.({
                    tab: 'settings',
                  });
                }}
                sx={{
                  cursor: 'pointer',
                  fontSize: '12px',
                  textAlign: 'right',
                  color: 'blue',
                  fontWeight: 'bold',
                }}
              >
                Add Template ?
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
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
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Start Date"
                name="startDate"
                value={formik.values.startDate}
                onChange={(value) => formik.setFieldValue('startDate', value)}
                format="DD-MM-YYYY"
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <DatePicker
                label="End Date"
                name="endDate"
                value={formik.values.endDate}
                onChange={(value) => formik.setFieldValue('endDate', value)}
                format="DD-MM-YYYY"
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>
            {/* <Grid item xs={12}>
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
            )} */}
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
