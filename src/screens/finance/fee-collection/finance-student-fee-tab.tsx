'use client';

import React, { useEffect } from 'react';

import { useSearchParams } from 'src/routes/hooks';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import FinanceStudentFeeCardComponent from './studentFeeDetails/finance-student-fee-card-component';
import FinanceStudentDetailedFeeComponent from './studentFeeDetails/finance-student-detailed-fee-component';


interface FinanceStudentFeeTabProps {
  studentId: string;
  studentClass?: string;
  division?: string;
}

const FinanceStudentFeeTab: React.FC<FinanceStudentFeeTabProps> = ({ studentId, studentClass, division }) => {
  const searchParams = useSearchParams();

  const selectedStudentd = searchParams.get('id') || '';

  useEffect(() => {
    // Example of how you can use the params for fetching data or logic
    console.log('Student ID:', studentId);

  }, [studentId,]);

  return (
    <>
      <CustomBreadcrumbs
        heading="Fee Collection"
        links={[{ name: 'Finance' }, { name: 'Fee Collection' }]}
        sx={{ px: 1, mb: 2 }}
      />
      <FinanceStudentFeeCardComponent studentId={selectedStudentd} />

      <FinanceStudentDetailedFeeComponent studentId={selectedStudentd} />
    </>
  );
};

export default FinanceStudentFeeTab;
