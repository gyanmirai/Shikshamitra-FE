import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Grid } from '@mui/material';
import React, { useState, useEffect } from 'react';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';

import { ReportForm } from './ReportForm';
import { useReportOptions } from '../hooks/useReportOptions';

export default function StudentAttendanceRegisterSmall() {
  const { organizations } = useReportOptions();
  const [allClass, setAllClass] = useState<any[]>([]);
  const [allDivision, setAllDivision] = useState<any[]>([]);

  const formik = useFormik({
    initialValues: {
      organization: '',
      classes: [],
      divisions: [],
    },
    validationSchema: Yup.object({
      organization: Yup.string().required('Organization is required'),
      classes: Yup.array().min(1, 'At least one class is required'),
      divisions: Yup.array().min(1, 'At least one division is required'),
    }),
    onSubmit: (values) => {
      console.info('Generate Student Attendance Register (Small) Report', values);
    },
  });

  useEffect(() => {
    const standards =
      organizations.find((org: any) => org?.id === formik.values.organization)?.standards || [];

    if (!standards.some((std: any) => std.id === 'all')) {
      standards.unshift({ id: 'all', name: 'All', divisions: [] });
    }
    setAllClass(standards);
  }, [organizations, formik.values.organization]);

  useEffect(() => {
    if (formik.values.classes.length === 0) {
      setAllDivision([]);
      formik.setFieldValue('divisions', []);
      return;
    }

    if (formik.values.classes.length === 1 && formik.values.classes[0] !== 'all') {
      const selectedClass = allClass.find((cls: any) => cls?.id === formik.values.classes[0]);
      const divisions = selectedClass?.divisions || [];
      setAllDivision(divisions);
      const divisionIds = divisions.map((div: any) => div.id);
      formik.setFieldValue('divisions', [...divisionIds]);
    } else {
      setAllDivision([{ id: 'all', name: 'All' }]);
      formik.setFieldValue('divisions', ['all']);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allClass, formik.values.classes]);

  return (
    <ReportForm onSubmit={formik.handleSubmit}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <ShakingTextField error={!!(formik.touched.organization && formik.errors.organization)}>
            <CustomSelect
              options={organizations}
              label="Organization *"
              value={formik.values.organization}
              onChange={(val) => {
                formik.setFieldValue('organization', val);
                const standards =
                  organizations.find((org: any) => org?.id === val)?.standards || [];
                const standardIds = standards.map((standard: any) => standard.id);
                formik.setFieldValue('classes', [
                  'all',
                  ...standardIds.filter((id: string) => id !== 'all'),
                ]);
              }}
              labelKey="name"
              valueKey="id"
              formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
              onBlur={() => formik.setFieldTouched('organization', true)}
              error={formik.touched.organization && Boolean(formik.errors.organization)}
              helperText={(formik.touched.organization && formik.errors.organization) as string}
            />
          </ShakingTextField>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <ShakingTextField error={!!(formik.touched.classes && formik.errors.classes)}>
            <CustomSelect
              options={allClass}
              label="Class *"
              multiple
              value={formik.values.classes}
              onChange={(val) => formik.setFieldValue('classes', val)}
              labelKey="name"
              valueKey="id"
              formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
              disabled={!formik.values.organization}
              onBlur={() => formik.setFieldTouched('classes', true)}
              error={formik.touched.classes && Boolean(formik.errors.classes)}
              helperText={(formik.touched.classes && formik.errors.classes) as string}
            />
          </ShakingTextField>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <ShakingTextField error={!!(formik.touched.divisions && formik.errors.divisions)}>
            <CustomSelect
              options={allDivision}
              label="Division *"
              multiple
              value={formik.values.divisions}
              onChange={(val) => formik.setFieldValue('divisions', val)}
              labelKey="name"
              valueKey="id"
              formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
              disabled={formik.values.classes.length === 0}
              onBlur={() => formik.setFieldTouched('divisions', true)}
              error={formik.touched.divisions && Boolean(formik.errors.divisions)}
              helperText={(formik.touched.divisions && formik.errors.divisions) as string}
            />
          </ShakingTextField>
        </Grid>
      </Grid>
    </ReportForm>
  );
}
