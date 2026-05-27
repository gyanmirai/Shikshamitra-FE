'use client';

import type { RootState } from 'src/redux/store';
import type { Board, Medium } from 'src/types/school';
import type { LabelColor } from 'src/components/label';

import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { useTabs } from 'src/hooks/use-tabs';
import { Label } from 'src/components/label';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomSelect from 'src/components/custom-select';
import { formatNumber } from 'src/utils/formate_number';
import React, { useMemo, useState, useEffect } from 'react';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import { useConfirmWithUndo } from 'src/hooks/useConfirmWithUndo';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { ConcessionStatusType } from 'src/enums/concession-status-type';
import { Box, Tab, Card, Tabs, Button, Typography } from '@mui/material';
import { useDeleteConcessionRequestMutation } from 'src/redux/finance/ConcessionManagement/concessionRequestApi';
import {
  concessionManagementApi,
  useGetConcessionApplicationsQuery,
} from 'src/redux/finance/ConcessionManagement/concessionManagementApi';

import type { IStudentInfo } from '../type';

// ── Dummy concession data ────────────────────────────────────────────────────
const DUMMY_CONCESSION_DATA: any[] = [
  {
    id: 'cr-001',
    studentId: 'stu-001',
    studentName: 'Riya Patel',
    grNumber: 'GR1023',
    rollNo: '12',
    standardName: '10',
    divisionName: 'A',
    email: 'riya.patel@example.com',
    contactNo: '9876543210',
    concessionTypeName: 'Merit Scholarship',
    concessionAmount: 5000,
    totalFees: 45000,
    pendingFees: 30000,
    status: ConcessionStatusType.Pending,
    createdAt: '2026-04-10T09:00:00.000Z',
    studentConcessionTypeRequestId: 'sctr-001',
  },
  {
    id: 'cr-002',
    studentId: 'stu-002',
    studentName: 'Aarav Shah',
    grNumber: 'GR2045',
    rollNo: '8',
    standardName: '9',
    divisionName: 'B',
    email: 'aarav.shah@example.com',
    contactNo: '9988776655',
    concessionTypeName: 'Financial Aid',
    concessionAmount: 8000,
    totalFees: 42000,
    pendingFees: 28000,
    status: ConcessionStatusType.Approved,
    createdAt: '2026-03-25T09:00:00.000Z',
    studentConcessionTypeRequestId: 'sctr-002',
  },
  {
    id: 'cr-003',
    studentId: 'stu-003',
    studentName: 'Simran Desai',
    grNumber: 'GR3056',
    rollNo: '5',
    standardName: '8',
    divisionName: 'C',
    email: 'simran.desai@example.com',
    contactNo: '9123456780',
    concessionTypeName: 'Sports Quota',
    concessionAmount: 3500,
    totalFees: 38000,
    pendingFees: 25000,
    status: ConcessionStatusType.Rejected,
    createdAt: '2026-03-18T09:00:00.000Z',
    studentConcessionTypeRequestId: 'sctr-003',
  },
  {
    id: 'cr-004',
    studentId: 'stu-004',
    studentName: 'Krish Mehta',
    grNumber: 'GR4012',
    rollNo: '15',
    standardName: '10',
    divisionName: 'A',
    email: 'krish.mehta@example.com',
    contactNo: '9876541234',
    concessionTypeName: 'Sibling Discount',
    concessionAmount: 4000,
    totalFees: 45000,
    pendingFees: 32000,
    status: ConcessionStatusType.Pending,
    createdAt: '2026-04-15T09:00:00.000Z',
    studentConcessionTypeRequestId: 'sctr-004',
  },
  {
    id: 'cr-005',
    studentId: 'stu-005',
    studentName: 'Ananya Gupta',
    grNumber: 'GR5078',
    rollNo: '3',
    standardName: '9',
    divisionName: 'A',
    email: 'ananya.gupta@example.com',
    contactNo: '9012345678',
    concessionTypeName: 'Staff Ward',
    concessionAmount: 12000,
    totalFees: 42000,
    pendingFees: 42000,
    status: ConcessionStatusType.Approved,
    createdAt: '2026-02-20T09:00:00.000Z',
    studentConcessionTypeRequestId: 'sctr-005',
  },
  {
    id: 'cr-006',
    studentId: 'stu-006',
    studentName: 'Rohan Joshi',
    grNumber: 'GR6034',
    rollNo: '22',
    standardName: '8',
    divisionName: 'B',
    email: 'rohan.joshi@example.com',
    contactNo: '9876509876',
    concessionTypeName: 'EWS Concession',
    concessionAmount: 15000,
    totalFees: 38000,
    pendingFees: 38000,
    status: ConcessionStatusType.Pending,
    createdAt: '2026-04-18T09:00:00.000Z',
    studentConcessionTypeRequestId: 'sctr-006',
  },
  {
    id: 'cr-007',
    studentId: 'stu-007',
    studentName: 'Priya Sharma',
    grNumber: 'GR7091',
    rollNo: '11',
    standardName: '10',
    divisionName: 'B',
    email: 'priya.sharma@example.com',
    contactNo: '9123498765',
    concessionTypeName: 'Merit Scholarship',
    concessionAmount: 6000,
    totalFees: 45000,
    pendingFees: 35000,
    status: ConcessionStatusType.Rejected,
    createdAt: '2026-03-12T09:00:00.000Z',
    studentConcessionTypeRequestId: 'sctr-007',
  },
];

interface ICombinedProps {
  onRequestConcession?: (student: IStudentInfo) => void;
  onApprove: (data: IStudentInfo) => void;
  onReject: (data: IStudentInfo) => void;
  onAddConcession: () => void;
  onViewConcession?: (student: IStudentInfo) => void;
  onEditConcession?: (student: IStudentInfo) => void;
  onViewAllConcession?: (student: IStudentInfo) => void;
  selectedBoard: string;
  selectedMedium: string;
  onBoardChange: (value: string) => void;
  onMediumChange: (value: string) => void;
}

const StudentConcessionTable: React.FC<ICombinedProps> = ({
  onApprove,
  onReject,
  onAddConcession,
  onRequestConcession,
  onViewConcession,
  onEditConcession,
  onViewAllConcession,
  selectedBoard,
  selectedMedium,
  onBoardChange,
  onMediumChange,
}) => {
  const tabs = useTabs(ConcessionStatusType.Pending);
  const [selectedConcession, setSelectedConcession] = React.useState<IStudentInfo | null>(null);
  const removeConcessionDialog = useBoolean();
  const { confirmWithUndo } = useConfirmWithUndo();
  const [deleteConcessionRequest] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteConcessionRequestMutation,
  });
  const [boards, setBoards] = useState<Board[]>([]);
  const [mediums, setMediums] = useState<Medium[]>([]);
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  useEffect(() => {
    if (currentYear?.boards) {
      setBoards(currentYear.boards);
      onBoardChange(currentYear.boards[0].id);
      onMediumChange(currentYear.boards[0].educationMediums[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentYear.boards]);

  useEffect(() => {
    setBoards(currentYear?.boards);
    const board = boards?.find((item: any) => item.id === selectedBoard);
    setMediums((board as unknown as Medium)?.educationMediums || []);
  }, [boards, currentYear?.boards, selectedBoard]);

  // Fetch concession requests from API
  const {
    data: allConcessionData,
    isLoading: isLoadingConcessionData,
    isFetching: isFetchingConcessionData,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetConcessionApplicationsQuery,
    params: {
      boardId: selectedBoard,
      educationMediumId: selectedMedium,
    },
    options: {
      skip: !selectedMedium,
    },
  });

  // Use API data if available, otherwise fall back to dummy data
  const allItems = useMemo(
    () => allConcessionData?.items || DUMMY_CONCESSION_DATA,
    [allConcessionData]
  );

  // Filter items by tab
  const filteredItems = useMemo(
    () => allItems.filter((item: any) => item.status === tabs.value),
    [allItems, tabs.value]
  );

  const concessionCounts = useMemo(
    () => ({
      pending: allItems.filter((i: any) => i.status === ConcessionStatusType.Pending).length,
      approved: allItems.filter((i: any) => i.status === ConcessionStatusType.Approved).length,
      rejected: allItems.filter((i: any) => i.status === ConcessionStatusType.Rejected).length,
      cancelled: allItems.filter((i: any) => i.status === ConcessionStatusType.Cancelled).length,
    }),
    [allItems]
  );

  const TABS = useMemo(
    () => [
      {
        label: 'Pending',
        value: ConcessionStatusType.Pending,
        count: concessionCounts.pending,
        color: 'warning',
      },
      {
        label: 'Approved',
        value: ConcessionStatusType.Approved,
        count: concessionCounts.approved,
        color: 'success',
      },
      {
        label: 'Rejected',
        value: ConcessionStatusType.Rejected,
        count: concessionCounts.rejected,
        color: 'error',
      },
      {
        label: 'Cancelled',
        value: ConcessionStatusType.Cancelled,
        count: concessionCounts.cancelled,
        color: 'error',
      },
    ],
    [concessionCounts]
  );

  return (
    <>
      <Card sx={{ boxShadow: 'var(--shadows-4)', px: 1, pt: 1, mb: 1 }}>
        <Box display="flex" justifyContent="space-between">
          <Box sx={{ display: 'flex', gap: 2 }}>
            <CustomSelect
              label="Board"
              options={boards || []}
              labelKey="name"
              valueKey="id"
              value={selectedBoard}
              onChange={(value) => {
                onBoardChange(value as string);
                onMediumChange('');
              }}
              formControlProps={{ sx: { minWidth: '248px', width: '100%' } }}
            />
            <CustomSelect
              label="Medium"
              options={mediums || []}
              labelKey="name"
              disabled={!selectedBoard}
              valueKey="id"
              value={selectedMedium}
              onChange={(value) => onMediumChange(value as string)}
              formControlProps={{ sx: { minWidth: '248px', width: '100%' } }}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Tabs
              value={tabs.value}
              onChange={tabs.onChange}
              sx={{
                '& .MuiTabs-flexContainer': { gap: 2 },
                flexGrow: 1,
              }}
            >
              {TABS.map((tab) => (
                <Tab
                  key={String(tab.value)}
                  value={tab.value}
                  sx={{ fontSize: '12px' }}
                  label={
                    <Box display="flex" justifyContent="center" gap={1} alignItems="center">
                      {tab.label}
                      <Label color={tab.color as LabelColor}>{tab.count}</Label>
                    </Box>
                  }
                />
              ))}
            </Tabs>
          </Box>
        </Box>
      </Card>

      <CustomizableTable
        tableId="student-concession-table"
        isLoading={isLoadingConcessionData || isFetchingConcessionData}
        columns={[
          {
            id: 'studentName',
            label: 'Name(Gr No.)',
            align: 'left',
            sticky: true,
            width: 150,
            minWidth: 100,
            maxWidth: 150,
            render: (value, row) => (
              <Typography variant="caption" fontSize="13px">
                {value || '-'} ({row.grNumber})
              </Typography>
            ),
          },
          {
            id: 'rollNo',
            label: 'Roll No.',
            align: 'left',
            width: 96,
            minWidth: 80,
            maxWidth: 120,
            filterType: 'number',
          },
          {
            id: 'standardName',
            label: 'Class/Div',
            align: 'left',
            width: 110,
            minWidth: 90,
            maxWidth: 140,
            render: (value, row) => (
              <Typography variant="caption" fontSize="13px">
                {value || '-'}-{row.divisionName}
              </Typography>
            ),
          },
          {
            id: 'concessionTypeName',
            label: 'Concession Type',
            align: 'left',
            width: 160,
            minWidth: 140,
            maxWidth: 200,
          },
          {
            id: 'concessionAmount',
            label: 'Amount',
            width: 130,
            minWidth: 110,
            maxWidth: 160,
            render: (value) => (
              <Typography variant="caption" fontSize="13px">
                {formatNumber(value || 0, 'INR')}
              </Typography>
            ),
          },
          {
            id: 'createdAt',
            label: 'Requested On',
            align: 'left',
            width: 140,
            minWidth: 120,
            maxWidth: 160,
            render: (value) =>
              value ? (
                <Typography variant="caption" fontSize="13px">
                  {dayjs(value).format('DD-MM-YYYY')}
                </Typography>
              ) : (
                '-'
              ),
          },
          {
            id: 'actions',
            label: 'Action',
            align: 'left',
            width: 80,
            minWidth: 64,
            isSort: false,
            isFilter: false,
            sticky: true,
            render: (value, row) => {
              const isPending = row.status === ConcessionStatusType.Pending;
              return (
                <ThreeDotsActions
                  placement="right-top"
                  showViewIcon
                  showEditIcon={isPending}
                  handleDeleteClick={
                    isPending
                      ? () => {
                          setSelectedConcession(row as IStudentInfo);
                          removeConcessionDialog.onTrue();
                        }
                      : undefined
                  }
                  showThreeDots={false}
                  handleEditClick={
                    isPending ? () => onEditConcession?.(row as IStudentInfo) : undefined
                  }
                  handleViewClick={() => onViewConcession?.(row as IStudentInfo)}
                />
              );
            },
          },
        ]}
        data={filteredItems}
        noDataText={
          <>
            No Concessions Found{' '}
            <Box
              component="span"
              onClick={onAddConcession}
              color="primary.main"
              fontWeight={600}
              sx={{
                '&:hover': { cursor: 'pointer', textDecoration: 'underline' },
              }}
            >
              Add Concession
            </Box>
          </>
        }
      />

      <ConfirmDialog
        open={removeConcessionDialog.value}
        onClose={() => {
          setSelectedConcession(null);
          removeConcessionDialog.onFalse();
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete concession for{' '}
            <strong>&quot;{selectedConcession?.studentName}&quot;?</strong>
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => {
              removeConcessionDialog.onFalse();
              if (selectedConcession) {
                confirmWithUndo({
                  item: selectedConcession,
                  onOptimisticRemove: (dispatchFn, setDeleteIndex) => {
                    dispatchFn(
                      concessionManagementApi.util.updateQueryData(
                        'getConcessionApplications',
                        {
                          boardId: selectedBoard,
                          educationMediumId: selectedMedium,
                        },
                        (draft) => {
                          const index = draft?.items?.findIndex(
                            (item: any) => item.id === selectedConcession.id
                          );
                          if (index !== -1) {
                            setDeleteIndex(index);
                            draft.items.splice(index, 1);
                          }
                        }
                      )
                    );
                    setSelectedConcession(null);
                  },
                  onUndoRestore: () => {},
                  onCommit: () => deleteConcessionRequest(selectedConcession.id),
                });
              }
            }}
          >
            Yes
          </Button>
        }
      />
    </>
  );
};

export default StudentConcessionTable;
