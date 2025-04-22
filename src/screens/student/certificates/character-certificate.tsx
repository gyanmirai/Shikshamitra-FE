import type { RootState } from 'src/redux/store';
import type { Medium, Division, Standards, Organization } from 'src/types/school';

import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import React, { useState, useEffect } from 'react';

import { Create } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import {
  Box,
  Button,
  Tooltip,
  TextField,
  Typography,
  Autocomplete,
  DialogActions,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';

const CharacterCertificate = () => {
  const dialog = useBoolean();
  return (
    <Box>
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button startIcon={<Create />} size="small" variant="contained" onClick={dialog.onTrue}>
          Create Character
        </Button>
      </Box>
      <CustomizableTable
        tableId="character-certificate"
        noDataText={
          <>
            No Character Data Found{' '}
            <Box
              onClick={() => {
                dialog.onTrue();
              }}
              color="primary.main"
              fontWeight={600}
              sx={{
                '&:hover': {
                  cursor: 'pointer',
                  color: 'primary.main',
                  textDecoration: 'underline',
                },
              }}
            >
              Create Character
            </Box>
          </>
        }
        searchFieldProps={{
          placeholder: 'Search by Medium, Organization, Class...',
          label: 'Search by Medium, Organization, Class...',
        }}
        columns={[
          { id: 'medium', label: 'Medium' },
          { id: 'organization', label: 'organization' },
          { id: 'class', label: 'Class' },
          { id: 'division', label: 'Division' },
          { id: 'grNo', label: 'GR.No.' },
          { id: 'studentName', label: 'Student Name', align: 'left', minWidth: '180px' },
          {
            id: 'creationDate',
            label: 'Creation Date',
            align: 'left',
            minWidth: '180px',
            filterType: 'date',
          },
          { id: 'reason', label: 'Reason' },
        ]}
        data={[]}
      />
      <CustomDialog
        maxWidth="lg"
        title={
          <Box display="flex" flexDirection="row" gap={2} alignItems="center">
            <Typography variant="h5">Create Character Certificate</Typography>
            <Tooltip
              arrow
              placement="right"
              title="This certificate attests to the student's conduct and behavior during their time at the institution."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </Tooltip>
          </Box>
        }
        open={dialog.value}
        handleClose={dialog.onFalse}
      >
        <CharacterForm />
      </CustomDialog>
    </Box>
  );
};

export default CharacterCertificate;

const CharacterForm = () => {
  const [allMediums, setAllMediums] = useState<Medium[]>([]);
  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [allDivision, setAllDivision] = useState<Division[]>([]);

  const { values, setFieldValue, handleSubmit, handleChange } = useFormik({
    initialValues: {
      medium: '',
      organization: '',
      classes: '',

      grNo: '',
      creationDate: null,
      reason: '',
      division: '',
    },
    onSubmit: (val: any) => {
      // submit form logic
      // fresetForm();
    },
  });
  const { division, organization, classes } = values;
  const {
    currentBoard,
    currentMedium: medium,
    setCurrentMedium: setMedium,
  } = useSelector((state: RootState) => state.globalState);

  useEffect(() => {
    setAllOrganization(medium?.educationMediumStages || []);
    setFieldValue('organization', medium?.educationMediumStages?.[0]?.id || '');
  }, [medium, setFieldValue]);

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
              options={allOrganization}
              label="Organization"
              value={organization}
              onChange={(val) => setFieldValue('organization', val as string)}
              labelKey="name"
              valueKey="id"
              formControlProps={{
                fullWidth: true,
              }}
              disabled={!medium}
            />
          </Grid>
          <Grid xs={3}>
            <CustomSelect
              options={allClass}
              label="Class"
              value={classes}
              onChange={(val) => setFieldValue('classes', val as string)}
              labelKey="name"
              valueKey="id"
              formControlProps={{
                fullWidth: true,
              }}
              disabled={!organization}
            />
          </Grid>
          <Grid xs={3}>
            <CustomSelect
              options={allDivision}
              label="Division"
              value={division}
              onChange={(val) => setFieldValue('division', val as string)}
              labelKey="name"
              valueKey="id"
              formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset', width: '100%' } }}
              disabled={!classes}
            />
          </Grid>
          <Grid xs={3}>
            <Autocomplete
              loading={false}
              noOptionsText="No Student Found"
              fullWidth
              // value={props.formik.values.sponsorStudent}
              // onChange={(e, value: any) => {
              //   props.formik.setFieldValue('sponsorStudent', value);
              // }}
              options={[]}
              getOptionLabel={(option: any) => option?.firstName || ''}
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="small"
                  label="Student"
                  placeholder="Search  Student"
                  fullWidth
                />
              )}
              renderOption={(prop: any, option: any) => (
                <li {...prop} key={option.id}>
                  {option.firstName}
                </li>
              )}
            />
          </Grid>

          {/* <Grid xs={6}>
            <TextField
              size="small"
              value={values.grNo}
              onChange={handleChange}
              name="grNo"
              label="GR No"
              fullWidth
            />
          </Grid> */}
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
          <Grid xs={3}>
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
        </Grid>
      </Scrollbar>
      <DialogActions>
        <Button startIcon={<Create />} variant="contained" type="submit">
          Create
        </Button>
      </DialogActions>
    </Box>
  );
};
