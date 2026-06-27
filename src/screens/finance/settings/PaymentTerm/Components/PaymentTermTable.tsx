'use client';

import type { IColumn } from 'src/components/customizabaleTable/types';

import React, { useMemo } from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import { Box, MenuItem, Typography } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { usePatchPaymentTermMutation } from 'src/redux/finance/paymentTerm';

import type { IPaymentTerm, PaymentTermStatus, IPaymentTermTableProps } from '../type';

const STATUS_COLOR: Record<PaymentTermStatus, 'success' | 'warning' | 'error' | 'default'> = {
  Active: 'success',
  Archived: 'default',
};

const PaymentTermTable: React.FC<IPaymentTermTableProps> = ({
  data,
  addPaymentTerm,
  setEditData,
  onEdit,
  onDelete,
}) => {
  const [patchPaymentTerm] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: usePatchPaymentTermMutation,
  });

  const columns: IColumn[] = useMemo(
    () => [
      {
        id: 'paymentTermName',
        label: 'Name',
        align: 'left',
        render: (value) => (
          <Typography variant="subtitle2" fontWeight={600} fontSize="13px">
            {value}
          </Typography>
        ),
      },
      {
        id: 'boardName',
        label: 'Board',
        align: 'left',
        render: (value) => (
          <Typography variant="caption" fontSize="13px">
            {value || '-'}
          </Typography>
        ),
      },
      {
        id: 'academicYearName',
        label: 'Academic Year',
        align: 'left',
        render: (value) => (
          <Typography variant="caption" fontSize="13px">
            {value || '-'}
          </Typography>
        ),
      },
      {
        id: 'installments',
        label: 'Installments',
        align: 'center',
        render: (value) => (
          <Typography variant="caption" fontSize="13px">
            {Array.isArray(value) ? value.length : 0}
          </Typography>
        ),
      },
      {
        id: 'status',
        label: 'Status',
        align: 'left',
        render: (value) => (
          <Label color={STATUS_COLOR[value as PaymentTermStatus] ?? 'default'}>{value}</Label>
        ),
      },
      {
        id: 'updatedBy',
        label: 'Updated By',
        align: 'left',
        render: (value) => (
          <Typography variant="caption" fontSize="13px">
            {value || '-'}
          </Typography>
        ),
      },
      {
        id: 'action',
        label: 'Actions',
        align: 'left',
        isSort: false,
        isFilter: false,
        sticky: true,
        minWidth: 80,
        render: (_, row) => {
          const term = row as IPaymentTerm;
          return (
            <ThreeDotsActions
              showThreeDots
              showEditIcon
              handleEditClick={() => onEdit(term)}
              showDeleteIcon
              disableDeleteIcon={term.isUsedInDownstream}
              handleDeleteClick={() => onDelete(term)}
              actions={({ popover }) => (
                <MenuItem
                  onClick={async () => {
                    popover.onClose();
                    try {
                      const newStatus: PaymentTermStatus =
                        term.status === 'Active' ? 'Archived' : 'Active';
                      await patchPaymentTerm({ id: term.id, body: { status: newStatus } });
                      shikshaMitraToast.success({
                        message: `Payment Term "${term.paymentTermName}" marked as ${newStatus} successfully.`,
                      });
                    } catch {
                      shikshaMitraToast.error({ message: 'Failed to update status.' });
                    }
                  }}
                >
                  <Iconify
                    icon={term.status === 'Active' ? 'mdi:archive-outline' : 'mdi:eye-outline'}
                    sx={{ mr: 1, width: 18, height: 18 }}
                  />
                  {term.status === 'Active' ? 'Archive' : 'Activate'}
                </MenuItem>
              )}
            />
          );
        },
      },
    ],
    [onEdit, onDelete, patchPaymentTerm]
  );

  return (
    <CustomizableTable
      tableId="payment-term-table"
      noDataText={
        <>
          No Payment Term data found.{' '}
          <Box
            component="span"
            onClick={() => {
              addPaymentTerm.onTrue();
              setEditData(null);
            }}
            color="primary.main"
            fontWeight={600}
            sx={{
              '&:hover': {
                cursor: 'pointer',
                color: 'primary.main',
                textDecoration: 'underline',
              },
            }}
          >
            Add Payment Term
          </Box>
        </>
      }
      columns={columns}
      data={data || []}
    />
  );
};

export default PaymentTermTable;
