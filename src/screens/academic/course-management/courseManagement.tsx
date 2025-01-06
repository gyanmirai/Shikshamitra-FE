import type { ChartOptions } from 'src/components/chart';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import { useFormik } from 'formik';
import React, { useState } from 'react';

import { Add } from '@mui/icons-material';
import {
  Box,
  Tab,
  Card,
  Grid,
  Button,
  Switch,
  MenuList,
  useTheme,
  MenuItem,
  TextField,
  Typography,
  IconButton,
  DialogActions,
  DialogContent,
  LinearProgress,
  DialogContentText,
} from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';
import { useBoolean } from 'src/hooks/use-boolean';

import { fNumber } from 'src/utils/format-number';

import { CONFIG } from 'src/config-global';
import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { Iconify } from 'src/components/iconify';
import { UploadBox } from 'src/components/upload';
import { SvgColor } from 'src/components/svg-color';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import { Chart, useChart } from 'src/components/chart';
import CustomSelect from 'src/components/custom-select';
import { CustomTabs } from 'src/components/custom-tabs';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

const initialCourseData: CourseData[] = [
  {
    id: 1,
    courseName: 'Mathematics 101',
    className: '1',
    description: 'An introduction to basic algebra and geometry.',
    subject: 'Math',
    resource: 'Textbook',
    learningGoal: 'Understand basic algebraic equations.',
    assignedTeacher: 'Jiya',
    status: 'Active',
    material: {
      videos: 20,
      pdfs: 50,
    },
  },
  {
    id: 2,
    courseName: 'English Literature',
    className: '2',
    description: 'Study of classical English literature.',
    subject: 'English',
    resource: 'Projector',
    learningGoal: 'Familiarize with classical literature themes.',
    assignedTeacher: 'Riya',
    status: 'Inactive',
    material: {
      videos: 90,
      pdfs: 10,
    },
  },
  {
    id: 3,
    courseName: 'Physics 101',
    className: '3',
    description: 'Introduction to mechanics and thermodynamics.',
    subject: 'Science',
    resource: 'Laptop',
    learningGoal: 'Understand the basics of mechanics and energy transfer.',
    assignedTeacher: 'Priya',
    status: 'Active',
    material: {
      videos: 60,
      pdfs: 10,
    },
  },
];

interface CourseData {
  id: number;
  courseName: string;
  className: string;
  description: string;
  subject: string;
  resource: string;
  learningGoal: string;
  assignedTeacher: string;
  status: string;
  material: {
    videos: number;
    pdfs: number;
  };
}

interface ChapterData {
  id: number;
  courseId: number;
  chapter: string;
  content: string;
  progress: number;
  classId: string;
  division: string;
}

interface AccordionItem {
  chapter: string;
  content: string;
  progress: number;
}

const sampleChapterData: ChapterData[] = [
  {
    id: 1,
    courseId: 1,
    chapter: 'Chapter 1: Introduction to Algebra',
    content: 'Chapter 1 for div A',
    progress: 80,
    classId: '1',
    division: 'A',
  },
  {
    id: 2,
    courseId: 1,
    chapter: 'Chapter 2: Linear Equations',
    content: 'Chapter 2 for div A',
    progress: 60,
    classId: '1',
    division: 'A',
  },
  {
    id: 3,
    courseId: 1,
    chapter: 'Chapter 1: Introduction to Algebra',
    content: 'Chapter 2 for div B',
    progress: 30,
    classId: '1',
    division: 'B',
  },
  {
    id: 4,
    courseId: 1,
    chapter: 'Chapter 2: Linear Equations',
    content: 'Chapter 2 for div B',
    progress: 90,
    classId: '1',
    division: 'B',
  },
];

const CourseManagement = (props: TabComponentType) => {
  const [courseData, setCourseData] = useState<CourseData[]>(initialCourseData);
  const [selectedCourse, setSelectedCourse] = useState<CourseData | null>(null);
  const [chapterData, setChapterData] = useState<ChapterData[]>(sampleChapterData);
  const dialog = useBoolean();
  const confirm_dialog = useBoolean();
  const chapterDialog = useBoolean();

  const [pendingStatusChange, setPendingStatusChange] = useState<{
    id: number;
    newValue: string;
  } | null>(null);

  const [selectedEntry, setSelectedEntry] = useState<CourseData | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  // const [accordionData1, setAccordionData1] = useState<AccordionItem[]>(initialAccordionData);
  // const [accordionData2, setAccordionData2] = useState<AccordionItem[]>(initialAccordionData);

  const theme = useTheme();

  const handleSave = (dataFromDialog: CourseData) => {
    if (isEdit && selectedEntry) {
      setCourseData(
        courseData.map((course) =>
          course.id === selectedEntry.id ? { ...course, ...dataFromDialog } : course
        )
      );
    } else {
      setCourseData([...courseData, { ...dataFromDialog, id: Date.now() }]);
    }
    closeDialog();
  };

  const closeDialog = () => {
    setIsEdit(false);
    setSelectedEntry(null);
    dialog.onFalse();
  };

  const handleViewChapters = (course: CourseData) => {
    setSelectedCourse(course);
    chapterDialog.onTrue();
  };

  const handleStatusChange = (id: number, value: string) => {
    setPendingStatusChange({ id, newValue: value === 'Active' ? 'Inactive' : 'Active' });
    confirm_dialog.onTrue(); // Open confirmation dialog
  };

  const confirmStatusChange = () => {
    if (pendingStatusChange) {
      const { id, newValue } = pendingStatusChange;
      setCourseData((prevCourse) =>
        prevCourse.map((course) => (course.id === id ? { ...course, status: newValue } : course))
      );
    }
    confirm_dialog.onFalse();
    setPendingStatusChange(null);
  };

  const cancelStatusChange = () => {
    confirm_dialog.onFalse();
    setPendingStatusChange(null);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="flex-end" alignItems="center" mb={5}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setIsEdit(false);
            setSelectedEntry(null);
            dialog.onTrue();
          }}
        >
          Create New Course
        </Button>
      </Box>
      <CustomizableTable
        columns={[
          { id: 'courseName', label: 'Course Name' },
          { id: 'className', label: 'Class' },
          {
            id: 'assignedTeacher',
            label: 'Assigned Teacher(s)',
            render: (value) => (Array.isArray(value) ? value.join(', ') : value),
          },
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
            id: 'status',
            label: 'Status',
            render: (value, row) => (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography sx={{ mr: 2 }} fontSize={11}>
                  In Active
                </Typography>
                <Switch
                  size="small"
                  checked={value === 'Active'}
                  onChange={() => {
                    handleStatusChange(row.id, value);
                  }}
                />
                <Typography sx={{ mr: 2 }} fontSize={11}>
                  Active
                </Typography>
              </Box>
            ),
          },
          {
            id: 'viewChapters',
            label: 'View Details',
            render: (_, row) => {
              const course = courseData.find((s) => s.id === row.id);
              return (
                <IconButton onClick={() => course && handleViewChapters(course)} sx={{}}>
                  <Iconify icon="mdi:eye" />
                </IconButton>
              );
            },
          },
          {
            id: 'action',
            label: 'Action',
            render(value: any, row: any) {
              return (
                <ThreeDotsActions
                  actions={({ popover }: any) => (
                    <MenuList>
                      <MenuItem
                        onClick={() => {
                          setIsEdit(true);
                          setSelectedEntry(row);
                          dialog.onTrue();
                        }}
                      >
                        <Iconify icon="solar:pen-bold" />
                        Edit
                      </MenuItem>
                    </MenuList>
                  )}
                />
              );
            },
          },
        ]}
        data={courseData}
      />
      <CustomDialog
        title={isEdit ? 'Edit Course' : 'New Course'}
        open={dialog.value}
        handleClose={closeDialog}
        maxWidth="sm"
      >
        <CourseCreationForm
          onSave={handleSave}
          onClose={closeDialog}
          data={selectedEntry}
          isEdit={isEdit}
        />
      </CustomDialog>

      <CustomDialog
        title="Confirm Publication"
        open={confirm_dialog.value}
        handleClose={confirm_dialog.onFalse}
        maxWidth="sm"
      >
        <DialogContent>
          <DialogContentText>
            Are you sure to {pendingStatusChange?.newValue === 'Active' ? 'publish' : 'deactivate'}{' '}
            this course?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelStatusChange} variant="contained" color="error">
            Cancel
          </Button>
          <Button onClick={confirmStatusChange} autoFocus variant="contained" color="success">
            Confirm
          </Button>
        </DialogActions>
      </CustomDialog>

      <CustomDialog
        title={`${selectedCourse?.courseName} course`}
        open={chapterDialog.value}
        handleClose={chapterDialog.onFalse}
        maxWidth="md"
      >
        <ViewChaptersComponent
          onClose={chapterDialog.onFalse}
          chapterData={chapterData}
          selectedCourse={selectedCourse}
        />
      </CustomDialog>

      <Grid container spacing={2} mt={4}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2, height: '100%', display: 'flex', justifyContent: 'space-between' }}>
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
          <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 2 }}>
            <Switch defaultChecked />
            <Typography>Draft Mode</Typography>
            <Switch />
            <Typography>Publish</Typography>
            <Button variant="contained" sx={{ marginLeft: 'auto' }}>
              Discussion
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2, height: '100%', display: 'flex', justifyContent: 'space-between' }}>
            <AppWidget
              title="Videos"
              total={38566}
              icon="solar:user-rounded-bold"
              chart={{ series: 98 }}
            />
            <AppWidget
              title="Quizzes"
              total={38566}
              icon="solar:user-rounded-bold"
              chart={{
                series: 21,
                colors: [theme.palette.secondary.light, theme.palette.secondary.main],
              }}
            />
          </Card>
          <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 2 }}>
            <Switch defaultChecked />
            <Typography>Draft Mode</Typography>
            <Switch />
            <Typography>Publish</Typography>
            <Button variant="contained" sx={{ marginLeft: 'auto' }}>
              Discussion
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

interface ViewChaptersComponentProps {
  onClose: () => void;
  selectedCourse: CourseData | null;
  chapterData: ChapterData[];
}

const ViewChaptersComponent: React.FC<ViewChaptersComponentProps> = ({
  onClose,
  selectedCourse,
  chapterData,
}) => {
  const [division, setDivision] = useState<string>('');

  const filteredChapters = React.useMemo(() => {
    if (!selectedCourse || !selectedCourse.className || !division) {
      return;
    }

    // eslint-disable-next-line consistent-return
    return chapterData.filter(
      (chapter) =>
        chapter.courseId === selectedCourse.id &&
        chapter.classId === selectedCourse?.className &&
        chapter.division === division
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterData, selectedCourse, selectedCourse?.className, division]);

  return (
    <Box display="flex" flexDirection="column" gap={2} marginBottom={2}>
      <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '500px' }}>
        <Box display="flex" gap={2}>
          <CustomSelect
            label="Division"
            disabled={!selectedCourse?.className}
            options={[
              { value: 'A', label: 'A' },
              { value: 'B', label: 'B' },
              { value: 'C', label: 'C' },
            ]}
            value={division}
            onChange={(val) => {
              setDivision(val as string);
            }}
            formControlProps={{ fullWidth: true, sx: { maxWidth: '200px' } }}
          />
        </Box>
        {selectedCourse?.className &&
          division &&
          filteredChapters &&
          filteredChapters?.length > 0 && <ChapterTabsView chapters={filteredChapters} />}
      </Scrollbar>
      <DialogActions>
        <Button>Cancel</Button>
        <Button type="submit" variant="contained">
          Save
        </Button>
      </DialogActions>
    </Box>
  );
};

interface ChapterTabsViewProps {
  chapters: ChapterData[];
}

const ChapterTabsView: React.FC<ChapterTabsViewProps> = ({ chapters }) => {
  const tabs = useTabs(chapters[0]?.id.toString());

  const currentChapter = chapters.find((chapter) => chapter.id.toString() === tabs.value);

  const CHAPTER_TABS = chapters.map((chapter) => ({
    value: chapter.id.toString(),
    label: chapter?.chapter,
    component: () => (
      <Box sx={{ marginTop: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              {chapter.chapter} Progress
            </Typography>
            <Box
              sx={{
                width: '200px',
                height: '24px',
                position: 'relative',
                borderRadius: '12px',
                bgcolor: '#e0e0e0',
                overflow: 'hidden',
              }}
            >
              <LinearProgress
                variant="determinate"
                value={chapter.progress}
                sx={{
                  height: '100%',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: 'primary',
                    transition: 'transform 0.4s linear',
                  },
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  color: '#000',
                  fontWeight: 'bold',
                  zIndex: 1,
                }}
              >
                {`${Math.round(chapter.progress)}%`}
              </Typography>
            </Box>
          </Box>
          {/* Buttons container */}
          <Box display="flex" alignItems="center" gap={2}>
            <Button variant="contained" startIcon={<Add />} onClick={() => {}}>
              Add New Content
            </Button>
            <Button variant="contained" onClick={() => {}}>
              Edit
            </Button>
            <Button variant="contained" onClick={() => {}}>
              Delete
            </Button>
          </Box>
        </Box>
        <Card sx={{ mt: 2, height: '100%' }}>
          <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '300px' }}>
            <ChapterContent content={chapter.content} />
          </Scrollbar>
        </Card>
      </Box>
    ),
  }));

  const CurrentComponent = CHAPTER_TABS.find((tab) => tab.value === tabs.value)?.component;

  return (
    <Box>
      <Card
        sx={{
          '& *': { fontSize: '13px !important', '& svg': { fontSize: '18px !important' } },
          marginTop: 2,
        }}
      >
        <CustomTabs
          value={tabs.value}
          onChange={tabs.onChange}
          variant="fullWidth"
          slotProps={{ tab: { px: 0 } }}
        >
          {CHAPTER_TABS.map((tab) => (
            <Tab key={tab.value} value={tab.value} label={tab.label} />
          ))}
        </CustomTabs>
      </Card>
      <Box px={1} pt={2}>
        {CurrentComponent?.()}
      </Box>
    </Box>
  );
};

const ChapterContent: React.FC<{ content: string }> = ({ content }) => (
  <Box sx={{ p: 2 }}>
    <Typography>{content}</Typography>
  </Box>
);

interface AppWidgetProps {
  title: string;
  total?: number;
  icon: string;
  chart: {
    colors?: string[];
    series: number;
    options?: ChartOptions;
  };
}

export const AppWidget: React.FC<AppWidgetProps> = ({ title, total, icon, chart }) => {
  const theme = useTheme();

  const chartColors = chart.colors ?? [theme.palette.primary.light, theme.palette.primary.main];

  const chartOptions = useChart({
    chart: { sparkline: { enabled: true } },
    stroke: { width: 0 },
    fill: {
      type: 'solid',
      colors: chartColors,
    },
    plotOptions: {
      radialBar: {
        dataLabels: {
          name: { show: false },
          value: {
            offsetY: 6,
            color: 'black',
            fontSize: theme.typography.subtitle2.fontSize as string,
          },
        },
      },
    },
    ...chart.options,
  });

  return (
    <Box
      sx={{
        p: 1.5,
        gap: 2,
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'common.white',
        color: 'common.black',
        width: '100%',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          position: 'relative',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Chart
          type="radialBar"
          series={[chart.series]}
          options={chartOptions}
          width={80}
          height={80}
          sx={{ zIndex: 1 }}
        />
        <SvgColor
          src={`${CONFIG.site.basePath}/assets/background/shape-circle-3.svg`}
          sx={{
            width: 200,
            height: 200,
            opacity: 0.08,
            position: 'absolute',
            color: 'primary.light',
          }}
        />
      </Box>

      <Box sx={{ textAlign: 'center' }}>
        {total && <Typography variant="h3">{fNumber(total)}</Typography>}
        <Typography
          variant="subtitle2"
          sx={{
            mt: 1,
            color: 'text.secondary',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '100%',
          }}
        >
          {title}
        </Typography>
      </Box>
    </Box>
  );
};

interface CourseCreationFormProps {
  onSave: (values: CourseData) => void;
  onClose: () => void;
  data: CourseData | null;
  isEdit: boolean;
}

const CourseCreationForm: React.FC<CourseCreationFormProps> = ({
  onSave,
  onClose,
  data,
  isEdit,
}) => {
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  const formik = useFormik<CourseData>({
    initialValues: {
      id: isEdit && data ? data.id : Date.now(),
      courseName: isEdit && data ? data.courseName : '',
      className: isEdit && data ? data.className : '',
      description: isEdit && data ? data.description : '',
      subject: isEdit && data ? data.subject : '',
      resource: isEdit && data ? data.resource : '',
      learningGoal: isEdit && data ? data.learningGoal : '',
      assignedTeacher: isEdit && data ? data.assignedTeacher : '',
      status: isEdit && data ? data.status : 'Inactive',
      material: {
        videos: 0,
        pdfs: 0,
      },
    },
    onSubmit: (values) => {
      onSave(values);
    },
  });

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <form onSubmit={formik.handleSubmit}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '300px' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Course Name"
                name="courseName"
                value={formik.values.courseName}
                onChange={formik.handleChange}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <CustomSelect
                options={classData?.items || []}
                value={formik.values.className}
                onChange={(val) => formik.setFieldValue('className', val as string)}
                label="Class"
                isLoading={isLoading}
                labelKey="name"
                valueKey="name"
                formControlProps={{ sx: { minWidth: 270 } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <CustomSelect
                label="Subject"
                options={[
                  { value: 'math', label: 'Math' },
                  { value: 'english', label: 'English' },
                  { value: 'science', label: 'Science' },
                ]}
                name="subject"
                value={formik.values.subject}
                onChange={(val) => formik.setFieldValue('subject', val as string)}
                formControlProps={{ sx: { minWidth: 275 } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <CustomSelect
                label="Assigned Teacher(s)"
                options={[
                  { value: 'Jiya', label: 'Jiya' },
                  { value: 'Riya', label: 'Riya' },
                  { value: 'Priya', label: 'Priya' },
                ]}
                name="assignedTeacher"
                value={formik.values.assignedTeacher}
                onChange={(val) => formik.setFieldValue('assignedTeacher', val as string[])}
                formControlProps={{ sx: { minWidth: 270 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
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
            <Grid item xs={12} md={6}>
              <CustomSelect
                label="Resources"
                options={[
                  { value: 'laptop', label: 'Laptop' },
                  { value: 'projector', label: 'Projector' },
                  { value: 'textbook', label: 'Textbook' },
                ]}
                name="resource"
                value={formik.values.resource}
                onChange={(val) => formik.setFieldValue('resource', val as string)}
                formControlProps={{ sx: { minWidth: 275 } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Learning Goals"
                name="learningGoal"
                value={formik.values.learningGoal}
                onChange={formik.handleChange}
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <CustomSelect
                label="Status"
                options={[
                  { value: 'Active', label: 'Active' },
                  { value: 'Inactive', label: 'Inactive' },
                ]}
                name="status"
                value={formik.values.status}
                onChange={(val) => formik.setFieldValue('status', val as string)}
                formControlProps={{ sx: { minWidth: 275 } }}
              />
            </Grid>
          </Grid>
        </Scrollbar>

        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {isEdit ? 'Update' : 'Create'} Course
          </Button>
        </DialogActions>
      </form>
    </Box>
  );
};

export default CourseManagement;
