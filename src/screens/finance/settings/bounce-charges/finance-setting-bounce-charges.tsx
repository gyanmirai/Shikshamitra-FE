'use client'


import React, { useState, useEffect } from 'react'

import { Box, Button } from '@mui/material'

import { useBoolean } from 'src/hooks/use-boolean'

import CustomizableTable from 'src/components/customizabaleTable'
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs'

import AddNewBounceCheckChargesDialog from './component/add-new-bounce-check-charges-dialog'


const FinanceSettingBounceCharges = () => {

  const bounceBankChargesData = [
    {
      bankName: "SBI",
      bounceReasone: "Insuffcient Fund",
      bounceAmount: "₹ 0 - 1,00,000",
      charges: "₹ 150",
      gst: "₹ 27",
    },
    {
      bankName: "SBI",
      bounceReasone: "Insuffcient Fund",
      bounceAmount: "₹ 1,00,000 - 5,00,000",
      charges: "₹ 250",
      gst: "₹ 90",
    }
  ]



  const dialog = useBoolean();
  const [selectedEntry, setSelectedEntry] = useState(bounceBankChargesData);
  const [isEdit, setIsEdit] = useState(false);
  const [tableData, setTableData] = useState(bounceBankChargesData);

  const closeDialog = () => {
    setIsEdit(false);

    dialog.onFalse();
  };

  const handleDelete = (item: any) => {

  };
  useEffect(() => { }, [selectedEntry, isEdit]);

  const handleSave = (dataFromDialog: any) => {


    closeDialog();
  };
  return (
    <>
      <CustomBreadcrumbs
        heading="Bounce Cheque Charges"
        links={[{ name: 'Finance' }, { name: 'Settings' }, { name: 'Bounce Cheque Charges' },]}
        sx={{ px: 1, mb: 2 }}

      />
      <Box gap={3} display="flex" flexDirection="row" justifyContent="flex-end">
        <Button
          onClick={() => {
            setIsEdit(false);
            dialog.onTrue();
          }}
          variant="contained"
          size="small"
        >
          Add New Charges
        </Button>
      </Box>
      {/* <Box>
        <Typography component="span" variant="h6" gutterBottom>
          Bounce Check Charges Overview
        </Typography>
      </Box> */}
      <CustomizableTable columns={[
        { id: "bankName", label: "Bank", },
        { id: "bounceReasone", label: "Bounce Reasone" },
        { id: "bounceAmount", label: "Bounce Amount" },
        { id: "charges", label: "Charges" },
        // { id: "gst", label: "GST" }
      ]}
        data={bounceBankChargesData} />

      {dialog.value && selectedEntry && (
        <AddNewBounceCheckChargesDialog
          onSave={handleSave}
          dialogValue={dialog.value}
          onClose={closeDialog}
          data={selectedEntry}
          isEdit={isEdit}
          allData={tableData}
        />
      )}
    </>


  )





}

export default FinanceSettingBounceCharges