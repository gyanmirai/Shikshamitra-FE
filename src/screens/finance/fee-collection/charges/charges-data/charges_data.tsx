interface ChargeDetail {
  dueDate: string;
  chargesPerDay: string;
  totalCharges: number;
  status: 'Paid' | 'Pending';
  feeHead: string;
  noOfDay: number;
  chargesHead: string;
  chargesHeadId: number;
}

interface Charge {
  srNo: number;
  chargeHead: string;
  chargeId: string;
  chargeType: string;
  appliedDate: string;
  overdueDate: string;
  amount: number;
  status: 'Paid' | 'Pending';
  description: string;
  details: ChargeDetail[];
}

export const chargesData: Charge[] = [
  {
    srNo: 1,
    chargeHead: 'Late Fee',
    chargeId: '674773',
    chargeType: 'latefee',
    appliedDate: '15-08-2024',
    overdueDate: '20-08-2024',
    amount: 300,
    status: 'Pending',
    description: 'Late fee for overdue payment of Tuition Fee.',
    details: [
      {
        dueDate: '01-01-2025',
        chargesPerDay: '5',
        totalCharges: 150,
        status: 'Paid',
        feeHead: 'Tuition',
        noOfDay: 30,
        chargesHead: 'Late Fee',
        chargesHeadId: 567,
      },
      {
        dueDate: '01-02-2025',
        chargesPerDay: '5',
        totalCharges: 150,
        status: 'Pending',
        feeHead: 'Tuition',
        noOfDay: 60,
        chargesHead: 'Late Fee',
        chargesHeadId: 367,
      },
      {
        dueDate: '01-03-2025',
        chargesPerDay: '5',
        totalCharges: 150,
        status: 'Pending',
        feeHead: 'Tuition',
        noOfDay: 120,
        chargesHead: 'Late Fee',
        chargesHeadId: 369,
      },
    ],
  },
  {
    srNo: 2,
    chargeHead: 'Late Fee',
    chargeId: '874912',
    chargeType: 'latefee',
    appliedDate: '10-09-2024',
    overdueDate: '15-09-2024',
    amount: 500,
    status: 'Pending',
    description: 'Late fee for overdue payment of Sports Fee.',
    details: [
      {
        dueDate: '01-04-2025',
        chargesPerDay: '10',
        totalCharges: 300,
        status: 'Paid',
        feeHead: 'Sports',
        noOfDay: 30,
        chargesHead: 'Late Fee',
        chargesHeadId: 389,
      },
      {
        dueDate: '01-05-2025',
        chargesPerDay: '10',
        totalCharges: 300,
        status: 'Pending',
        feeHead: 'Sports',
        noOfDay: 60,
        chargesHead: 'Late Fee',
        chargesHeadId: 399,
      },
      {
        dueDate: '01-06-2025',
        chargesPerDay: '10',
        totalCharges: 300,
        status: 'Pending',
        feeHead: 'Sports',
        noOfDay: 120,
        chargesHead: 'Late Fee',
        chargesHeadId: 349,
      },
    ],
  },
];
