'use client';

import { FinanceCashier } from './finance/FinanceCashier';

import type { ICollectChargesProps } from './type';

export default function CollectChargesForm(props: ICollectChargesProps) {
  const { open, charge } = props;
  return open.value && charge?.id ? <FinanceCashier key={String(charge.id)} {...props} /> : null;
}
