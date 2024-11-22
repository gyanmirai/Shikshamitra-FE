'use client'

import React from 'react';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import FinanceStudentFeeCardComponent from './studentFeeDetails/finance-student-fee-card-component';
import FinanceStudentDetailedFeeComponent from './studentFeeDetails/finance-student-detailed-fee-component';

const FinanceStudentFeeTab = () => {
  const data = [];
  return (
    <>
    <CustomBreadcrumbs
        heading="Fee Collection"
        links={[{ name: 'Finance' }, { name: 'Fee Collection' }]}
        sx={{ px: 1, mb: 2 }}
        
      />
      <FinanceStudentFeeCardComponent />

      <FinanceStudentDetailedFeeComponent />
    </>
  );
};

export default FinanceStudentFeeTab;
