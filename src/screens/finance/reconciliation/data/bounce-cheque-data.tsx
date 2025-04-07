export interface ChargeData {
  srNo: number;
  chequeNumber: string;
  chequeDate: string;
  bounceDate: string;
  reason: string;
  amount: string;
  status: string;
  studentName: string;
  chargesAmount: string;
  feeHead: string;
  grNumber: number;
  parentsContactNumber: number;
}

export const chargesData: ChargeData[] = [
  {
    srNo: 1,
    chequeNumber: '123456',
    chequeDate: '15-08-2024',
    bounceDate: '20-08-2024',
    reason: 'Insufficient Funds',
    amount: '5000',
    status: 'Pending',
    studentName: 'Ishita Desai',
    chargesAmount: '300',
    feeHead: 'Library',
    grNumber: 89554,
    parentsContactNumber: 9843539133,
  },
  {
    srNo: 2,
    chequeNumber: '789012',
    chequeDate: '10-09-2024',
    bounceDate: '15-09-2024',
    reason: 'Account Closed',
    amount: '25000',
    status: 'Pending',
    studentName: 'Ishita Desai',
    chargesAmount: '300',
    feeHead: 'Library',
    grNumber: 89554,
    parentsContactNumber: 9843539133,
  },
  {
    srNo: 3,
    chequeNumber: '345678',
    chequeDate: '01-10-2024',
    bounceDate: '05-10-2024',
    reason: 'Signature Mismatch',
    amount: '12000',
    status: 'Paid',
    studentName: 'Ishita Desai',
    chargesAmount: '300',
    feeHead: 'Library',
    grNumber: 89554,
    parentsContactNumber: 9843539133,
  },
  {
    srNo: 4,
    chequeNumber: '901234',
    chequeDate: '25-11-2024',
    bounceDate: '28-11-2024',
    reason: 'Funds Not Cleared',
    amount: '8000',
    status: 'Paid',
    studentName: 'Ishita Desai',
    chargesAmount: '300',
    feeHead: 'Library',
    grNumber: 89554,
    parentsContactNumber: 9843539133,
  },
  {
    srNo: 5,
    chequeNumber: '567890',
    chequeDate: '10-12-2024',
    bounceDate: '15-12-2024',
    reason: 'Stale Cheque',
    amount: '15000',
    status: 'Paid',
    studentName: 'Ishita Desai',
    chargesAmount: '300',
    feeHead: 'Library',
    grNumber: 89554,
    parentsContactNumber: 9843539133,
  },
];
