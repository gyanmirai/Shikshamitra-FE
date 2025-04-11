'use client';

import React, { useState } from 'react';

import { Box, Grid, Button, DialogActions } from '@mui/material';

import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';

interface AssignRoomProps {
  selectedRoom: string;
  slotData: any;
  onRoomSelect: (value: string) => void;
}

const AssignRoom: React.FC<AssignRoomProps> = ({ selectedRoom, slotData, onRoomSelect }) => {
  const [room, setRoom] = useState<string>(selectedRoom || '');
  console.log('selectedRoom', room);

  const handleSubmit = () => {
    onRoomSelect(room);
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <form onSubmit={handleSubmit}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '100px' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomSelect
                label="Room"
                name="room"
                options={[
                  { id: 'A101', name: 'A101' },
                  { id: 'A102', name: 'A102' },
                  { id: 'B101', name: 'B101' },
                ]}
                labelKey="name"
                valueKey="id"
                value={room}
                onChange={(value) => {
                  setRoom(value as string);
                }}
                // disabled={!formik.values.subject}
                // error={formik.touched.teacher && Boolean(formik.errors.teacher)}
                // helperText={formik.touched.teacher && formik.errors.teacher}
                formControlProps={{ fullWidth: true }}
              />
            </Grid>
          </Grid>
        </Scrollbar>
        <DialogActions>
          <Button onClick={handleSubmit} variant="contained">
            Save
          </Button>
        </DialogActions>
      </form>
    </Box>
  );
};

export default AssignRoom;
