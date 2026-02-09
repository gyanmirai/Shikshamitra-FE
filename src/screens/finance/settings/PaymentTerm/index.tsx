'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { Add } from '@mui/icons-material';
import { Box, Card, Button } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { useConfirmWithUndo } from 'src/hooks/useConfirmWithUndo';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import {
  PaymentTermApi,
  useGetPaymentTermQuery,
  useDeletePaymentTermMutation,
} from 'src/redux/finance/paymentTerm';

import PaymentTermForm from './Components/PaymentTermForm';
import PaymentTermTable from './Components/PaymentTermTable';

import type { IPaymentTerm } from './type';

const PaymentTerm = () => {
  // State to track the currently selected payment term
  const [selectedPaymentTerm, setSelectedPaymentTerm] = useState<IPaymentTerm | null>(null);
  // Custom hook to manage dialog open/close state
  const addPaymentTermDialog = useBoolean();
  const deletePaymentTermDialog = useBoolean();

  // Delete mutation
  const { deletePaymentTerm } = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeletePaymentTermMutation,
  });

  const { confirmWithUndo } = useConfirmWithUndo();

  const { data: paymentTerms, refetch } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetPaymentTermQuery,
  });

  // Redux state and dispatch
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  // Redux dispatch function for dispatching actions to update the store
  const dispatch = useDispatch();
  /**
   * Handles closing the fee structure dialog
   * @param _e - Event object (unused)
   * @param isSubmit - Boolean indicating if form was submitted
   */
  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are u sure to leave this page ?'))) {
      addPaymentTermDialog.onFalse();
      setSelectedPaymentTerm(null);
      dispatch(setIsChanges(false));
    } else if (!isChanges) {
      addPaymentTermDialog.onFalse();
      setSelectedPaymentTerm(null);
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {addPaymentTermDialog.value ? (
        <CustomBreadcrumbs
          heading={addPaymentTermDialog.value ? 'Add Payment Term' : 'Update Payment Term'}
          description={
            selectedPaymentTerm
              ? 'Update existing payment term details such as frequency (monthly, quarterly, custom), due dates, and applicable fee heads to ensure accurate payment scheduling.'
              : 'Manage all payment terms such as monthly, quarterly, or custom schedules. Create new terms to match your institution’s fee structure.'
          }
          isBack
          onBack={() => {
            handleClose(null, false);
          }}
          links={[
            { name: 'Finance', href: '/finance/dashboard' },
            { name: 'Settings', href: '/finance/settings/payment-term/' },
            { name: 'Payment Terms', href: '/finance/payment-term' },
            { name: addPaymentTermDialog.value ? 'Add Payment Term' : 'Update Payment Term' },
          ]}
        />
      ) : (
        <CustomBreadcrumbs
          heading="Payment Terms"
          description={
            addPaymentTermDialog.value
              ? 'Access detailed information on the selected payment term such as frequency, due dates, and mapping with fee structures.'
              : 'Define and manage payment terms by linking them with fee structures. Set schedules to ensure smooth fee collection process.'
          }
          links={[
            { name: 'Finance', href: '/finance/dashboard' },
            { name: 'Settings', href: '/finance/setting' },
            { name: 'Payment Terms', href: '/finance/payment-term' },
          ]}
          isBack={addPaymentTermDialog.value}
          onBack={() => {
            addPaymentTermDialog.onFalse();
            setSelectedPaymentTerm(null);
          }}
          action={
            <Button
              onClick={() => addPaymentTermDialog.onTrue()}
              size="small"
              startIcon={<Add />}
              variant="contained"
              sx={{ px: '32px' }}
            >
              Payment Term
            </Button>
          }
        />
      )}
      <>
        {/* Subject form card for creating/editing subjects */}
        {addPaymentTermDialog.value ? (
          <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
            <PaymentTermForm
              open={addPaymentTermDialog}
              onClose={handleClose}
              editData={selectedPaymentTerm}
            />
          </Card>
        ) : (
          <PaymentTermTable
            data={paymentTerms}
            addPaymentTerm={addPaymentTermDialog}
            editData={selectedPaymentTerm}
            setEditData={setSelectedPaymentTerm}
            onEdit={(data) => {
              addPaymentTermDialog.onTrue();
              setSelectedPaymentTerm(data);
            }}
            onDelete={(data) => {
              deletePaymentTermDialog.onTrue();
              setSelectedPaymentTerm(data);
            }}
          />
        )}
      </>

      <ConfirmDialog
        open={deletePaymentTermDialog.value}
        icon="warning"
        onClose={() => {
          deletePaymentTermDialog.onFalse();
          setTimeout(() => {
            setSelectedPaymentTerm(null);
          }, 200);
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete payment term{' '}
            <strong>{selectedPaymentTerm?.paymentTermName}</strong>?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => {
              confirmWithUndo({
                item: selectedPaymentTerm,
                onOptimisticRemove: (dispatchFn, setDeleteIndex) =>
                  dispatchFn(
                    PaymentTermApi.util.updateQueryData(
                      'getPaymentTerm',
                      undefined,
                      (draft: any) => {
                        const index = draft.data?.findIndex(
                          (b: any) => b.id === (selectedPaymentTerm as any)?.id
                        );
                        setDeleteIndex(index);
                        if (index !== -1) {
                          draft.data.splice(index, 1);
                        }
                      }
                    )
                  ),
                onUndoRestore: () => refetch(),
                onCommit: () => deletePaymentTerm(selectedPaymentTerm?.id),
              });
              deletePaymentTermDialog.onFalse();
              setSelectedPaymentTerm(null);
            }}
          >
            Yes
          </Button>
        }
      />
    </Box>
  );
};

export default PaymentTerm;
