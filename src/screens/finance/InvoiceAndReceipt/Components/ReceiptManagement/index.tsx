import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';
import type { Board, Medium, Division, Standards, Organization } from 'src/types/school';

import { useSelector } from 'react-redux';
import { useTabs } from 'src/hooks/use-tabs';
import { Label } from 'src/components/label';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import { Box, Tab, Tabs, Typography } from '@mui/material';
import React, { useMemo, useState, useEffect } from 'react';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetReceiptDataQuery } from 'src/redux/invoiceAndReceipt/receiptApi';

import ReceiptTable from './Components/receiptTable';
import StudentTableView from './Components/StudentReceiptTable';

import type { IFeeReceipt } from './type';

const STATIC_RECEIPTS: IFeeReceipt[] = [
  {
    student: 'Dharmik Jinjala',
    rollNo: '101',
    class: '10',
    division: 'A',
    totalPaidFees: 10000,
    totalPendingFees: 5000,
    grNo: 111,
    lastPaymentDate: '10-08-2025',
    paymentTerm: 'Monthly',
    status: 'Partial',
  },
  {
    student: 'Prerna Atre',
    rollNo: '102',
    class: '10',
    division: 'A',
    totalPaidFees: 13500,
    totalPendingFees: 0,
    grNo: 112,
    lastPaymentDate: '12-08-2025',
    paymentTerm: 'Quarterly',
    status: 'Paid',
  },
  {
    student: 'Aarav Mehta',
    rollNo: '103',
    class: '10',
    division: 'B',
    totalPaidFees: 9500,
    totalPendingFees: 5500,
    grNo: 113,
    lastPaymentDate: '15-08-2025',
    paymentTerm: 'Half-Yearly',
    status: 'Partial',
  },
  {
    student: 'Siya Patel',
    rollNo: '104',
    class: '10',
    division: 'A',
    totalPaidFees: 15000,
    totalPendingFees: 0,
    grNo: 114,
    lastPaymentDate: '17-08-2025',
    paymentTerm: 'Annually',
    status: 'Paid',
  },
  {
    student: 'Rohan Sharma',
    rollNo: '105',
    class: '10',
    division: 'B',
    totalPaidFees: 8000,
    totalPendingFees: 7000,
    grNo: 115,
    lastPaymentDate: '18-08-2025',
    paymentTerm: 'Monthly',
    status: 'Partial',
  },
  {
    student: 'Ananya Desai',
    rollNo: '106',
    class: '9',
    division: 'A',
    totalPaidFees: 12000,
    totalPendingFees: 0,
    grNo: 116,
    lastPaymentDate: '20-08-2025',
    paymentTerm: 'Quarterly',
    status: 'Paid',
  },
  {
    student: 'Vivaan Shah',
    rollNo: '107',
    class: '9',
    division: 'B',
    totalPaidFees: 0,
    totalPendingFees: 11000,
    grNo: 117,
    lastPaymentDate: '-',
    paymentTerm: 'Half-Yearly',
    status: 'Pending',
  },
];

const ReceiptManagement = () => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [mediums, setMediums] = useState<Medium[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<string>('');
  const [selectedMedium, setSelectedMedium] = useState<string>('');
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [classes, setClass] = useState<string>('');
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  const [division, setDivision] = useState<string>('');
  const viewReceiptDetailsDialog = useBoolean();
  const [selectedReceiptData, setSelectedReceiptData] = useState<IFeeReceipt | null>(null);

  const { data: receiptData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetReceiptDataQuery,
  });

  const tableData = receiptData?.length ? receiptData : STATIC_RECEIPTS;

  const statusTabs = useTabs('All');

  const getPaymentStatus = (row: IFeeReceipt) => {
    if (row.totalPendingFees <= 0) return 'Paid';
    if (row.totalPaidFees > 0) return 'Partial';
    return 'Pending';
  };

  const statusCounts = useMemo(() => {
    const list = tableData || [];
    return {
      All: list.length,
      Paid: list.filter((i: IFeeReceipt) => getPaymentStatus(i) === 'Paid').length,
      Partial: list.filter((i: IFeeReceipt) => getPaymentStatus(i) === 'Partial').length,
      Pending: list.filter((i: IFeeReceipt) => getPaymentStatus(i) === 'Pending').length,
    };
  }, [tableData]);

  const STATUS_TABS = useMemo(
    () => [
      { value: 'All', label: 'All', count: statusCounts.All, color: 'default' },
      { value: 'Paid', label: 'Paid', count: statusCounts.Paid, color: 'success' },
      { value: 'Partial', label: 'Partial', count: statusCounts.Partial, color: 'info' },
      { value: 'Pending', label: 'Pending', count: statusCounts.Pending, color: 'warning' },
    ],
    [statusCounts]
  );

  const filteredReceiptData = useMemo(() => {
    const list = tableData || [];
    if (statusTabs.value === 'All') return list;
    return list.filter((i: IFeeReceipt) => getPaymentStatus(i) === statusTabs.value);
  }, [tableData, statusTabs.value]);

  const { currentYear } = useSelector((state: RootState) => state.globalState);

  // Sync boards from current year
  useEffect(() => {
    setBoards(currentYear?.boards || []);
  }, [currentYear?.boards]);

  // Board → Medium cascade
  useEffect(() => {
    const board = boards.find((item: Board) => item.id === selectedBoard);
    setMediums(board?.educationMediums || []);
  }, [boards, selectedBoard]);

  // Medium → Class cascade
  useEffect(() => {
    const medium = mediums?.find((item: Medium) => item.id === selectedMedium);
    const allClasses =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];
    setAllClass(allClasses);
    setClass('');
  }, [mediums, selectedMedium]);

  // Class → Division cascade
  useEffect(() => {
    setAllDivision(allClass.find((org: any) => org?.name === classes)?.divisions || []);
    setDivision('');
  }, [allClass, classes]);

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
          options={allClass || []}
          label="Class"
          value={classes}
          onChange={(val) => setClass(val as string)}
          labelKey="name"
          valueKey="name"
          disabled={!selectedMedium}
          formControlProps={{ sx: { maxWidth: '180px', width: '100%' } }}
        />
        <CustomSelect
          options={allDivision || []}
          label="Division"
          value={division}
          onChange={(val) => setDivision(val as string)}
          labelKey="name"
          valueKey="name"
          disabled={!classes}
          formControlProps={{ sx: { maxWidth: '180px', width: '100%' } }}
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

      <ReceiptTable
        data={filteredReceiptData}
        onView={(data) => {
          viewReceiptDetailsDialog.onTrue();
          setSelectedReceiptData(data);
        }}
      />
      <CustomDialog
        open={viewReceiptDetailsDialog.value}
        handleClose={() => {
          viewReceiptDetailsDialog?.onFalse();
          setSelectedReceiptData(null);
        }}
        title={
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Receipt Details
            </Typography>
            {selectedReceiptData && (
              <Typography variant="caption" color="text.secondary">
                {selectedReceiptData.student}
              </Typography>
            )}
          </Box>
        }
        maxWidth="sm"
      >
        <StudentTableView selectedStudent={selectedReceiptData} />
      </CustomDialog>
    </Box>
  );
};

export default ReceiptManagement;
