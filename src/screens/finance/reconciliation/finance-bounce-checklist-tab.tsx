'use client';

import React, { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { varAlpha } from 'src/theme/styles';
import { GlobalIcons } from 'src/utils/icons';
import { Add, Send } from '@mui/icons-material';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import { formatNumber } from 'src/utils/formate_number';
import { Iconify } from 'src/components/iconify/iconify';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import bounceChequeData from 'src/json/finance/reconicilation/bounceChequeData.json';
import {
  Box,
  Button,
  TextField,
  IconButton,
  Typography,
  DialogActions,
  InputAdornment,
} from '@mui/material';

import FinanceChequeBounceChargeCollect from '../fee-collection/charges/component/finance-cheque-bounce-charge-collect';

import type { IChargeData } from './data/charges_data_interface';

const FinanceBounceScreen = () => {
  // Dialog state using custom hook for bounce charge collection dialog
  const dialog = useBoolean();

  // State to store selected entry data for bounce charge collection
  const [selectedEntry, setSelectedEntry] = useState<IChargeData>();

  // Handler to close bounce charge collection dialog
  const closeDialog = () => {
    dialog.onFalse();
  };

  // Handler for saving bounce charge collection data
  const handleSave = () => {};

  // Dialog state for additional dialog functionality
  const [openDialog, setOpenDialog] = useState<boolean>(false);

  // Handler to close additional dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  return (
    <>
      <CustomBreadcrumbs
        heading="Bounced Cheque"
        description="The bounce cheque screen displays all payments made by cheque which are marked as bounced"
        links={[
          { name: 'Finance', href: '/finance/dashboard' },
          { name: 'Reconciliation', href: '/finance/reconciliation/bounce-cheque/' },
          { name: 'Bounced Cheque' },
        ]}
        sx={{ px: 1, mb: 2 }}
      />

      <CustomizableTable
        noDataText={
          <>There are no Bounce cheque recorded for the selected class and division at this time.</>
        }
        tableId="finance-bounce-checklist-tab"
        columns={[
          //  {id:"srNo", label:"SR No"},

          { id: 'grNumber', label: 'GR No', filterType: 'number', sticky: true, align: 'left' },
          { id: 'studentName', label: 'Student Name', align: 'left' },
          { id: 'class', label: 'Class', align: 'left' },
          { id: 'division', label: 'Division', align: 'left' },
          { id: 'parentsContactNumber', label: 'Contact Number', align: 'left' },
          { id: 'chequeNumber', label: 'Cheque Number', align: 'left' },
          { id: 'chequeDate', label: 'Cheque Date', filterType: 'date', align: 'left' },

          { id: 'feeHead', label: 'Fee Head', align: 'left' },

          { id: 'bounceDate', label: 'Bounce Date', filterType: 'date', align: 'left' },
          { id: 'reason', label: 'Reason', align: 'left' },
          {
            id: 'chargesAmount',
            label: 'Charges',
            filterType: 'formattedNumber',
            align: 'left',
            render(value, row) {
              return (
                <Typography fontSize="12px">{formatNumber(row.chargesAmount, 'INR')}</Typography>
              );
            },
          },
          {
            id: 'amount',
            label: 'Amount',
            filterType: 'formattedNumber',
            align: 'left',
            render(value, row) {
              return <Typography fontSize="12px">{formatNumber(row.amount, 'INR')}</Typography>;
            },
          },
          {
            id: 'conversation',
            label: 'Follow up',
            isSort: false,
            align: 'left',
            isFilter: false,
            sticky: true,
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
        ]}
        data={bounceChequeData}
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

export default FinanceBounceScreen;

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
      </Box>
    </Scrollbar>
    <DialogActions>
      <Button
        startIcon={<Iconify icon={GlobalIcons.cancel} />}
        onClick={handleCloseDialog}
        variant="outlined"
      >
        Close
      </Button>
      <LoadingButton
        startIcon={<Iconify icon={GlobalIcons.submit} />}
        type="submit"
        variant="contained"
      >
        Submit
      </LoadingButton>
    </DialogActions>
  </Box>
);
