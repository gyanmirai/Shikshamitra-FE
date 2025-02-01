'use client';

import React, { useState } from 'react';

import { Box, Grid, Button, DialogActions } from '@mui/material';

import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';

interface AssignTeacherProps {
  slotData: any;
  onTeacherSelect: (value: string) => void;
}

const AssignTeacher = ({ slotData, onTeacherSelect }: AssignTeacherProps) => {
  console.log('slotData----', slotData);

  const [selectedTeacher, setSelectedTeacher] = useState(slotData?.teacher || '');
  const handleSubmit = () => {
    onTeacherSelect(selectedTeacher);
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <form onSubmit={handleSubmit}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '150px' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomSelect
                label="Teacher"
                name="teacher"
                options={[
                  { id: 'Mr. Smith', name: 'Mr. Smith' },
                  { id: 'Ms. Johnson', name: 'Ms. Johnson' },
                  { id: 'Mr. Brown', name: 'Mr. Brown' },
                ]}
                labelKey="name"
                valueKey="id"
                value={selectedTeacher}
                onChange={(value) => {
                  setSelectedTeacher(value);
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

export default AssignTeacher;
