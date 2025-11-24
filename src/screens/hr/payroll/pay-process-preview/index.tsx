'use client';

import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';
import type { Organization } from 'src/types/school';

import dayjs from 'dayjs';
import { Box } from '@mui/material';
import { useSelector } from 'react-redux';
import { DatePicker } from '@mui/x-date-pickers';
import React, { useState, useEffect } from 'react';
import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

const PayProcessPreviewScreen = () => {
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
        heading="Pay Process preview"
        links={[{ name: 'HR' }, { name: 'Payroll Management' }, { name: 'Pay Process preview' }]}
        sx={{ mb: 2 }}
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
        tableId="payProcessPreview"
        columns={[
          { id: 'employeeCode', label: 'Employee Code' },
          { id: 'name', label: 'Name' },
          { id: 'workingDays', label: 'Working Days' },
          { id: 'presentDays', label: 'Present Days' },
          { id: 'salary', label: 'Salary' },
          { id: 'grossSalary', label: 'Gross Salary' },
          { id: 'pf', label: 'PF' },
          { id: 'profTex', label: 'Prof tex' },

          { id: 'tds', label: 'TDS' },
          { id: 'netSalary', label: 'Net Salary' },
        ]}
        data={[]}
      />
    </Box>
  );
};

export default PayProcessPreviewScreen;
