import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import { useSelector } from 'react-redux';
import React, { useState, useEffect } from 'react';

import { ClearIcon } from '@mui/x-date-pickers';
import { GridSearchIcon } from '@mui/x-data-grid';
import { Box, TextField, IconButton, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetReceiptDataQuery } from 'src/redux/invoiceAndReceipt/receiptApi';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import CustomTooltip from 'src/components/custom-tooltip';

import ReceiptTable from './Components/receiptTable';
import StudentTableView from './Components/StudentReceiptTable';

import type { IFeeReceipt } from './type';

const ReceiptManagement = ({ addInvoiceDialog }: any) => {
  // State to store all classes/standards for the selected organization
  const [allClass, setAllClass] = useState<Standards[]>([]);
  // State to store selected class/standard ID
  const [classes, setClass] = useState<string>('');
  // State to store all divisions for the selected class
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  // State to store selected division ID
  const [division, setDivision] = useState<string>('');
  // State to store search input value for filtering students/invoices
  const [searchValue, setSearchValue] = useState('');
  const viewReceiptDetailsDialog = useBoolean();
  const [selectedReceiptData, setSelectedReceiptData] = useState<IFeeReceipt | null>(null);

  // Query hook to fetch invoice data from the API
  // Returns invoice data and loading state
  const { data: receiptData, isLoading: boardLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetReceiptDataQuery,
  });
  // Get current board, medium and medium setter from global state
  const {
    currentBoard,
    currentMedium: medium,
    setCurrentMedium: setMedium,
  } = useSelector((state: RootState) => state.globalState);

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
      <ReceiptTable
        data={receiptData}
        onView={(data) => {
          viewReceiptDetailsDialog.onTrue();
          setSelectedReceiptData(data);
        }}
      />

      <CustomDialog
        open={viewReceiptDetailsDialog.value}
        handleClose={() => {
          viewReceiptDetailsDialog?.onFalse();
          setSelectedReceiptData(null);
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Receipt Details</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="This modal displays all fee receipts of a particular student, with options to view, download."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        maxWidth="sm"
      >
        <StudentTableView selectedStudent={selectedReceiptData} />
      </CustomDialog>
    </Box>
  );
};

export default ReceiptManagement;
