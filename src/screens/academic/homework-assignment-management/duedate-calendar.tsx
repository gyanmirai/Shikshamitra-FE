import type { TabComponentType } from 'src/screens/hr/leave-request';

import React from 'react';
import { DatePicker } from '@mui/x-date-pickers';
import { useBoolean } from 'src/hooks/useBoolean';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/custom-dialog';
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
            <Box display="flex" flexDirection="column" gap={2}>
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
