'use client';

import type { Dayjs } from 'dayjs';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import React, { useState } from 'react';

import { Add } from '@mui/icons-material';
import { DatePicker, DateTimePicker } from '@mui/x-date-pickers';
import {
  Box,
  Grid,
  Card,
  Chip,
  Button,
  Switch,
  TextField,
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
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { ViewSubject } from './subject/component/viewDetailComponents/viewSubjectComponent';

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
  curriculumName: string; // Added curriculumName to the interface
  subjects: TSubject[];
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  scheduleDate: Dayjs | null;
  // documents?: Document[];
  status: string;
}

const CurriculumData: TCurriculum[] = [
  {
    id: 1,
    className: '1',
    curriculumName: 'First Grade Curriculum', // Added curriculumName
    subjects: [
      { name: 'Math', color: '#0077b6' },
      { name: 'Science', color: '#8e44ad' },
      { name: 'English', color: '#2980b9' },
      { name: 'Gujarati', color: '#e74c3c' },
    ],
    startDate: dayjs('2024-10-28'),
    endDate: dayjs('2024-12-28'),
    scheduleDate: dayjs('2024-10-28'),
    status: 'Unpublish',
  },
  {
    id: 2,
    className: '2',
    curriculumName: 'Second Grade Curriculum', // Added curriculumName
    subjects: [
      { name: 'Math', color: '#0077b6' },
      { name: 'Science', color: '#8e44ad' },
      { name: 'English', color: '#2980b9' },
      { name: 'Gujarati', color: '#e74c3c' },
    ],
    startDate: dayjs('2023-10-28'),
    endDate: dayjs('2024-10-20'),
    scheduleDate: dayjs('2024-10-28'),
    status: 'Publish',
  },
  {
    id: 3,
    className: '3',
    curriculumName: 'Third Grade Curriculum', // Added curriculumName
    subjects: [
      { name: 'Math', color: '#0077b6' },
      { name: 'Science', color: '#8e44ad' },
      { name: 'English', color: '#2980b9' },
      { name: 'Gujarati', color: '#e74c3c' },
    ],
    startDate: dayjs('2024-10-11'),
    endDate: dayjs('2024-10-28'),
    scheduleDate: dayjs('2024-10-28'),
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
  // const dialog = useBoolean();
  const [open, setOpen] = useState(false);
  const showDialog = useBoolean();
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    id: number;
    newValue: string;
  } | null>(null);
  const confirmPublishDialog = useBoolean();

  const handleCloseDialog = () => {
    setOpen(false);
    setSelectedCurriculum(null);
    setIsEdit(false);
    confirmPublishDialog.onFalse();
  };

  const handleEditCurriculum = (curriculum: any) => {
    setSelectedCurriculum(curriculum);
    setIsEdit(true);
    setOpen(true);
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
    <Box>
      {open ? (
        <>
          <CustomBreadcrumbs
            heading="Curriculum Overview"
            links={[
              { name: 'Academic and Assignment' },
              { name: 'Curriculum' },
              { name: 'Curriculum Overview' },
              { name: 'Curriculum Form' },
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
            <CurriculumForm
              setSearchParams={setSearchParams}
              onSubmit={handleSubmit}
              onClose={handleCloseDialog}
              isEdit={isEdit}
              data={selectedCurriculum}
            />
          </Card>
        </>
      ) : (
        <>
          <CustomBreadcrumbs
            heading="Curriculum Overview"
            links={[
              { name: 'Academic and Assignment' },
              { name: 'Curriculum' },
              { name: 'Curriculum Overview' },
            ]}
            sx={{ px: 1, mb: 2 }}
            action={
              <Button
                startIcon={<Add />}
                variant="contained"
                size="small"
                onClick={() => {
                  setIsEdit(false);
                  setSelectedCurriculum(null);
                  setOpen(true);
                }}
              >
                Curriculum
              </Button>
            }
          />
          <CustomizableTable
            tableId="curriculum-overview-table"
            columns={[
              { id: 'className', label: 'Class', minWidth: '100px', align: 'left' },
              {
                id: 'curriculumName',
                label: 'Curriculum Name',
                minWidth: '200px',
                align: 'left',
              },
              {
                id: 'startDate',
                label: 'Start Date',
                minWidth: '130px',
                align: 'left',
                render: (value, row) => (
                  <Typography fontSize="12px" gutterBottom>
                    {dayjs(value).format('DD MMM YYYY')}
                  </Typography>
                ),
              },
              {
                id: 'endDate',
                label: 'End Date',
                minWidth: '130px',
                align: 'left',
                render: (value, row) => (
                  <Typography fontSize="12px" gutterBottom>
                    {dayjs(value).format('DD MMM YYYY')}
                  </Typography>
                ),
              },
              {
                id: 'subjects',
                label: 'Subjects',
                render(value, row) {
                  return row.subjects.map((data: any, index: any) => (
                    <Chip size="small" label={data.name} variant="outlined" sx={{ m: 0.1 }} />
                  ));
                },
              },
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
                label: 'Actions',
                isSort: false,
                render(value, row) {
                  return (
                    <ThreeDotsActions
                      // actions={(prop) => actions({ ...props, row })}
                      placement="right-top"
                      showEditIcon
                      showThreeDots={false}
                      handleEditClick={() => {
                        handleEditCurriculum(row);
                      }}
                    />
                  );
                },
              },
            ]}
            data={curriculumTableData}
          />
        </>
      )}

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
      curriculumName: data?.curriculumName || '',
      subjects: data?.subjects.map((subject) => subject.name) || [],
      startDate: data?.startDate ? dayjs(data?.startDate) : dayjs(),
      endDate: data?.endDate ? dayjs(data?.endDate) : null,
      scheduleDate: data?.startDate ? dayjs(data?.startDate) : dayjs(),
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
        <Scrollbar sx={{ p: 2, height: '200px' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="curriculumName"
                label="Curriculum Name"
                value={formik.values.curriculumName}
                onChange={formik.handleChange}
                size="small"
              />
            </Grid>
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

            {/* <Grid item xs={12} md={6}>
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
            </Grid> */}

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
            <Grid item xs={12} md={6}>
              <DateTimePicker
                label="Schedule Date"
                value={formik.values.scheduleDate}
                onChange={(value) => {
                  formik.setFieldValue('scheduleDate', value);
                }}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                  },
                }}
                disablePast
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
