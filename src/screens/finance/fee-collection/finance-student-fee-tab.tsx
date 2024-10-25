import React from 'react';

import FinanceStudentFeeCardComponent from './studentFeeDetails/finance-student-fee-card-component';
import FinanceStudentDetailedFeeComponent from './studentFeeDetails/finance-student-detailed-fee-component';

const FinanceStudentFeeTab = () => {
  const data = [];
  return (
    <>
      <FinanceStudentFeeCardComponent />

      <FinanceStudentDetailedFeeComponent />
    </>
  );
};

export default FinanceStudentFeeTab;
