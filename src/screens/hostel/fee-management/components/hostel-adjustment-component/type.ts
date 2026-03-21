import type { UseBooleanReturn } from 'src/hooks/useBoolean';

export interface IHostelFeeAdjustment {
  id: number;
  amount: number;
  type: string;
  reason: string;
  status: string;
}

export interface IAdjustmentFormProps {
  open: UseBooleanReturn;
  onClose: (e: any, isSubmit: boolean) => void;
  editData?: IHostelFeeAdjustment | null;
}
