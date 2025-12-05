import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { DatePicker } from '@mui/x-date-pickers';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import { useSelector, useDispatch } from 'react-redux';
import CustomSelect from 'src/components/custom-select';
import { Iconify } from 'src/components/iconify/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import React, { useMemo, useState, useEffect } from 'react';
import ShakingTextField from 'src/components/shaking-text-field';
import { useLazyGetFilterStudentsQuery } from 'src/redux/student';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import BonofiedCertificateTemplate1 from 'src/templates/student-certificates/bonofied-certificate-1';
import {
  Box,
  Grid,
  Chip,
  Button,
  TextField,
  Typography,
  Autocomplete,
  DialogActions,
} from '@mui/material';

const BonofiedCertificate = () => {
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
    <Box sx={{ minHeight: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button
          sx={{ width: '180px' }}
          startIcon={<Iconify icon="mdi:plus" />}
          size="small"
          variant="contained"
          onClick={dialog.onTrue}
          sx={{ px: '32px' }}
        >
          Bonafide
        </Button>
      </Box>
      <CustomizableTable
        tableId="bonofied-certificate"
        noDataText={
          <>
            No Bonofied Certificate Found{' '}
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
              Create Bonafide
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
        maxWidth="md"
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Create Bonafide</Typography>
            <CustomTooltip
              arrow
              placement="right"
              title="This certificate verifies that the student is officially enrolled in the institution and serves as proof of their academic status."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        open={dialog.value}
        handleClose={dialog.onFalse}
      >
        <BonofiedForm onClose={handleClose} />
      </CustomDialog>
    </Box>
  );
};

export default BonofiedCertificate;

const BonofiedForm = ({ onClose }: { onClose: (e: any, isSubmit: boolean) => void }) => {
  // State to store list of organizations
  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);
  // State to store list of classes
  const [allClass, setAllClass] = useState<Standards[]>([]);
  // State to store list of divisions
  const [allDivision, setAllDivision] = useState<Division[]>([]);

  // Get current medium and board from global state
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  // Initialize form with Formik
  const {
    initialValues,
    setFieldTouched,
    values,
    setFieldValue,
    handleSubmit,
    handleChange,
    touched,
    errors,
  } = useFormik({
    // Set initial form values
    initialValues: {
      organization: medium?.educationMediumStages?.[0]?.id || '',
      classes: medium?.educationMediumStages?.[0]?.standards?.[0]?.id || '',
      division: medium?.educationMediumStages?.[0]?.standards?.[0]?.divisions?.[0]?.id || '',
      grNo: '',
      creationDate: dayjs(),
      reason: '',
      student: [],
    },
    validationSchema: Yup.object().shape({
      organization: Yup.string().required('Organization is required'),
      classes: Yup.string().required('Class is required'),
      division: Yup.string().required('Division is required'),
      creationDate: Yup.mixed().nullable().required('Creation date is required'),
      reason: Yup.string().required('Reason is required'),
      student: Yup.array()
        .nullable()
        .min(1, 'At least one student must be selected')
        .required('Student selection is required'),
    }),
    onSubmit: (val: any) => {
      shikshaMitraToast.success({
        message: `Bonafide certificate created for ${val.student?.length} students`,
      });
      onClose(null, true);
    },
  });

  // Destructure form values for organization, classes and division
  // These are used to track selected values and trigger dependent dropdowns
  const { organization, classes, division } = values;
  // Update organizations list when medium changes
  useEffect(() => {
    setAllOrganization(medium?.educationMediumStages || []);
  }, [medium, setFieldValue]);

  // Update classes list when organization changes
  useEffect(() => {
    setAllClass(allOrganization.find((org: any) => org?.id === organization)?.standards || []);
  }, [organization, allOrganization, setFieldValue]);

  // Update divisions list when class changes
  useEffect(() => {
    setAllDivision(allClass.find((org: any) => org?.id === classes)?.divisions || []);
  }, [allClass, classes, setFieldValue]);

  // Initialize query hook for fetching students
  const [getStudents, { data: StudentsData, isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetFilterStudentsQuery,
  });

  // Fetch students when division, class and organization are all selected
  useEffect(() => {
    if (division && classes && organization) {
      getStudents({
        educationMediumStageId: organization,
        standardId: classes,
        divisionId: division,
      });
    }
  }, [division, classes, organization, getStudents]);

  // Transform student data to include full name
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
      <DialogScrollContent>
        <Scrollbar sx={{ p: 2 }}>
          <Box display="flex" justifyContent="flex-end" mb={2}>
            <Button
              variant="contained"
              size="small"
              type="submit"
              onClick={(e: any) => handleSubmit(e)}
              startIcon={<Iconify icon={GlobalIcons.submit} />}
            >
              Generate
            </Button>
          </Box>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <ShakingTextField error={!!(touched.organization && errors.organization)}>
                <CustomSelect
                  options={allOrganization}
                  label="Organization *"
                  value={organization}
                  onChange={(val) => {
                    const selectedOrg = allOrganization.find((org: any) => org?.id === val);
                    const selectedClass = selectedOrg?.standards?.[0];
                    const selectedDivision = selectedClass?.divisions?.[0];

                    setFieldValue('organization', val as string);
                    setFieldValue('classes', selectedClass?.id || '');
                    setFieldTouched('classes', false);
                    setFieldValue('division', selectedDivision?.id || '');
                    setFieldTouched('division', false);
                  }}
                  labelKey="name"
                  valueKey="id"
                  formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                  error={!!(touched.organization && errors.organization)}
                  helperText={(touched.organization && errors.organization) as string}
                  disabled={!medium}
                />
              </ShakingTextField>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <ShakingTextField error={!!(touched.classes && errors.classes)}>
                <CustomSelect
                  options={allClass}
                  label="Class *"
                  value={classes}
                  onChange={(val) => {
                    const selectedClass = allClass.find((cls: any) => cls.id === val);
                    const firstDivision = selectedClass?.divisions?.[0];
                    setFieldValue('classes', val as string);
                    setFieldValue('division', firstDivision?.id || '');
                    setFieldTouched('division', false);
                  }}
                  labelKey="name"
                  valueKey="id"
                  formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                  disabled={!organization}
                  error={!!(touched.classes && errors.classes)}
                  helperText={(touched.classes && errors.classes) as string}
                />
              </ShakingTextField>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <ShakingTextField error={!!(touched.division && errors.division)}>
                <CustomSelect
                  options={allDivision}
                  label="Division *"
                  value={division}
                  onChange={(val) => setFieldValue('division', val as string)}
                  labelKey="name"
                  valueKey="id"
                  formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset', width: '100%' } }}
                  disabled={!classes}
                  error={!!(touched.division && errors.division)}
                  helperText={(touched.division && errors.division) as string}
                />
              </ShakingTextField>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <ShakingTextField error={!!(touched.student && errors.student)}>
                <Autocomplete
                  loading={isLoading}
                  noOptionsText="No Student Found"
                  multiple
                  fullWidth
                  value={values.student}
                  onChange={(e, value: any) => setFieldValue('student', value)}
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

            <Grid size={{ xs: 12, md: 6 }}>
              <ShakingTextField error={!!(touched.creationDate && errors.creationDate)}>
                <DatePicker
                  label="Creation Date *"
                  value={values.creationDate}
                  disabled
                  onChange={(newValue) => setFieldValue('creationDate', newValue)}
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

            <Grid size={{ xs: 12, md: 6 }}>
              <ShakingTextField error={!!(touched.reason && errors.reason)}>
                <TextField
                  size="small"
                  value={values.reason}
                  onChange={handleChange}
                  name="reason"
                  label="Reason *"
                  fullWidth
                  error={!!(touched.reason && errors.reason)}
                  helperText={(touched.reason && errors.reason) as string}
                />
              </ShakingTextField>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <BonofiedCertificateTemplate1 />
            </Grid>
          </Grid>
        </Scrollbar>
      </DialogScrollContent>
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
          onClick={(e: any) => {
            handleSubmit(e);
          }}
        >
          Submit
        </Button>
      </DialogActions>
    </BackPopUpChecked>
  );
};
