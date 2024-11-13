"use client";

import React, { useState, useEffect } from 'react';

import { Box, Button, Switch, MenuItem, MenuList, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

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
      <Box gap={3} display="flex" flexDirection="row" justifyContent="flex-end">
        <Button
          onClick={() => {
            setIsEdit(false);
            dialog.onTrue();
          }}
          variant="contained"
          size="small"
        >
          Add Payment Method
        </Button>
      </Box>
      <Box>
        <Typography component="span" variant="h6" gutterBottom>
          Payment Methods Overview
        </Typography>
      </Box>
      <CustomizableTable
        columns={[
          { id: 'paymentMethodName', label: 'Payment Method Name' },
          {
            id: 'serviceProviderDetail',
            label: 'Service Provider Details',
            render(value, row) {
              return (
                <Box>
                  <Typography>{row.serviceProviderDetail.serviceProviderName}</Typography>
                  <Typography>{row.serviceProviderDetail.serviceProviderMobile}</Typography>
                </Box>
              );
            },
          },
          {
            id: 'toggle',
            label: 'Status Toggle',
            render() {
              return <Switch />;
            },
          },
          {
            id: 'action',
            label: 'Action',
            render: (value, row: any) => (
              <ThreeDotsActions
                actions={({ popover }: any) => (
                  <MenuList>
                    <MenuItem
                      onClick={() => {
                        setIsEdit(true);

                        setSelectedEntry(row);
                        dialog.onTrue();
                        popover.onClose();
                      }}
                    >
                      <Iconify color="blue" icon="solar:pen-bold" />
                      Edit
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        handleDelete(row); // Handle delete action
                        popover.onClose(); // Close the popover
                      }}
                    >
                      <Iconify color="red" icon="solar:trash-bin-trash-bold" />
                      Delete
                    </MenuItem>
                  </MenuList>
                )}
              />
            ),
          },
        ]}
        data={tableData}
      />
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
