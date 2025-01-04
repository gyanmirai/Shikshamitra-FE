import type { Division, Standards } from 'src/types/school';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import dayjs from 'dayjs';
import React, { useState, useEffect, useCallback } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import {
  Box,
  Grid,
  Chip,
  Button,
  MenuItem,
  MenuList,
  useTheme,
  TextField,
  Typography,
  ListItemText,
  DialogActions,
  CircularProgress,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import { Upload, UploadBox } from 'src/components/upload';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { AddNewChapter } from '../course-management/subjects';
import { subjectTempData } from '../course-management/subjectsData';

import type { Document, ChapterFormValues } from '../course-management/subjects';

interface TableRow {
  subjectName: string;
  primaryTeacher: string;
  secondaryTeacher: string[] | null;
  progress: number;
  material: {
    videos: number;
    pdfs: number;
  };
}

interface AssignmentRow {
  title: string;
  dueDate: string;
  status: string;
}

const Course = (props: TabComponentType) => {
  const { searchParams, setSearchParams } = props;
  const classes = searchParams?.classId ? searchParams?.classId : '';
  const [division, setDivision] = useState('');
  const [divisionOptions, setDivisionOptions] = useState<Division[]>([]);
  const [hoveredResource, setHoveredResource] = useState<string | null>(null);
  const chapterDialog = useBoolean();
  const addChapterDialog = useBoolean();
  const viewAssignmentDialog = useBoolean();
  const theme = useTheme();
  const [subjectData, setSubjectData] = useState<any>(subjectTempData);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [subjectTableData, setSubjectTableData] = useState<TableRow[]>([]);
  const [dialogData, setDialogData] = useState<any>([]);
  const [selectedChapter, setSelectedChapter] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  useEffect(() => {
    if (classData?.items?.length) {
      if (classes) {
        const selectedClass = classData.items.find((i: Standards) => i.id === classes);
        setDivisionOptions(selectedClass?.divisions || []);
        // Set first division if available
        if (selectedClass?.divisions?.length) {
          setDivision(selectedClass.divisions[0].id);
        }

        const selectedClassData = subjectData.classes.find(
          (cls: any) => cls.name === selectedClass?.name
        );
        if (selectedClassData) {
          const divisionData = selectedClassData.divisions;
          const firstDivisionSubjects = divisionData[0]?.subjects || [];

          const subjects = firstDivisionSubjects.map((subject: any) => ({
            subjectName: subject.name,
            primaryTeacher: subject.primaryTeacher,
            secondaryTeacher: subject.secondaryTeacher,
            progress: subject.progress,
            material: subject.material,
          }));

          setSubjectTableData(subjects);
        } else {
          setSubjectTableData([]);
        }
      } else {
        const firstClass = classData.items[0];
        setSearchParams?.({
          classId: firstClass.id,
        });
        setDivisionOptions(firstClass?.divisions || []);
        // Set first division if available
        if (firstClass?.divisions?.length) {
          setDivision(firstClass.divisions[0].id);
        }

        const selectedClassData = subjectData.classes.find(
          (cls: any) => cls.name === firstClass?.name
        );
        if (selectedClassData) {
          const divisionData = selectedClassData.divisions;
          const firstDivisionSubjects = divisionData[0]?.subjects || [];

          const subjects = firstDivisionSubjects.map((subject: any) => ({
            subjectName: subject.name,
            primaryTeacher: subject.primaryTeacher,
            secondaryTeacher: subject.secondaryTeacher,
            progress: subject.progress,
            material: subject.material,
          }));

          setSubjectTableData(subjects);
        } else {
          setSubjectTableData([]);
        }
      }
    }
  }, [classData, classes, setSearchParams, subjectData.classes]);

  const handleDocumentUpload = async (files: File[]): Promise<Document[]> =>
    files.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      url: URL.createObjectURL(file),
      file,
    }));

  const handleChapterSubmit = async (values: ChapterFormValues) => {
    const updatedSubjectData = { ...subjectData };
    const selectedClass = updatedSubjectData.classes.find(
      (cls: { name: string }) => cls.name === classes
    );

    if (selectedClass) {
      // Handle document uploads first
      let newDocuments: Document[] = [];
      if (values.documents) {
        const filesToUpload = values.documents.filter((doc: any) => doc.file) as Document[];
        if (filesToUpload.length > 0) {
          const uploadedDocs = await handleDocumentUpload(filesToUpload.map((doc) => doc.file!));
          newDocuments = [
            ...values.documents.filter((doc: any) => !doc.file), // Keep existing documents
            ...uploadedDocs, // Add newly uploaded documents
          ];
        } else {
          newDocuments = values.documents;
        }
      }

      if (isEditMode && selectedChapter) {
        // Update existing chapter
        selectedClass.divisions.forEach((div: any) => {
          const subject = div.subjects.find((sub: any) => sub.name === selectedSubject);
          if (subject) {
            const chapterIndex = subject.chapters.findIndex(
              (ch: any) => ch.id === selectedChapter.id
            );
            if (chapterIndex !== -1) {
              subject.chapters[chapterIndex] = {
                ...subject.chapters[chapterIndex],
                chapterName: values.chapterName,
                assignedTeacher: values.assignedTeacher,
                content: values.content,
                timeLine: values.timeLine,
                documents: newDocuments,
                progress: subject.chapters[chapterIndex].progress,
                assignments: subject.chapters[chapterIndex].assignments,
              };
            }
          }
        });
      } else {
        // Create new chapter
        const newChapter = {
          id:
            Math.max(
              ...selectedClass.divisions.flatMap((div: any) =>
                div.subjects.flatMap((sub: any) => sub.chapters.map((ch: any) => ch.id))
              ),
              0
            ) + 1,
          chapterName: values.chapterName,
          assignedTeacher: values.assignedTeacher,
          content: values.content,
          timeLine: values.timeLine,
          documents: newDocuments,
          progress: 0,
          assignments: [],
        };

        selectedClass.divisions.forEach((div: any) => {
          const subject = div.subjects.find((sub: any) => sub.name === selectedSubject);
          if (subject) {
            subject.chapters.push({ ...newChapter });
          }
        });
      }

      setSubjectData(updatedSubjectData);
      const updatedDialogData = selectedClass.divisions.map((div: any) => ({
        divisionName: div.name,
        chapters: div.subjects
          .filter((subject: any) => subject.name === selectedSubject)
          .flatMap((subject: any) => subject.chapters),
      }));

      setDialogData(updatedDialogData);
    }
    addChapterDialog.onFalse();
  };

  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <>
        {' '}
        <MenuList>
          <MenuItem
            onClick={() => {
              setSelectedSubject(row.subjectName);
              addChapterDialog.onTrue();
              setIsEditMode(false);
              setSelectedChapter(null);
            }}
          >
            <Iconify icon="mdi:plus" />
            Chapter
          </MenuItem>

          <MenuItem
            onClick={() => {
              viewAssignmentDialog.onTrue();
            }}
          >
            <Iconify icon="mdi:eye" />
            View Assignments
          </MenuItem>
        </MenuList>
      </>
    ),
    [addChapterDialog, viewAssignmentDialog]
  );

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Course"
        links={[
          { name: 'Academic and Assignment' },
          { name: 'Learning Management System' },
          { name: 'Course' },
        ]}
        sx={{ px: 1, mb: 2 }}
      />
      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
        <CustomSelect
          label="Class"
          options={classData?.items || []}
          labelKey="name"
          valueKey="id"
          onChange={(val) => {
            const selectedClass: Standards = classData.items.find((i: Standards) => i.id === val);
            // formik.setFieldValue('class', selectedClass?.name || '');
            setSearchParams?.({
              classId: val as string,
            });
            setDivisionOptions(selectedClass?.divisions || []);
          }}
          value={classes}
          formControlProps={{
            sx: { width: '100%', maxWidth: '200px' },
          }}
        />
        <CustomSelect
          label="Division"
          disabled={!classes}
          labelKey="name"
          valueKey="id"
          options={divisionOptions}
          value={division}
          onChange={(val) => {
            // const selectedDivision = divisionOptions.find((i: Division) => val.includes(i.id));
            // formik.setFieldValue('division', selectedDivision?.name || '');
            setDivision(val as string);
          }}
          formControlProps={{
            sx: { width: '100%', maxWidth: '200px' },
          }}
        />
      </Box>
      <CustomizableTable
        columns={[
          {
            id: 'subjectName',
            label: 'Subject Name',
          },
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
          {
            id: 'progress',
            label: 'Progress',
            render(value, row) {
              return (
                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                  <CircularProgress variant="determinate" value={value} />
                  <Box
                    sx={{
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      position: 'absolute',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="caption" component="div" sx={{ color: 'text.secondary' }}>
                      {value}%
                    </Typography>
                  </Box>
                </Box>
              );
            },
          },
          {
            id: 'actions',
            label: 'Actions',
            isSort: false,
            render(value, row) {
              return (
                <ThreeDotsActions
                  actions={(prop) => actions({ ...prop, row })}
                  placement="right-top"
                />
              );
            },
          },
        ]}
        data={subjectTableData}
      />

      <CustomDialog
        title={isEditMode ? `Edit ${selectedChapter.chapterName} Chapter` : 'Add New Chapter'}
        open={addChapterDialog.value}
        handleClose={addChapterDialog.onFalse}
        maxWidth="sm"
      >
        <AddNewChapter
          onSubmit={handleChapterSubmit}
          selectedSubject={selectedSubject}
          initialValues={selectedChapter}
          isEdit={isEditMode}
        />
      </CustomDialog>

      <CustomDialog
        title="View Assignment"
        open={viewAssignmentDialog.value}
        handleClose={viewAssignmentDialog.onFalse}
        maxWidth="xl"
      >
        <ViewAssignmentData />
      </CustomDialog>
    </Box>
  );
};

export default Course;

const filteredData = [
  {
    title: 'Math Practice Problems',
    description: 'Solve problems from Chapter 5 on Linear Equations.',
    dueDate: null,
    dueTime: null,
    submissionType: 'Online',
    assignmentType: 'Practice Questions',
    topic: 'Linear Equations',
    assignedResources: 'Workbook Page 32-34',
    evaluationCriteria: '',
    customRubric: '',
  },
  {
    title: 'Science Project',
    description: 'Prepare a working model of the solar system.',
    dueDate: dayjs('2024-12-15'),
    dueTime: dayjs('23:59'),
    submissionType: 'In-Person',
    assignmentType: 'Project Work',
    topic: 'Solar System',
    assignedResources: 'Chapter 7: The Solar System',
    evaluationCriteria: 'Model Design, Explanation, Creativity',
    customRubric: 'Include all 8 planets with labels.',
  },
  {
    title: 'History Essay',
    description: 'Write an essay on the causes and effects of World War II.',
    dueDate: dayjs('2024-12-20'),
    dueTime: dayjs('23:59'),
    submissionType: 'Online',
    assignmentType: 'Essay Writing',
    topic: 'World War II',
    assignedResources: 'History Textbook Chapter 10',
    evaluationCriteria: 'Content, Structure, Grammar, and Relevance',
    customRubric: 'Include at least 3 major causes and their effects.',
  },
  {
    title: 'Geography Map Work',
    description: 'Mark and label the major rivers of India on the map.',
    dueDate: dayjs('2024-12-12'),
    dueTime: dayjs('18:00'),
    submissionType: 'In-Person',
    assignmentType: 'Map Work',
    topic: 'Indian Rivers',
    assignedResources: 'Map and Atlas',
    evaluationCriteria: '',
    customRubric: '',
  },
  {
    title: 'English Reading Task',
    description: 'Read and summarize Chapter 3 of your textbook.',
    dueDate: null,
    dueTime: null,
    submissionType: 'Online',
    assignmentType: 'Summary Writing',
    topic: 'Reading Comprehension',
    assignedResources: 'Textbook Chapter 3',
    evaluationCriteria: '',
    customRubric: '',
  },
];

const ViewAssignmentData = () => {
  const submissionDialog = useBoolean();

  return (
    <Box sx={{ p: 2 }}>
      <Scrollbar sx={{ height: '600px' }}>
        <CustomizableTable
          columns={[
            { id: 'title', label: 'Assignment Title' },
            { id: 'description', label: 'Assignment Description' },
            {
              id: 'dueDate',
              label: 'Due Date',
              render: (value: any, row: any) => (
                <Typography fontSize="12px" gutterBottom>
                  {value ? dayjs(value).format('DD MMM YYYY') : '-'}
                </Typography>
              ),
            },
            {
              id: 'dueTime',
              label: 'Time',
              render: (value: any, row: any) => (
                <Typography fontSize="12px" gutterBottom>
                  {value ? dayjs(value).format('HH:mm') : '-'}
                </Typography>
              ),
            },
            { id: 'submissionType', label: 'Submission Type' },
            { id: 'assignmentType', label: 'Assignment Type' },
            { id: 'topic', label: 'Topic' },
            { id: 'assignedResources', label: 'Assigned Resources' },
            { id: 'evaluationCriteria', label: 'Evaluation Criteria' },
            { id: 'customRubric', label: 'Custom Rubric' },
            {
              id: 'action',
              label: 'Action',
              render(value: any, row: any) {
                return (
                  <ThreeDotsActions
                    placement="right-top"
                    actions={() => (
                      <MenuList>
                        <MenuItem
                          onClick={() => {
                            submissionDialog.onTrue();
                          }}
                        >
                          <Iconify icon="mdi:eye" />
                          <ListItemText>View Submission</ListItemText>
                        </MenuItem>
                      </MenuList>
                    )}
                  />
                );
              },
            },
          ]}
          data={filteredData}
        />
      </Scrollbar>
    </Box>
  );
};

const CourseDetails = () => (
  <Box display="flex" gap={2}>
    <TextField size="small" label="Course Name" name="courseName" />
    <TextField size="small" label="Course Description" name="courseDescription" />
    <CustomSelect
      options={[]}
      label="Grade Level"
      name="gradeLevel"
      value=""
      onChange={() => {}}
      formControlProps={{ sx: { maxWidth: 250, width: '100%' } }}
    />
  </Box>
);

const AssignTeacher = () => (
  <Box>
    <CustomSelect
      options={[]}
      label="Select Teacher"
      name="teacher"
      value=""
      onChange={() => {}}
      formControlProps={{ sx: { maxWidth: 250, width: '100%' } }}
    />
  </Box>
);

const AddContent = () => (
  <Box>
    <Upload />
  </Box>
);

const SetLearningGoals = () => (
  <Box>
    <TextField
      size="small"
      label="Define learning objectives for this course"
      name="learningGoals"
      multiline
      rows={4}
      fullWidth
    />
    <Button startIcon={<Iconify icon="mdi:plus" />} variant="contained" color="primary">
      {' '}
      Add Another Goal
    </Button>
  </Box>
);

const allStep = [CourseDetails, AssignTeacher, AddContent, SetLearningGoals];

const CourseCreationForm = () => {
  const [gradeLevel, setGradeLevel] = useState('');
  const [teacher, setTeacher] = useState<any>([]);
  const [resources, setResources] = useState('');
  return (
    <Box>
      <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '300px' }}>
        <Box display="flex" flexDirection="column" gap={2}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField label="Course Name" size="small" name="courseName" fullWidth />
            </Grid>
            <Grid item xs={12} md={6}>
              <CustomSelect
                label="Grade Level"
                options={[
                  { value: 'A', label: 'A' },
                  { value: 'B', label: 'B' },
                  { value: 'C', label: 'C' },
                  { value: 'D', label: 'D' },
                  { value: 'E', label: 'E' },
                  { value: 'F', label: 'F' },
                ]}
                value={gradeLevel}
                onChange={(val) => {
                  setGradeLevel(val as string);
                }}
                formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Course End Date"
                name="endDate"
                format="DD/MM/YYYY"
                sx={{ width: '100%', minWidth: '270px' }}
                onChange={() => {}}
                slotProps={{ textField: { size: 'small' } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <CustomSelect
                label="Select Teacher"
                options={[
                  { value: 'Jiya', label: 'Jiya' },
                  { value: 'Riya', label: 'Riya' },
                  { value: 'Priya', label: 'Priya' },
                  { value: 'Diya', label: 'Diya' },
                ]}
                multiple
                value={teacher}
                onChange={(val) => {
                  setTeacher(val);
                }}
                formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Course Description"
                size="small"
                name="courseDescription"
                multiline
                fullWidth
                rows={4}
              />
            </Grid>
          </Grid>
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
                <Typography variant="body2">Uplaod File</Typography>
              </Box>
            }
            sx={{
              py: 2.5,
              width: '100%',
              height: 'auto',
              borderRadius: 1.5,
            }}
          />
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField label="Field Name" size="small" name="fieldName" fullWidth />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Description"
                size="small"
                name="description"
                multiline
                fullWidth
                rows={4}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Define Learning Objectives for this course"
                size="small"
                name="learningObjectives"
                multiline
                fullWidth
                rows={4}
              />
            </Grid>
          </Grid>
        </Box>
      </Scrollbar>
      <DialogActions>
        <Button variant="contained" onClick={() => {}} color="warning">
          Save Draft
        </Button>
        <Button variant="contained" onClick={() => {}}>
          Publish
        </Button>
      </DialogActions>
    </Box>
  );
};
