import type { BoxProps, CardProps } from '@mui/material';
import type { ChartOptions } from 'src/components/chart';

import React, { useState } from 'react';

import Grid2 from '@mui/material/Unstable_Grid2';
// eslint-disable-next-line import/no-duplicates
import { AccordionSummary } from '@mui/material';
// eslint-disable-next-line import/no-duplicates
import { CircularProgress } from '@mui/material';
import { GridExpandMoreIcon } from '@mui/x-data-grid';
// eslint-disable-next-line import/no-duplicates
import { Stack, TextField, Typography, DialogActions } from '@mui/material';
// eslint-disable-next-line import/no-duplicates
import {
  Box,
  Card,
  Grid,
  Button,
  Switch,
  useTheme,
  Accordion,
  AccordionDetails,
  // eslint-disable-next-line import/no-duplicates
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { fNumber } from 'src/utils/format-number';

import { CONFIG } from 'src/config-global';

import { Iconify } from 'src/components/iconify';
import { SvgColor } from 'src/components/svg-color';
import { Scrollbar } from 'src/components/scrollbar';
import { Chart, useChart } from 'src/components/chart';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import { Upload, UploadBox } from 'src/components/upload';

type FProps = CardProps & {
  title: string;
  total: number;
  percent: number;
  name: string;
  chart: {
    colors?: string[];
    categories: string[];
    series: number[];
    options?: ChartOptions;
  };
};

const listData = [
  { chapter: 'Chapter 1', content: 'Content for accordion 1', progress: 80 },
  { chapter: 'Chapter 2', content: 'Content for accordion 2', progress: 50 },
  { chapter: 'Chapter 3', content: 'Content for accordion 3 with actions', progress: 30 },
];

const CourseManagement = () => {
  const [items, setItems] = useState(listData);
  const [items2, setItems2] = useState(listData);
  const theme = useTheme();
  const dialog = useBoolean();
  const [expandedPanel, setExpandedPanel] = useState(null);

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box display="flex" justifyContent="flex-end" alignItems="center" mb={3}>
        {' '}
        <Button variant="contained" onClick={dialog.onTrue}>
          Create New Course
        </Button>
      </Box>
      <Grid2 container spacing={2} marginBottom={6}>
        <Grid2 xs={12} sm={6}>
          <AppWidgetSummary
            title="Math Course"
            percent={2.6}
            total={16}
            name="John Doe"
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [15, 18, 12, 51, 68, 11, 39, 37],
            }}
          />
        </Grid2>
        <Grid2 xs={12} sm={6}>
          <AppWidgetSummary
            title="Science Course"
            percent={2.6}
            total={20}
            name="John Doe"
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [15, 18, 12, 51, 68, 11, 39, 37],
            }}
          />
        </Grid2>
      </Grid2>
      <CustomDialog
        title="New Course"
        open={dialog.value}
        handleClose={dialog.onFalse}
        maxWidth="sm"
      >
        <CourseCreationForm />
      </CustomDialog>
      <Grid2 container spacing={2}>
        <Grid2 xs={12} sm={6}>
          <AccordianComponent items={items} />
        </Grid2>
        <Grid2 xs={12} sm={6}>
          <AccordianComponent items={items2} />
        </Grid2>
      </Grid2>
      <Grid container spacing={2} marginTop={2}>
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              p: 2,
              height: '100%',
              display: 'flex',
              justifyContent: 'space-between',
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
                colors: [theme.palette.secondary.light, theme.palette.secondary.main], // Secondary colors
              }}
            />
          </Card>
          <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 2 }}>
            <Switch defaultChecked />
            <Typography>Draft Mode</Typography>
            <Switch />
            <Typography>Publish</Typography>
            <Button variant="contained" sx={{ marginLeft: '180px' }}>
              Discussion
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              p: 2,
              height: '100%',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <AppWidget
              title="Videos"
              total={38566}
              icon="solar:user-rounded-bold"
              chart={{ series: 98 }}
            />
            <AppWidget
              title="Quizess"
              total={38566}
              icon="solar:user-rounded-bold"
              chart={{
                series: 21,
                colors: [theme.palette.secondary.light, theme.palette.secondary.main], // Secondary colors
              }}
            />
          </Card>
          <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 2 }}>
            <Switch defaultChecked />
            <Typography>Draft Mode</Typography>
            <Switch />
            <Typography>Publish</Typography>
            <Button variant="contained" sx={{ marginLeft: '180px' }}>
              Discussion
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

const AccordianComponent = ({ items }: any) => {
  const [editingId, setEditingId] = useState(null);
  const [data, setData] = useState(items);
  const [isEdit, setIsEdit] = useState(false);
  const addContentDialog = useBoolean();
  const handleEdit = (index: any) => {
    setEditingId(index);
    setIsEdit(true);
  };

  const handleSave = (index: any) => {
    setEditingId(null);
    setIsEdit(false);
  };

  const handleDelete = (index: any) => {
    const newItems = items.filter((_: any, i: any) => i !== index);
    setData(newItems);
  };

  const handleContentChange = (index: any, newContent: any) => {
    const newItems = [...items];
    newItems[index].content = newContent;
    setData(newItems);
  };
  return (
    <>

      
      {data.map((item: any, index: any) => (
        <Accordion key={index}>
          <AccordionSummary
            expandIcon={<GridExpandMoreIcon />}
            aria-controls={`panel${index + 1}-content`}
            id={`panel${index + 1}-header`}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <Typography sx={{ flexGrow: 1 }}>{item.chapter}</Typography>
              <Box sx={{ position: 'relative', display: 'inline-flex', mr: 5 }}>
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
              <Button
                variant="outlined"
                size="small"
                sx={{ mr: 1 }}
                onClick={addContentDialog.onTrue}
              >
                Add Content
              </Button>
              <Button
                variant="outlined"
                size="small"
                sx={{ mr: 1 }}
                onClick={() => (editingId === index ? handleSave(index) : handleEdit(index))}
              >
                {editingId === index ? 'Save' : 'Edit'}
              </Button>
              <Button variant="contained" size="small" onClick={handleDelete}>
                Delete
              </Button>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            {editingId === index && isEdit ? (
              <TextField
                fullWidth
                multiline
                rows={4}
                value={item.content}
                onChange={(e) => handleContentChange(index, e.target.value)}
              />
            ) : (
              <Typography>{item.content}</Typography>
            )}
          </AccordionDetails>
        </Accordion>
      ))}
      <CustomDialog
        title="Add Content"
        open={addContentDialog.value}
        handleClose={addContentDialog.onFalse}
        maxWidth="sm"
      >
        <AddContent />
      </CustomDialog>
    </>
  );
};

const AppWidgetSummary = ({ title, percent, total, name, chart, sx, ...other }: FProps) => {
  const theme = useTheme();

  const chartColors = chart.colors ?? [theme.palette.primary.main];

  const chartOptions = useChart({
    chart: { sparkline: { enabled: true } },
    colors: chartColors,
    stroke: { width: 0 },
    xaxis: { categories: chart.categories },
    tooltip: {
      y: { formatter: (value) => fNumber(value), title: { formatter: () => '' } },
    },
    plotOptions: { bar: { borderRadius: 1.5, columnWidth: '64%' } },
    ...chart.options,
  });

  return (
    <Card
      sx={{
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        ...sx,
      }}
      {...other}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Typography variant="subtitle2">{title}</Typography>
          <Typography variant="h3" sx={{ my: 1 }}>
            {fNumber(total)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {name}
          </Typography>
        </Box>
        <Chart
          type="bar"
          series={[{ data: chart.series }]}
          options={chartOptions}
          width={60}
          height={40}
        />
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mt: 'auto',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Switch size="small" />
          <Typography variant="body2" sx={{ ml: 1 }}>
            Visible to students
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="small"
          sx={{
            bgcolor: 'grey.800',
            color: 'common.white',
            '&:hover': {
              bgcolor: 'grey.700',
            },
          }}
        >
          Edit Course
        </Button>
      </Box>
    </Card>
  );
};

const CourseCreationForm = () => {
  const [gradeLevel, setGradeLevel] = useState('');
  const [teacher, setTeacher] = useState('');
  const [assignedTeacher, setAssignedTeacher] = useState('');
  const [resources, setResources] = useState('');
  return (
    <Box>
      <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '300px' }}>
        <Box display="flex" flexDirection="column" gap={2}>
          <Grid container spacing={2}>
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
              <TextField label="Course Name" size="small" name="courseName" fullWidth />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Course Description"
                size="small"
                name="courseDescription"
                multiline
                fullWidth
                rows={4}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <CustomSelect
                label="Teacher Names"
                options={[
                  { value: 'Jiya', label: 'Jiya' },
                  { value: 'Riya', label: 'Riya' },
                  { value: 'Priya', label: 'Priya' },
                  { value: 'Diya', label: 'Diya' },
                ]}
                value={teacher}
                onChange={(val) => {
                  setTeacher(val as string);
                }}
                formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <CustomSelect
                label="Assigned Teacher List"
                options={[
                  { value: 'Jiya', label: 'Jiya' },
                  { value: 'Riya', label: 'Riya' },
                  { value: 'Priya', label: 'Priya' },
                  { value: 'Diya', label: 'Diya' },
                ]}
                value={assignedTeacher}
                onChange={(val) => {
                  setAssignedTeacher(val as string);
                }}
                formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
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
              <TextField label="Learning Goals" size="small" name="learningGoals" fullWidth />
            </Grid>
            <Grid item xs={12} md={6}>
              <CustomSelect
                label="Prerequisites or resources"
                options={[
                  { value: 'laptop', label: 'Laptop' },
                  { value: 'mobile', label: 'Mobile' },
                  { value: 'projector', label: 'Projector' },
                ]}
                value={resources}
                onChange={(val) => {
                  setResources(val as string);
                }}
                formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
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

const AddContent = () => (
  <Box>
    <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral' }}>
      <Stack spacing={2}>
        <CustomSelect
          options={[]}
          value=""
          onChange={() => {}}
          label="Select Content Type"
          formControlProps={{ fullWidth: true }}
        />
        <Upload />
      </Stack>
    </Scrollbar>

    <DialogActions>
      <Button variant="contained">Upload</Button>
    </DialogActions>
  </Box>
);
// ----------------------------------------------------------------------

type SProps = BoxProps & {
  icon: string;
  title: string;
  total: number;
  chart: {
    colors?: string[];
    series: number;
    options?: ChartOptions;
  };
};

export function AppWidget({ title, total, icon, chart, sx, ...other }: SProps) {
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
        ...sx,
      }}
      {...other}
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
      </div>
    </Box>
  );
}

export default CourseManagement;
