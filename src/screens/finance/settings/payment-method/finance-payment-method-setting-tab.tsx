'use client';

import React, { useState, useEffect } from 'react';

import { Box, Button, Switch, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { DeleteConfirmationDialog } from 'src/components/delete-confirmation';

import FinanceSettingPaymentMethodDialog from './component/finance-setting-payment-method-dialog';

interface ServiceProviderDetail {
  serviceProviderName: string;
  serviceProviderMobile: string;
}

interface Data {
  paymentMethodName: string;
  serviceProviderDetail: ServiceProviderDetail;
  id: number;
  action?: string;
}

let initialData: Data[] = [
  {
    id: 1,
    paymentMethodName: 'Stripe',
    serviceProviderDetail: {
      serviceProviderName: 'Jack',
      serviceProviderMobile: '98498989844',
    },
    action: 'View',
  },
  {
    id: 2,
    paymentMethodName: 'PayPal',
    serviceProviderDetail: {
      serviceProviderName: 'John',
      serviceProviderMobile: '98498989855',
    },
    action: 'View',
  },
];

const FinancePaymentMethodSettingTab: React.FC = () => {
  const dialog = useBoolean();
  const dialogForDeleteConfirmation = useBoolean();
  const [selectedEntry, setSelectedEntry] = useState(initialData);
  const [isEdit, setIsEdit] = useState(false);
  const [tableData, setTableData] = useState(initialData);

  const closeDialog = () => {
    setIsEdit(false);

    dialog.onFalse();
  };

  const handleDelete = (item: any) => {
    console.log('hiren xyz', item.id);
    initialData = initialData.filter((val) => val.id !== item.id);
    setTableData([...initialData]);
  };

  const handleSave = (dataFromDialog: Data) => {
    const { serviceProviderDetail, paymentMethodName, id } = dataFromDialog;

    if (dataFromDialog) {
      const existingEntryIndex = initialData.findIndex((val) => id === val.id);

      const newPaymentMethodName = {
        paymentMethodName,
        serviceProviderDetail: {
          serviceProviderName: serviceProviderDetail.serviceProviderName,
          serviceProviderMobile: serviceProviderDetail.serviceProviderMobile,
        },

        id,
        action: isEdit ? 'edit' : 'add',
      };

      const updatedData = [...initialData];

      if (isEdit && existingEntryIndex !== -1) {
        updatedData[existingEntryIndex] = newPaymentMethodName;
      } else {
        updatedData.push(newPaymentMethodName);
      }

      setTableData(updatedData);
    }

    closeDialog();
    console.log('Updated Data:', dataFromDialog);
  };

  useEffect(() => {}, [selectedEntry, isEdit]);

  return (
    <>
      <Box display="flex" flexDirection="row" justifyContent="space-between" alignItems="center">
        <CustomBreadcrumbs
          heading="Payment Method"
          links={[{ name: 'Finance' }, { name: 'Settings' }, { name: 'Payment Method' }]}
          sx={{ px: 1, mb: 2 }}
        />
        <Box gap={3} display="flex" flexDirection="row" justifyContent="flex-end" pb="20px">
          <Button
            startIcon={<Iconify icon="ic:outline-plus" />}
            onClick={() => {
              setIsEdit(false);
              dialog.onTrue();
            }}
            variant="contained"
            size="small"
          >
            Payment Method
          </Button>
        </Box>
      </Box>
      <CustomizableTable
        tableId="finance-payment-method-setting-table"
        columns={[
          { id: 'paymentMethodName', label: 'Payment Method Name' },
          {
            id: 'serviceProviderDetail',
            label: 'Service Provider Details',
            render(value, row) {
              return (
                <Box>
                  <Typography fontSize="12px">
                    {row.serviceProviderDetail.serviceProviderName}
                  </Typography>
                  <Typography fontSize="12px">
                    {row.serviceProviderDetail.serviceProviderMobile}
                  </Typography>
                </Box>
              );
            },
          },
          {
            id: 'toggle',
            label: 'InActive/Active',
            render() {
              return <Switch />;
            },
          },
          {
            id: 'action',
            label: 'Action',
            render: (value, row: any) => (
              <ThreeDotsActions
                showThreeDots={false}
                showDeleteIcon
                handleDeleteClick={() => {
                  dialogForDeleteConfirmation.onTrue();
                  // handleDelete(row);
                }}
                showEditIcon
                handleEditClick={() => {
                  setIsEdit(true);

                  setSelectedEntry(row);
                  dialog.onTrue();
                }}
              />
            ),
          },
        ]}
        data={tableData}
      />

      {dialogForDeleteConfirmation.value && (
        <DeleteConfirmationDialog
          open={dialogForDeleteConfirmation.value}
          onClose={() => {
            dialogForDeleteConfirmation.onFalse();
          }}
          onConfirm={() => {}}
          title="Delete Item"
          description="Are you sure you want to delete this item? This action cannot be undone."
        />
      )}
      {dialog.value && selectedEntry && (
        <FinanceSettingPaymentMethodDialog
          onSave={handleSave}
          dialogValue={dialog.value}
          onClose={closeDialog}
          data={selectedEntry}
          isEdit={isEdit}
          allData={tableData}
        />
      )}
    </>
  );
};

export default FinancePaymentMethodSettingTab;
