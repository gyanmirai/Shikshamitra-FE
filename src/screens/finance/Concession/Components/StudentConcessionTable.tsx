'use client';

import type { LabelColor } from 'src/components/label';

import dayjs from 'dayjs';
import { useTabs } from 'src/hooks/use-tabs';
import { Label } from 'src/components/label';
import React, { useMemo, useCallback } from 'react';
import { Cancel, CheckCircle } from '@mui/icons-material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { ConcessionStatusType } from 'src/enums/concession-status-type';
import { Box, Tab, Tabs, MenuList, MenuItem, Typography } from '@mui/material';
import { useGetConcessionRequestsQuery } from 'src/redux/finance/ConcessionManagement/concessionRequestApi';

import type { IStudentInfo } from '../type';
import type { IViewConcessionRequestProps } from '../../ConcessionAdmin/type';

interface ICombinedProps {
  data: any[];
  onRequestConcession?: (student: IStudentInfo) => void;
  onApprove: (data: IStudentInfo) => void;
  onReject: (data: IStudentInfo) => void;
  onAddConcession: () => void;
  onRemove: (data: IStudentInfo) => void;
  onViewConcession?: (student: IViewConcessionRequestProps) => void;
  onViewAllConcession?: (student: IStudentInfo) => void;
}

const StudentConcessionTable: React.FC<ICombinedProps> = ({
  data,
  onApprove,
  onReject,
  onRemove,
  onAddConcession,
  onRequestConcession,
  onViewConcession,
  onViewAllConcession,
}) => {
  const { data: concessionData = [], isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetConcessionRequestsQuery,
  });
  const tabs = useTabs(ConcessionStatusType.Pending);
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
        isLoading={isLoading}
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
                  handleDeleteClick={() => onRemove(row as IStudentInfo)}
                  handleViewClick={() => onViewConcession?.(row as IViewConcessionRequestProps)}
                />
              );
            },
          },
        ]}
        data={tableData || []}
      />
    </>
  );
};

export default StudentConcessionTable;
