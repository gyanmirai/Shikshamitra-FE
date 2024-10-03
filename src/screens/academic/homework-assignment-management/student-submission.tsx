import React from 'react';

import {
  Box,
  Button,
  MenuList,
  MenuItem,
  TextField,
  Typography,
  DialogActions,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import { UploadBox } from 'src/components/upload';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

const StudentSubmission = () => {
  const dialog = useBoolean();
  const dummyData = [
    {
      id: 1,
      studentName: 'John Doe',
      assignmentTitle: 'Math Homework 1',
      grade: 'A',
      submissionStatus: 'Submitted',
    },
    {
      id: 2,
      studentName: 'Jane Smith',
      assignmentTitle: 'English Essay',
      grade: 'B+',
      submissionStatus: 'Graded',
    },
    {
      id: 3,
      studentName: 'Mike Johnson',
      assignmentTitle: 'Science Project',
      grade: 'Pending',
      submissionStatus: 'Submitted',
    },
    {
      id: 4,
      studentName: 'Emily Brown',
      assignmentTitle: 'History Report',
      grade: 'C',
      submissionStatus: 'Late Submission',
    },
    {
      id: 5,
      studentName: 'Alex Wilson',
      assignmentTitle: 'Programming Assignment',
      grade: 'A-',
      submissionStatus: 'Graded',
    },
  ];

  return (
    <Box>
      <Box display="flex" gap={2} alignItems="center">
        <CustomSelect options={[]} value="" onChange={() => {}} label="Organization" />
        <CustomSelect options={[]} value="" onChange={() => {}} label="Class" />
      </Box>
      <CustomizableTable
        columns={[
          { id: 'studentName', label: 'Student Name' },
          { id: 'assignmentTitle', label: 'Assignment Title' },
          { id: 'grade', label: 'Grade' },
          { id: 'submissionStatus', label: 'Submission Status' },
          {
            id: 'action',
            label: 'Action',
            render(value, row) {
              return (
                <ThreeDotsActions
                  actions={() => (
                    <MenuList>
                      <MenuItem>
                        <Iconify icon="mdi:eye" />
                        View Submission
                      </MenuItem>
                      <MenuItem>
                        <Iconify icon="mdi:file-document-edit" />
                        Grade Assignment
                      </MenuItem>
                      <MenuItem onClick={dialog.onTrue}>
                        <Iconify icon="mdi:comment-text" />
                        Provide Feedback
                      </MenuItem>
                    </MenuList>
                  )}
                />
              );
            },
          },
        ]}
        data={dummyData}
      />
      <CustomDialog title="Grade" open={dialog.value} handleClose={dialog.onFalse}>
        <Box>
          <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '500px' }}>
            <Box display="flex" flexDirection="column" gap={2}>
              <TextField label="Assignment Title" fullWidth />
              <TextField label="Student Name" fullWidth />
              <TextField label="Write your feedback here" fullWidth multiline rows={4} />

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
                    <Typography variant="body2">Attach Resource</Typography>
                  </Box>
                }
                sx={{
                  py: 2.5,
                  width: '100%',
                  height: 'auto',
                  borderRadius: 1.5,
                }}
              />
            </Box>
          </Scrollbar>
          <DialogActions>
            <Button color="error" variant="outlined" onClick={dialog.onFalse}>
              Cancel
            </Button>
            <Button variant="contained" onClick={dialog.onFalse}>
              Submit
            </Button>
          </DialogActions>
        </Box>
      </CustomDialog>
    </Box>
  );
};

export default StudentSubmission;
