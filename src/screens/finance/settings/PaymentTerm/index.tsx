'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { Add } from '@mui/icons-material';
import { Box, Card, Button } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useGetPaymentTermQuery } from 'src/redux/finance/paymentTerm';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import PaymentTermForm from './Components/PaymentTermForm';
import PaymentTermTable from './Components/PaymentTermTable';

import type { IPaymentTerm } from './type';

const PaymentTerm = () => {
  // State to track the currently selected payment term
  const [selectedPaymentTerm, setSelectedPaymentTerm] = useState<IPaymentTerm | null>(null);
  // Custom hook to manage dialog open/close state
  const addPaymentTermDialog = useBoolean();
  const deletePaymentTermDialog = useBoolean();

  const { data: paymentTerms, isLoading: paymentTermsLoading } = useQueryAndMutation({
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
          heading="Payment Terms"
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
            { name: 'Setting', href: '/finance/setting' },
            { name: 'Payment Terms', href: '/finance/payment-term' },
          ]}
          sx={{ mb: 2 }}
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
            { name: 'Setting', href: '/finance/setting' },
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
            >
              Payment Term
            </Button>
          }
          sx={{ mb: 2 }}
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
              // Handle delete action here
              shikshaMitraToast.success({
                message: (
                  <>
                    Payment Term: <strong>{selectedPaymentTerm?.paymentTermName}</strong> deleted
                    successfully.
                  </>
                ),
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
