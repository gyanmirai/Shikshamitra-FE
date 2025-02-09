'use client';

import React from 'react';

import { Box, TextField } from '@mui/material';

import { useSearchParam } from 'src/hooks/use-search-param';

import CustomSelect from 'src/components/custom-select';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import FinanceStudentFeeCardComponent from './studentFeeDetails/finance-student-fee-card-component';
import FinanceStudentDetailedFeeComponent from './studentFeeDetails/finance-student-detailed-fee-component';

interface FinanceStudentFeeTabProps {
  studentId: string;
  studentClass?: string;
  division?: string;
}

const FinanceStudentFeeTab: React.FC<FinanceStudentFeeTabProps> = ({
  studentId,
  studentClass,
  division,
}) => {
  // Get and set search params (studentId, class, division)
  const [searchParams, setSearchParams] = useSearchParam({ studentId: '1' });

  // Update studentId in the URL
  const handleStudentChange = (newStudentId: string) => {
    setSearchParams({ studentId: newStudentId });
  };

  return (
    <>
      <CustomBreadcrumbs
        heading="Fee Collection"
        links={[{ name: 'Finance' }, { name: 'Fee Collection' }]}
        sx={{ px: 1, mb: 2 }}
      />

      {/* Student Selection */}
      <Box display="flex" flexDirection="row" justifyContent="space-between">
        <Box py="15px" display="flex" flexDirection="row" gap={3}>
          <CustomSelect
            label="Standard"
            options={[]} // Add class options
            value={studentClass || ''}
            onChange={(value) => setSearchParams({ studentClass: value })}
            formControlProps={{ sx: { minWidth: 140 } }}
          />
          <CustomSelect
            label="Division"
            options={[]} // Add division options
            value={division || ''}
            onChange={(value) => setSearchParams({ division: value })}
            formControlProps={{ sx: { minWidth: 140 } }}
          />
          <TextField
            label="Search by student name"
            variant="outlined"
            size="small"
            value={searchParams.studentId || ''}
            onChange={(e) => handleStudentChange(e.target.value)}
          />
        </Box>
      </Box>

      {/* Fee Components */}
      <FinanceStudentFeeCardComponent studentId={searchParams.studentId} />
      <FinanceStudentDetailedFeeComponent studentId={searchParams.studentId} />
    </>
  );
};

export default FinanceStudentFeeTab;
