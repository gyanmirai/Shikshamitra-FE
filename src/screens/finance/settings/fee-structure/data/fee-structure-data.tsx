import type { IFeeItem } from '../fee-structure-interface';

export const feestructureDummyData: IFeeItem[] = [
  {
    feeHead: 'Admission',
    grossFee: 1000,
    payableFee: 1000,
    generalDiscount: 0,
    paymentMethod: ['cash'],
    lateFeeChargesType: 'fixed',
    lateFeeChargesAmount: '1000',
    isActive: true,
    discountReason: 'none',
  },
  {
    feeHead: 'Tuition',
    grossFee: 5000,
    payableFee: 4500,
    generalDiscount: 500,
    paymentMethod: ['cash', 'online'],
    lateFeeChargesType: 'perDay',
    lateFeeChargesAmount: '1',
    isActive: true,
    discountReason:
      'promotion campaign promotion campaign promotion campaign promotion campaign promotion campaign promotion campaign',
  },
  {
    feeHead: 'Sports',
    grossFee: 5000,
    payableFee: 4500,
    generalDiscount: 500,
    paymentMethod: ['cash'],
    lateFeeChargesType: 'perDay',
    lateFeeChargesAmount: '1',
    isActive: false,
    discountReason: 'promotion campaign',
  },
  {
    feeHead: 'Transport',
    grossFee: 5000,
    payableFee: 4500,
    generalDiscount: 500,
    paymentMethod: ['cash'],
    lateFeeChargesType: 'fixed',
    lateFeeChargesAmount: '1000',
    isActive: false,
    discountReason: 'promotion campaign',
  },
];
