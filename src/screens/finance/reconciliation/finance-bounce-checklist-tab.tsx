'use client';

import React, { useState, useEffect } from 'react';

import { Add, Send } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import {
  Box,
  Button,
  TextField,
  IconButton,
  Typography,
  DialogActions,
  InputAdornment,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { formatNumber } from 'src/utils/formate_number';

import { varAlpha } from 'src/theme/styles';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';

import FinanceChequeBounceChargeCollect from '../fee-collection/charges/component/finance-cheque-bounce-charge-collect';

const FinanceBounceTab = () => {
  const chargesData = [
    {
      srNo: 1,
      chequeNumber: '123456',
      chequeDate: '15-08-2024',
      bounceDate: '20-08-2024',
      reason: 'Insufficient Funds',
      amount: '5000',
      status: 'Pending',
      studentName: 'Ishita Desai',
      chargesAmount: '300',
      feeHead: 'Library',
      grNumber: 89554,
      parentsContactNumber: 9843539133,
    },
    {
      srNo: 2,
      chequeNumber: '789012',
      chequeDate: '10-09-2024',
      bounceDate: '15-09-2024',
      reason: 'Account Closed',
      amount: '25000',
      status: 'Pending',
      studentName: 'Ishita Desai',
      chargesAmount: '300',
      feeHead: 'Library',
      grNumber: 89554,
      parentsContactNumber: 9843539133,
    },
    {
      srNo: 3,
      chequeNumber: '345678',
      chequeDate: '01-10-2024',
      bounceDate: '05-10-2024',
      reason: 'Signature Mismatch',
      amount: '12000',
      status: 'Paid',
      studentName: 'Ishita Desai',
      chargesAmount: '300',
      feeHead: 'Library',
      grNumber: 89554,
      parentsContactNumber: 9843539133,
    },
    {
      srNo: 4,
      chequeNumber: '901234',
      chequeDate: '25-11-2024',
      bounceDate: '28-11-2024',
      reason: 'Funds Not Cleared',
      amount: '8000',
      status: 'Paid',
      studentName: 'Ishita Desai',
      chargesAmount: '300',
      feeHead: 'Library',
      grNumber: 89554,
      parentsContactNumber: 9843539133,
    },
    {
      srNo: 5,
      chequeNumber: '567890',
      chequeDate: '10-12-2024',
      bounceDate: '15-12-2024',
      reason: 'Stale Cheque',
      amount: '15000',
      status: 'Paid',
      studentName: 'Ishita Desai',
      chargesAmount: '300',
      feeHead: 'Library',
      grNumber: 89554,
      parentsContactNumber: 9843539133,
    },
  ];
  const dialog = useBoolean();

  const [selectedEntry, setSelectedEntry] = useState<any>();

  const closeDialog = () => {
    dialog.onFalse();
  };

  const handleSave = () => {};

  useEffect(() => {}, [selectedEntry]);
  const [, setSelectedInquiry] = useState<any>(null);
  const [openDialog, setOpenDialog] = useState(false);

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedInquiry(null);
  };
  return (
    <>
      {/* <CustomBreadcrumbs
        heading="Bounce Check Details"
        links={[{ name: 'Finance' }, { name: 'Bounce Check Details' }]}
        sx={{ px: 1, mb: 2 }}
        
      /> */}
      <Box py="15px" display="flex" justifyContent="space-between">
        <Box display="flex" flexDirection="row" gap={3}>
          <CustomSelect
            label="Class/Grade"
            options={[]}
            value=""
            onChange={() => {}}
            formControlProps={{ sx: { minWidth: 140 } }}
          />
          <CustomSelect
            label="Division"
            options={[]}
            value=""
            onChange={() => {}}
            formControlProps={{ sx: { minWidth: 140 } }}
          />
          <TextField
            label="Search by student name"
            variant="outlined"
            size="small"
            value=""
            onChange={(e: any) => {
              console.log(e);
            }}
          />
        </Box>
      </Box>
      <CustomizableTable
        tableId="finance-bounce-checklist-tab"
        columns={[
          //  {id:"srNo", label:"SR No"},

          { id: 'grNumber', label: 'GR No' },
          { id: 'parentsContactNumber', label: 'Contact Number' },
          { id: 'chequeNumber', label: 'Cheque Number' },
          { id: 'chequeDate', label: 'Cheque Date' },
          {
            id: 'chargesAmount',
            label: 'Charges',
            render(value, row) {
              return (
                <Typography fontSize="12px">{formatNumber(row.chargesAmount, 'INR')}</Typography>
              );
            },
          },
          { id: 'feeHead', label: 'Fee Head' },
          { id: 'studentName', label: 'Student Name' },
          { id: 'bounceDate', label: 'Bounce Date' },
          { id: 'reason', label: 'Reason' },
          {
            id: 'amount',
            label: 'Amount',
            render(value, row) {
              return <Typography fontSize="12px">{formatNumber(row.amount, 'INR')}</Typography>;
            },
          },
          {
            id: 'conversation',
            label: 'Conversation',
            isSort: false,
            align: 'center',
            render(value, row) {
              return (
                <IconButton
                  sx={{
                    backgroundColor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.3),
                    color: (theme) => theme.palette.primary.main,
                    '&:hover': {
                      backgroundColor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.3),
                    },
                    height: '24px',
                    width: '24px',
                  }}
                  onClick={() => setOpenDialog(true)}
                >
                  <Add sx={{ height: '18px', width: '18px' }} />
                </IconButton>
              );
            },
          },
          //  {
          //     id: 'status',
          //     label: 'Status',
          //     render(value, row) {
          //     return (
          //       value !== "" ?   <Label
          //           variant="soft"
          //           color={
          //             value === 'Overdue'
          //               ? 'error'
          //               : value === 'Pending'
          //                 ? 'warning'
          //                 : value === 'Paid'
          //                   ? 'success'
          //                   : 'default'
          //           }
          //         >
          //           {value}
          //         </Label> : <Box/>
          //       );
          //     },
          //   },
          // {
          //   id: 'action',
          //   label: 'Action',
          //   render(value, row: any) {
          //     return (
          //       <ThreeDotsActions
          //         actions={({ popover }: any) => (
          //           <MenuList>
          //           { row.status === "Pending" && <MenuItem
          //               onClick={() => {
          //                 // setIsClearCheck(false)
          //                 setSelectedEntry(row);

          //                 dialog.onTrue();
          //               }}
          //             >
          //               <Iconify icon="fluent:check-24-regular" />
          //               Collect Charges

          //             </MenuItem>}
          //            { row.status === "Paid" && <MenuItem
          //               onClick={() => {
          //                 // setIsClearCheck(true)
          //                 // setSelectedEntry(row);

          //                 // dialog.onTrue();
          //               }}
          //             >
          //               <Iconify icon="circum:receipt"   />
          //             Generate Receipt
          //             </MenuItem>}
          //           </MenuList>
          //         )}
          //       />
          //     );
          //   },
          // },
        ]}
        data={chargesData}
      />

      <CustomDialog open={openDialog} handleClose={handleCloseDialog} title="Communication History">
        <CommunicationForm handleCloseDialog={handleCloseDialog} />
      </CustomDialog>

      {dialog.value && (
        <FinanceChequeBounceChargeCollect
          onSave={handleSave}
          dialogValue={dialog.value}
          onClose={closeDialog}
          data={selectedEntry}
        />
      )}
    </>
  );
};

export default FinanceBounceTab;

export const CommunicationForm = ({ handleCloseDialog }: any) => (
  <Box>
    <Scrollbar
      sx={{
        p: 3,
        bgcolor: 'background.neutral',

        position: 'relative',
      }}
    >
      <Box height="350px" />

      <Box
        sx={{
          // position: 'absolute',
          // bottom: 16,
          // right: 16,
          // left: 16,
          // zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          flexDirection: 'column',
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type a message..."
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton>
                  <Send />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <DatePicker
          label="Due Date"
          slotProps={{ textField: { size: 'small', fullWidth: true } }}
        />
        <CustomSelect
          options={
            [
              // { label: 'Interested', value: 'interested' },
              // { label: 'Not Interested', value: 'notInterested' },
              // { label: 'Pending', value: 'pending' },
            ]
          }
          value=""
          onChange={() => {}}
          label="Change Status"
          formControlProps={{ sx: { maxWidth: 'unset' }, fullWidth: true }}
        />
      </Box>
    </Scrollbar>
    <DialogActions>
      <Button onClick={handleCloseDialog} variant="outlined" color="error">
        Close
      </Button>
      <Button onClick={handleCloseDialog} variant="contained">
        Submit
      </Button>
    </DialogActions>
  </Box>
);
