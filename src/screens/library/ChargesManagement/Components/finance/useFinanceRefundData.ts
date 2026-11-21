import { useState, useEffect } from 'react';
import { skipToken } from '@reduxjs/toolkit/query';
import { useGetFeeRefundsQuery } from 'src/redux/finance/RefundManagement/feeRefundManage';
import { useLazyGetDetailedChargeQuery } from 'src/redux/library/charges-management/charges-get-api';
import { useGetFinanceExternalRefundFormQuery } from 'src/redux/library/charges-management/finance-external-api';

import type { FinanceActionProps } from './finance-flow-types';

export function useFinanceRefundData(
  { source, onChanged }: FinanceActionProps,
  canRequest: boolean
) {
  const form = useGetFinanceExternalRefundFormQuery(canRequest ? source : skipToken, {
    refetchOnMountOrArgChange: true,
  });
  const [readAssessment, assessment] = useLazyGetDetailedChargeQuery();
  const [linkId, setLinkId] = useState<string | null>(null);
  const [linkIssue, setLinkIssue] = useState('');
  const [page, setPage] = useState(0);
  useEffect(() => {
    let active = true;
    setLinkId(null);
    setLinkIssue('');
    const read = readAssessment({ chargeId: source.sourceId }, false);
    read
      .unwrap()
      .then((value) => {
        if (!active) return;
        if (
          value.id !== source.sourceId ||
          value.sourceVersion !== source.sourceVersion ||
          !value.financeSourceLinkId
        ) {
          setLinkIssue(
            'The saved Finance source changed. Reopen this assessment before viewing its refund history.'
          );
          return;
        }
        setLinkId(value.financeSourceLinkId);
      })
      .catch(() => undefined);
    return () => {
      active = false;
      read.unsubscribe();
    };
  }, [readAssessment, source.sourceId, source.sourceVersion]);
  const year = linkId ? assessment.currentData?.academicYearId : null;
  const history = useGetFeeRefundsQuery(
    linkId && year
      ? {
          financeExternalSourceLinkId: linkId,
          academicYearId: year,
          skipCount: page * 10,
          maxResultCount: 10,
        }
      : skipToken,
    { refetchOnMountOrArgChange: true }
  );
  useEffect(() => {
    if (form.currentData && !form.isFetching && !form.isError)
      onChanged(form.currentData.receivable);
  }, [form.currentData, form.isFetching, form.isError, onChanged]);
  return { form, history, assessment, linkId, linkIssue, year, page, setPage };
}
