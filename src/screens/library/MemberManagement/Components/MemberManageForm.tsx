import React from 'react';
import { useFormik } from 'formik';

import { Grid, Button, DialogActions } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  useGetRoleOptionsQuery,
  useGetClassOptionsQuery,
  useGetStudentOptionsQuery,
  useGetDivisionOptionsQuery,
} from 'src/redux/memberManagement/memberManagementApi';

import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { memberValidationSchema } from './MemberManagementSchema';
import { getInitialMemberData } from './MemberManagementInitialValues';

import type { IMemberPayload, IMemberFormProps } from './type';

const MemberForm: React.FC<IMemberFormProps> = ({ open, onClose }) => {
  const { data: roleOptions, isLoading: roleLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetRoleOptionsQuery,
  });

  const { data: classOptions, isLoading: classLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassOptionsQuery,
  });

  const { data: divisionOptions, isLoading: divisionLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetDivisionOptionsQuery,
  });

  const { data: studentOptions, isLoading: studentLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStudentOptionsQuery,
  });

  const formik = useFormik<IMemberPayload>({
    initialValues: getInitialMemberData(),
    validationSchema: memberValidationSchema,
    validateOnChange: true,
    onSubmit: (values) => {
      shikshaMitraToast.success({ message: `Member "${values.student}" added successfully` });
      onClose(null, true);
    },
  });

  const isLoading = roleLoading || classLoading || divisionLoading || studentLoading;

  return isLoading ? (
    'loading.. ...'
  ) : (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={2}>
          {/* Role */}
          <Grid item xs={6} md={6}>
            <ShakingTextField error={!!(formik.touched.role && formik.errors.role)}>
              <CustomSelect
                label="Role *"
                name="role"
                options={roleOptions || []}
                value={formik.values.role}
                onChange={(value) => formik.setFieldValue('role', value)}
                error={!!(formik.touched.role && formik.errors.role)}
                helperText={(formik.touched.role && formik.errors.role) as string}
                formControlProps={{ fullWidth: true }}
              />
            </ShakingTextField>
          </Grid>

          {/* Class */}
          <Grid item xs={6} md={6}>
            <ShakingTextField error={!!(formik.touched.class && formik.errors.class)}>
              <CustomSelect
                label="Class *"
                name="class"
                options={classOptions || []}
                value={formik.values.class}
                onChange={(value) => formik.setFieldValue('class', value)}
                error={!!(formik.touched.class && formik.errors.class)}
                helperText={(formik.touched.class && formik.errors.class) as string}
                formControlProps={{ fullWidth: true }}
              />
            </ShakingTextField>
          </Grid>

          {/* Division */}
          <Grid item xs={6} md={6}>
            <ShakingTextField error={!!(formik.touched.division && formik.errors.division)}>
              <CustomSelect
                label="Division *"
                name="division"
                options={divisionOptions || []}
                value={formik.values.division}
                onChange={(value) => formik.setFieldValue('division', value)}
                error={!!(formik.touched.division && formik.errors.division)}
                helperText={(formik.touched.division && formik.errors.division) as string}
                formControlProps={{ fullWidth: true }}
              />
            </ShakingTextField>
          </Grid>

          {/* Student */}
          <Grid item xs={12}>
            <ShakingTextField error={!!(formik.touched.student && formik.errors.student)}>
              <CustomSelect
                label="Student *"
                name="student"
                options={studentOptions || []}
                value={formik.values.student}
                onChange={(value) => formik.setFieldValue('student', value)}
                error={!!(formik.touched.student && formik.errors.student)}
                helperText={(formik.touched.student && formik.errors.student) as string}
                formControlProps={{ fullWidth: true }}
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
