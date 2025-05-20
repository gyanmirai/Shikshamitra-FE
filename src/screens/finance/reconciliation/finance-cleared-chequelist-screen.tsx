'use client';

import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import { useSelector } from 'react-redux';
import React, { useState, useEffect } from 'react';

import { Box, Typography } from '@mui/material';

import { formatNumber } from 'src/utils/formate_number';

import data from 'src/json/finance/reconicilation/clearedChqueData.json';

import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

const FinanceClearedChequeListScreen = () => {
  // States for managing organization/stage selection
  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);
  const [organization, setOrganization] = useState<string>('');

  // States for managing class/standard selection
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [classes, setClass] = useState<string>('');

  // States for managing division selection
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  const [division, setDivision] = useState<string>('');
  const {
    currentBoard,
    currentMedium: medium,
    setCurrentMedium: setMedium,
  } = useSelector((state: RootState) => state.globalState);

  // Effect to update organizations when medium changes
  useEffect(() => {
    setAllOrganization(medium?.educationMediumStages || []);
    setOrganization(medium?.educationMediumStages?.[0]?.id || '');
  }, [medium]);

  // Effect to update classes when organization changes
  useEffect(() => {
    setAllClass(allOrganization.find((org: any) => org?.id === organization)?.standards || []);
    setClass(
      allOrganization.find((org: any) => org?.id === organization)?.standards?.[0]?.id || ''
    );
  }, [organization, allOrganization]);

  // Effect to update divisions when class changes
  useEffect(() => {
    setAllDivision(allClass.find((org: any) => org?.id === classes)?.divisions || []);
    setDivision(allClass.find((org: any) => org?.id === classes)?.divisions?.[0]?.id || '');
  }, [allClass, classes]);

  return (
    <>
      <CustomBreadcrumbs
        heading="Cleared Cheque"
        description="The cleared cheque screen displays all payments made by cheque which are marked as cleared"
        links={[
          { name: 'Finance', href: '/finance/dashboard' },
          { name: 'Reconciliation' },
          { name: 'Cleared Cheque' },
        ]}
        sx={{ px: 1, mb: 2 }}
      />

      <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
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
        <CustomSelect
          options={allClass}
          label="Class"
          value={classes}
          onChange={(val) => setClass(val as string)}
          labelKey="name"
          valueKey="id"
          formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
          disabled={!organization}
        />
        <CustomSelect
          options={allDivision}
          label="Division"
          value={division}
          onChange={(val) => setDivision(val as string)}
          labelKey="name"
          valueKey="id"
          formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
          disabled={!classes}
        />
      </Box>
      <CustomizableTable
        noDataText={
          <>
            There are no cleared cheques recorded for the selected class and division at this time.
          </>
        }
        searchFieldProps={{
          placeholder: 'Search by Gr Number, Name...',
          label: 'Search by Gr Number, Name...',
          sx: {
            maxWidth: '400px',
            width: '100%',
          },
        }}
        tableId="finance-cleared-checklist-tab"
        columns={[
          //  {id:"srNo", label:"SR No"},

          { id: 'grNumber', label: 'GR No', filterType: 'number', sticky: true },
          { id: 'studentName', label: 'Student Name' },
          { id: 'chequeNumber', label: 'Cheque Number' },
          { id: 'chequeDate', label: 'Cheque Date', filterType: 'date' },
          { id: 'clearedDate', label: 'Cleared Date', filterType: 'date' },
          { id: 'feeHead', label: 'Fee Head' },

          {
            id: 'amount',
            label: 'Amount',
            filterType: 'formattedNumber',
            render(value, row) {
              return <Typography fontSize="12px">{formatNumber(row.amount, 'INR')}</Typography>;
            },
          },
        ]}
        data={data}
      />
    </>
  );
};

export default FinanceClearedChequeListScreen;
