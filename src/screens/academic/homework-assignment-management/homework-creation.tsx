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

const HomeworkCreation = () => {
  const dialog = useBoolean();
  return (
    <Box>
      <Box display="flex" gap={2} alignItems="center" justifyContent="flex-end">
        <Button variant="contained" onClick={dialog.onTrue}>
          Create New Assignment
        </Button>
      </Box>
      <CustomDialog title="New Assignment" open={dialog.value} handleClose={dialog.onFalse}>
        <Box>
          <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '500px' }}>
            <Box display="flex" flexDirection="column" gap={2}>
              <TextField label="Assignment Title" fullWidth />
              <CustomSelect
                label="Class"
                options={[]}
                value=""
                onChange={() => {}}
                formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
              />
              <CustomSelect
                label="Subject"
                options={[]}
                value=""
                onChange={() => {}}
                formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
              />
              <TextField label="Description" fullWidth multiline rows={4} />

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

              <FormControlLabel
                control={<Checkbox />}
                label="Assign to Multiple Classes"
                sx={{ mt: 1 }}
              />
              <CustomSelect
                label="Use Template"
                options={[
                  { value: 'essays', label: 'Essays' },
                  { value: 'quizzes', label: 'Quizzes' },
                ]}
                value=""
                onChange={() => {}}
                formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
              />
            </Box>
          </Scrollbar>
          <DialogActions>
            <Button color="error" variant="outlined" onClick={dialog.onFalse}>
              Cancel
            </Button>
            <Button variant="contained" onClick={dialog.onFalse}>
              Create
            </Button>
          </DialogActions>
        </Box>
      </CustomDialog>
    </Box>
  );
};

export default HomeworkCreation;
