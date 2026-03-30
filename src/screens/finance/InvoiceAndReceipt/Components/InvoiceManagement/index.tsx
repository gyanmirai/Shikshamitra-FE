import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';
import type { Board, Medium, Division, Standards, Organization } from 'src/types/school';

import { useTabs } from 'src/hooks/use-tabs';
import { Label } from 'src/components/label';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSelector, useDispatch } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import { Box, Tab, Tabs, Typography } from '@mui/material';
import React, { useMemo, useState, useEffect } from 'react';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { useGetInvoiceDataQuery } from 'src/redux/invoiceAndReceipt/invoiceApi';

import InvoiceForm from './InvoiceForm';
import InvoiceTable from './InvoiceTable';
import InvoiceTableView from './StudentInvoiceTable';

import type { InvoiceData } from './type';

const STATIC_INVOICES: InvoiceData[] = [
  {
    id: 'inv-001',
    invoiceNumber: 'SCH/2025/0001',
    studentId: 'stu-001',
    student: 'Dharmik Jinjala',
    class: '10',
    division: 'A',
    rollNumber: 10,
    grNumber: 111,
    academicYear: '2024-25',
    billingCycle: 'Monthly',
    billingPeriod: ['April', 'May'],
    feeItems: [
      { name: 'Tuition Fee', amount: 4000 },
      { name: 'Library Fee', amount: 500 },
      { name: 'Lab Fee', amount: 600 },
    ],
    concessions: [{ name: 'Sibling Discount', amount: 500 }],
    totalAmount: 4600,
    paidAmount: 2000,
    status: 'Partial',
    createdAt: '2025-04-01',
    receiptIds: ['rcp-001'],
  },
  {
    id: 'inv-002',
    invoiceNumber: 'SCH/2025/0002',
    studentId: 'stu-002',
    student: 'Prerna Atre',
    class: '10',
    division: 'A',
    rollNumber: 12,
    grNumber: 112,
    academicYear: '2024-25',
    billingCycle: 'Quarterly',
    billingPeriod: 'Q1 (Apr-Jun)',
    feeItems: [
      { name: 'Tuition Fee', amount: 12000 },
      { name: 'Library Fee', amount: 1500 },
    ],
    concessions: [],
    totalAmount: 13500,
    paidAmount: 13500,
    status: 'Paid',
    createdAt: '2025-04-01',
    receiptIds: ['rcp-002', 'rcp-003'],
  },
  {
    id: 'inv-003',
    invoiceNumber: 'SCH/2025/0003',
    studentId: 'stu-003',
    student: 'Mayur Solanki',
    class: '10',
    division: 'A',
    rollNumber: 15,
    grNumber: 113,
    academicYear: '2024-25',
    billingCycle: 'Half-Yearly',
    billingPeriod: 'First Half (Apr-Sep)',
    feeItems: [
      { name: 'Tuition Fee', amount: 24000 },
      { name: 'Lab Fee', amount: 3000 },
    ],
    concessions: [{ name: 'Merit Scholarship', amount: 2000 }],
    totalAmount: 25000,
    paidAmount: 0,
    status: 'Pending',
    createdAt: '2025-04-02',
    receiptIds: [],
  },
  {
    id: 'inv-004',
    invoiceNumber: 'SCH/2025/0004',
    studentId: 'stu-004',
    student: 'Parth Ghusar',
    class: '10',
    division: 'A',
    rollNumber: 18,
    grNumber: 114,
    academicYear: '2024-25',
    billingCycle: 'Annually',
    billingPeriod: 'Full Year (Apr-Mar)',
    feeItems: [
      { name: 'Tuition Fee', amount: 48000 },
      { name: 'Library Fee', amount: 3000 },
      { name: 'Lab Fee', amount: 6000 },
      { name: 'Sports Fee', amount: 2000 },
    ],
    concessions: [],
    totalAmount: 59000,
    paidAmount: 30000,
    status: 'Partial',
    createdAt: '2025-04-03',
    receiptIds: ['rcp-004', 'rcp-005'],
  },
  {
    id: 'inv-005',
    invoiceNumber: 'SCH/2025/0005',
    studentId: 'stu-005',
    student: 'Raj Baku',
    class: '10',
    division: 'A',
    rollNumber: 20,
    grNumber: 115,
    academicYear: '2024-25',
    billingCycle: 'Monthly',
    billingPeriod: ['June'],
    feeItems: [
      { name: 'Tuition Fee', amount: 4000 },
      { name: 'Library Fee', amount: 500 },
    ],
    concessions: [],
    totalAmount: 4500,
    paidAmount: 0,
    status: 'Pending',
    createdAt: '2025-06-01',
    receiptIds: [],
  },
  {
    id: 'inv-006',
    invoiceNumber: 'SCH/2025/0006',
    studentId: 'stu-006',
    student: 'Ananya Desai',
    class: '9',
    division: 'B',
    rollNumber: 5,
    grNumber: 116,
    academicYear: '2024-25',
    billingCycle: 'Monthly',
    billingPeriod: ['April', 'May', 'June'],
    feeItems: [
      { name: 'Tuition Fee', amount: 3500 },
      { name: 'Library Fee', amount: 400 },
    ],
    concessions: [],
    totalAmount: 3900,
    paidAmount: 3900,
    status: 'Paid',
    createdAt: '2025-04-05',
    receiptIds: ['rcp-006'],
  },
  {
    id: 'inv-007',
    invoiceNumber: 'SCH/2025/0007',
    studentId: 'stu-007',
    student: 'Vivaan Shah',
    class: '9',
    division: 'A',
    rollNumber: 8,
    grNumber: 117,
    academicYear: '2024-25',
    billingCycle: 'Quarterly',
    billingPeriod: 'Q2 (Jul-Sep)',
    feeItems: [
      { name: 'Tuition Fee', amount: 10500 },
      { name: 'Sports Fee', amount: 1500 },
    ],
    concessions: [{ name: 'Early Bird Discount', amount: 1000 }],
    totalAmount: 11000,
    paidAmount: 5000,
    status: 'Partial',
    createdAt: '2025-07-01',
    receiptIds: ['rcp-007'],
  },
];

const InvoiceManagement = ({ addInvoiceDialog }: any) => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [mediums, setMediums] = useState<Medium[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<string>('');
  const [selectedMedium, setSelectedMedium] = useState<string>('');
  // State to store all classes/standards for the selected organization
  const [allClass, setAllClass] = useState<Standards[]>([]);
  // State to store selected class/standard ID
  const [selectedInvoiceData, setSelectedInvoiceData] = useState<InvoiceData | null>(null);
  const [classes, setClass] = useState<string>('');
  // State to store all divisions for the selected class
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  // State to store selected division ID
  const [division, setDivision] = useState<string>('');
  const { data: invoiceData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetInvoiceDataQuery,
  });

  const tableData = invoiceData?.length ? invoiceData : STATIC_INVOICES;

  const statusTabs = useTabs('All');

  const statusCounts = useMemo(() => {
    const list = tableData || [];
    return {
      All: list.length,
      Pending: list.filter((i: InvoiceData) => i.status === 'Pending').length,
      Partial: list.filter((i: InvoiceData) => i.status === 'Partial').length,
      Paid: list.filter((i: InvoiceData) => i.status === 'Paid').length,
    };
  }, [tableData]);

  const STATUS_TABS = useMemo(
    () => [
      { value: 'All', label: 'All', count: statusCounts.All, color: 'default' },
      { value: 'Pending', label: 'Pending', count: statusCounts.Pending, color: 'warning' },
      { value: 'Partial', label: 'Partial', count: statusCounts.Partial, color: 'info' },
      { value: 'Paid', label: 'Paid', count: statusCounts.Paid, color: 'success' },
    ],
    [statusCounts]
  );

  const filteredInvoiceData = useMemo(() => {
    const list = tableData || [];
    if (statusTabs.value === 'All') return list;
    return list.filter((i: InvoiceData) => i.status === statusTabs.value);
  }, [tableData, statusTabs.value]);
  const viewInvoiceDetailsDialog = useBoolean();
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();

  // Get current year from global state to derive boards
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  // Sync boards from current year
  useEffect(() => {
    setBoards(currentYear?.boards || []);
  }, [currentYear?.boards]);

  // Update mediums when selectedBoard changes
  useEffect(() => {
    const board = boards.find((item: Board) => item.id === selectedBoard);
    setMediums(board?.educationMediums || []);
  }, [boards, selectedBoard]);

  // Update classes when medium changes
  useEffect(() => {
    const medium = mediums?.find((item: Medium) => item.id === selectedMedium);
    const allClasses =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];
    setAllClass(allClasses);
    setClass('');
  }, [mediums, selectedMedium]);

  // Update divisions when class changes
  useEffect(() => {
    setAllDivision(allClass.find((org: any) => org?.name === classes)?.divisions || []);
    setDivision('');
  }, [allClass, classes]);

  const handleClose = (_e: any, isSubmit?: boolean) => {
    const resetState = () => {
      setTimeout(() => {
        dispatch(setIsChanges(false));
      }, 200); // Adjust timing based on your dialog close animation
    };
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      addInvoiceDialog.onFalse();
      resetState();
    } else if (!isChanges) {
      addInvoiceDialog.onFalse();
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box
        display="flex"
        sx={{
          borderRadius: 2,
          bgcolor: 'background.paper',
          boxShadow: 'var(--shadows-3)',
          mt: 1,
          mb: 1,
          p: 1,
          pb: 0,
          gap: 2,
        }}
      >
        <CustomSelect
          options={boards || []}
          label="Board"
          value={selectedBoard}
          onChange={(val) => {
            setSelectedBoard(val as string);
            setSelectedMedium('');
            setClass('');
            setDivision('');
          }}
          labelKey="name"
          valueKey="id"
          formControlProps={{ sx: { maxWidth: '180px', width: '100%' } }}
        />
        <CustomSelect
          options={mediums || []}
          label="Medium"
          value={selectedMedium}
          onChange={(val) => {
            setSelectedMedium(val as string);
            setClass('');
            setDivision('');
          }}
          labelKey="name"
          valueKey="id"
          disabled={!selectedBoard}
          formControlProps={{ sx: { maxWidth: '180px', width: '100%' } }}
        />
        <CustomSelect
          options={allClass}
          label="Class"
          value={classes}
          onChange={(val) => setClass(val as string)}
          labelKey="name"
          valueKey="name"
          disabled={!selectedMedium}
          formControlProps={{ sx: { maxWidth: '180px', width: '100%' } }}
        />
        <CustomSelect
          options={allDivision}
          label="Division"
          value={division}
          onChange={(val) => setDivision(val as string)}
          labelKey="name"
          valueKey="name"
          formControlProps={{ sx: { maxWidth: '180px', width: '100%' } }}
          disabled={!classes}
        />
        <Tabs
          value={statusTabs.value}
          onChange={statusTabs.onChange}
          sx={{ '& .MuiTabs-flexContainer': { gap: 2, justifyContent: 'end' }, flexGrow: 1 }}
        >
          {STATUS_TABS.map((tab) => (
            <Tab
              key={tab.value}
              value={tab.value}
              sx={{ fontSize: '12px' }}
              label={
                <Box display="flex" justifyContent="center" gap={1} alignItems="center">
                  {tab.label}{' '}
                  <Label variant="soft" color={(tab.color as LabelColor) || 'default'}>
                    {tab.count}
                  </Label>
                </Box>
              }
            />
          ))}
        </Tabs>
      </Box>

      <InvoiceTable
        data={filteredInvoiceData}
        onView={(data) => {
          viewInvoiceDetailsDialog.onTrue();
          setSelectedInvoiceData(data);
        }}
      />
      <CustomDialog
        open={addInvoiceDialog.value}
        handleClose={() => {
          addInvoiceDialog?.onFalse();
        }}
        title={
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Generate Invoice
            </Typography>
          </Box>
        }
        maxWidth="sm"
      >
        <InvoiceForm open={addInvoiceDialog} onClose={handleClose} />
      </CustomDialog>

      <CustomDialog
        open={viewInvoiceDetailsDialog.value}
        handleClose={() => {
          viewInvoiceDetailsDialog?.onFalse();
          setSelectedInvoiceData(null);
        }}
        title={
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Invoice Details
            </Typography>
            {selectedInvoiceData?.invoiceNumber && (
              <Typography variant="caption" color="text.secondary">
                {selectedInvoiceData.invoiceNumber}
              </Typography>
            )}
          </Box>
        }
        maxWidth="sm"
      >
        <InvoiceTableView selectedStudent={selectedInvoiceData} />
      </CustomDialog>
    </Box>
  );
};

export default InvoiceManagement;
