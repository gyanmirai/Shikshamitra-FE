import type { LabelColor } from 'src/components/label';

import dayjs from 'dayjs';
import { useTabs } from 'src/hooks/use-tabs';
import { Label } from 'src/components/label';
import { useTheme } from '@mui/material/styles';
import React, { useMemo, useCallback } from 'react';
import { Cancel, CheckCircle } from '@mui/icons-material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { ChargesPaymentStatus } from 'src/enums/fee-charges-status';
import { Box, Tab, Tabs, MenuItem, MenuList, Typography } from '@mui/material';

import type { IChargeData } from './type';

const ChargesTable = ({
  data,
  onView,
  onEdit,
  onAddCharge,
  onApprove,
  onReject,
  onRemove,
}: {
  data: IChargeData[];
  onView: (data: IChargeData) => void;
  onEdit: (data: IChargeData) => void;
  onAddCharge: () => void;
  onApprove: (data: IChargeData) => void;
  onReject: (data: IChargeData) => void;
  onRemove: (data: IChargeData) => void;
}) => {
  const theme = useTheme();

  // 🔹 Tab Counts
  const chargeCounts = useMemo(
    () => ({
      pending:
        data?.filter((i: IChargeData) => i.status === ChargesPaymentStatus.Pending)?.length || 0,
      approved:
        data?.filter((i: IChargeData) => i.status === ChargesPaymentStatus.Approved)?.length || 0,
      rejected:
        data?.filter((i: IChargeData) => i.status === ChargesPaymentStatus.Rejected)?.length || 0,
    }),
    [data]
  );

  const tabs = useTabs(ChargesPaymentStatus.Pending);

  const TABS = useMemo(
    () => [
      {
        label: 'Pending',
        value: ChargesPaymentStatus.Pending,
        count: chargeCounts.pending,
        color: 'warning',
      },
      {
        label: 'Approved',
        value: ChargesPaymentStatus.Approved,
        count: chargeCounts.approved,
        color: 'success',
      },
      {
        label: 'Rejected',
        value: ChargesPaymentStatus.Rejected,
        count: chargeCounts.rejected,
        color: 'error',
      },
    ],
    [chargeCounts]
  );

  // 🔹 Filter Table Data by Selected Tab
  const tableData = useMemo(
    () =>
      data
        ?.filter((i: IChargeData) => i.status === tabs.value)
        ?.map((item: IChargeData) => ({
          ...item,
          amount:
            item.amount !== undefined && item.amount !== null
              ? parseFloat(String(item.amount).replace(/,/g, ''))
              : 0,
          description: item.description || '-',
          dueDate: item.dueDate ? dayjs(item.dueDate).format('DD-MM-YYYY') : '-',
        })),
    [data, tabs.value]
  );

  const actions = useCallback(
    ({ popover: pop, row }: any) => {
      const isPending = row.status === ChargesPaymentStatus.Pending;
      return (
        <MenuList>
          {row.status === ChargesPaymentStatus.Rejected ? (
            <MenuItem
              onClick={() => {
                onApprove(row as IChargeData);
                pop.onClose();
              }}
            >
              <CheckCircle sx={{ width: '20px', height: '20px', color: 'success.main' }} /> Approve
            </MenuItem>
          ) : (
            <MenuItem
              onClick={() => {
                onReject(row as IChargeData);
                pop.onClose();
              }}
            >
              <Cancel sx={{ width: '20px', height: '20px', color: 'error.main' }} /> Reject
            </MenuItem>
          )}
        </MenuList>
      );
    },
    [onApprove, onReject]
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" sx={{ mt: '4px', mb: 2 }}>
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
              sx={{ fontSize: '12px' }}
              key={tab.value}
              label={
                <Box display="flex" justifyContent="center" gap={1} alignItems="center">
                  {tab.label}
                  <Label color={(tab?.color as LabelColor) || 'default'}>{tab.count}</Label>
                </Box>
              }
              value={tab.value}
            />
          ))}
        </Tabs>
      </Box>

      <CustomizableTable
        tableId="charges-table"
        noDataText={
          <>
            No Charges Found{' '}
            <Box
              onClick={onAddCharge}
              color="primary.main"
              fontWeight={600}
              sx={{
                '&:hover': {
                  cursor: 'pointer',
                  textDecoration: 'underline',
                },
              }}
            >
              Add Charge
            </Box>
          </>
        }
        columns={[
          {
            id: 'studentName',
            label: 'Student Name',
            align: 'left',
            isFilter: true,
            minWidth: 140,
            sticky: true,
            render: (value, row) => (
              <Typography variant="caption" fontSize="13px">
                {value || '-'} ({row.grNo})
              </Typography>
            ),
          },
          {
            id: 'rollNo',
            label: 'Roll No.',
            align: 'left',
            minWidth: 90,
            filterType: 'number',
            isFilter: true,
          },
          {
            id: 'class',
            label: 'Class/Div',
            align: 'left',
            minWidth: 100,
            isFilter: true,
            render: (value, row) => (
              <Typography variant="caption" fontSize="13px">
                {row.class ? `${row.class}${row.division ? ` - ${row.division}` : ''}` : '-'}
              </Typography>
            ),
          },
          {
            id: 'category',
            label: 'Charge Category',
            align: 'left',
            isFilter: true,
            minWidth: 160,
          },
          {
            id: 'amount',
            label: 'Amount',
            filterType: 'number',
            align: 'left',
            isFilter: true,
            render: (value) => `₹ ${parseFloat(value).toLocaleString()}`,
          },
          {
            id: 'description',
            label: 'Description',
            align: 'left',
            render: (value) => (
              <Typography
                variant="caption"
                fontSize="13px"
                sx={{
                  maxWidth: 250,
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                }}
              >
                {value || '-'}
              </Typography>
            ),
          },
          {
            id: 'dueDate',
            label: 'Due Date',
            align: 'left',
            filterType: 'date',
            minWidth: '110px',
            // render: (value) => (
            //   <Typography fontSize="13px">
            //     {value ? dayjs(value).format('DD-MM-YYYY') : '-'}
            //   </Typography>
            // ),
          },
          {
            id: 'actions',
            label: 'Action',
            align: 'left',
            isSort: false,
            isFilter: false,
            minWidth: 40,
            sticky: true,
            render(value, row) {
              return (
                <ThreeDotsActions
                  placement="right-top"
                  actions={(prop) => actions({ ...prop, row })}
                  showViewIcon={row.status === 1}
                  showEditIcon={row.status === 1}
                  showThreeDots={row.status !== 1}
                  showDeleteIcon={row.status === 1}
                  handleDeleteClick={() => onRemove(row as IChargeData)}
                  handleViewClick={() => onView(row as IChargeData)}
                  handleEditClick={() => onEdit(row as IChargeData)}
                />
              );
            },
          },
        ]}
        data={tableData || []}
      />
    </Box>
  );
};

export default ChargesTable;
