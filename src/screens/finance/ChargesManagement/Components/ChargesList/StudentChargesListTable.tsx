import type { LabelColor } from 'src/components/label';

import dayjs from 'dayjs';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import React, { useMemo, useCallback } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import { formatNumber } from 'src/utils/formate_number';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Grid, MenuItem, MenuList, Typography } from '@mui/material';
import {
  ChargesPaymentStatus,
  ChargesPaymentStatusColors,
  ChargesPaymentStatusOptions,
} from 'src/enums/fee-charges-status';

import type {
  IChargeData,
  ISingleCharge,
  IStudentChargeData,
} from '../ChargesManage/Component/type';

const ViewStudentAllCharges = ({
  data,
  onDelete,
}: {
  data: IStudentChargeData;
  onDelete: (charge: IChargeData) => void;
}) => {
  // row actions
  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <MenuList>
        <MenuItem
          onClick={() => {
            onDelete?.(row as IChargeData);
            pop.onClose();
          }}
        >
          <Iconify icon={GlobalIcons.cancel} />
          Remove
        </MenuItem>
      </MenuList>
    ),
    [onDelete]
  );

  const tableData = useMemo(
    () =>
      (data?.charges || []).map((item: ISingleCharge) => ({
        ...item,
        category: item.category || '-', // fallback if missing
        description: item.description || '-', // ensure description exists
        amount:
          item.amount !== undefined && item.amount !== null
            ? parseFloat(String(item.amount).replace(/,/g, '')) // clean string to number
            : 0,
        dueDate: item.dueDate ? dayjs(item.dueDate).toISOString() : null, // ISO for datepicker/render
        priority: item.priority ?? '-', // numeric/enum fallback
        status: item.status ?? ChargesPaymentStatus.Pending, // default enum if missing
      })),
    [data]
  );

  return (
    <Scrollbar sx={{ height: '500px', p: 2 }}>
      {/* Student Info */}
      <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2, mb: 2 }}>
        <Typography variant="h6" mb={1} color="primary.main">
          Student Information
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Student Name
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {data?.studentName || '-'}
            </Typography>
          </Grid>

          <Grid size={{ xs: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Roll No.
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {data?.rollNo || '-'}
            </Typography>
          </Grid>

          <Grid size={{ xs: 3 }}>
            <Typography variant="body2" color="text.secondary">
              GR No.
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {data?.grNo || '-'}
            </Typography>
          </Grid>

          <Grid size={{ xs: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Class/Division
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {`${data?.class || '-'} / ${data?.division || '-'}`}
            </Typography>
          </Grid>
        </Grid>
      </Box>
      <Typography variant="h6" ml={1} mb={1} color="primary.main">
        Charges List
      </Typography>
      {/* Charges Table */}
      <CustomizableTable
        tableId="charges-table"
        noDataText="No charges found"
        columns={[
          {
            id: 'category',
            label: 'Category',
            align: 'left',
            sticky: true,
            minWidth: 150,
          },
          {
            id: 'description',
            label: 'Description',
            align: 'left',
            minWidth: 220,
            render: (value) => (
              <Typography variant="caption" sx={{ fontSize: '13px' }}>
                {value}
              </Typography>
            ),
          },
          {
            id: 'amount',
            label: 'Amount',
            align: 'left',
            minWidth: 120,
            render(value, row) {
              return (
                <Typography variant="caption" fontSize="13px">
                  {formatNumber(row.amount, 'INR')}
                </Typography>
              );
            },
          },
          {
            id: 'dueDate',
            label: 'Due Date',
            align: 'left',
            filterType: 'date',
            minWidth: 120,
            render: (value) => (
              <Typography variant="caption" fontSize="13px">
                {dayjs(value).format('DD-MM-YYYY')}
              </Typography>
            ),
          },
          {
            id: 'priority',
            label: 'Priority',
            align: 'left',
            minWidth: 100,
          },
          {
            id: 'status',
            label: 'Status',
            align: 'left',
            filterType: 'enum',
            enumOptions: ChargesPaymentStatusOptions,
            sticky: true,
            render(value, row) {
              const color = ChargesPaymentStatusColors[value as ChargesPaymentStatus] as LabelColor;
              return (
                <Label
                  color={
                    color as 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'
                  }
                >
                  {ChargesPaymentStatus[value as ChargesPaymentStatus]}
                </Label>
              );
            },
          },
          {
            id: 'actions',
            label: 'Action',
            align: 'left',
            isSort: false,
            isFilter: false,
            sticky: true,
            minWidth: 40,
            render: (value, row) => (
              <ThreeDotsActions
                placement="right-center"
                actions={(prop) => actions({ ...prop, row })}
              />
            ),
          },
        ]}
        data={tableData || []}
      />
    </Scrollbar>
  );
};

export default ViewStudentAllCharges;
