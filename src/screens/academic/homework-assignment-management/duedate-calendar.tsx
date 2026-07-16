import type { TabComponentType } from 'src/screens/hr/leave-request';

import React from 'react';
import { AcademicDatePicker as DatePicker } from 'src/components/academic-date-picker';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import { CalendarView } from 'src/sections/calendar/view';
import { Box, Button, TextField, DialogActions } from '@mui/material';

const DueDateCalendar = (props: TabComponentType) => {
  const dialog = useBoolean();
  return (
    <Box>
      <CalendarView />
      <CustomDialog title="New Assignment" open={dialog.value} handleClose={dialog.onFalse}>
        <Box>
          <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral' }}>
            <Box display="flex" flexDirection="column" gap={1}>
              <TextField label="Assignment Title" fullWidth />

              <TextField label="Description" fullWidth multiline rows={4} />

              <DatePicker
                label="Due Date"
                slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                format="DD-MM-YYYY"
              />

              <CustomSelect
                label="Subject Selection"
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

export default DueDateCalendar;
