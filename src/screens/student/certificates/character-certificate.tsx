import type { RootState } from 'src/redux/store';
import type { Medium, Division, Standards, Organization } from 'src/types/school';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useSelector, useDispatch } from 'react-redux';
import React, { useMemo, useState, useEffect } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import {
  Box,
  Chip,
  Button,
  TextField,
  Typography,
  Autocomplete,
  DialogActions,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { GlobalIcons } from 'src/utils/icons';

import { useLazyGetFilterStudentsQuery } from 'src/redux/student';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import CustomTooltip from 'src/components/custom-tooltip';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

const CharacterCertificate = () => {
  const dialog = useBoolean();
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();

  const handleClose = (_e: any, isSubmit?: boolean) => {
    const resetState = () => {
      setTimeout(() => {
        dispatch(setIsChanges(false));
      }, 200); // Adjust timing based on dialog close animation
    };

    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      dialog.onFalse();
      resetState();
    } else if (!isChanges) {
      dialog.onFalse();
      setTimeout(() => {
        // setSelectedSubject(null);
      }, 200);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button
          sx={{ width: '180px' }}
          startIcon={<Iconify icon="mdi:plus" />}
          size="small"
          variant="contained"
          onClick={dialog.onTrue}
        >
          Character
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
        columns={[
          { id: 'medium', label: 'Medium' },
          { id: 'organization', label: 'Organization' },
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
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Create Character Certificate</Typography>
            <CustomTooltip
              arrow
              placement="right"
              title="This certificate attests to the student's conduct and behavior during their time at the institution."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        open={dialog.value}
        handleClose={dialog.onFalse}
      >
        <CharacterForm onClose={handleClose} />
      </CustomDialog>
    </Box>
  );
};

export default CharacterCertificate;

const CharacterForm = ({ onClose }: { onClose: (e: any, isSubmit: boolean) => void }) => {
  const [allMediums, setAllMediums] = useState<Medium[]>([]);
  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  const {
    currentBoard,
    currentMedium: medium,
    setCurrentMedium: setMedium,
  } = useSelector((state: RootState) => state.globalState);
  const [getStudents, { data: StudentsData, isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetFilterStudentsQuery,
  });

  const { errors, touched, initialValues, values, setFieldValue, handleSubmit, handleChange } =
    useFormik({
      initialValues: {
        medium: '',
        organization: medium?.educationMediumStages?.[0]?.id || '',
        classes: medium?.educationMediumStages?.[0]?.standards?.[0]?.id || '',
        division: medium?.educationMediumStages?.[0]?.standards?.[0]?.divisions?.[0]?.id || '',
        grNo: '',
        creationDate: null,
        reason: '',
      },
      validationSchema: Yup.object().shape({
        organization: Yup.string().required('Organization is required'),
        classes: Yup.string().required('Class is required'),
        division: Yup.string().required('Division is required'),
        creationDate: Yup.date().required('Creation date is required'),
        reason: Yup.string().required('Reason is required'),
      }),
      onSubmit: (val: any) => {
        // submit form logic
        // fresetForm();
      },
    });
  const { division, organization, classes } = values;

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

  useEffect(() => {
    if (division && classes && organization) {
      getStudents({
        educationMediumStageId: organization,
        standardId: classes,
        divisionId: division,
      });
    }
  }, [division, classes, organization, getStudents]);

  const tableData = useMemo(
    () =>
      StudentsData?.items?.map((item: any) => ({
        ...item,
        name: `${item.firstName} ${item.lastName} ${item.middleName}`,
      })) || [],
    [StudentsData?.items]
  );

  return (
    <BackPopUpChecked initialValues={initialValues} currentValues={values}>
      <Box component="form" onSubmit={handleSubmit}>
        <Scrollbar sx={{ p: 2 }}>
          <Grid container spacing={3}>
            <Grid xs={12} md={6}>
              <ShakingTextField error={!!(touched.organization && errors.organization) || false}>
                <CustomSelect
                  options={allOrganization}
                  label="Organization *"
                  value={organization}
                  onChange={(val) => setFieldValue('organization', val as string)}
                  labelKey="name"
                  valueKey="id"
                  error={!!(touched.organization && errors.organization)}
                  helperText={(touched.organization && errors.organization) as string}
                  formControlProps={{
                    fullWidth: true,
                  }}
                  disabled={!medium}
                />
              </ShakingTextField>
            </Grid>
            <Grid xs={12} md={6}>
              <ShakingTextField error={!!(touched.classes && errors.classes) || false}>
                <CustomSelect
                  options={allClass}
                  label="Class *"
                  value={classes}
                  onChange={(val) => setFieldValue('classes', val as string)}
                  labelKey="name"
                  valueKey="id"
                  error={!!(touched.classes && errors.classes)}
                  helperText={(touched.classes && errors.classes) as string}
                  formControlProps={{
                    fullWidth: true,
                  }}
                  disabled={!organization}
                />
              </ShakingTextField>
            </Grid>
            <Grid xs={12} md={6}>
              <ShakingTextField error={!!(touched.division && errors.division) || false}>
                <CustomSelect
                  options={allDivision}
                  label="Division *"
                  value={division}
                  onChange={(val) => setFieldValue('division', val as string)}
                  labelKey="name"
                  valueKey="id"
                  error={!!(touched.division && errors.division)}
                  helperText={(touched.division && errors.division) as string}
                  formControlProps={{
                    fullWidth: true,
                    sx: { maxWidth: 'unset', width: '100%' },
                  }}
                  disabled={!classes}
                />
              </ShakingTextField>
            </Grid>
            <Grid xs={12} md={6}>
              <ShakingTextField error={!!(touched.student && errors.student) || false}>
                <Autocomplete
                  loading={isLoading}
                  noOptionsText="No Student Found"
                  multiple
                  fullWidth
                  value={values.student}
                  onChange={(e, value: any) => {
                    setFieldValue('student', value);
                  }}
                  renderTags={(tagValue, getTagProps) =>
                    tagValue.map((option, index) => (
                      <Chip
                        label={option.name}
                        variant="soft"
                        size="small"
                        {...getTagProps({ index })}
                      />
                    ))
                  }
                  options={tableData}
                  getOptionLabel={(option: any) => option?.name || ''}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      label="Student *"
                      fullWidth
                      error={!!(touched.student && errors.student)}
                      helperText={(touched.student && errors.student) as string}
                    />
                  )}
                  renderOption={(prop: any, option: any) => (
                    <li {...prop} key={option.id}>
                      {option.name}
                    </li>
                  )}
                />
              </ShakingTextField>
            </Grid>
            <Grid xs={12} md={6}>
              <ShakingTextField error={!!(touched.creationDate && errors.creationDate) || false}>
                <DatePicker
                  label="Creation Date *"
                  value={values.creationDate}
                  onChange={(newValue) => {
                    setFieldValue('creationDate', newValue);
                  }}
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                      error: !!(touched.creationDate && errors.creationDate),
                      helperText: (touched.creationDate && errors.creationDate) as string,
                    },
                  }}
                />
              </ShakingTextField>
            </Grid>
            <Grid xs={12} md={6}>
              <ShakingTextField error={!!(touched.reason && errors.reason) || false}>
                <TextField
                  size="small"
                  value={values.reason}
                  onChange={handleChange}
                  name="reason"
                  multiline
                  rows={3}
                  label="Reason *"
                  fullWidth
                  error={!!(touched.reason && errors.reason)}
                  helperText={(touched.reason && errors.reason) as string}
                />
              </ShakingTextField>
            </Grid>
          </Grid>
        </Scrollbar>
        <DialogActions>
          <Button
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
            onClick={() => {
              onClose(null, false);
            }}
            variant="outlined"
            size="small"
          >
            Cancel
          </Button>
          <Button
            startIcon={<Iconify icon={GlobalIcons.submit} />}
            variant="contained"
            type="submit"
            size="small"
          >
            Submit
          </Button>
        </DialogActions>
      </Box>
    </BackPopUpChecked>
  );
};
