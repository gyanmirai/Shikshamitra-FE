import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Grid } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';
import { ResponsiveMultiSelect } from 'src/components/responsive-multi-select';

import { ReportForm } from './ReportForm';
import { useLibraryReportOptions } from '../hooks/useLibraryReportOptions';

export default function StaffWiseBookIssueReport() {
  const { departmentOptions, memberOptions } = useLibraryReportOptions();

  const formik = useFormik({
    initialValues: {
      departments: [] as string[],
      staffMembers: [] as string[],
    },
    validationSchema: Yup.object({}),
    onSubmit: (values) => {
      console.info('Generate Staff-wise Book Issue Report', values);
    },
  });

  const allDepartmentIds = departmentOptions;
  const allStaffIds = memberOptions;

  return (
    <ReportForm onSubmit={formik.handleSubmit}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField error={!!(formik.touched.departments && formik.errors.departments)}>
            <ResponsiveMultiSelect
              label="Select Departments"
              options={[
                { id: 'all', name: 'All' },
                ...departmentOptions.map((d) => ({ id: d, name: d })),
              ]}
              value={formik.values.departments}
              getOptionLabel={(opt) => opt?.name}
              getOptionValue={(opt) => opt?.id}
              onChange={(selectedValues) => {
                const hasAllInSelection = selectedValues.includes('all');
                const wasAllPreviouslySelected = formik.values.departments.includes('all');
                let finalValues: string[] = [];

                if (hasAllInSelection && !wasAllPreviouslySelected) {
                  finalValues = ['all', ...allDepartmentIds];
                } else if (!hasAllInSelection && wasAllPreviouslySelected) {
                  finalValues = [];
                } else if (hasAllInSelection && wasAllPreviouslySelected) {
                  finalValues = selectedValues.filter((id) => id !== 'all');
                } else {
                  const selectedRealIds = selectedValues.filter((id) => id !== 'all');
                  if (
                    selectedRealIds.length === allDepartmentIds.length &&
                    allDepartmentIds.every((id) => selectedRealIds.includes(id))
                  ) {
                    finalValues = ['all', ...allDepartmentIds];
                  } else {
                    finalValues = selectedRealIds;
                  }
                }
                formik.setFieldValue('departments', finalValues);
              }}
              error={!!formik.errors.departments && !!formik.touched.departments}
              helperText={(formik.touched.departments && formik.errors.departments) as string}
            />
          </ShakingTextField>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField error={!!(formik.touched.staffMembers && formik.errors.staffMembers)}>
            <ResponsiveMultiSelect
              label="Select Staff Members"
              options={[
                { id: 'all', name: 'All' },
                ...memberOptions.map((m) => ({ id: m, name: m })),
              ]}
              value={formik.values.staffMembers}
              getOptionLabel={(opt) => opt?.name}
              getOptionValue={(opt) => opt?.id}
              onChange={(selectedValues) => {
                const hasAllInSelection = selectedValues.includes('all');
                const wasAllPreviouslySelected = formik.values.staffMembers.includes('all');
                let finalValues: string[] = [];

                if (hasAllInSelection && !wasAllPreviouslySelected) {
                  finalValues = ['all', ...allStaffIds];
                } else if (!hasAllInSelection && wasAllPreviouslySelected) {
                  finalValues = [];
                } else if (hasAllInSelection && wasAllPreviouslySelected) {
                  finalValues = selectedValues.filter((id) => id !== 'all');
                } else {
                  const selectedRealIds = selectedValues.filter((id) => id !== 'all');
                  if (
                    selectedRealIds.length === allStaffIds.length &&
                    allStaffIds.every((id) => selectedRealIds.includes(id))
                  ) {
                    finalValues = ['all', ...allStaffIds];
                  } else {
                    finalValues = selectedRealIds;
                  }
                }
                formik.setFieldValue('staffMembers', finalValues);
              }}
              error={!!formik.errors.staffMembers && !!formik.touched.staffMembers}
              helperText={(formik.touched.staffMembers && formik.errors.staffMembers) as string}
            />
          </ShakingTextField>
        </Grid>
      </Grid>
    </ReportForm>
  );
}
