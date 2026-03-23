import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useMemo } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useGetEmployeeQuery } from 'src/redux/hr/employeeApi';
import { EmployeeStatusTypeOptions } from 'src/enums/employee-status-type';
import { Box, Grid, Card, Button, TextField, Autocomplete } from '@mui/material';

// Define the report types
export const REPORT_TYPES = [
  'Employee Profile',
  'Employee List',
  'Joining Letter',
  'Employee Detail',
  'Employee Contact List',
  'Employee All Detail',
  'Relieving Certificate',
  'Increment Certificate',
  'Experience Certificate',
] as const;

export type ReportType = (typeof REPORT_TYPES)[number];

// Define the filter configuration for each report
const REPORT_FILTERS: Record<
  ReportType,
  {
    employee?: 'single' | 'multi';
    department?: 'multi';
    status?: 'multi';
  }
> = {
  'Employee Profile': { employee: 'multi' },
  'Employee List': { department: 'multi', status: 'multi' },
  'Joining Letter': { employee: 'multi' },
  'Employee Detail': { department: 'multi', status: 'multi' },
  'Employee Contact List': { department: 'multi', status: 'multi' },
  'Employee All Detail': { employee: 'multi' },
  'Relieving Certificate': { employee: 'single' },
  'Increment Certificate': { employee: 'single' },
  'Experience Certificate': { employee: 'single' },
};

const ReportFilter = () => {
  const { data: employeeData } = useGetEmployeeQuery({});

  const employees = useMemo(() => employeeData?.items || [], [employeeData]);

  const departmentOptions = useMemo(() => {
    const depts = new Set<string>();
    employees.forEach((emp: any) => {
      if (emp.department) {
        depts.add(emp.department);
      }
    });
    return Array.from(depts).sort();
  }, [employees]);

  const formik = useFormik({
    initialValues: {
      report: null as ReportType | null,
      employees: [] as any[],
      departments: [] as string[],
      statuses: [] as any[],
    },
    validationSchema: Yup.object().shape({
      report: Yup.string().required('Report is required').nullable(),
      employees: Yup.array().when('report', {
        is: (report: ReportType) => report && REPORT_FILTERS[report]?.employee,
        then: (schema) => schema.min(1, 'At least one employee is required'),
        otherwise: (schema) => schema.notRequired(),
      }),
      departments: Yup.array().when('report', {
        is: (report: ReportType) => report && REPORT_FILTERS[report]?.department,
        then: (schema) => schema.min(1, 'At least one department is required'),
        otherwise: (schema) => schema.notRequired(),
      }),
      statuses: Yup.array().when('report', {
        is: (report: ReportType) => report && REPORT_FILTERS[report]?.status,
        then: (schema) => schema.min(1, 'At least one status is required'),
        otherwise: (schema) => schema.notRequired(),
      }),
    }),
    onSubmit: (values) => {
      // Add logic to generate report here
    },
  });

  const { values, setFieldValue, errors, touched, handleSubmit } = formik;
  const selectedReport = values.report;

  const handleReportChange = (event: any, newValue: ReportType | null) => {
    setFieldValue('report', newValue);
    // Reset filters when report changes
    setFieldValue('employees', []);
    setFieldValue('departments', []);
    setFieldValue('statuses', []);
  };

  const renderFilters = () => {
    if (!selectedReport) return null;

    const config = REPORT_FILTERS[selectedReport];
    const filters = [];

    if (config.employee) {
      filters.push(
        <Grid size={{ xs: 12, md: 4 }} key="employee">
          <Autocomplete
            multiple={config.employee === 'multi'}
            options={employees}
            getOptionLabel={(option) =>
              `${option.firstName} ${option.lastName} (${option.employeeCode || ''})`
            }
            value={config.employee === 'multi' ? values.employees : values.employees[0] || null}
            onChange={(event, newValue) => {
              setFieldValue(
                'employees',
                config.employee === 'multi' ? (newValue as any[]) : newValue ? [newValue] : []
              );
            }}
            size="small"
            slotProps={{
              chip: {
                size: 'small',
                variant: 'soft',
              },
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label={config.employee === 'multi' ? 'Select Employees' : 'Select Employee'}
                placeholder={config.employee === 'multi' ? 'Select Employees' : 'Select Employee'}
                error={touched.employees && Boolean(errors.employees)}
                helperText={touched.employees && (errors.employees as string)}
              />
            )}
          />
        </Grid>
      );
    }

    if (config.department) {
      filters.push(
        <Grid size={{ xs: 12, md: 4 }} key="department">
          <Autocomplete
            multiple
            options={departmentOptions}
            value={values.departments}
            onChange={(event, newValue) => {
              setFieldValue('departments', newValue);
            }}
            size="small"
            slotProps={{
              chip: {
                size: 'small',
                variant: 'soft',
              },
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Departments"
                placeholder="Select Departments"
                error={touched.departments && Boolean(errors.departments)}
                helperText={touched.departments && (errors.departments as string)}
              />
            )}
          />
        </Grid>
      );
    }

    if (config.status) {
      filters.push(
        <Grid size={{ xs: 12, md: 4 }} key="status">
          <Autocomplete
            multiple
            options={EmployeeStatusTypeOptions}
            getOptionLabel={(option) => option.label}
            value={values.statuses}
            onChange={(event, newValue) => {
              setFieldValue('statuses', newValue);
            }}
            size="small"
            slotProps={{
              chip: {
                size: 'small',
                variant: 'soft',
              },
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Status"
                placeholder="Select Status"
                error={touched.statuses && Boolean(errors.statuses)}
                helperText={touched.statuses && (errors.statuses as string)}
              />
            )}
          />
        </Grid>
      );
    }

    return filters;
  };

  return (
    <Card>
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Autocomplete
              options={REPORT_TYPES}
              value={selectedReport}
              onChange={handleReportChange}
              size="small"
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Report"
                  placeholder="Select Report"
                  error={touched.report && Boolean(errors.report)}
                  helperText={touched.report && errors.report}
                />
              )}
            />
          </Grid>
          {renderFilters()}
          <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              onClick={() => handleSubmit()}
              disabled={!selectedReport}
              size="small"
              startIcon={<Iconify icon={GlobalIcons.report} />}
              sx={{ px: 4 }}
            >
              Generate Report
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Card>
  );
};

export default ReportFilter;
