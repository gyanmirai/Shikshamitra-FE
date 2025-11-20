'use client';

import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';
import type { Organization } from 'src/types/school';

import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { Refresh } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import React, { useState, useEffect } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Stack, Button, Divider, Checkbox, Typography } from '@mui/material';

const ImportAttendanceScreen = () => {
  const dialog = useBoolean();

  const [viewData] = useState<any>(null);
  const [year, setYear] = useState<null | Dayjs>(dayjs(new Date()));
  const [month, setMonth] = useState<null | Dayjs>(dayjs(new Date()));
  // const [allMediums, setAllMediums] = useState<Medium[]>([]);
  // const [medium, setMedium] = useState<string>('');
  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);
  const [organization, setOrganization] = useState<string>('');

  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  useEffect(() => {
    setAllOrganization(medium?.educationMediumStages || []);
    setOrganization(medium?.educationMediumStages?.[0]?.id || '');
  }, [medium]);
  return (
    <Box>
      <CustomBreadcrumbs
        heading="Import Attendance"
        links={[{ name: 'HR' }, { name: 'Payroll Management' }, { name: 'Import Attendance' }]}
        sx={{ mb: 2 }}
        action={
          <Button startIcon={<Refresh />} variant="contained">
            Generate Selected
          </Button>
        }
      />
      <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
        <DatePicker
          value={year}
          onChange={(val) => setYear(val)}
          views={['year']}
          label="Select Year"
          format="YYYY"
          sx={{ maxWidth: '250px', width: '100%' }}
          slotProps={{
            textField: {
              size: 'small',
            },
          }}
        />
        <DatePicker
          value={month}
          onChange={(val) => setMonth(val)}
          views={['month']}
          label="Select Month"
          format="MMMM"
          sx={{ maxWidth: '250px', width: '100%' }}
          slotProps={{
            textField: {
              size: 'small',
            },
          }}
        />
        {/* <CustomSelect
          options={allMediums}
          label="Medium"
          value={medium}
          onChange={(val) => {
            setMedium(val as string);
          }}
          labelKey="name"
          valueKey="id"
          formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
        /> */}
        <CustomSelect
          options={allOrganization}
          label="Organization"
          value={organization}
          onChange={(val) => setOrganization(val as string)}
          labelKey="name"
          valueKey="id"
          formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
          disabled={!medium}
        />
      </Box>
      <CustomizableTable
        tableId="attendanceImport"
        columns={[
          {
            id: 'checkbox',
            label: ' ',
            isSort: false,
            renderColumn(value) {
              return <Checkbox />;
            },
            render(value, row) {
              return <Checkbox />;
            },
          },
          { id: 'employeeCode', label: 'Employee Code' },
          { id: 'name', label: 'Name' },
          { id: 'employeeType', label: 'Employee Type' },
          { id: 'department', label: 'Department' },
          { id: 'workingDays', label: 'Working Days' },
          { id: 'leave', label: 'Leave' },
          {
            id: 'status',
            label: 'Status',
            render(value, row) {
              return <Label color={value === 'Active' ? 'success' : 'error'}>{value}</Label>;
            },
          },
          {
            id: 'action',
            label: 'Generate',
            // renderColumn(value) {
            //   return (
            //     <Button size="small" variant="contained">
            //       Generate All
            //     </Button>
            //   );
            // },
            render(value, row) {
              return (
                <Button size="small" variant="contained">
                  Generate
                </Button>
              );
            },
          },
        ]}
        data={[
          {
            employeeCode: 'EMP001',
            name: 'John Doe',
            employeeType: 'Full Time',
            department: 'IT',
            workingDays: 22,
            leave: 2,
            status: 'Active',
            action: '',
          },
          {
            employeeCode: 'EMP002',
            name: 'Jane Smith',
            employeeType: 'Part Time',
            department: 'HR',
            workingDays: 20,
            leave: 1,
            status: 'Active',
            action: '',
          },
          {
            employeeCode: 'EMP003',
            name: 'Mike Johnson',
            employeeType: 'Full Time',
            department: 'Finance',
            workingDays: 21,
            leave: 3,
            status: 'Active',
            action: '',
          },
        ]}
      />

      <CustomDialog title="Pay Process View" handleClose={dialog.onFalse} open={dialog.value}>
        <Scrollbar sx={{ bgcolor: 'background.neutral', p: 3 }}>
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="subtitle2">Name</Typography>
              <Typography>{viewData?.name}</Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between">
              <Typography variant="subtitle2">Salary Month</Typography>
              <Typography>December</Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between">
              <Typography variant="subtitle2">Year</Typography>
              <Typography>2023</Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between">
              <Typography variant="subtitle2">Working Days</Typography>
              <Typography>{viewData?.workingDays}</Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between">
              <Typography variant="subtitle2">Present Days</Typography>
              <Typography>{(viewData?.workingDays || 0) - (viewData?.leave || 0)}</Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between">
              <Typography variant="subtitle2">Salary</Typography>
              <Typography>₹50,000</Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between">
              <Typography variant="subtitle2">Gross Salary</Typography>
              <Typography>₹48,000</Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between">
              <Typography variant="subtitle2">PR</Typography>
              <Typography>₹1,800</Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between">
              <Typography variant="subtitle2">Prof. Tax</Typography>
              <Typography>₹200</Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between">
              <Typography variant="subtitle2">TDS</Typography>
              <Typography>₹5,000</Typography>
            </Stack>

            <Divider />

            <Stack direction="row" justifyContent="space-between">
              <Typography variant="subtitle1">Net Salary:</Typography>
              <Typography variant="subtitle1">₹41,000</Typography>
            </Stack>
          </Stack>
        </Scrollbar>
      </CustomDialog>
    </Box>
  );
};

export default ImportAttendanceScreen;
