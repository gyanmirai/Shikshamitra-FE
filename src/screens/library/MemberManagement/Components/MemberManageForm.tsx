import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { useGetRolesQuery } from 'src/redux/role/roleApi';
import React, { useMemo, useState, useEffect } from 'react';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import { useLazyGetFilterStudentsQuery } from 'src/redux/student';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { Grid, Chip, Button, TextField, Autocomplete, DialogActions } from '@mui/material';

import { memberValidationSchema } from './MemberManagementSchema';
import { getInitialMemberData } from './MemberManagementInitialValues';

import type { IMemberPayload, IMemberFormProps } from './type';

const MemberForm: React.FC<IMemberFormProps> = ({ open, onClose }) => {
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [classes, setClasses] = useState<string>('');
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  const [division, setDivision] = useState<string>('');

  // Roles API
  const { data, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetRolesQuery,
  });

  // Students API
  const [getStudents, { data: StudentsData }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetFilterStudentsQuery,
  });

  // Formik setup
  const formik = useFormik<IMemberPayload>({
    initialValues: getInitialMemberData(),
    validationSchema: memberValidationSchema,
    validateOnChange: true,
    onSubmit: (values) => {
      shikshaMitraToast.success({ message: `Member "${values.member}" added successfully` });
      onClose(null, true);
    },
  });

  useEffect(() => {
    setAllOrganization(medium?.educationMediumStages || []);
  }, [medium?.educationMediumStages]);

  useEffect(() => {
    // Flatten the list of standards from all stages
    const allClasses =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];
    setAllClass(allClasses);
    setClasses(allClasses[0]?.id || '');
  }, [medium]);

  useEffect(() => {
    setAllDivision(allClass.find((org: any) => org?.id === formik.values.class)?.divisions || []);
    setDivision(
      allClass.find((org: any) => org?.id === formik.values.class)?.divisions?.[0]?.id || ''
    );
  }, [allClass, formik.values.class, setDivision]);

  useEffect(() => {
    if (division && formik.values.class) {
      getStudents({
        educationMediumStageId: allOrganization[1]?.id,
        standardId: formik.values.class,
        divisionId: division,
      });
    }
  }, [division, formik.values.class, getStudents, allOrganization]);

  // Transform student data to include full name
  const tableData = useMemo(
    () =>
      StudentsData?.items?.map((item: any) => ({
        ...item,
        name: `${item.firstName} ${item.lastName} ${item.middleName}`,
      })) || [],
    [StudentsData?.items]
  );

  return isLoading ? (
    'loading...'
  ) : (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={2}>
          {/* Role */}
          <Grid size={{ xs: 12, md: 6 }}>
            <ShakingTextField error={formik.touched.role && Boolean(formik.errors.role)}>
              <Autocomplete
                disabled={isLoading}
                options={data?.items || []}
                value={data?.items?.find((item: any) => item.name === formik.values.role) || null}
                getOptionLabel={(option: any) => option?.name || ''}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Role *"
                    size="small"
                    fullWidth
                    sx={{ width: '100%', minWidth: '200px' }}
                    error={formik.touched.role && Boolean(formik.errors.role)}
                    helperText={(formik.touched.role && formik.errors.role) as string}
                  />
                )}
                onChange={(e, value) => {
                  formik.setFieldValue('role', value?.name || '');
                }}
              />
            </ShakingTextField>
          </Grid>

          {formik.values.role === 'Student' && (
            <>
              {/* Class */}
              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField error={!!(formik.touched.class && formik.errors.class)}>
                  <CustomSelect
                    label="Class *"
                    options={allClass}
                    value={formik.values.class}
                    onChange={(val) => {
                      formik.setFieldValue('class', val);
                      formik.setFieldValue('division', '');
                      formik.setFieldValue('member', '');
                      formik.setFieldTouched('class', false);
                    }}
                    labelKey="name"
                    valueKey="id"
                    formControlProps={{ fullWidth: true }}
                    error={!!(formik.touched.class && formik.errors.class)}
                    helperText={(formik.touched.class && formik.errors.class) as string}
                  />
                </ShakingTextField>
              </Grid>

              {/* Division */}
              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField error={!!(formik.touched.division && formik.errors.division)}>
                  <CustomSelect
                    label="Division *"
                    options={allDivision}
                    disabled={!formik.values.class}
                    value={formik.values.division}
                    onChange={(val) => {
                      formik.setFieldValue('division', val);
                      formik.setFieldValue('member', '');
                      formik.setFieldTouched('division', false);
                    }}
                    labelKey="name"
                    valueKey="id"
                    formControlProps={{ fullWidth: true }}
                    error={!!(formik.touched.division && formik.errors.division)}
                    helperText={(formik.touched.division && formik.errors.division) as string}
                  />
                </ShakingTextField>
              </Grid>
            </>
          )}

          {/* Member Dropdown */}
          <Grid size={{ xs: 12, md: 6 }}>
            <ShakingTextField error={!!(formik.touched.student && formik.errors.student)}>
              <Autocomplete
                loading={isLoading}
                disabled={!formik.values.role}
                noOptionsText="No Member Found"
                fullWidth
                value={
                  (formik.values.role === 'Student'
                    ? tableData.find((s: any) => s.id === formik.values.student)
                    : [
                        { id: '1', name: 'Prerna Atre' },
                        { id: '2', name: 'Raj Baku' },
                        { id: '3', name: 'Dharmik Jinjala' },
                      ].find((s: any) => s.id === formik.values.student)) || null
                }
                onChange={(e, value: any) => {
                  formik.setFieldValue('student', value?.id || '');
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
                options={
                  formik.values.role === 'Student'
                    ? tableData
                    : [
                        { id: '1', name: 'Prerna Atre' },
                        { id: '2', name: 'Raj Baku' },
                        { id: '3', name: 'Dharmik Jinjala' },
                      ]
                }
                getOptionLabel={(option: any) => option?.name || ''}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    label="Member *"
                    fullWidth
                    error={!!(formik.touched.student && formik.errors.student)}
                    helperText={(formik.touched.student && formik.errors.student) as string}
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
        </Grid>
      </DialogScrollContent>

      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={() => onClose(null, false)}
          variant="outlined"
          size="small"
        >
          Cancel
        </Button>
        <Button
          startIcon={<Iconify icon={GlobalIcons.submit} width={20} height={20} />}
          type="submit"
          variant="contained"
          size="small"
          onClick={(e: any) => formik.handleSubmit(e)}
        >
          Submit
        </Button>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default MemberForm;
