import type { RootState } from 'src/redux/store';
import type { Medium, Division, Standards, Organization } from 'src/types/school';

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
import BonofiedCertificateTemplate1 from 'src/templates/student-certificates/bonofied-certificate-1';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';

const BonofiedCertificate = () => {
  const dialog = useBoolean();
  return (
    <Box>
      <Box display="flex" justifyContent="flex-end">
        <Button startIcon={<Create />} variant="contained" onClick={dialog.onTrue}>
          Create Bonofied
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
      <CustomDialog
        maxWidth="lg"
        title="Create Bonofied"
        open={dialog.value}
        handleClose={dialog.onFalse}
      >
        <BonofiedForm />
      </CustomDialog>
    </Box>
  );
};

export default BonofiedCertificate;

const BonofiedForm = () => {
  const [allMediums, setAllMediums] = useState<Medium[]>([]);
  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  const { values, setFieldValue, handleSubmit, handleChange } = useFormik({
    initialValues: {
      medium: '',
      organization: '',
      classes: '',
      division: '',
      grNo: '',
      creationDate: null,
      reason: '',
    },
    onSubmit: (val: any) => {
      // submit form logic
      // fresetForm();
    },
  });
  const { medium, organization, classes, division } = values;
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

  useEffect(() => {
    setAllDivision(allClass.find((org: any) => org?.id === classes)?.divisions || []);
    setFieldValue(
      'division',
      allClass.find((org: any) => org?.id === classes)?.divisions?.[0]?.id || ''
    );
  }, [allClass, classes, setFieldValue]);
  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral' }}>
        <Grid container spacing={2}>
          <Grid xs={3}>
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
                sx: {
                  maxWidth: 'unset',
                },
              }}
            />
          </Grid>
          <Grid xs={3}>
            <CustomSelect
              options={allOrganization}
              label="Organization"
              value={organization}
              onChange={(val: string | string[]) => setFieldValue('organization', val as string)}
              labelKey="name"
              valueKey="id"
              formControlProps={{
                fullWidth: true,
                sx: {
                  maxWidth: 'unset',
                },
              }}
              disabled={!medium}
            />
          </Grid>
          <Grid xs={3}>
            <CustomSelect
              options={allClass}
              label="Class"
              value={classes}
              onChange={(val: string | string[]) => setFieldValue('classes', val as string)}
              labelKey="name"
              valueKey="id"
              formControlProps={{
                fullWidth: true,
                sx: {
                  maxWidth: 'unset',
                },
              }}
              disabled={!organization}
            />
          </Grid>
          <Grid xs={3}>
            <CustomSelect
              options={allDivision}
              label="Division"
              value={division}
              onChange={(val: string | string[]) => setFieldValue('division', val as string)}
              labelKey="name"
              valueKey="id"
              formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset', width: '100%' } }}
              disabled={!classes}
            />
          </Grid>
          <Grid xs={3}>
            <TextField
              size="small"
              value={values.grNo}
              onChange={handleChange}
              name="grNo"
              label="GR No"
              fullWidth
            />
          </Grid>
          <Grid xs={3}>
            <DatePicker
              label="Creation Date"
              value={values.creationDate}
              onChange={(newValue) => {
                setFieldValue('creationDate', newValue);
              }}
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true,
                },
              }}
            />
          </Grid>
          <Grid xs={12}>
            <TextField
              size="small"
              value={values.reason}
              onChange={handleChange}
              name="reason"
              multiline
              rows={3}
              label="Reason"
              fullWidth
            />
          </Grid>
          <Grid xs={12}>
            <BonofiedCertificateTemplate1 />
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
