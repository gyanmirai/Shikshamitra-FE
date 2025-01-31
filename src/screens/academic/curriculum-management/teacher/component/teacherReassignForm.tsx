'use client';

import React from 'react';
import { useFormik } from 'formik';

import { Box, Grid, Button, DialogActions } from '@mui/material';

import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';

import type { TTeacherData } from './teacher';

interface TeacherReassignProps {
  selectedTeacher: TTeacherData | null;
  onSubmit: (values: any) => void;
}

const TeacherReassign: React.FC<TeacherReassignProps> = ({ selectedTeacher, onSubmit }) => {
  const formik = useFormik({
    initialValues: {
      assignedTeacher: selectedTeacher?.assignedTeacher || [],
    },
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <form onSubmit={formik.handleSubmit}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '100px' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomSelect
                label="Assigned Teacher"
                options={[
                  { value: 'John Doe', label: 'John Doe' },
                  { value: 'Jane Smith', label: 'Jane Smith' },
                  { value: 'Robert Johnson', label: 'Robert Johnson' },
                  { value: 'Emily Brown', label: 'Emily Brown' },
                  { value: 'Michael Wilson', label: 'Michael Wilson' },
                ]}
                name="assignedTeacher"
                multiple
                value={formik.values.assignedTeacher}
                formControlProps={{ sx: { minWidth: 180, width: '100%' } }}
                onChange={(val) => {
                  formik.setFieldValue('assignedTeacher', val);
                }}
                error={formik.touched.assignedTeacher}
              />
            </Grid>
          </Grid>
        </Scrollbar>
        <DialogActions>
          <Button type="submit" variant="contained">
            Reassign
          </Button>
        </DialogActions>
      </form>
    </Box>
  );
};

export default TeacherReassign;
