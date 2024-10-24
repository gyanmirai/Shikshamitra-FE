import type { ChartOptions } from 'src/components/chart';

import { useFormik } from 'formik';
import React, { useState, useEffect } from 'react';

import { GridExpandMoreIcon } from '@mui/x-data-grid';
import {
  Box,
  Card,
  Grid,
  Button,
  Switch,
  MenuList,
  useTheme,
  MenuItem,
  TextField,
  Accordion,
  Typography,
  DialogActions,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
} from '@mui/material';

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
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

const initialCourseData: CourseData[] = [
  {
    id: 1,
    courseName: 'Mathematics 101',
    className: 'Class A',
    description: 'An introduction to basic algebra and geometry.',
    subject: 'Math',
    resource: 'Textbook',
    learningGoal: 'Understand basic algebraic equations.',
    assignedTeacher: 'Jiya',
    status: 'Active',
  },
  {
    id: 2,
    courseName: 'English Literature',
    className: 'Class B',
    description: 'Study of classical English literature.',
    subject: 'English',
    resource: 'Projector',
    learningGoal: 'Familiarize with classical literature themes.',
    assignedTeacher: 'Riya',
    status: 'Inactive',
  },
  {
    id: 3,
    courseName: 'Physics 101',
    className: 'Class C',
    description: 'Introduction to mechanics and thermodynamics.',
    subject: 'Science',
    resource: 'Laptop',
    learningGoal: 'Understand the basics of mechanics and energy transfer.',
    assignedTeacher: 'Priya',
    status: 'Active',
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
}

interface AccordionItem {
  chapter: string;
  content: string;
  progress: number;
}

const initialAccordionData: AccordionItem[] = [
  { chapter: 'Chapter 1', content: 'Content for accordion 1', progress: 80 },
  { chapter: 'Chapter 2', content: 'Content for accordion 2', progress: 50 },
  { chapter: 'Chapter 3', content: 'Content for accordion 3 with actions', progress: 30 },
];

const CourseManagement: React.FC = () => {
  const [courseData, setCourseData] = useState<CourseData[]>(initialCourseData);
  const dialog = useBoolean();
  const [selectedEntry, setSelectedEntry] = useState<CourseData | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [accordionData1, setAccordionData1] = useState<AccordionItem[]>(initialAccordionData);
  const [accordionData2, setAccordionData2] = useState<AccordionItem[]>(initialAccordionData);

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
  const handleStatusChange = (id: number, value: string) => {
    console.log('handleStatusChange : ', id, value);
    setCourseData((prevCourse) =>
      prevCourse.map((course) => (course.id === id ? { ...course, status: value } : course))
    );
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box display="flex" justifyContent="flex-end" alignItems="center" mb={3}>
        <Button
          variant="contained"
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
            id: 'status',
            label: 'Status',
            render: (value, row) => (
              <Switch
                checked={value === 'Active'}
                onChange={(e) => {
                  handleStatusChange(row.id, value === 'Active' ? 'Inactive' : 'Active');
                }}
              />
            ),
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

      <Grid container spacing={2} mt={4}>
        <Grid item xs={12} sm={6}>
          <AccordionComponent items={accordionData1} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <AccordionComponent items={accordionData2} />
        </Grid>
      </Grid>

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

interface AccordionItem {
  chapter: string;
  content: string;
  progress: number;
}

interface AccordionComponentProps {
  items: AccordionItem[];
}

const AccordionComponent: React.FC<AccordionComponentProps> = ({ items }) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [accordionData, setAccordionData] = useState<AccordionItem[]>(items || []);
  const [editedContent, setEditedContent] = useState<string>('');
  const [expandedPanel, setExpandedPanel] = useState<number | false>(false);

  const handleChange = (panel: number) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedPanel(isExpanded ? panel : false);
  };

  const handleEdit = (index: number, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent accordion from toggling
    if (index >= 0 && index < accordionData.length) {
      setEditingId(index);
      setEditedContent(accordionData[index].content);
      setExpandedPanel(index); // Ensure panel is expanded when editing
    }
  };

  const handleSave = (index: number, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent accordion from toggling
    if (index >= 0 && index < accordionData.length) {
      const newAccordionData = [...accordionData];
      newAccordionData[index] = {
        ...newAccordionData[index],
        content: editedContent,
      };
      setAccordionData(newAccordionData);
      setEditingId(null);
    }
  };

  const handleDelete = (index: number, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent accordion from toggling
    const newAccordionData = accordionData.filter((_, i) => i !== index);
    setAccordionData(newAccordionData);
  };

  const handleMenuClick = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent accordion from toggling when clicking menu
  };

  useEffect(() => {
    setAccordionData(items || []);
  }, [items]);

  if (!items || items.length === 0) {
    return <Typography>No accordion items available</Typography>;
  }

  return (
    <>
      {accordionData.map((item, index) => (
        <Accordion key={index} onChange={handleChange(index)}>
          <AccordionSummary
            expandIcon={<GridExpandMoreIcon />}
            aria-controls={`panel${index + 1}-content`}
            id={`panel${index + 1}-header`}
            sx={{
              '& .MuiAccordionSummary-content': {
                margin: '0 !important',
              },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                justifyContent: 'space-between',
                pr: 2, // Add padding to prevent overlap with expand icon
              }}
            >
              <Typography>{item.chapter}</Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                  <CircularProgress variant="determinate" value={item.progress} size={30} />
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
                    <Typography variant="caption" component="div" color="text.secondary">
                      {item.progress}%
                    </Typography>
                  </Box>
                </Box>
                <ThreeDotsActions
                  actions={({ popover }: any) => (
                    <MenuList>
                      <MenuItem onClick={(e) => handleEdit(index, e)}>
                        <Iconify icon="solar:pen-bold" sx={{ mr: 1 }} />
                        Edit
                      </MenuItem>
                      <MenuItem onClick={(e) => handleDelete(index, e)}>
                        <Iconify icon="solar:trash-bin-trash-bold" sx={{ mr: 1 }} />
                        Delete
                      </MenuItem>
                    </MenuList>
                  )}
                />
              </Box>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            {editingId === index ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button variant="contained" color="primary" onClick={(e) => handleSave(index, e)}>
                    Save
                  </Button>
                </Box>
              </Box>
            ) : (
              <Typography>{item.content}</Typography>
            )}
          </AccordionDetails>
        </Accordion>
      ))}
    </>
  );
};

interface AppWidgetProps {
  title: string;
  total: number;
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
        p: 3,
        gap: 3,
        borderRadius: 2,
        display: 'flex',
        overflow: 'hidden',
        position: 'relative',
        alignItems: 'center',
        bgcolor: 'common.white',
        color: 'common.black',
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
      <div>
        <Box sx={{ typography: 'subtitle2' }}>{title}</Box>
        <Typography variant="h3">{fNumber(total)}</Typography>
      </div>
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
    },
    onSubmit: (values) => {
      onSave(values);
    },
  });

  return (
    <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '300px' }}>
      <Box display="flex" flexDirection="column" gap={2}>
        <form onSubmit={formik.handleSubmit}>
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
                formControlProps={{ sx: { minWidth: 270 } }}
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
                formControlProps={{ sx: { minWidth: 270 } }}
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
                formControlProps={{ sx: { minWidth: 270 } }}
              />
            </Grid>
          </Grid>
          <DialogActions>
            <Button onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {isEdit ? 'Update' : 'Create'} Course
            </Button>
          </DialogActions>
        </form>
      </Box>
    </Scrollbar>
  );
};

export default CourseManagement;
