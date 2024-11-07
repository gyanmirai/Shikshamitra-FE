'use client';

import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';
import type { Organization } from 'src/types/school';

import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import React, { useState, useEffect } from 'react';

import { Box } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';

import { Label } from 'src/components/label';
import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

const PayProcessScreen = () => {
  const [year, setYear] = useState<null | Dayjs>(dayjs(new Date()));
  const [month, setMonth] = useState<null | Dayjs>(dayjs(new Date()));
  // const [allMediums, setAllMediums] = useState<Medium[]>([]);
  // const [medium, setMedium] = useState<string>('');
  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);
  const [organization, setOrganization] = useState<string>('');

  const { currentMedium: medium, setCurrentMedium: setMedium } = useSelector(
    (state: RootState) => state.globalState
  );

  useEffect(() => {
    setAllOrganization(medium?.educationMediumStages || []);
    setOrganization(medium?.educationMediumStages?.[0]?.id || '');
  }, [medium]);

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Pay Process"
        links={[{ name: 'HR' }, { name: 'Payroll Management' }, { name: 'Pay Process' }]}
        sx={{ px: 1, mb: 2 }}
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
          onChange={(val: string | string[]) => {
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
          onChange={(val: string | string[]) => setOrganization(val as string)}
          labelKey="name"
          valueKey="id"
          formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
          disabled={!medium}
        />
      </Box>
      <CustomizableTable
        columns={[
          { id: 'employeeCode', label: 'Employee Code' },
          { id: 'name', label: 'Name' },
          { id: 'remark', label: 'Remark' },
          {
            id: 'payrollStatus',
            label: 'Payroll Status',
            render(value, row) {
              return <Label color={value === 'Generated' ? 'success' : 'warning'}>{value}</Label>;
            },
          },
        ]}
        data={[
          {
            employeeCode: 'EMP001',
            name: 'John Doe',
            remark: 'Active',
            payrollStatus: 'Generated',
          },
          {
            employeeCode: 'EMP002',
            name: 'Jane Smith',
            remark: 'On Leave',
            payrollStatus: 'Pending',
          },
          {
            employeeCode: 'EMP003',
            name: 'Mike Johnson',
            remark: 'Active',
            payrollStatus: 'Generated',
          },
          {
            employeeCode: 'EMP004',
            name: 'Sarah Williams',
            remark: 'Active',
            payrollStatus: 'Pending',
          },
          {
            employeeCode: 'EMP005',
            name: 'Robert Brown',
            remark: 'Inactive',
            payrollStatus: 'Pending',
          },
        ]}
      />
    </Box>
  );
};

export default PayProcessScreen;
