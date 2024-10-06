import React from 'react';

import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import {
  Box,
  Radio,
  Button,
  Checkbox,
  TextField,
  RadioGroup,
  Typography,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import { UploadBox } from 'src/components/upload';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';

const HomeworkCreation = () => {
  const dialog = useBoolean();
  return (
    <Box>
      <Box display="flex" gap={2} alignItems="center" justifyContent="flex-end">
        <Button variant="contained" onClick={dialog.onTrue}>
          Create New Assignment
        </Button>
      </Box>
      <CustomizableTable
        columns={[
          { id: 'classGrade', label: 'Class/Grade' },
          { id: 'division', label: 'Division' },
          { id: 'assignmentTitle', label: 'Assignment Title' },
          { id: 'subject', label: 'Subject' },
          { id: 'assignmentDesc', label: 'Assignment Description' },
          { id: 'dueDate', label: 'Due Date' },
          { id: 'time', label: 'time' },
          { id: 'submissionType', label: 'Submission Type' },
        ]}
        data={[
          {
            classGrade: 'Math',
            division: 'Jayvion Simon',
            assignmentTitle: '25 Studet Enrolled',
            subject: 'Math',
            assignmentDesc: 'Math Tut',
            dueDate: '10-05-24',
            time: '08:30',
            submissionType: "Online Text"
          },
          {
            classGrade: 'Math',
            division: 'Jayvion Simon',
            assignmentTitle: '25 Studet Enrolled',
            subject: 'Math',
            assignmentDesc: 'Math Tut',
            dueDate: '10-05-24',
            time: '08:30',
            submissionType: "Online Text"
          },
          {
            classGrade: 'Math',
            division: 'Jayvion Simon',
            assignmentTitle: '25 Studet Enrolled',
            subject: 'Math',
            assignmentDesc: 'Math Tut',
            dueDate: '10-05-24',
            time: '08:30',
            submissionType: "Online Text"
          },
          {
            classGrade: 'Math',
            division: 'Jayvion Simon',
            assignmentTitle: '25 Studet Enrolled',
            subject: 'Math',
            assignmentDesc: 'Math Tut',
            dueDate: '10-05-24',
            time: '08:30',
            submissionType: "Online Text"
          },
          {
            classGrade: 'Math',
            division: 'Jayvion Simon',
            assignmentTitle: '25 Studet Enrolled',
            subject: 'Math',
            assignmentDesc: 'Math Tut',
            dueDate: '10-05-24',
            time: '08:30',
            submissionType: "Online Text"
          },
        ]}
      />

      <CustomDialog title="New Assignment" open={dialog.value} handleClose={dialog.onFalse}>
        <Box>
          <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '500px' }}>
            <Box display="flex" flexDirection="column" gap={2}>
              <CustomSelect
                label="Class/Grade"
                options={[]}
                value=""
                onChange={() => { }}
                formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
              />
              <CustomSelect
                label="Division"
                options={[]}
                value=""
                onChange={() => { }}
                formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
              />
              <TextField label="Assignment Title" size="small" />
              <CustomSelect
                label="Subject"
                options={[]}
                value=""
                onChange={() => { }}
                formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
              />
              <TextField label="Assignment Description" fullWidth multiline rows={4} />
              <Button variant="contained" sx={{ maxWidth: '200px', width: '100%' }} onClick={dialog.onFalse}>
                Upload Files
              </Button>
              <UploadBox
                onDrop={() => { }}
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
                    <Typography variant="body2">Upload file</Typography>
                  </Box>
                }
                sx={{
                  py: 2.5,
                  width: '100%',
                  height: 'auto',
                  borderRadius: 1.5,
                }}
              />
              <DatePicker
                label="Due Date"
                slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                format="DD/MM/YYYY"
              />
              <TimePicker
                label="Time Picker"
                slotProps={{ textField: { fullWidth: true, size: 'small' } }}
              />

              <Typography variant="subtitle1">Submission Type</Typography>
              <RadioGroup row>
                <FormControlLabel value="online_text" control={<Radio />} label="Online text" />
                <FormControlLabel value="file_upload" control={<Radio />} label="File upload" />
                <FormControlLabel
                  value="in_person"
                  control={<Radio />}
                  label="In-person submission"
                />
              </RadioGroup>
            </Box>
          </Scrollbar>
          <DialogActions>
            <Button variant="contained" onClick={dialog.onFalse}>
              Save Draft
            </Button>
            <Button variant="contained" onClick={dialog.onFalse}>
              Publish
            </Button>
          </DialogActions>
        </Box>
      </CustomDialog>
    </Box>
  );
};

export default HomeworkCreation;
