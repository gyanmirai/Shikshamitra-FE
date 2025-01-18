import { useFormik } from 'formik';
import React, { useState } from 'react';

import { Add } from '@mui/icons-material';
import { MobileTimePicker } from '@mui/x-date-pickers';
import { Box, Stack, Button, DialogActions } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

const EntranceExamSlots = () => {
  const dialog = useBoolean();

  const [editData, setEditData] = useState(null);

  const handleClose = () => {
    dialog.onFalse();
    setEditData(null);
  };
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
        <Button variant="contained" startIcon={<Add />} onClick={dialog.onTrue}>
          Slot
        </Button>
      </Box>
      <CustomizableTable
        tableId="entrance-exam-slots"
        columns={[
          { label: 'Start Time', id: 'startTime' },
          { label: 'End Time', id: 'endTime' },
          {
            label: 'Action',
            id: 'action',
            render(value, row) {
              return (
                <ThreeDotsActions
                  showDeleteIcon
                  showEditIcon
                  showThreeDots={false}
                  handleDeleteClick={() => {
                    setEditData(row as any);
                  }}
                  handleEditClick={() => {
                    dialog.onTrue();
                    setEditData(row as any);
                  }}
                />
              );
            },
          },
        ]}
        data={[]}
      />

      <CustomDialog title="Slots" open={dialog.value} handleClose={handleClose}>
        <SlotsForm handleClose={handleClose} />
      </CustomDialog>
    </Box>
  );
};

export default EntranceExamSlots;

const SlotsForm = ({ handleClose }: { handleClose?: () => void }) => {
  const formik = useFormik({
    initialValues: {
      startTime: null,
      endTime: null,
    },
    onSubmit(values, formikHelpers) {},
  });
  return (
    <Box component="form" onSubmit={formik.handleSubmit}>
      <Scrollbar sx={{ bgcolor: 'background.neutral', p: 2 }}>
        <Stack spacing={2}>
          <MobileTimePicker
            label="Start Time"
            value={formik.values.startTime}
            onChange={(date) => formik.setFieldValue('startTime', date)}
            slotProps={{ textField: { size: 'small', fullWidth: true } }}
          />
          <MobileTimePicker
            label="End Time"
            value={formik.values.endTime}
            onChange={(date) => formik.setFieldValue('endTime', date)}
            slotProps={{ textField: { size: 'small', fullWidth: true } }}
          />
        </Stack>
      </Scrollbar>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button type="submit" variant="contained">
          Save
        </Button>
      </DialogActions>
    </Box>
  );
};
