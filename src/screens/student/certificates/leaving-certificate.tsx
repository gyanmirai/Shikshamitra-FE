import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';
import type { Division, Standards, Organization } from 'src/types/school';

import dayjs from 'dayjs';
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

const LeavingCertificate = () => {
  const dialog = useBoolean();
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();
  const [query, setQuery] = useState({
    sorting: '',
    skipCount: 0,
    maxResultCount: 10,
  });
  // const {
  //   // currentBoard,
  //   // currentMedium: medium,
  //   // setCurrentMedium: setMedium,
  // } = useSelector((state: RootState) => state.globalState);
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
    ],
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
          Leaving Certificate
        </Button>
      </Box>
      <CustomizableTable
        tableId="leaving-certificate"
        noDataText={
          <>
            No Leaving Certifacate Data Found{' '}
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
              Create Leaving
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
            <Typography variant="h5">Create Leaving Certificate</Typography>
            <CustomTooltip
              arrow
              placement="right"
              title="This certificate is issued to students upon leaving the institution, confirming their enrollment period and academic details."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        open={dialog.value}
        handleClose={dialog.onFalse}
      >
        <LeavingForm onClose={handleClose} />
      </CustomDialog>
    </Box>
  );
};

export default LeavingCertificate;

const LeavingForm = ({ onClose }: { onClose: (e: any, isSubmit: boolean) => void }) => {
  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);
  const {
    touched,
    setFieldTouched,
    initialValues,
    values,
    errors,
    setFieldValue,
    handleSubmit,
    handleChange,
  } = useFormik({
    initialValues: {
      medium: '',
      organization: medium?.educationMediumStages?.[0]?.id || '',
      classes: medium?.educationMediumStages?.[0]?.standards?.[0]?.id || '',
      division: medium?.educationMediumStages?.[0]?.standards?.[0]?.divisions?.[0]?.id || '',
      grNo: '',
      lcNo: '',
      lcDate: null,
      leftdate: null,
      lcCopy: '',
      behavior: '',
      progress: '',
      lcReason: '',
      remarks: '',
      bookNumber: '',
      feesDetails: '',
      student: [],
    },
    validationSchema: Yup.object().shape({
      organization: Yup.string().required('Organization is required'),
      classes: Yup.string().required('Class is required'),
      division: Yup.string().required('Division is required'),
      student: Yup.array().min(1, 'Please select at least one student'),
      lcNo: Yup.string().required('LC No. is required'),
      lcDate: Yup.mixed().nullable().required('LC Date is required'),
      leftdate: Yup.mixed().nullable().required('Left Date is required'),
      lcCopy: Yup.string().required('LC Copy is required'),
      behavior: Yup.string().required('Behavior is required'),
      progress: Yup.string().required('Progress is required'),
      lcReason: Yup.string().required('LC Reason is required'),
      bookNumber: Yup.string().required('Book Number is required'),
    }),
    onSubmit: (val: any) => {
      shikshaMitraToast.success({
        message: `Leaving certificate created for ${val.student?.length} students`,
      });
      onClose(null, true);
    },
  });
  const { division, organization, classes } = values;
  const [getStudents, { data: StudentsData, isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetFilterStudentsQuery,
  });
  useEffect(() => {
    setAllOrganization(medium?.educationMediumStages || []);
    // setFieldValue('organization', medium?.educationMediumStages?.[0]?.id || '');
  }, [medium, setFieldValue]);

  useEffect(() => {
    setAllClass(allOrganization.find((org: any) => org?.id === organization)?.standards || []);
    // setFieldValue(
    //   'classes',
    //   allOrganization.find((org: any) => org?.id === organization)?.standards?.[0]?.id || ''
    // );
  }, [organization, allOrganization, setFieldValue]);

  useEffect(() => {
    setAllDivision(allClass.find((org: any) => org?.id === classes)?.divisions || []);
    // setFieldValue(
    //   'division',
    //   allClass.find((org: any) => org?.id === classes)?.divisions?.[0]?.id || ''
    // );
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
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  return (
    <BackPopUpChecked initialValues={initialValues} currentValues={values}>
      <DialogScrollContent>
        {/* <Scrollbar sx={{ p: 2 }}> */}
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
          <Grid size={{ xs: 3 }}>
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
                formControlProps={{ fullWidth: true }}
                disabled={!medium}
                error={!!(touched.organization && errors.organization)}
                helperText={(touched.organization && errors.organization) as string}
              />
            </ShakingTextField>
          </Grid>

          <Grid size={{ xs: 3 }}>
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
                }}
                labelKey="name"
                valueKey="id"
                formControlProps={{ fullWidth: true }}
                disabled={!organization}
                error={!!(touched.classes && errors.classes)}
                helperText={(touched.classes && errors.classes) as string}
              />
            </ShakingTextField>
          </Grid>

          <Grid size={{ xs: 3 }}>
            <ShakingTextField error={!!(touched.division && errors.division)}>
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

          <Grid size={{ xs: 3 }}>
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

          {/* Repeat same change for all other fields */}
          <Grid size={{ xs: 3 }}>
            <ShakingTextField error={!!(touched.lcNo && errors.lcNo)}>
              <TextField
                size="small"
                value={values.lcNo}
                onChange={handleChange}
                name="lcNo"
                label="LC No *"
                fullWidth
                error={!!(touched.lcNo && errors.lcNo)}
                helperText={(touched.lcNo && errors.lcNo) as string}
              />
            </ShakingTextField>
          </Grid>

          <Grid size={{ xs: 3 }}>
            <ShakingTextField error={!!(touched.lcDate && errors.lcDate)}>
              <DatePicker
                label="LC Date *"
                value={values.lcDate}
                format="DD-MM-YYYY"
                minDate={dayjs(currentYear?.startDate)}
                maxDate={dayjs(currentYear?.endDate)}
                onChange={(newValue) => setFieldValue('lcDate', newValue)}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    error: !!(touched.lcDate && errors.lcDate),
                    helperText: (touched.lcDate && errors.lcDate) as string,
                  },
                }}
              />
            </ShakingTextField>
          </Grid>

          {/* ... continue same pattern for remaining fields ... */}

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
      {/* </Box> */}
    </BackPopUpChecked>
  );
};
