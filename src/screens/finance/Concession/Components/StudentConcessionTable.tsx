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
import { Cancel, CheckCircle } from '@mui/icons-material';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import { useConfirmWithUndo } from 'src/hooks/useConfirmWithUndo';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { ConcessionStatusType } from 'src/enums/concession-status-type';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Box, Tab, Tabs, Card, Button, MenuList, MenuItem, Typography } from '@mui/material';
import {
  concessionRequestApi,
  useDeleteConcessionRequestMutation,
} from 'src/redux/finance/ConcessionManagement/concessionRequestApi';

import concessionData from '../../../../../concession.json';

import type { IStudentInfo } from '../type';
import type { IViewConcessionRequestProps } from '../../ConcessionAdmin/type';

interface ICombinedProps {
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
  // Local state to store filtered boards based on academic year
  const [boards, setBoards] = useState<Board[]>([]);
  const [mediums, setMediums] = useState<Medium[]>([]);
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const [selectedBoard, setSelectedBoard] = useState<string>('');
  const [selectedMedium, setSelectedMedium] = useState<string>('');

  // State to store the selected student concession data
  // null when no student is selected
  useEffect(() => {
    // Filter boards based on academic year ID from edit data
    setBoards(currentYear?.boards);
    const board = boards?.find((item: any) => item.id === selectedBoard);
    setMediums((board as unknown as Board)?.educationMediums || []);
  }, [boards, currentYear?.boards, selectedBoard]);

  const concessionCounts = useMemo(
    () => ({
      pending:
        concessionData?.concessionRequestData?.filter(
          (i: any) => i?.status === ConcessionStatusType.Pending
        )?.length || 0,
      approved:
        concessionData?.concessionRequestData?.filter(
          (i: any) => i?.status === ConcessionStatusType.Approved
        )?.length || 0,
      rejected:
        concessionData?.concessionRequestData?.filter(
          (i: any) => i?.status === ConcessionStatusType.Rejected
        )?.length || 0,
    }),
    []
  );

  const tableData = useMemo(
    () => concessionData?.concessionRequestData?.filter((i: any) => i?.status === tabs.value) || [],
    [tabs.value]
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
      <Card sx={{ boxShadow: 'var(--shadows-4)', px: 1.5, pt: 1.5, pb: 1.5 }}>
        <Box display="flex" justifyContent="space-between">
          <Box sx={{ display: 'flex', gap: 2 }}>
            <CustomSelect
              label="Board"
              options={boards || []}
              labelKey="name"
              valueKey="id"
              value={selectedBoard}
              onChange={(value) => {
                setSelectedBoard(value as string);
                setSelectedMedium('');
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
              onChange={(value) => setSelectedMedium(value as string)}
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
        // isLoading={isLoadingConcessionData}
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
