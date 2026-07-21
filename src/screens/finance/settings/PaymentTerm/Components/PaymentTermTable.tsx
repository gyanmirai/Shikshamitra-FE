'use client';

import type { IColumn } from 'src/components/customizabaleTable/types';

import React, { useMemo } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, Chip, Stack, Switch, Typography } from '@mui/material';
import {
  useArchivePaymentTermMutation,
  useRestorePaymentTermMutation,
} from 'src/redux/finance/paymentTerm';

import type { IPaymentTerm, IPaymentTermTableProps } from '../type';

const PaymentTermTable: React.FC<IPaymentTermTableProps> = ({
  data,
  loading,
  addPaymentTerm,
  setEditData,
  onEdit,
  onDelete,
}) => {
  const [archivePaymentTerm] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useArchivePaymentTermMutation,
  });
  const [restorePaymentTerm] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useRestorePaymentTermMutation,
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
        id: 'totalInstallments',
        label: 'Installments',
        align: 'left',
        render: (value, row) => {
          const term = row as IPaymentTerm;
          const count =
            typeof value === 'number'
              ? value
              : Array.isArray(term.installments)
                ? term.installments.length
                : 0;
          return (
            <Typography variant="caption" fontSize="13px">
              {count}
            </Typography>
          );
        },
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
        id: 'status',
        label: 'Status',
        align: 'left',
        sticky: true,
        minWidth: 80,
        render: (value, row) => {
          const term = row as IPaymentTerm;
          const isActive = term.status === 'Active';
          return (
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                size="small"
                label={isActive ? 'Active' : 'Archived'}
                color={isActive ? 'success' : 'default'}
                variant="soft"
              />
              <Switch
                size="small"
                checked={isActive}
                onClick={(event) => event.stopPropagation()}
                onChange={async () => {
                  if (!term.id) return;
                  try {
                    if (isActive) {
                      await archivePaymentTerm({
                        paymentTermId: term.id,
                        body: { reason: 'Archived from Payment Terms list' },
                      });
                      shikshaMitraToast.success({
                        message: `Payment Term "${term.paymentTermName}" archived successfully.`,
                      });
                    } else {
                      await restorePaymentTerm(term.id);
                      shikshaMitraToast.success({
                        message: `Payment Term "${term.paymentTermName}" restored successfully.`,
                      });
                    }
                  } catch {
                    shikshaMitraToast.error({ message: 'Failed to update status.' });
                  }
                }}
              />
            </Stack>
          );
        },
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
              showThreeDots={false}
              showEditIcon
              handleEditClick={() => onEdit(term)}
              showDeleteIcon
              disableDeleteIcon={term.isUsedInDownstream}
              handleDeleteClick={() => onDelete(term)}
            />
          );
        },
      },
    ],
    [onEdit, onDelete, archivePaymentTerm, restorePaymentTerm]
  );

  return (
    <CustomizableTable
      tableId="payment-term-table"
      isLoading={loading}
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
