'use client';

import { Box, Button } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import React, { useState, useEffect } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import { formatNumber } from 'src/utils/formate_number';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import AddNewBounceCheckChargesDialog from './component/add-new-bounce-check-charges-dialog';

const FinanceSettingBounceCharges = () => {
  const bounceBankChargesData = [
    {
      bankName: 'SBI',
      bounceReasone: 'Insuffcient Fund',
      bounceAmount: '₹ 0 - 1,00,000',
      charges: '150',
      gst: '₹ 27',
    },
    {
      bankName: 'SBI',
      bounceReasone: 'Insuffcient Fund',
      bounceAmount: '₹ 1,00,000 - 5,00,000',
      charges: '250',
      gst: '₹ 90',
    },
  ];

  const dialog = useBoolean();
  const [selectedEntry] = useState(bounceBankChargesData);
  const [isEdit, setIsEdit] = useState(false);
  const [tableData] = useState(bounceBankChargesData);

  const closeDialog = () => {
    setIsEdit(false);

    dialog.onFalse();
  };

  useEffect(() => {}, [selectedEntry, isEdit]);

  const handleSave = (dataFromDialog: any) => {
    closeDialog();
  };

  const [open, setOpen] = useState(false);

  const closeHandler = () => {
    setIsEdit(false);
    setOpen(false);
  };

  return (
    <>
      {open ? (
        <AddNewBounceCheckChargesDialog
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
              heading="Bounce Cheque Charges"
              links={[{ name: 'Finance' }, { name: 'Settings' }, { name: 'Bounce Cheque Charges' }]}
            />
            <Box gap={3} display="flex" flexDirection="row" justifyContent="flex-end" pb="20px">
              <Button
                startIcon={<Iconify icon="ic:outline-plus" />}
                onClick={() => {
                  setIsEdit(false);
                  setOpen(true);
                  // dialog.onTrue();
                }}
                variant="contained"
                size="small"
              >
                New Charges
              </Button>
            </Box>
          </Box>
          <CustomizableTable
            tableId="bounce-charges"
            columns={[
              { id: 'bankName', label: 'Bank' },
              { id: 'bounceReasone', label: 'Bounce Reasone' },
              { id: 'bounceAmount', label: 'Bounce Amount' },
              {
                id: 'charges',
                label: 'Charges',
                render(value, row) {
                  return formatNumber(value, 'INR');
                },
              },
              // { id: "gst", label: "GST" }
            ]}
            data={bounceBankChargesData}
          />
        </>
      )}
    </>
  );
};

export default FinanceSettingBounceCharges;
