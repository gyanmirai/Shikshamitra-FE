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
  },
];
