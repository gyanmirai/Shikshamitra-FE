import React from 'react';

import { Box, Stack, Button, MenuList, MenuItem, TextField, DialogActions } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Label } from 'src/components/label';
import { Upload } from 'src/components/upload';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

const AssessmentManagement = () => {
  const modal = useBoolean();
  const uploadModal = useBoolean();
  const gradeScalingModal = useBoolean();
  return (
    <Box>
      <CustomSelect
        options={[]}
        value=""
        onChange={() => {}}
        label="Pending Assessment"
        formControlProps={{ sx: { maxWidth: 200, mb: 2, width: '100%' } }}
      />
      <CustomizableTable
        columns={[
          { id: 'class', label: 'Class' },
          { id: 'subjectName', label: 'Subject Name' },
          { id: 'examName', label: 'Exam Name' },
          { id: 'marksEntry', label: 'Marks Entry' },
          { id: 'grade', label: 'Grade' },
          {
            id: 'status',
            label: 'Status',
            render: (value) => (
              <Label color={value === 'Pending' ? 'warning' : 'success'}>{value}</Label>
            ),
          },
          {
            id: 'action',
            label: 'Action',
            render(value, row) {
              return (
                <ThreeDotsActions
                  actions={({ popover }: any) => (
                    <MenuList>
                      <MenuItem
                        onClick={() => {
                          modal.onTrue();
                          popover.onClose();
                        }}
                      >
                        <Iconify icon="solar:pen-bold" sx={{ height: '16px', width: '16px' }} />
                        Enter Marks
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          uploadModal.onTrue();
                          popover.onClose();
                        }}
                      >
                        <Iconify icon="solar:upload-bold" sx={{ height: '16px', width: '16px' }} />
                        Bulk Upload Marks
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          gradeScalingModal.onTrue();
                          popover.onClose();
                        }}
                      >
                        <Iconify icon="solar:upload-bold" sx={{ height: '16px', width: '16px' }} />
                        Grade Scaling & Criteria
                      </MenuItem>
                    </MenuList>
                  )}
                />
              );
            },
          },
        ]}
        data={[
          {
            class: '10th Grade',
            subjectName: 'Mathematics',
            examName: 'Mid-Term Exam',
            marksEntry: '50/100',
            grade: 'B',
            status: 'Completed',
            action: 'View',
          },
          {
            class: '11th Grade',
            subjectName: 'Physics',
            examName: 'Final Exam',
            marksEntry: '85/100',
            grade: 'A',
            status: 'Completed',
            action: 'View',
          },
          {
            class: '9th Grade',
            subjectName: 'English',
            examName: 'Quiz 1',
            marksEntry: '18/20',
            grade: 'A-',
            status: 'Pending',
            action: 'Edit',
          },
          {
            class: '12th Grade',
            subjectName: 'Chemistry',
            examName: 'Lab Test',
            marksEntry: '28/30',
            grade: 'A+',
            status: 'Pending',
            action: 'Review',
          },
          {
            class: '10th Grade',
            subjectName: 'History',
            examName: 'Term Paper',
            marksEntry: 'Not Available',
            grade: 'Pending',
            status: 'Scheduled',
            action: 'Cancel',
          },
        ]}
      />
      <CustomDialog open={modal.value} handleClose={modal.onFalse} title="Enter Marks">
        <EnterMarks />
      </CustomDialog>
      <CustomDialog
        open={uploadModal.value}
        handleClose={uploadModal.onFalse}
        title="Upload Marks CSV/Excel"
      >
        <Upload />
      </CustomDialog>
      <CustomDialog
        open={gradeScalingModal.value}
        handleClose={gradeScalingModal.onFalse}
        title="Grade Scaling & Criteria"
      >
        <GradeScalingCriteria />
      </CustomDialog>
    </Box>
  );
};

export default AssessmentManagement;

const GradeScalingCriteria = () => (
  <form>
    <Scrollbar sx={{ backgroundColor: 'background.neutral', p: 2 }}>
      <Stack spacing={2}>
        <CustomSelect options={[]} value="" onChange={() => {}} label="Predefined grading scales" />
        <CustomSelect options={[]} value="" onChange={() => {}} label="Subject" />
        <CustomSelect options={[]} value="" onChange={() => {}} label="Class" />
        <TextField label="custom grade thresholds" name="threshold" size="small" />
      </Stack>
    </Scrollbar>
    <DialogActions>
      <Button variant="contained" color="primary">
        Save
      </Button>
    </DialogActions>
  </form>
);

const EnterMarks = () => (
  <form>
    <Scrollbar sx={{ backgroundColor: 'background.neutral', p: 2 }}>
      <Stack spacing={2}>
        <TextField label="Name" name="name" size="small" />
        <TextField label="Marks" name="marks" size="small" />
      </Stack>
    </Scrollbar>
    <DialogActions>
      <Button variant="contained" color="primary">
        Save
      </Button>
    </DialogActions>
  </form>
);
