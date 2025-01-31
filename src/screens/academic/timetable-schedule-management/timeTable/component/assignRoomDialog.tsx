'use client';

import React, { useState } from 'react';

import { Box, Grid, Button, DialogActions } from '@mui/material';

import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';

interface AssignRoomProps {
  slotData: any;
  onRoomSelect: (value: string) => void;
}

const AssignRoom: React.FC<AssignRoomProps> = ({ slotData, onRoomSelect }) => {
  const [selectedRoom, setSelectedRoom] = useState(slotData?.room || '');
  const handleSubmit = () => {
    onRoomSelect(selectedRoom);
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <form onSubmit={handleSubmit}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '150px' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomSelect
                label="Room"
                name="teacher"
                options={[
                  { id: 'A101', name: 'A101' },
                  { id: 'A102', name: 'A102' },
                  { id: 'B101', name: 'B101' },
                ]}
                labelKey="name"
                valueKey="id"
                value={selectedRoom}
                onChange={(value) => {
                  setSelectedRoom(value);
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
