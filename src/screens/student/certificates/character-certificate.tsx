import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';
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
import sortQueryString from 'src/utils/sort-query-string';
import React, { useMemo, useState, useEffect } from 'react';
import { useGetFilterStudentsQuery } from 'src/redux/student';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { useStudentAcademicScope } from 'src/hooks/use-student-academic-scope';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
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

import { StudentAcademicScopeFilters } from '../student-academic-scope-filters';

const CharacterCertificate = () => {
  const dialog = useBoolean();
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();
  const [query, setQuery] = useState({
    sorting: '',
    skipCount: 0,
    maxResultCount: 10,
  });
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

  const columns: IColumn[] = useMemo(
    () => [
      { label: 'Medium', id: 'medium', sticky: true, minWidth: '12vw', align: 'left' },
      { label: 'Organization', id: 'organization' },
      { label: 'Class', id: 'class' },
      { label: 'Division', id: 'division' },
      { label: 'GR.No.', id: 'grNo' },
      { label: 'Student Name', id: 'studentName', align: 'left', minWidth: '180px' },
      {
        label: 'Creation Date',
        id: 'creationDate',
        align: 'left',
        minWidth: '180px',
        filterType: 'date',
      },
      { label: 'Reason', id: 'reason' },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

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
          Character
        </Button>
      </Box>
      <CustomizableTable
        tableTitle="Character Certificate"
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
        columns={columns}
        data={[]}
        serverSide
        onServerSort={(column, sortData) => {
          setQuery((prev) => ({
            ...prev,
            sorting: sortQueryString(sortData),
          }));
        }}
        onServerPagination={(page: number, rowsPerPage: number) => {
          setQuery((prev) => ({
            ...prev,
            skipCount: page * rowsPerPage,
            maxResultCount: rowsPerPage,
          }));
        }}
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
  // State for storing all available mediums (languages of instruction)
  // const [allMediums, setAllMediums] = useState<Medium[]>([]);

  // State for storing all organizations/stages within selected medium
  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);

  // State for storing all classes/standards within selected organization
  const [allClass, setAllClass] = useState<Standards[]>([]);

  // State for storing all divisions within selected class
  const [allDivision, setAllDivision] = useState<Division[]>([]);

  const { currentMedium: medium, currentYear: scopeYear } = useStudentAcademicScope();

  // Initialize form handling with Formik
  const { errors, touched, initialValues, values, setFieldValue, handleSubmit, handleChange } =
    useFormik({
      initialValues: {
        medium: '', // Medium of instruction
        organization: medium?.educationMediumStages?.[0]?.id || '', // Default to first organization
        classes: medium?.educationMediumStages?.[0]?.standards?.[0]?.id || '', // Default to first class
        division: medium?.educationMediumStages?.[0]?.standards?.[0]?.divisions?.[0]?.id || '', // Default to first division
        grNo: '',
        creationDate: null,
        reason: '',
        student: [],
      },
      validationSchema: Yup.object().shape({
        organization: Yup.string().required('Organization is required'),
        classes: Yup.string().required('Class is required'),
        division: Yup.string().required('Division is required'),
        student: Yup.array().min(1, 'Please select at least one student'),

        creationDate: Yup.date().required('Creation date is required'),
        reason: Yup.string().required('Reason is required'),
      }),
      onSubmit: (val: any) => {
        shikshaMitraToast.success({
          message: `Character certificate created for ${val.student?.length} students`,
        });
        onClose(null, true);
      },
    });
  // Destructure form values for division, organization and classes
  // These are used to track selected options and trigger data fetching
  const { division, organization, classes } = values;
  // Update organizations list and set default organization when medium changes
  useEffect(() => {
    setAllOrganization(medium?.educationMediumStages || []);
    setFieldValue('organization', medium?.educationMediumStages?.[0]?.id || '');
  }, [medium, setFieldValue]);

  // Update classes list and set default class when organization changes
  useEffect(() => {
    // Find selected organization and get its standards/classes
    const selectedOrg = allOrganization.find((org: any) => org?.id === organization);
    setAllClass(selectedOrg?.standards || []);

    // Set first class as default
    setFieldValue('classes', selectedOrg?.standards?.[0]?.id || '');
  }, [organization, allOrganization, setFieldValue]);

  // Update divisions list and set default division when class changes
  useEffect(() => {
    // Find selected class and get its divisions
    const selectedClass = allClass.find((org: any) => org?.id === classes);
    setAllDivision(selectedClass?.divisions || []);

    // Set first division as default
    setFieldValue('division', selectedClass?.divisions?.[0]?.id || '');
  }, [allClass, classes, setFieldValue]);

  // Fetch students data when division, class or organization changes
  const validPlacement = Boolean(
    scopeYear?.id &&
    medium?.educationMediumStages?.some(
      (stage) =>
        stage.id === organization &&
        stage.standards?.some(
          (standard) =>
            standard.id === classes && standard.divisions?.some((item) => item.id === division)
        )
    )
  );
  const {
    currentData: StudentsData,
    isFetching: isLoading,
    isError,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetFilterStudentsQuery,
    params: {
      academicYearId: scopeYear?.id,
      academicMediumId: medium?.id,
      educationMediumStageId: organization,
      standardId: classes,
      divisionId: division,
    },
    options: { skip: !validPlacement },
  });

  useEffect(() => {
    setFieldValue('student', []);
  }, [scopeYear?.id, medium?.id, division, validPlacement, isError, setFieldValue]);

  // Transform students data for table display
  const tableData = useMemo(
    () =>
      validPlacement && !isError
        ? StudentsData?.items?.map((item: any) => ({
            ...item,
            // Combine first, last and middle names
            name: `${item.firstName} ${item.lastName} ${item.middleName}`,
          })) || []
        : [],
    [StudentsData?.items, validPlacement, isError]
  );

  return (
    <BackPopUpChecked initialValues={initialValues} currentValues={values}>
      <DialogScrollContent>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <StudentAcademicScopeFilters />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
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

          <Grid size={{ xs: 12, md: 6 }}>
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

          <Grid size={{ xs: 12, md: 6 }}>
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

          <Grid size={{ xs: 12, md: 6 }}>
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

          <Grid size={{ xs: 12, md: 6 }}>
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

          <Grid size={{ xs: 12, md: 6 }}>
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
