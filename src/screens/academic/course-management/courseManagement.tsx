import type { TabComponentType } from 'src/screens/hr/leave-request';
import type { IData } from 'src/components/customizabaleTable/types';

import React, { useState } from 'react';
import { Add } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import {
  Box,
  Card,
  Grid,
  Button,
  Switch,
  MenuList,
  MenuItem,
  Typography,
  IconButton,
  DialogActions,
  DialogContent,
  DialogContentText,
} from '@mui/material';

import AppWidget from './components/AppWidget';
import CourseCreationForm from './components/CourseCreationForm';
import { initialCourseData, sampleChapterData } from './sampleData';
import ViewChaptersComponent from './components/ViewChaptersComponent';

import type { CourseData, ChapterData } from './type';

const CourseManagement = (props: TabComponentType) => {
  const [courseData, setCourseData] = useState<CourseData[]>(initialCourseData);
  const [selectedCourse, setSelectedCourse] = useState<CourseData | null>(null);
  const [chapterData] = useState<ChapterData[]>(sampleChapterData);
  const dialog = useBoolean();
  const confirm_dialog = useBoolean();
  const chapterDialog = useBoolean();

  const [pendingStatusChange, setPendingStatusChange] = useState<{
    id: number;
    newValue: string;
  } | null>(null);

  const [selectedEntry, setSelectedEntry] = useState<CourseData | null>(null);
  const [isEdit, setIsEdit] = useState(false);

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
        tableId="course-management-table"
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
                <IconButton onClick={() => course && handleViewChapters(course)}>
                  <Iconify icon="mdi:eye" />
                </IconButton>
              );
            },
          },
          {
            id: 'action',
            label: 'Action',
            render(value: string, row: IData) {
              const typedRow = row as CourseData;
              return (
                <ThreeDotsActions
                  actions={(actionProps: { popover: { onClose: () => void } }) => (
                    <MenuList>
                      <MenuItem
                        onClick={() => {
                          setIsEdit(true);
                          setSelectedEntry(typedRow);
                          dialog.onTrue();
                          actionProps.popover.onClose();
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

      <Grid container spacing={1} mt={4}>
        <Grid size={{ xs: 12, md: 6 }}>
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

        <Grid size={{ xs: 12, md: 6 }}>
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

export default CourseManagement;
