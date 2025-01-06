'use client';

import type { Dayjs } from 'dayjs';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useCallback } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Box,
  Grid,
  List,
  Chip,
  Button,
  MenuItem,
  useTheme,
  MenuList,
  ListItem,
  TextField,
  Accordion,
  Typography,
  IconButton,
  ListItemIcon,
  ListItemText,
  DialogActions,
  CircularProgress,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { Label } from 'src/components/label';
import { Editor } from 'src/components/editor';
import { Iconify } from 'src/components/iconify';
import { UploadBox } from 'src/components/upload';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
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

interface AssignmentRow {
  title: string;
  dueDate: string;
  status: string;
}

interface Chapter {
  id: number;
  chapterName: string;
  teacher: string;
  content: string;
}

const assignmentData: AssignmentRow[] = [
  {
    title: 'Assignment 1',
    dueDate: '01-01-24',
    status: 'Pending',
  },
  {
    title: 'Assignment 2',
    dueDate: '01-01-24',
    status: 'Received',
  },
  {
    title: 'Assignment 3',
    dueDate: '01-01-24',
    status: 'Pending',
  },
  {
    title: 'Assignment 4',
    dueDate: '01-01-24',
    status: 'Received',
  },
];

const Subjects = (props: TabComponentType) => {
  const { searchParams, setSearchParams } = props;
  const router = useRouter();
  const [classes, setClasses] = useState<string>('');
  const chapterDialog = useBoolean();
  const addChapterDialog = useBoolean();
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
  console.log('props===', props);

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
          const subject = division.subjects.find((sub: any) => sub.name === selectedSubject);
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

        selectedClass.divisions.forEach((division: any) => {
          const subject = division.subjects.find((sub: any) => sub.name === selectedSubject);
          if (subject) {
            subject.chapters.push({ ...newChapter });
          }
        });
      }

      setSubjectData(updatedSubjectData);
      const updatedDialogData = selectedClass.divisions.map((division: any) => ({
        divisionName: division.name,
        chapters: division.subjects
          .filter((subject: any) => subject.name === selectedSubject)
          .flatMap((subject: any) => subject.chapters),
      }));

      setDialogData(updatedDialogData);
    }
    addChapterDialog.onFalse();
  };

  const handleEditChapter = (chapter: any) => {
    console.log('chapter---', chapter);

    setSelectedChapter(chapter);
    setIsEditMode(true);
    addChapterDialog.onTrue();
  };

  const handleEyeClick = (subjectName: string) => {
    const selectedClassData = subjectData.classes.find((cls: any) => cls.name === classes);

    setSelectedSubject(subjectName);
    const allDivisionChapters =
      selectedClassData?.divisions.map((division: any) => {
        const subjectDataOfClass = division.subjects.find(
          (subject: any) => subject.name === subjectName
        );

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
              setSelectedSubject(row.subjectName);
              addChapterDialog.onTrue();
              setIsEditMode(false);
              setSelectedChapter(null);
              pop.onClose();
            }}
          >
            <Iconify icon="mdi:plus" />
            Chapter
          </MenuItem>
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
    [addChapterDialog]
  );

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Content Management"
        links={[
          { name: 'Academic and Assignment' },
          { name: 'Course Management' },
          { name: 'Content Management' },
        ]}
        sx={{ px: 1, mb: 2 }}
      />
      <Typography variant="h6" marginBottom={3} mt={3}>
        Subject&apos;s Content Management
      </Typography>
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
      {subjectTableData.length > 0 && (
        <CustomizableTable
          columns={[
            {
              id: 'subjectName',
              label: 'Subject Name',
              minWidth: '140px',
              align: 'left',
            },
            { id: 'primaryTeacher', label: 'Primary Teacher', minWidth: '150px', align: 'left' },
            {
              id: 'secondaryTeacher',
              label: 'Secondary Teacher',
              minWidth: '170px',
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
              id: 'material',
              label: 'Material',
              render(value, row) {
                const { videos, pdfs } = value;
                return (
                  <Typography sx={{ mr: 2 }} fontSize={12}>
                    {videos} Videos and {pdfs} PDF/Notes
                  </Typography>
                );
              },
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
              isSort: false,
              render(value, row) {
                return (
                  <ThreeDotsActions
                    actions={(prop) => actions({ ...prop, row })}
                    placement="right-top"
                    showViewIcon
                    handleViewClick={() => {
                      handleEyeClick(row.subjectName);
                    }}
                  />
                );
              },
            },
          ]}
          data={subjectTableData}
        />
      )}

      <CustomDialog
        title={`class ${classes} - ${selectedSubject} Details`}
        open={chapterDialog.value}
        handleClose={chapterDialog.onFalse}
        maxWidth="md"
      >
        <ViewSubjectChapter
          onClose={chapterDialog.onFalse}
          chapterData={dialogData}
          onAddNewChapter={() => {
            setSelectedSubject(selectedSubject);
            setIsEditMode(false);
            setSelectedChapter(null);
            addChapterDialog.onTrue();
          }}
          onEditChapter={handleEditChapter}
        />
      </CustomDialog>

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

      {/* {selectedSubject && (
        <Box mt={2}>
          <Typography variant="h6" gutterBottom>
            {selectedSubject.subjectName} Details
          </Typography>
          {selectedSubject.chapters.map((chapter) => (
            <Accordion
              key={chapter.id}
              expanded={expandedAccordion === chapter.chapterName}
              onChange={() => handleAccordionToggle(chapter.chapterName)}
            >
              <AccordionSummary
                expandIcon={<GridExpandMoreIcon />}
                aria-controls={`panel${chapter.id}-content`}
                id={`panel${chapter.id}-header`}
              >
                <Typography>{chapter.chapterName}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>{chapter.content}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )} */}

      {/* <Grid container spacing={2} marginTop={2}>
        <Grid item xs={12}>
          <Card
            sx={{
              p: 2,
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <AppWidget
              title="Videos"
              total={38566}
              icon="solar:user-rounded-bold"
              chart={{ series: 48 }}
            />
            <AppWidget
              title="PDFs/Notes"
              total={38566}
              icon="solar:user-rounded-bold"
              chart={{
                series: 75,
                colors: [theme.palette.secondary.light, theme.palette.secondary.main],
              }}
            />
          </Card>
        </Grid>
      </Grid>

      <CustomizableTable
        columns={[
          { id: 'title', label: 'Title' },
          { id: 'dueDate', label: 'Due Date' },
          {
            id: 'status',
            label: 'Status',
            render: (value: string) => (
              <Label
                variant="soft"
                color={
                  value === 'Pending' ? 'warning' : value === 'Received' ? 'success' : 'default'
                }
              >
                {value}
              </Label>
            ),
          },
        ]}
        data={assignmentData}
      />

      <TextField
        placeholder="Teachers to leave comments/notes on subject"
        multiline
        rows={5}
        sx={{ marginTop: 2, width: '50%' }}
      /> */}
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
  chapterName: string;
  assignedTeacher: string;
  content: string;
  timeLine: string | undefined;
  documents: Document[];
}

interface AddNewChapterProps {
  onSubmit: (values: ChapterFormValues) => void;
  selectedSubject: string;
  isEdit?: boolean;
  initialValues?: {
    chapterName: string;
    assignedTeacher: string;
    content: string;
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
  console.log('initial values---', initialValues);

  const validationSchema = Yup.object({
    chapterName: Yup.string().required('Chapter name is required'),
    assignedTeacher: Yup.string().required('Assigned Teacher is Required'),
    content: Yup.string().required('Chapter description is required'),
    timeLine: Yup.string().required('Select the timeline for chapter'),
  });

  const formik = useFormik({
    initialValues: {
      chapterName: initialValues?.chapterName || '',
      assignedTeacher: initialValues?.assignedTeacher || '',
      content: initialValues?.content || '',
      timeLine: initialValues?.timeLine ? dayjs(initialValues.timeLine) : null,
    },
    validationSchema,
    onSubmit: (values) => {
      onSubmit({
        ...values,
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
        'timeLine',
        initialValues.timeLine ? dayjs(initialValues.timeLine) : null
      );
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
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '300px' }}>
          <Grid container spacing={2}>
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
                label="Chapter timeLine"
                value={formik.values.timeLine}
                onChange={(newValue) => {
                  formik.setFieldValue('timeLine', newValue);
                }}
                slotProps={{
                  textField: {
                    sx: { width: '100%', maxWidth: '200px' },
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

const ViewSubjectChapter: React.FC<ViewSubjectChapterProps> = ({
  onClose,
  chapterData,
  onAddNewChapter,
  onEditChapter,
}: ViewSubjectChapterProps) => {
  console.log('chhapter data---', chapterData);
  const [subjectProgress, setSubjectProgress] = useState<number>(0);
  const [division, setDivision] = useState<string>('All');
  const [chapters, setChapters] = useState<any[]>([]); // State to hold chapter details

  useEffect(() => {
    if (division === 'All') {
      setSubjectProgress(chapterData[0]?.subjectProgress || 0);
      const allChapters = chapterData
        .flatMap((chapter: any) => chapter.chapters || [])
        .filter(
          (chapter: any, index: number, self: any[]) =>
            index === self.findIndex((c: any) => c.chapterName === chapter.chapterName)
        );

      setChapters(allChapters);
    } else {
      const selectedDivisionData = chapterData.find(
        (chapter: any) => chapter.divisionName === division
      );
      setChapters(selectedDivisionData?.chapters || []);
    }
  }, [division, chapterData]);

  const getDeadlineColor = (deadline: string) => {
    const deadlineDate = dayjs(deadline);
    const today = dayjs();
    const diffInDays = deadlineDate.diff(today, 'day');
    if (diffInDays < 0) {
      return 'red';
    }
    if (diffInDays <= 7) {
      return 'orange';
    }
    return 'green';
  };

  return (
    <Box display="flex" flexDirection="column" gap={2} marginBottom={2}>
      <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '500px' }}>
        <Box sx={{ display: 'flex', gap: 6, flexGrow: 1 }}>
          <CustomSelect
            label="Division"
            options={[
              { value: 'All', label: 'All' },
              { value: 'A', label: 'A' },
              { value: 'B', label: 'B' },
            ]}
            value={division}
            onChange={(e) => {
              setDivision(e as string);
            }}
            formControlProps={{ fullWidth: true, sx: { maxWidth: '200px' } }}
          />
          <Button
            startIcon={<Iconify icon="mdi:plus" />}
            variant="contained"
            size="small"
            onClick={onAddNewChapter}
          >
            New Chapter
          </Button>
          {division === 'All' && (
            <Label variant="soft" color={subjectProgress < 50 ? 'error' : 'success'} marginTop={1}>
              Subject Progress : {subjectProgress}% Completed
            </Label>
          )}
        </Box>
        <Box sx={{ mt: 3 }}>
          {chapters.length > 0 &&
            chapters.map((chapter) => (
              <Accordion key={chapter.id}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={`panel${chapter.id}-content`}
                  id={`panel${chapter.id}-header`}
                >
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6">{chapter.chapterName}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                    {division !== 'All' && (
                      <Label
                        variant="soft"
                        color={chapter.progress < 50 ? 'error' : 'success'}
                        marginRight={2}
                      >
                        {chapter.progress}% Completed
                      </Label>
                    )}
                    <Typography
                      variant="subtitle2"
                      style={{
                        color: getDeadlineColor(chapter.timeLine),
                        marginRight: '16px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      {/* Icon for deadline can be added here */}
                      {/* Placeholder for deadline icon */}
                      <Iconify
                        icon="solar:calendar-mark-bold-duotone"
                        sx={{ height: '16px', width: '16px', color: 'black' }}
                      />
                      Deadline : {dayjs(chapter.timeLine).format('DD MMM YYYY')}
                    </Typography>
                    <ThreeDotsActions
                      placement="right-top"
                      onClickThreeDots={(e) => {
                        e.stopPropagation();
                      }}
                      actions={({ popover }) => (
                        <MenuList>
                          <MenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditChapter(chapter);
                              popover.onClose();
                            }}
                          >
                            <Iconify icon="solar:pen-bold" sx={{ height: '16px', width: '16px' }} />
                            Edit Chapter
                          </MenuItem>
                        </MenuList>
                      )}
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  {/* <Editor
                    value={chapter.content}
                    placeholder="Chapter Description"
                    editable={false}
                    sx={{ width: '100%', marginTop: '10px' }}
                  />{' '} */}
                  <Scrollbar sx={{ height: '150px' }}>
                    <Box dangerouslySetInnerHTML={{ __html: chapter.content }} />
                    {chapter.documents && chapter.documents.length > 0 && (
                      <Box mt={2}>
                        <Typography variant="subtitle2" gutterBottom>
                          Attached Documents
                        </Typography>
                        <List>
                          {chapter.documents.map((doc: any, index: any) => (
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
                </AccordionDetails>
              </Accordion>
            ))}
        </Box>
      </Scrollbar>
    </Box>
  );
};
