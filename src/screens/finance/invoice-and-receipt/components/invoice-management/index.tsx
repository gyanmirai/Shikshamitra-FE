import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import { ClearIcon } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { GridSearchIcon } from '@mui/x-data-grid';
import React, { useState, useEffect } from 'react';
import { useBoolean } from 'src/hooks/useBoolean';
import { useSelector, useDispatch } from 'react-redux';
import CustomDialog from 'src/components/custom-dialog';
import CustomSelect from 'src/components/custom-select';
import CustomTooltip from 'src/components/custom-tooltip';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, TextField, IconButton, Typography } from '@mui/material';
import { setIsChanges } from 'src/redux/confirm-popup/confirmPopupSlice';
import { useGetInvoiceDataQuery } from 'src/redux/invoice-and-receipt/invoiceApi';

import InvoiceForm from './InvoiceForm';
import InvoiceTable from './InvoiceTable';
import InvoiceTableView from './StudentInvoiceTable';

import type { InvoiceData } from './type';

const InvoiceManagement = ({ addInvoiceDialog }: any) => {
  // State to store all classes/standards for the selected organization
  const [allClass, setAllClass] = useState<Standards[]>([]);
  // State to store selected class/standard ID
  const [selectedInvoiceData, setSelectedInvoiceData] = useState<InvoiceData | null>(null);
  const [classes, setClass] = useState<string>('');
  // State to store all divisions for the selected class
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  // State to store selected division ID
  const [division, setDivision] = useState<string>('');
  const [searchValue, setSearchValue] = useState('');
  const { data: invoiceData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetInvoiceDataQuery,
  });
  const viewInvoiceDetailsDialog = useBoolean();
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();

  // Get current board, medium and medium setter from global state
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  // Update classes when organization changes
  useEffect(() => {
    // Flatten the list of standards from all stages
    const allClasses =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];
    setAllClass(allClasses);
    setClass(allClasses[0]?.name || '');
  }, [medium]);

  // Update divisions when class changes
  useEffect(() => {
    setAllDivision(allClass.find((org: any) => org?.name === classes)?.divisions || []);
    setDivision(allClass.find((org: any) => org?.name === classes)?.divisions?.[0]?.name || '');
  }, [allClass, classes]);

  const handleClose = (_e: any, isSubmit?: boolean) => {
    const resetState = () => {
      setTimeout(() => {
        dispatch(setIsChanges(false));
      }, 200); // Adjust timing based on your dialog close animation
    };
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      addInvoiceDialog.onFalse();
      resetState();
    } else if (!isChanges) {
      addInvoiceDialog.onFalse();
    }
  };

  return (
    <Box>
      <Box
        display="flex"
        sx={{
          borderRadius: '8px',
          bgcolor: 'background.paper',
          boxShadow: 'var(--shadows-3)',
          mt: 1,
          mb: 2,
          p: 1,
          gap: 2,
        }}
      >
        {' '}
        <CustomSelect
          options={allClass}
          label="Class"
          value={classes}
          onChange={(val) => setClass(val as string)}
          labelKey="name"
          valueKey="name"
          formControlProps={{ sx: { maxWidth: '248px', width: '100%' } }}
        />
        <CustomSelect
          options={allDivision}
          label="Division"
          value={division}
          onChange={(val) => setDivision(val as string)}
          labelKey="name"
          valueKey="name"
          formControlProps={{ sx: { maxWidth: '248px', width: '100%' } }}
          disabled={!classes}
        />
        <TextField
          variant="outlined"
          size="small"
          value={searchValue}
          onChange={() => {}}
          InputProps={{
            endAdornment: (
              <>
                {searchValue ? (
                  <IconButton
                    size="small"
                    sx={{ mr: '-12px', p: 1 }}
                    onClick={() => setSearchValue('')}
                  >
                    <ClearIcon />
                  </IconButton>
                ) : (
                  <IconButton size="small" sx={{ mr: '-12px', p: 1 }}>
                    <GridSearchIcon />
                  </IconButton>
                )}
              </>
            ),
          }}
          label="Search Student by Name, Invoice Id"
          sx={{ minWidth: '250.6px', width: '100%' }}
        />
      </Box>
      <InvoiceTable
        data={invoiceData}
        onView={(data) => {
          viewInvoiceDetailsDialog.onTrue();
          setSelectedInvoiceData(data);
        }}
      />
      <CustomDialog
        open={addInvoiceDialog.value}
        handleClose={() => {
          addInvoiceDialog?.onFalse();
        }}
        title="Generate Student Invoice"
        maxWidth="sm"
      >
        <InvoiceForm open={addInvoiceDialog} onClose={handleClose} />
      </CustomDialog>

      <CustomDialog
        open={viewInvoiceDetailsDialog.value}
        handleClose={() => {
          viewInvoiceDetailsDialog?.onFalse();
          setSelectedInvoiceData(null);
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Receipt Details</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="This modal displays all invoices of a particular student, with options to view each invoice in detail or send it."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        maxWidth="sm"
      >
        <InvoiceTableView selectedStudent={selectedInvoiceData} />
      </CustomDialog>
    </Box>
  );
};

export default InvoiceManagement;
