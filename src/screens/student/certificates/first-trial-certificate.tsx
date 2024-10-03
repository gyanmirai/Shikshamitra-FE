import type { RootState } from 'src/redux/store';
import type { Medium, Standards, Organization } from 'src/types/school';

import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import React, { useState, useEffect } from 'react';

import { Create } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import { Box, Button, TextField, DialogActions } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useLazyGetBoardByIdQuery } from 'src/redux/board/boardApi';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';

const FirstTrialCertificate = () => {
  const dialog = useBoolean();
  return (
    <Box>
      <Box display="flex" justifyContent="flex-end">
        <Button startIcon={<Create />} variant="contained" onClick={dialog.onTrue}>
          Create First Trial
        </Button>
      </Box>
      <CustomizableTable
        columns={[
          { id: 'medium', label: 'Medium' },
          { id: 'organization', label: 'organization' },
          { id: 'class', label: 'Class' },
          { id: 'division', label: 'Division' },
          { id: 'grNo', label: 'GR.No.' },
          { id: 'studentName', label: 'Student Name' },

          { id: 'creationDate', label: 'Creation Date' },
          { id: 'reason', label: 'Reason' },
        ]}
        data={[]}
      />
      <CustomDialog title="Create First Trial" open={dialog.value} handleClose={dialog.onFalse}>
        <FirstTrialForm />
      </CustomDialog>
    </Box>
  );
};

export default FirstTrialCertificate;

const FirstTrialForm = () => {
  const [allMediums, setAllMediums] = useState<Medium[]>([]);
  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const { values, setFieldValue, handleSubmit, handleChange } = useFormik({
    initialValues: {
      medium: '',
      organization: '',
      classes: '',
      grNo: '',
      firstTrialDate: null,
      examYear: null,
      examCenter: '',
      seatNumber: '',
      trial: '',
      remarks: '',
      lastExamName: '',
    },
    onSubmit: (val: any) => {
      // submit form logic
      // fresetForm();
    },
  });
  const { medium, organization, classes } = values;
  const { currentBoard } = useSelector((state: RootState) => state.globalState);
  const [getBoard, { data: boardData }] = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useLazyGetBoardByIdQuery,
  });
  useEffect(() => {
    if (currentBoard?.id) {
      if (boardData) {
        setAllMediums(boardData?.educationMediums || []);
        setFieldValue('medium', boardData?.educationMediums?.[0]?.id || '');
      } else {
        getBoard(currentBoard.id);
      }
    } else {
      setAllMediums([]);
      setFieldValue('medium', '');
    }
  }, [boardData, currentBoard.id, setFieldValue, getBoard]);

  useEffect(() => {
    setAllMediums(boardData?.educationMediums || []);
    setFieldValue('medium', boardData?.educationMediums?.[0]?.id || '');
  }, [boardData, setFieldValue]);

  useEffect(() => {
    setAllOrganization(
      allMediums.find((med: any) => med?.id === medium)?.educationMediumStages || []
    );
    setFieldValue(
      'organization',
      allMediums.find((med: any) => med?.id === medium)?.educationMediumStages?.[0]?.id || ''
    );
  }, [medium, allMediums, setFieldValue]);

  useEffect(() => {
    setAllClass(allOrganization.find((org: any) => org?.id === organization)?.standards || []);
    setFieldValue(
      'classes',
      allOrganization.find((org: any) => org?.id === organization)?.standards?.[0]?.id || ''
    );
  }, [organization, allOrganization, setFieldValue]);
  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral' }}>
        <Grid container spacing={2}>
          <Grid xs={6}>
            <CustomSelect
              options={allMediums}
              label="Medium"
              value={medium}
              onChange={(val: string | string[]) => {
                setFieldValue('medium', val as string);
              }}
              labelKey="name"
              valueKey="id"
              formControlProps={{
                fullWidth: true,
              }}
            />
          </Grid>
          <Grid xs={6}>
            <CustomSelect
              options={allOrganization}
              label="Organization"
              value={organization}
              onChange={(val: string | string[]) => setFieldValue('organization', val as string)}
              labelKey="name"
              valueKey="id"
              formControlProps={{
                fullWidth: true,
              }}
              disabled={!medium}
            />
          </Grid>
          <Grid xs={6}>
            <CustomSelect
              options={allClass}
              label="Class"
              value={classes}
              onChange={(val: string | string[]) => setFieldValue('classes', val as string)}
              labelKey="name"
              valueKey="id"
              formControlProps={{
                fullWidth: true,
              }}
              disabled={!organization}
            />
          </Grid>
          <Grid xs={6}>
            <TextField
              size="small"
              value={values.grNo}
              onChange={handleChange}
              name="grNo"
              label="GR No"
              fullWidth
            />
          </Grid>
          <Grid xs={6}>
            <DatePicker
              label="First Trial Date"
              value={values.firstTrialDate}
              format="DD-MM-YYYY"
              onChange={(newValue) => {
                setFieldValue('firstTrialDate', newValue);
              }}
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true,
                },
              }}
            />
          </Grid>
          <Grid xs={6}>
            <DatePicker
              label="Exam Year"
              value={values.examYear}
              format="yyyy"
              views={['year']}
              onChange={(newValue) => {
                setFieldValue('examYear', newValue);
              }}
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true,
                },
              }}
            />
          </Grid>
          <Grid xs={6}>
            <TextField
              size="small"
              value={values.examCenter}
              onChange={handleChange}
              name="examCenter"
              label="Exam Center"
              fullWidth
            />
          </Grid>
          <Grid xs={6}>
            <TextField
              size="small"
              value={values.seatNumber}
              onChange={handleChange}
              name="seatNumber"
              label="Seat Number"
              fullWidth
            />
          </Grid>
          <Grid xs={6}>
            <CustomSelect
              options={[
                { name: 'First Trial', id: 'first' },
                { name: 'Second Trial', id: 'second' },
                { name: 'Third Trial', id: 'third' },
              ]}
              value={values.triel}
              onChange={(val) => setFieldValue('triel', val)}
              name="triel"
              label="Subject"
              labelKey="name"
              valueKey="id"
              formControlProps={{
                fullWidth: true,
              }}
            />
          </Grid>
          <Grid xs={6}>
            <TextField
              size="small"
              value={values.lastExamName}
              onChange={handleChange}
              name="lastExamName"
              label="Last Exam Name"
              fullWidth
            />
          </Grid>
          <Grid xs={12}>
            <TextField
              size="small"
              value={values.remarks}
              onChange={handleChange}
              name="remarks"
              multiline
              rows={3}
              label="remarks"
              fullWidth
            />
          </Grid>
        </Grid>
      </Scrollbar>
      <DialogActions>
        <Button variant="contained" type="submit">
          Create
        </Button>
      </DialogActions>
    </Box>
  );
};
