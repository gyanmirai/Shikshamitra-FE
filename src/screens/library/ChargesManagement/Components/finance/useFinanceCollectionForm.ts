import { useEffect } from 'react';
import { useFormik } from 'formik';
import { useGetFinanceRoutingOptionsQuery } from 'src/redux/finance/financeRoutingApi';
import { useGetFinanceExternalCollectFormQuery } from 'src/redux/library/charges-management/finance-external-api';

import { createFinanceCollectionSchema } from './finance-collection-validation';
import {
  useFinanceCollectionCommand,
  type FinanceCollectionProps,
} from './useFinanceCollectionCommand';

import type { FinanceCollectionValues } from './FinancePaymentFields';

export function useFinanceCollectionForm(props: FinanceCollectionProps) {
  const { source, disabled, onChanged, onBusyChange, onDirtyChange, canCollect } = props;
  const query = useGetFinanceExternalCollectFormQuery(source, { refetchOnMountOrArgChange: true });
  const commands = useFinanceCollectionCommand(props);
  const data = query.currentData;
  const formik = useFormik<FinanceCollectionValues>({
    initialValues: {
      amount: '',
      paymentMethod: '',
      schoolReceiptDate: '',
      bankAccountId: '',
      notes: '',
      details: {},
    },
    validationSchema: createFinanceCollectionSchema(data?.receivable.outstandingAmount),
    onSubmit: async (values) => {
      commands.prepare(values, data, query.isFetching || query.isError);
    },
  });
  const nonCash = formik.values.paymentMethod !== '' && formik.values.paymentMethod !== '0';
  const routing = useGetFinanceRoutingOptionsQuery(
    { academicYearId: data?.receivable.academicYearId || '', operation: 'collection' },
    { skip: !data || !nonCash }
  );
  useEffect(() => {
    if (data) onChanged(data.receivable);
  }, [data, onChanged]);
  useEffect(() => {
    onDirtyChange?.(formik.dirty);
    return () => onDirtyChange?.(false);
  }, [formik.dirty, onDirtyChange]);
  useEffect(() => {
    onBusyChange(commands.mutation.isLoading || commands.review || commands.uncertain);
    return () => onBusyChange(false);
  }, [commands.mutation.isLoading, commands.review, commands.uncertain, onBusyChange]);
  const locked =
    disabled || commands.mutation.isLoading || commands.review || commands.uncertain || !canCollect;
  return { query, formik, routing, data, locked, ...commands };
}
