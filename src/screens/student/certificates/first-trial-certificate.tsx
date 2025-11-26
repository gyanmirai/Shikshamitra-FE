import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSelector, useDispatch } from 'react-redux';
import CustomSelect from 'src/components/custom-select';
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

const FirstTrialCertificate = () => {
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
        >
          First Trial
        </Button>
      </Box>
      <CustomizableTable
        tableId="first-trial-certificate"
        noDataText={
          <>
            No First Trial Certificate Data Found{' '}
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
              First Trial
            </Box>
          </>
        }
        columns={[
          { id: 'medium', label: 'Medium' },
          { id: 'organization', label: 'Organization' },
          { id: 'class', label: 'Class' },
          { id: 'division', label: 'Division' },
          { id: 'grNo', label: 'GR.No.', align: 'left', minWidth: '180px' },
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
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Create First Trial</Typography>
            <CustomTooltip
              arrow
              placement="right"
              title="This certificate is issued to students who are appearing for their first attempt at an examination, documenting their eligibility and examination details."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        maxWidth="md"
        open={dialog.value}
        handleClose={dialog.onFalse}
      >
        <FirstTrialForm onClose={handleClose} />
      </CustomDialog>
    </Box>
  );
};

export default FirstTrialCertificate;

const FirstTrialForm = ({ onClose }: { onClose: (e: any, isSubmit: boolean) => void }) => {
  // State for storing organization data
  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);
  // State for storing class data
  const [allClass, setAllClass] = useState<Standards[]>([]);
  // Get current board and medium from global state
  const {
    // currentBoard,
    currentMedium: medium,
    // setCurrentMedium: setMedium,
  } = useSelector((state: RootState) => state.globalState);
  // State for storing division data
  const [allDivision, setAllDivision] = useState<Division[]>([]);

  // Initialize form with Formik
  const {
    initialValues,
    values,
    setFieldValue,
    setFieldTouched,
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
      student: [],
      firstTrialDate: null,
      examYear: null,
      examCenter: '',
      seatNumber: '',
      trial: '',
      remarks: '',
      lastExamName: '',
    },
    // Form validation schema
    validationSchema: Yup.object().shape({
      organization: Yup.string().required('Organization is required'),
      classes: Yup.string().required('Class is required'),
      grNo: Yup.string().required('GR No is required'),
      examYear: Yup.mixed().nullable().required('Exam Year is required'),
      examCenter: Yup.string().required('Exam Center is required'),
      seatNumber: Yup.string()
        .required('Seat Number is required')
        .matches(/^[0-9]+$/, 'Must be only digits'),
      remarks: Yup.string().required('Remarks are required'),
      lastExamName: Yup.string().required('Last Exam Name is required'),
      division: Yup.string().required('Division is required'),
      student: Yup.array()
        .nullable()
        .min(1, 'At least one student must be selected')
        .required('Student selection is required'),
    }),
    onSubmit: (val: any) => {
      shikshaMitraToast.success({
        message: `First Trial certificate created for ${val.student?.length} students`,
      });
      onClose(null, true);
    },
  });

  // Query hook for fetching student data
  const [getStudents, { data: StudentsData, isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetFilterStudentsQuery,
  });

  // Destructure form values
  const { organization, classes, division } = values;

  // Effect to update organizations when medium changes
  useEffect(() => {
    setAllOrganization(medium?.educationMediumStages || []);
  }, [medium, setFieldValue]);

  // Effect to fetch students when filters change
  useEffect(() => {
    if (division && classes && organization) {
      getStudents({
        educationMediumStageId: organization,
        standardId: classes,
        divisionId: division,
      });
    }
  }, [division, classes, organization, getStudents]);

  // Effect to update classes when organization changes
  useEffect(() => {
    setAllClass(allOrganization.find((org: any) => org?.id === organization)?.standards || []);
  }, [organization, allOrganization, setFieldValue]);

  // Effect to update divisions when class changes
  useEffect(() => {
    setAllDivision(allClass.find((org: any) => org?.id === classes)?.divisions || []);
  }, [allClass, classes, setFieldValue]);

  // Memoized table data transformation
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
          <Grid size={{ xs: 12, md: 4 }}>
            <ShakingTextField error={!!(touched.organization && errors.organization) || false}>
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
                formControlProps={{
                  fullWidth: true,
                  sx: { maxWidth: 'unset' },
                }}
                error={!!(touched.organization && errors.organization)}
                helperText={(touched.organization && errors.organization) as string}
                disabled={!medium}
              />
            </ShakingTextField>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <ShakingTextField error={!!(touched.classes && errors.classes) || false}>
              <CustomSelect
                options={allClass}
                label="Class *"
                value={classes}
                onChange={(val) => {
                  const selectedClass = allClass.find((cls: any) => cls.id === val);
                  const firstDivision = selectedClass?.divisions?.[0];

                  setFieldValue('classes', val as string);
                  setFieldValue('division', firstDivision?.id || '');
                }}
                labelKey="name"
                valueKey="id"
                formControlProps={{
                  fullWidth: true,
                  sx: { maxWidth: 'unset' },
                }}
                disabled={!organization}
                error={!!(touched.classes && errors.classes)}
                helperText={(touched.classes && errors.classes) as string}
              />
            </ShakingTextField>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <ShakingTextField error={!!(touched.division && errors.division) || false}>
              <CustomSelect
                options={allDivision}
                label="Division *"
                value={division}
                onChange={(val) => setFieldValue('division', val as string)}
                labelKey="name"
                valueKey="id"
                formControlProps={{
                  fullWidth: true,
                  sx: { maxWidth: 'unset', width: '100%' },
                }}
                disabled={!classes}
                error={!!(touched.division && errors.division)}
                helperText={(touched.division && errors.division) as string}
              />
            </ShakingTextField>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <ShakingTextField error={!!(touched.student && errors.student) || false}>
              <Autocomplete
                loading={isLoading}
                noOptionsText="No Student Found"
                fullWidth
                multiple
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

          <Grid size={{ xs: 12, md: 4 }}>
            <ShakingTextField error={!!(touched.grNo && errors.grNo)}>
              <TextField
                size="small"
                value={values.grNo}
                onChange={handleChange}
                name="grNo"
                label="GR No *"
                fullWidth
                error={!!(touched.grNo && errors.grNo)}
                helperText={(touched.grNo && errors.grNo) as string}
              />
            </ShakingTextField>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <ShakingTextField error={!!(touched.firstTrialDate && errors.firstTrialDate)}>
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
                    error: !!(touched.firstTrialDate && errors.firstTrialDate),
                    helperText: (touched.firstTrialDate && errors.firstTrialDate) as string,
                  },
                }}
              />
            </ShakingTextField>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <ShakingTextField error={!!(touched.examYear && errors.examYear)}>
              <DatePicker
                label="Exam Year *"
                value={values.examYear}
                format="YYYY"
                views={['year']}
                onChange={(newValue) => {
                  setFieldValue('examYear', newValue);
                }}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    error: !!(touched.examYear && errors.examYear),
                    helperText: (touched.examYear && errors.examYear) as string,
                  },
                }}
              />
            </ShakingTextField>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <ShakingTextField error={!!(touched.examCenter && errors.examCenter)}>
              <TextField
                size="small"
                value={values.examCenter}
                onChange={handleChange}
                name="examCenter"
                label="Exam Center *"
                fullWidth
                error={!!(touched.examCenter && errors.examCenter)}
                helperText={(touched.examCenter && errors.examCenter) as string}
              />
            </ShakingTextField>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <ShakingTextField error={!!(touched.seatNumber && errors.seatNumber)}>
              <TextField
                size="small"
                value={values.seatNumber}
                onChange={handleChange}
                name="seatNumber"
                label="Seat Number *"
                fullWidth
                error={!!(touched.seatNumber && errors.seatNumber)}
                helperText={(touched.seatNumber && errors.seatNumber) as string}
              />
            </ShakingTextField>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <ShakingTextField error={!!(touched.triel && errors.triel)}>
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
                  sx: { maxWidth: 'unset' },
                }}
                error={!!(touched.triel && errors.triel)}
                helperText={(touched.triel && errors.triel) as string}
              />
            </ShakingTextField>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <ShakingTextField error={!!(touched.lastExamName && errors.lastExamName)}>
              <TextField
                size="small"
                value={values.lastExamName}
                onChange={handleChange}
                name="lastExamName"
                label="Last Exam Name *"
                fullWidth
                error={!!(touched.lastExamName && errors.lastExamName)}
                helperText={(touched.lastExamName && errors.lastExamName) as string}
              />
            </ShakingTextField>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <ShakingTextField error={!!(touched.remarks && errors.remarks)}>
              <TextField
                size="small"
                value={values.remarks}
                onChange={handleChange}
                name="remarks"
                multiline
                rows={3}
                label="Remarks *"
                fullWidth
                error={!!(touched.remarks && errors.remarks)}
                helperText={(touched.remarks && errors.remarks) as string}
              />
            </ShakingTextField>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <BonofiedCertificateTemplate1 />
          </Grid>
        </Grid>
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
