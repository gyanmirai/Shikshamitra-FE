'use client';

import { LoadingButton } from '@mui/lab';
import { Iconify } from 'src/components/iconify';
import React, { useState, useEffect } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import { Box, Button, Switch, Typography } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { ConfirmDialog } from 'src/components/confirm-dialog/confirm-dialog';

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
  const [open, setOpen] = useState(false);

  const closeHandler = () => {
    setIsEdit(false);
    setOpen(false);
  };

  return (
    <>
      {open ? (
        <FinanceSettingPaymentMethodDialog
          onSave={handleSave}
          dialogValue={dialog.value}
          onClose={closeHandler}
          data={selectedEntry}
          isEdit={isEdit}
          allData={tableData}
        />
      ) : (
        <>
          <Box
            display="flex"
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <CustomBreadcrumbs
              heading="Payment Method"
              links={[{ name: 'Finance' }, { name: 'Settings' }, { name: 'Payment Method' }]}
              sx={{ mb: 2 }}
            />
            <Box gap={3} display="flex" flexDirection="row" justifyContent="flex-end" pb="20px">
              <Button
                startIcon={<Iconify icon="ic:outline-plus" />}
                onClick={() => {
                  setIsEdit(false);
                  setOpen(true);
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
                label: 'Active',
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
                      setOpen(true);
                    }}
                  />
                ),
              },
            ]}
            data={tableData}
          />

          {dialogForDeleteConfirmation.value && (
            <ConfirmDialog
              open={dialogForDeleteConfirmation.value}
              onClose={() => {
                dialogForDeleteConfirmation.onFalse();
              }}
              title="Delete Item"
              content="Are you sure you want to delete?"
              action={
                <LoadingButton variant="contained" loading={false} color="error" onClick={() => {}}>
                  Yes
                </LoadingButton>
              }
            />

            // <DeleteConfirmationDialog
            //   open={dialogForDeleteConfirmation.value}
            //   onClose={() => {
            //     dialogForDeleteConfirmation.onFalse();
            //   }}
            //   onConfirm={() => {}}
            //   title="Delete Item"
            //   description="Are you sure you want to delete this item? This action cannot be undone."
            // />
          )}
        </>
      )}
    </>
  );
};

export default FinancePaymentMethodSettingTab;
