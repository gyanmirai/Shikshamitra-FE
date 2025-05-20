'use client';

import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import { useSelector } from 'react-redux';
import React, { useState, useEffect } from 'react';

import { Box, TextField } from '@mui/material';

import { useSearchParam } from 'src/hooks/use-search-param';

import CustomSelect from 'src/components/custom-select';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import FinanceStudentFeeCardComponent from './studentFeeDetails/finance-student-fee-card-component';
import FinanceStudentDetailedFeeComponent from './studentFeeDetails/finance-student-detailed-fee-component';

interface FinanceStudentFeeTabProps {
  studentId: string;
}

const FinanceStudentFeeTab: React.FC<FinanceStudentFeeTabProps> = ({ studentId }) => {
  // Get and set search params (studentId, class, division)

  const [searchParams, setSearchParams] = useSearchParam({ studentId: '1' });

  // Update studentId in the URL
  const handleStudentChange = (newStudentId: string) => {
    setSearchParams({ studentId: newStudentId });
  };

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
        heading="Fee Collection"
        description="The Fee Collection tab serves as a single-window system for managing fee-related tasks. Here, you can collect fees, apply charges, provide additional discounts, process refunds, and view a student's complete fee details, including their fee structure, payment history, pending fees, and refund history."
        links={[{ name: 'Finance', href: '/finance/dashboard' }, { name: 'Fee Collection' }]}
        sx={{ px: 1, mb: 2 }}
      />

      {/* Student Selection */}

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
        <TextField
          label="Search by student name"
          variant="outlined"
          size="small"
          value={searchParams.studentId || ''}
          onChange={(e) => handleStudentChange(e.target.value)}
        />
      </Box>

      {/* Fee Components */}
      <FinanceStudentFeeCardComponent studentId={searchParams.studentId} />
      <FinanceStudentDetailedFeeComponent studentId={searchParams.studentId} />
    </>
  );
};

export default FinanceStudentFeeTab;
