'use client';

import type { LabelColor } from 'src/components/label';

import dayjs from 'dayjs';
import { useTabs } from 'src/hooks/use-tabs';
import { Label } from 'src/components/label';
import { useBoolean } from 'src/hooks/use-boolean';
import React, { useMemo, useCallback } from 'react';
import { Cancel, CheckCircle } from '@mui/icons-material';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import { useConfirmWithUndo } from 'src/hooks/useConfirmWithUndo';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { ConcessionStatusType } from 'src/enums/concession-status-type';
import { Box, Tab, Tabs, Button, MenuList, MenuItem, Typography } from '@mui/material';
import {
  concessionRequestApi,
  useGetConcessionRequestsListQuery,
  useDeleteConcessionRequestMutation,
} from 'src/redux/finance/ConcessionManagement/concessionRequestApi';

import type { IStudentInfo } from '../type';
import type { IViewConcessionRequestProps } from '../../ConcessionAdmin/type';

interface ICombinedProps {
  selectedBoard: string;
  selectedMedium: string;
  onRequestConcession?: (student: IStudentInfo) => void;
  onApprove: (data: IStudentInfo) => void;
  onReject: (data: IStudentInfo) => void;
  onAddConcession: () => void;
  // eslint-disable-next-line react/no-unused-prop-types
  onRemove?: (data: IStudentInfo) => void;
  onViewConcession?: (student: IViewConcessionRequestProps) => void;
  onViewAllConcession?: (student: IStudentInfo) => void;
}

const StudentConcessionTable: React.FC<ICombinedProps> = ({
  selectedBoard,
  selectedMedium,
  onApprove,
  onReject,
  onAddConcession,
  onRequestConcession,
  onViewConcession,
  onViewAllConcession,
}) => {
  const tabs = useTabs(ConcessionStatusType.Pending);
  const [selectedConcession, setSelectedConcession] = React.useState<IStudentInfo | null>(null);
  const removeConcessionDialog = useBoolean();
  const { confirmWithUndo } = useConfirmWithUndo();

  const [deleteConcessionRequest] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteConcessionRequestMutation,
  });

  const {
    data: concessionData = [],
    isLoading: isLoadingConcessionData,
    refetch,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetConcessionRequestsListQuery,
    params: {
      board: selectedBoard,
      medium: selectedMedium,
      status: tabs.value,
    },
  });

  const concessionCounts = useMemo(
    () => ({
      pending:
        concessionData?.filter((i: any) => i?.status === ConcessionStatusType.Pending)?.length || 0,
      approved:
        concessionData?.filter((i: any) => i?.status === ConcessionStatusType.Approved)?.length ||
        0,
      rejected:
        concessionData?.filter((i: any) => i?.status === ConcessionStatusType.Rejected)?.length ||
        0,
    }),
    [concessionData]
  );

  const tableData = useMemo(
    () => concessionData?.filter((i: any) => i?.status === tabs.value) || [],
    [concessionData, tabs.value]
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
    ],
    [concessionCounts.approved, concessionCounts.pending, concessionCounts.rejected]
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
      <Box display="flex" justifyContent="space-between" sx={{ mb: 2, ml: 2 }}>
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

      <CustomizableTable
        tableId="student-concession-table"
        isLoading={isLoadingConcessionData}
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
        columns={[
          {
            id: 'studentName',
            label: 'Student Name',
            align: 'left',
            sticky: true,
            minWidth: 150,
            render: (value, row) => (
              <Typography variant="caption" fontSize="13px">
                {value || '-'} ({row.grNo})
              </Typography>
            ),
          },
          { id: 'rollNo', label: 'Roll No.', align: 'left', minWidth: 90, filterType: 'number' },
          { id: 'classDivision', label: 'Class/Div', align: 'left', minWidth: 100 },
          {
            id: 'concessions',
            label: 'Concession Type',
            align: 'left',
            minWidth: 160,
            render: (concessions) => {
              if (!concessions || !Array.isArray(concessions) || concessions.length === 0) {
                return '-';
              }

              // Extract and join concession types
              const types = concessions
                .map((item) => item.concessionType)
                .filter(Boolean)
                .join(', ');

              return types || '-';
            },
          },
          {
            id: 'requestDate',
            label: 'Request Date',
            align: 'left',
            filterType: 'date',
            minWidth: 130,
            render: (value) => (
              <Typography fontSize="13px">
                {value ? dayjs(value).format('DD-MM-YYYY') : '-'}
              </Typography>
            ),
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
            render: (value, row) => {
              const status = row.status as ConcessionStatusType;
              return (
                <ThreeDotsActions
                  placement="right-top"
                  actions={(prop) => actions({ ...prop, row })}
                  showThreeDots={status !== ConcessionStatusType.Pending}
                  showViewIcon={status === ConcessionStatusType.Pending}
                  showDeleteIcon={status === ConcessionStatusType.Pending}
                  handleDeleteClick={() => {
                    setSelectedConcession(row as IStudentInfo);
                    removeConcessionDialog.onTrue();
                  }}
                  handleViewClick={() => onViewConcession?.(row as IViewConcessionRequestProps)}
                />
              );
            },
          },
        ]}
        data={tableData || []}
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
                      concessionRequestApi.util.updateQueryData(
                        'getConcessionRequestsList',
                        { board: selectedBoard, medium: selectedMedium, status: tabs.value },
                        (draft) => {
                          const index = draft.findIndex(
                            (item: any) => item.id === selectedConcession.id
                          );
                          if (index !== -1) {
                            setDeleteIndex(index);
                            draft.splice(index, 1);
                          }
                        }
                      )
                    );
                    setSelectedConcession(null);
                  },
                  onUndoRestore: () => refetch(),
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
