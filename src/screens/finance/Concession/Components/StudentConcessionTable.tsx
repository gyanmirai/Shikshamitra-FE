'use client';

import type { RootState } from 'src/redux/store';
import type { Board, Medium } from 'src/types/school';
import type { LabelColor } from 'src/components/label';

import { useSelector } from 'react-redux';
import { useTabs } from 'src/hooks/use-tabs';
import { Label } from 'src/components/label';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomSelect from 'src/components/custom-select';
import { Cancel, CheckCircle } from '@mui/icons-material';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import { useConfirmWithUndo } from 'src/hooks/useConfirmWithUndo';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { ConcessionStatusType } from 'src/enums/concession-status-type';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Box, Tab, Tabs, Card, Button, MenuList, MenuItem, Typography } from '@mui/material';
import { useDeleteConcessionRequestMutation } from 'src/redux/finance/ConcessionManagement/concessionRequestApi';
import {
  concessionManagementApi,
  useGetConcessionApplicationsQuery,
} from 'src/redux/finance/ConcessionManagement/concessionManagementApi';

import type { IStudentInfo } from '../type';

interface ICombinedProps {
  onRequestConcession?: (student: IStudentInfo) => void;
  onApprove: (data: IStudentInfo) => void;
  onReject: (data: IStudentInfo) => void;
  onAddConcession: () => void;
  // eslint-disable-next-line react/no-unused-prop-types
  onRemove?: (data: IStudentInfo) => void;
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
  const tabs = useTabs(ConcessionStatusType.Draft);
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
      // Only set initial values if not already selected
      if (!selectedBoard) {
        onBoardChange(currentYear.boards[0].id);
        onMediumChange(currentYear.boards[0].educationMediums[0].id);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentYear.boards]);

  useEffect(() => {
    const board = currentYear?.boards?.find((item: any) => item.id === selectedBoard);
    setMediums(board?.educationMediums || []);
  }, [selectedBoard, currentYear?.boards]);

  // Fetch all concession requests for count badges (no status filter)
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
      status: tabs.value,
    },
    options: {
      skip: !selectedMedium, // IMPORTANT
    },
  });

  const concessionCounts = useMemo(
    () => ({
      draft: allConcessionData?.draftCount || 0,
      pending: allConcessionData?.pendingCount || 0,
      approved: allConcessionData?.approvedCount || 0,
      rejected: allConcessionData?.rejectedCount || 0,
    }),
    [allConcessionData]
  );

  const TABS = useMemo(
    () => [
      {
        label: 'Draft',
        value: ConcessionStatusType.Draft,
        count: concessionCounts.draft,
        color: 'info',
      },
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
    ],
    [
      concessionCounts.approved,
      concessionCounts.draft,
      concessionCounts.pending,
      concessionCounts.rejected,
    ]
  );

  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <MenuList>
        {row.status === ConcessionStatusType.Rejected ? (
          <MenuItem
            onClick={() => {
              onApprove(row as IStudentInfo);
              pop.onClose();
            }}
          >
            <CheckCircle sx={{ width: '20px', height: '20px', color: 'success.main' }} /> Approve
          </MenuItem>
        ) : (
          <MenuItem
            onClick={() => {
              onReject(row as IStudentInfo);
              pop.onClose();
            }}
          >
            <Cancel sx={{ width: '20px', height: '20px', color: 'error.main' }} /> Reject
          </MenuItem>
        )}
      </MenuList>
    ),
    [onApprove, onReject]
  );

  return (
    <>
      <Card sx={{ boxShadow: 'var(--shadows-4)', px: 1.5, pt: 1.5, pb: 1.5, mb: 1 }}>
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
                  key={tab.value}
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
            label: 'Student Name',
            align: 'left',
            sticky: true,
            minWidth: 150,
            render: (value, row) => (
              <Typography variant="caption" fontSize="13px">
                {value || '-'} ({row.grNumber})
              </Typography>
            ),
          },
          { id: 'rollNo', label: 'Roll No.', align: 'left', minWidth: 90, filterType: 'number' },
          {
            id: 'standardName',
            label: 'Class/Div',
            align: 'left',
            minWidth: 100,
            render: (value, row) => (
              <Typography variant="caption" fontSize="13px">
                {value || '-'}-{row.divisionName}
              </Typography>
            ),
          },
          {
            id: 'totalConcessionApplication',
            label: 'Total Concession Application',
            align: 'left',
            minWidth: 160,
          },
          { id: 'email', label: 'Email', align: 'left', minWidth: 150 },
          { id: 'contactNo', label: 'Contact No.', align: 'left', minWidth: 120 },
          {
            id: 'actions',
            label: 'Action',
            align: 'left',
            minWidth: 40,
            isSort: false,
            isFilter: false,
            sticky: true,
            render: (value, row) => (
              <ThreeDotsActions
                placement="right-top"
                showViewIcon
                showEditIcon={tabs.value === ConcessionStatusType.Draft}
                handleDeleteClick={() => {
                  setSelectedConcession(row as IStudentInfo);
                  removeConcessionDialog.onTrue();
                }}
                showThreeDots={false}
                handleEditClick={() => onEditConcession?.(row as IStudentInfo)}
                handleViewClick={() => onViewConcession?.(row as IStudentInfo)}
              />
            ),
          },
        ]}
        data={allConcessionData?.items || []}
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
                    // Optimistic update logic
                    dispatchFn(
                      concessionManagementApi.util.updateQueryData(
                        'getConcessionApplications',
                        {
                          boardId: selectedBoard,
                          educationMediumId: selectedMedium,
                          status: tabs.value,
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
