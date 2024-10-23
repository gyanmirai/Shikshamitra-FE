import type { TabComponentType } from 'src/screens/hr/leave-request';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Box,
  Grid,
  Button,
  MenuItem,
  useTheme,
  MenuList,
  TextField,
  Accordion,
  Typography,
  IconButton,
  DialogActions,
  CircularProgress,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { UploadBox } from 'src/components/upload';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import { subjectTempData } from './subjectsData';

interface TableRow {
  subjectName: string;
  assignedTeacher: string;
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
  const router = useRouter();
  const [classes, setClasses] = useState<string>('');
  const chapterDialog = useBoolean();
  const addChapterDialog = useBoolean();
  const [expandedAccordion, setExpandedAccordion] = useState<string | false>(false);
  const theme = useTheme();
  const [subjectData, setSubjectData] = useState(subjectTempData);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [subjectTableData, setSubjectTableData] = useState<TableRow[]>([]);
  const [dialogData, setDialogData] = useState<any>([]);

  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });
  console.log('props===', props);

  useEffect(() => {
    if (classes) {
      const selectedClassData = subjectData.classes.find((cls) => cls.name === classes);
      if (selectedClassData) {
        const divisionData = selectedClassData.divisions;
        const firstDivisionSubjects = divisionData[0]?.subjects || [];

        const subjects = firstDivisionSubjects.map((subject) => ({
          subjectName: subject.name,
          assignedTeacher: subject.assignedTeacher,
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
  }, [classes, subjectData]);

  const handleNewChapterSubmit = (values: any) => {
    const updatedSubjectData = { ...subjectData };
    const selectedClass = updatedSubjectData.classes.find((cls) => cls.name === classes);

    if (selectedClass) {
      // Create the new chapter object
      const newChapter = {
        id:
          Math.max(
            ...selectedClass.divisions.flatMap((div) =>
              div.subjects.flatMap((sub) => sub.chapters.map((ch) => ch.id))
            ),
            0
          ) + 1,
        chapterName: values.chapterName,
        content: values.chapterDescription,
        progress: 0,
        assignments: [],
      };

      // Add the chapter to all divisions for the selected subject
      selectedClass.divisions.forEach((division) => {
        const subject = division.subjects.find((sub) => sub.name === selectedSubject);
        if (subject) {
          subject.chapters.push({ ...newChapter });
        }
      });

      setSubjectData(updatedSubjectData);
      const updatedDialogData = selectedClass.divisions.map((division) => ({
        divisionName: division.name,
        chapters: division.subjects
          .filter((subject) => subject.name === selectedSubject)
          .flatMap((subject) => subject.chapters),
      }));

      setDialogData(updatedDialogData);
    }
    addChapterDialog.onFalse();
  };

  const handleEyeClick = (subjectName: string) => {
    const selectedClassData = subjectData.classes.find((cls) => cls.name === classes);
    setSelectedSubject(subjectName);
    const allDivisionChapters =
      selectedClassData?.divisions.map((division) => ({
        divisionName: division.name,
        chapters: division.subjects
          .filter((subject) => subject.name === subjectName)
          .flatMap((subject) => subject.chapters),
      })) || [];

    setDialogData(allDivisionChapters);
    chapterDialog.onTrue();
  };

  return (
    <Box>
      <Typography variant="h6" marginBottom={3}>
        Subject Management
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
        formControlProps={{ sx: { minWidth: 200 } }}
      />
      {subjectTableData.length > 0 && (
        <CustomizableTable
          columns={[
            {
              id: 'subjectName',
              label: 'Subject Name',
            },
            { id: 'assignedTeacher', label: 'Assigned Teacher' },
            {
              id: 'material',
              label: 'Material',
              render(value, row) {
                const { videos, pdfs } = value;
                return (
                  <Typography sx={{ mr: 2 }} fontSize={11}>
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
              id: 'viewDetails',
              label: 'View Details',
              render: (value, row) => (
                <IconButton
                  onClick={() => {
                    handleEyeClick(row.subjectName);
                  }}
                >
                  <Iconify icon="mdi:eye" />
                </IconButton>
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
                      <MenuItem
                        onClick={() => {
                          setSelectedSubject(row.subjectName);
                          addChapterDialog.onTrue();
                        }}
                      >
                        Add Chapter
                      </MenuItem>
                      <MenuItem onClick={() => {}}>Add Learning Resources</MenuItem>
                    </MenuList>
                  )}
                />
              ),
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
            addChapterDialog.onTrue();
          }}
        />
      </CustomDialog>

      <CustomDialog
        title="Add New Chapter"
        open={addChapterDialog.value}
        handleClose={addChapterDialog.onFalse}
      >
        <AddNewChapter
          onSubmit={handleNewChapterSubmit}
          selectedSubject={selectedSubject}
          onClose={addChapterDialog.onFalse}
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

interface AddNewChapterProps {
  onSubmit: (values: any) => void;
  selectedSubject?: string;
  onClose: () => void;
  isEdit?: boolean;
}

const AddNewChapter: React.FC<AddNewChapterProps> = ({
  onSubmit,
  selectedSubject,
  onClose,
  isEdit = false,
}: AddNewChapterProps) => {
  const validationSchema = Yup.object({
    chapterName: Yup.string().required('Chapter name is required'),
    chapterDescription: Yup.string().required('Chapter description is required'),
  });

  const formik = useFormik({
    initialValues: {
      chapterName: '',
      chapterDescription: '',
    },
    validationSchema,
    onSubmit: (values) => {
      console.log('handle submit calls');
      onSubmit(values);
    },
  });
  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <form onSubmit={formik.handleSubmit}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '300px' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Chapter Name"
                name="chapterName"
                value={formik.values.chapterName}
                onChange={formik.handleChange}
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Chapter Description"
                name="chapterDescription"
                value={formik.values.chapterDescription}
                onChange={formik.handleChange}
                size="small"
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
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {isEdit ? 'Update' : 'Create'} Save
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
}

const ViewSubjectChapter: React.FC<ViewSubjectChapterProps> = ({
  onClose,
  chapterData,
  onAddNewChapter,
}: ViewSubjectChapterProps) => {
  const [division, setDivision] = useState<string>('');
  const [chapters, setChapters] = useState<any[]>([]); // State to hold chapter details

  useEffect(() => {
    if (division) {
      const selectedDivisionData = chapterData.find(
        (chapter: any) => chapter.divisionName === division
      );
      setChapters(selectedDivisionData?.chapters || []);
    }
  }, [division, chapterData]);

  return (
    <Box display="flex" flexDirection="column" gap={2} marginBottom={2}>
      <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '500px' }}>
        <Box sx={{ display: 'flex', gap: 6 }}>
          <CustomSelect
            label="Division"
            options={[
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
            onClick={onAddNewChapter}
          >
            Add New Chapter
          </Button>
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
                    <Typography>{chapter.chapterName}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <Label variant="soft" color="success">
                      {chapter.progress}% Completed
                    </Label>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>{chapter.content}</Typography>
                </AccordionDetails>
              </Accordion>
            ))}
        </Box>
      </Scrollbar>
    </Box>
  );
};
