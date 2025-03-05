'use client';

import React from 'react';

import { useSearchParam } from 'src/hooks/use-search-param';

import FinanceStudentFeeTab from 'src/screens/finance/fee-collection/finance-student-fee-tab';

const FinanceFeeCollection = () => {
  const [searchParams, setSearchParams] = useSearchParam({ studentId: '1' });

  return <FinanceStudentFeeTab studentId={searchParams.studentId} />;
};

export default FinanceFeeCollection;
