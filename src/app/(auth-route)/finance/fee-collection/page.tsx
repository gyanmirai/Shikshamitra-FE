'use client';

import React from 'react';

import { useNewSearchParams } from 'src/hooks/use-search-param';

import FinanceStudentFeeTab from 'src/screens/finance/fee-collection/finance-student-fee-tab';

// import FinanceFeeCollectionScreen from 'src/screens/finance/fee-collection/finance-fee-collection-screen';

const FinanceFeeCollection = () => {
  const [searchParams, setSearchParams] = useNewSearchParams({ studentId: '' });
  return <FinanceStudentFeeTab studentId="" />;
};

export default FinanceFeeCollection;
