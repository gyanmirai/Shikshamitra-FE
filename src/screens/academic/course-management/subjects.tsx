'use client';

import type { Dayjs } from 'dayjs';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useState, useEffect, useCallback } from 'react';

import { Add } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import {
  Box,
  Grid,
  List,
  Chip,
  Card,
  Button,
  MenuItem,
  MenuList,
  ListItem,
  TextField,
  Typography,
  IconButton,
  ListItemText,
  DialogActions,
  CircularProgress,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSearchParam } from 'src/hooks/use-search-param';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { Editor } from 'src/components/editor';
import { Iconify } from 'src/components/iconify';
import { UploadBox } from 'src/components/upload';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { subjectTempData } from './subjectsData';

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

export const chapterData = [
  {
    id: 1,
    chapterNo: 1,
    chapterName: 'Introduction to Algebra',
    startDate: dayjs('2025-03-01').format('YYYY-MM-DD'),
    endDate: dayjs('2025-04-01').format('YYYY-MM-DD'),
    assignedTeacher: ['Mr. Rajesh Sharma', 'Ms. Neha Verma'],
    viewMaterial: { videos: 5, pdfs: 3 },
    progress: 75,
  },
  {
    id: 2,
    chapterNo: 2,
    chapterName: 'Biology Basics',
    startDate: dayjs('2025-02-15').format('YYYY-MM-DD'),
    endDate: dayjs('2025-03-20').format('YYYY-MM-DD'),
    assignedTeacher: ['Ms. Priya Mehta'],
    viewMaterial: { videos: 8, pdfs: 4 },
    progress: 60,
  },
  {
    id: 3,
    chapterNo: 3,
    chapterName: 'Shakespeare’s Literature',
    startDate: dayjs('2025-01-10').format('YYYY-MM-DD'),
    endDate: dayjs('2025-02-05').format('YYYY-MM-DD'),
    assignedTeacher: ['Mrs. Kavita Shah', 'Mr. Ankit Tiwari'],
    viewMaterial: { videos: 6, pdfs: 2 },
    progress: 90,
  },
  {
    id: 4,
    chapterNo: 4,
    chapterName: 'World War History',
    startDate: dayjs('2025-04-01').format('YYYY-MM-DD'),
    endDate: dayjs('2025-05-15').format('YYYY-MM-DD'),
    assignedTeacher: ['Mr. Arvind Joshi'],
    viewMaterial: { videos: 4, pdfs: 1 },
    progress: 50,
  },
  {
    id: 5,
    chapterNo: 5,
    chapterName: 'Data Structures and Algorithms',
    startDate: dayjs('2025-06-01').format('YYYY-MM-DD'),
    endDate: dayjs('2025-07-10').format('YYYY-MM-DD'),
    assignedTeacher: ['Mr. Vikas Nair', 'Ms. Divya Reddy'],
    viewMaterial: { videos: 10, pdfs: 5 },
    progress: 85,
  },
];

const Subjects = (props: TabComponentType) => {
  const [classes, setClasses] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [open, setOpen] = useState(false);
  const chapterDialog = useBoolean();
  const addChapterDialog = useBoolean();
  const [subjectData, setSubjectData] = useState<any>(subjectTempData);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [subjectTableData, setSubjectTableData] = useState<TableRow[]>([]);
  const [dialogData, setDialogData] = useState<any>([]);
  const [selectedChapter, setSelectedChapter] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [params, setParams] = useSearchParam({ isForm: 'false' });
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  useEffect(() => {
    if (!classes) {
      const firstClass = classData?.items[0];
      setClasses(firstClass?.name);
    }
    if (classes) {
      const selectedClassData = subjectData.classes.find((cls: any) => cls.name === classes);
      if (selectedClassData) {
        const divisionData = selectedClassData.divisions;
        const firstDivisionSubjects = divisionData[0]?.subjects || [];

        const subjects = firstDivisionSubjects.map((sub: any) => ({
          subjectName: sub.name,
          primaryTeacher: sub.primaryTeacher,
          secondaryTeacher: sub.secondaryTeacher,
          progress: sub.progress,
          material: sub.material,
        }));

        setSubjectTableData(subjects);
      } else {
        setSubjectTableData([]);
      }
    } else {
      setSubjectTableData([]);
    }
  }, [classData?.items, classes, subjectData]);

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
        const filesToUpload = values.documents.filter((doc) => doc.file) as Document[];
        if (filesToUpload.length > 0) {
          const uploadedDocs = await handleDocumentUpload(filesToUpload.map((doc) => doc.file!));
          newDocuments = [
            ...values.documents.filter((doc) => !doc.file), // Keep existing documents
            ...uploadedDocs, // Add newly uploaded documents
          ];
        } else {
          newDocuments = values.documents;
        }
      }

      if (isEditMode && selectedChapter) {
        // Update existing chapter
        selectedClass.divisions.forEach((division: any) => {
          const subj = division.subjects.find((sub: any) => sub.name === selectedSubject);
          if (subject) {
            const newChapter = {
              chapterNo: values.chapterNo,
              chapterName: values.chapterName,
              assignedTeacher: values.assignedTeacher,
              content: values.content,
              startTime: values.startTime,
              endTime: values.endTime,
              documents: newDocuments,
              progress: subj.progress,
              assignments: subj.assignments,
            };
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
          chapterNo: values.chapterNo,

          chapterName: values.chapterName,
          assignedTeacher: values.assignedTeacher,
          content: values.content,
          startTime: values.startTime,
          endTime: values.endTime,
          documents: newDocuments,
          progress: 0,
          assignments: [],
        };

        selectedClass.divisions.forEach((division: any) => {
          const subj = division.subjects.find((sub: any) => sub.name === selectedSubject);
          if (subject) {
            subj.chapters.push({ ...newChapter });
          }
        });
      }

      setSubjectData(updatedSubjectData);
      const updatedDialogData = selectedClass.divisions.map((division: any) => ({
        divisionName: division.name,
        chapters: division.subjects
          .filter((sub: any) => sub.name === selectedSubject)
          .flatMap((sub: any) => sub.chapters),
      }));

      setDialogData(updatedDialogData);
    }
    addChapterDialog.onFalse();
  };

  const handleEditChapter = (chapter: any) => {
    setSelectedChapter(chapter);
    setIsEditMode(true);
    addChapterDialog.onTrue();
  };

  const handleEyeClick = (subjectName: string) => {
    const selectedClassData = subjectData.classes.find((cls: any) => cls.name === classes);

    setSelectedSubject(subjectName);
    const allDivisionChapters =
      selectedClassData?.divisions.map((division: any) => {
        const subjectDataOfClass = division.subjects.find((sub: any) => sub.name === subjectName);

        return {
          divisionName: division.name,
          chapters: subjectDataOfClass?.chapters || [],
          progress: subjectDataOfClass?.progress || 0, // Store subject progress
        };
      }) || [];

    setDialogData(allDivisionChapters);
    chapterDialog.onTrue();
  };

  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <>
        {' '}
        <MenuList>
          <MenuItem
            onClick={() => {
              // setSearchParams?.({
              //   tab: 'learningResources',
              //   class: classes,
              //   subject: row.subjectName,
              // });
              pop.onClose();
            }}
          >
            <Iconify icon="mdi:arrow-right-circle" sx={{ mr: 2 }} />
            Add Learning Resources
          </MenuItem>
        </MenuList>
      </>
    ),
    []
  );

  const links =
    params.isForm === 'true'
      ? [
          { name: 'Academic and Assignment' },
          { name: 'Syllabus' },
          { name: 'Syllabus Management' },
          { name: 'Add Chapter' },
        ]
      : [
          { name: 'Academic and Assignment' },
          { name: 'Syllabus' },
          { name: 'Syllabus Management' },
        ];

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Syllabus"
        description={
          params.isForm === 'true'
            ? 'Create or update chapter details, including the title, content, and associated subject. Manage chapters efficiently by adding new ones or editing existing entries.'
            : 'Manage and organize chapters for each subject efficiently. View the list of chapters, add new ones, update existing chapters, or remove them as needed.'
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
                ? () => {
                    setParams({ isForm: 'false' });
                  }
                : () => {
                    setParams({ isForm: 'true' });
                  }
            }
          >
            {params.isForm === 'true' ? 'Back' : 'Subject'}
          </Button>
        }
      />
      {params.isForm === 'true' ? (
        <Card>
          <AddNewChapter
            onSubmit={handleChapterSubmit}
            selectedSubject={selectedSubject}
            initialValues={selectedChapter}
            isEdit={isEditMode}
          />
        </Card>
      ) : (
        <>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <CustomSelect
              options={classData?.items || []}
              value={classes}
              onChange={(val) => {
                setClasses(val as string);
              }}
              label="Class"
              isLoading={isLoading}
              labelKey="name"
              valueKey="name"
              formControlProps={{ sx: { minWidth: 150, mb: 2 } }}
            />
            <CustomSelect
              options={[]}
              value={subject}
              onChange={(val) => {
                // setClasses(val as string);
                setSubject(val as string);
              }}
              label="Subject"
              isLoading={isLoading}
              formControlProps={{ sx: { minWidth: 150, mb: 2 } }}
            />
          </Box>
          <CustomizableTable
            tableId="subjectTable"
            columns={[
              {
                id: 'chapterNo',
                label: 'Chapter No',
                minWidth: '130px',
                align: 'left',
                filterType: 'number',
              },
              {
                id: 'chapterName',
                label: 'Chapter Name',
                minWidth: '180px',
                align: 'left',
                filterType: 'string',
              },
              {
                id: 'startDate',
                label: 'Start Date',
                minWidth: '120px',
                align: 'left',
                filterType: 'date',
              },
              {
                id: 'endDate',
                label: 'End Date',
                minWidth: '120px',
                align: 'left',
                filterType: 'date',
              },
              {
                id: 'assignedTeacher',
                label: 'Secondary Teacher',
                minWidth: '200px',
                align: 'left',
                render: (value) => (
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {value.map((audience: string) => (
                      <Chip key={audience} label={audience} size="small" variant="outlined" />
                    ))}
                  </Box>
                ),
              },
              {
                id: 'viewMaterial',
                label: 'View Material',
                minWidth: '150px',
                align: 'left',
                isFilter: false,
                render(value, row) {
                  // const { videos, pdfs } = value;
                  return <Iconify icon="mdi:eye" sx={{ ml: 7 }} />;
                },
              },
              {
                id: 'progress',
                label: 'Progress',
                minWidth: '150px',
                align: 'left',
                render(value, row) {
                  return (
                    <Box sx={{ position: 'relative', display: 'inline-flex', ml: 7 }}>
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
                        <Typography
                          variant="caption"
                          component="div"
                          sx={{ color: 'text.secondary' }}
                        >
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
                minWidth: '200px',
                isSort: false,
                isFilter: false,
                align: 'left',
                sticky: true,
                render(value, row) {
                  return (
                    <ThreeDotsActions
                      actions={(prop) => actions({ ...prop, row })}
                      placement="right-top"
                      showEditIcon
                      showViewIcon
                      showDeleteIcon
                      handleViewClick={() => {
                        handleEyeClick(row.subjectName);
                      }}
                      handleEditClick={() => {}}
                      handleDeleteClick={() => {}}
                    />
                  );
                },
              },
            ]}
            data={chapterData}
          />
        </>
      )}
    </Box>
  );
};

export default Subjects;

export interface Document {
  id: string;
  name: string;
  url: string;
  file?: File;
}

export interface ChapterFormValues {
  chapterNo: number;
  chapterName: string;
  assignedTeacher: string;
  content: string;
  startTime: string | undefined;
  endTime: string | undefined;
  timeLine: string | undefined;
  documents: Document[];
}

interface AddNewChapterProps {
  onSubmit: (values: ChapterFormValues) => void;
  selectedSubject: string;
  isEdit?: boolean;
  initialValues?: {
    chapterNo: number;
    chapterName: string;
    assignedTeacher: string;
    content: string;
    startTime: Dayjs | null;
    endTime: Dayjs | null;
    timeLine: Dayjs | null;
    documents?: Array<{
      id: string;
      name: string;
      url: string;
    }>;
  } | null;
}

export const AddNewChapter: React.FC<AddNewChapterProps> = ({
  onSubmit,
  selectedSubject,
  isEdit = false,
  initialValues = null,
}: AddNewChapterProps) => {
  const [documents, setDocuments] = useState<Document[]>(initialValues?.documents || []);
  const [uploadedDocs, setUploadedDocs] = useState<File[]>([]);
  const [editorContent, setEditorContent] = useState('');

  const validationSchema = Yup.object({
    chapterNo: Yup.number().required('Chapter No is required'),
    chapterName: Yup.string().required('Chapter name is required'),
    assignedTeacher: Yup.string().required('Assigned Teacher is Required'),
    content: Yup.string().required('Chapter description is required'),
    startTime: Yup.string().required('Select the startTime for chapter'),
    endTime: Yup.string().required('Select the endTime for chapter'),
  });

  const formik = useFormik({
    initialValues: {
      chapterNo: initialValues?.chapterNo || 0,
      chapterName: initialValues?.chapterName || '',
      assignedTeacher: initialValues?.assignedTeacher || '',
      content: initialValues?.content || '',
      startTime: initialValues?.startTime ? dayjs(initialValues.startTime) : null,
      endTime: initialValues?.endTime ? dayjs(initialValues.endTime) : null,
      timeLine: initialValues?.timeLine ? dayjs(initialValues.timeLine) : null,
    },
    validationSchema,
    onSubmit: (values) => {
      onSubmit({
        ...values,
        startTime: values.startTime?.toISOString(),
        endTime: values.endTime?.toISOString(),
        timeLine: values.timeLine?.toISOString(),
        documents,
      });
    },
  });

  useEffect(() => {
    if (initialValues) {
      setEditorContent(initialValues.content);
      setDocuments(initialValues.documents || []);
      formik.setFieldValue(
        'startTime',
        initialValues.startTime ? dayjs(initialValues.startTime) : null
      );

      formik.setFieldValue('endTime', initialValues.endTime ? dayjs(initialValues.endTime) : null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues]);

  const handleFileUpload = (files: File[]) => {
    const newDocs: Document[] = files.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      url: '',
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
        <Scrollbar sx={{ p: 2, height: { xs: 'auto', md: '500px' } }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Chapter Number"
                name="chapterNo"
                type="number"
                value={formik.values.chapterNo}
                onChange={formik.handleChange}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Chapter Name"
                name="chapterName"
                value={formik.values.chapterName}
                onChange={formik.handleChange}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Chapter StartTime"
                value={formik.values.startTime}
                onChange={(newValue) => {
                  formik.setFieldValue('startTime', newValue);
                }}
                sx={{ minWidth: 180, width: '100%' }}
                slotProps={{
                  textField: {
                    size: 'small',
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <DatePicker
                label="Chapter EndTime"
                value={formik.values.endTime}
                onChange={(newValue) => {
                  formik.setFieldValue('endTime', newValue);
                }}
                sx={{ minWidth: 180, width: '100%' }}
                slotProps={{
                  textField: {
                    size: 'small',
                  },
                }}
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
                name="assignedTeacher"
                value={formik.values.assignedTeacher}
                formControlProps={{ sx: { minWidth: 180, width: '100%' } }}
                onChange={(val) => {
                  formik.setFieldValue('assignedTeacher', val);
                }}
                error={formik.touched.assignedTeacher}
              />
            </Grid>

            <Grid item xs={12}>
              <Editor
                value={editorContent}
                onChange={(value) => {
                  formik.setFieldValue('content', value);
                }}
                placeholder="Chapter Description"
                sx={{ width: '100%', marginTop: '10px' }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Upload the chapter Material
              </Typography>
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
          <Button type="submit" variant="contained">
            {isEdit ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Box>
  );
};

interface ViewSubjectChapterProps {
  onClose: () => void;
  chapterData: any;
  onAddNewChapter: () => void;
  onEditChapter: (chapter: any) => void;
}
