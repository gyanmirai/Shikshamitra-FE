import type {
  FinanceExternalSource,
  FinanceExternalReceivable,
} from 'src/redux/library/charges-management/finance-external.types';

export type FinanceActionProps = {
  source: FinanceExternalSource;
  disabled: boolean;
  onChanged: (receivable: FinanceExternalReceivable) => void;
  onBusyChange: (busy: boolean) => void;
  onDirtyChange?: (dirty: boolean) => void;
};
