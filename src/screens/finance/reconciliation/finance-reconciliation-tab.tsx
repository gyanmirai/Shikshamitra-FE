'use client';

import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import { useSelector } from 'react-redux';
import React, { useState, useEffect } from 'react';

import { Box, MenuItem, MenuList, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { formatNumber } from 'src/utils/formate_number';

import chequeTransectionData from 'src/json/finance/reconicilation/chequeTransectionData.json';

import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import FinanceReconciliationClearAndBounceChequeDialog from './component/finance-reconciliation-clear-cheque-dialog';

import type { ReconciliationItem } from './data/cheque-list-data';

const FinanceChequeTransectionScreen = () => {
  // Dialog state to control the visibility of the dialog
  const dialog = useBoolean();

  // State to track whether the cheque is being cleared (true) or bounced (false)
  const [isClearCheck, setIsClearCheck] = useState<boolean>(false);

  // State to store the currently selected reconciliation entry
  const [selectedEntry, setSelectedEntry] = useState<ReconciliationItem>();

  // Function to reset states and close the dialog
  const closeDialog = () => {
    setIsClearCheck(false);
    dialog.onFalse();
  };

  // Function to handle save operation when clearing or bouncing a cheque
  const handleSave = () => {};

  // Effect to handle changes when selected entry or clear check status changes
  useEffect(() => {}, [selectedEntry, isClearCheck]);

  // States for managing organization/stage selection
  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);
  const [organization, setOrganization] = useState<string>('');

  // States for managing class/standard selection
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [classes, setClass] = useState<string>('');

  // States for managing division selection
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  const [division, setDivision] = useState<string>('');
  const {
    currentBoard,
    currentMedium: medium,
    setCurrentMedium: setMedium,
  } = useSelector((state: RootState) => state.globalState);

  // Effect to update organizations when medium changes
  useEffect(() => {
    setAllOrganization(medium?.educationMediumStages || []);
    setOrganization(medium?.educationMediumStages?.[0]?.id || '');
  }, [medium]);

  // Effect to update classes when organization changes
  useEffect(() => {
    setAllClass(allOrganization.find((org: any) => org?.id === organization)?.standards || []);
    setClass(
      allOrganization.find((org: any) => org?.id === organization)?.standards?.[0]?.id || ''
    );
  }, [organization, allOrganization]);

  // Effect to update divisions when class changes
  useEffect(() => {
    setAllDivision(allClass.find((org: any) => org?.id === classes)?.divisions || []);
    setDivision(allClass.find((org: any) => org?.id === classes)?.divisions?.[0]?.id || '');
  }, [allClass, classes]);

  return (
    <>
      <CustomBreadcrumbs
        heading="Cheque Transactions"
        description="The Cheque transection screen displays all payments made by cheque. You can also move cheques to Cleared or Bounced by clicking the action button"
        links={[
          { name: 'Finance', href: '/finance/dashboard' },
          { name: 'Reconciliation' },
          { name: 'Cheque Transactions' },
        ]}
        sx={{ px: 1, mb: 2 }}
      />
      <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
        <CustomSelect
          options={allOrganization}
          label="Organization"
          value={organization}
          onChange={(val) => setOrganization(val as string)}
          labelKey="name"
          valueKey="id"
          formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
          disabled={!medium}
        />
        <CustomSelect
          options={allClass}
          label="Class"
          value={classes}
          onChange={(val) => setClass(val as string)}
          labelKey="name"
          valueKey="id"
          formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
          disabled={!organization}
        />
        <CustomSelect
          options={allDivision}
          label="Division"
          value={division}
          onChange={(val) => setDivision(val as string)}
          labelKey="name"
          valueKey="id"
          formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
          disabled={!classes}
        />
      </Box>
      <CustomizableTable
        noDataText={
          <>
            There are no cheque payments recorded for the selected class and division at this time.
          </>
        }
        tableId="reconciliationTable"
        searchFieldProps={{
          placeholder: 'Search by Gr Number, Name...',
          label: 'Search by Gr Number, Name...',
          sx: {
            maxWidth: '400px',
            width: '100%',
          },
        }}
        columns={[
          { id: 'grNumber', label: 'GR No', filterType: 'number', sticky: true },

          { id: 'studentName', label: 'Student Name' },
          { id: 'class', label: 'Class' },
          { id: 'chequeNo', label: 'Cheque No' },
          { id: 'bankName', label: 'Bank Name' },
          { id: 'chequeDate', label: 'Date On Cheque', filterType: 'date' },
          { id: 'receivedChequeDate', label: 'Received Cheque Date', filterType: 'date' },

          { id: 'feeHead', label: 'Fee Head' },
          {
            id: 'amount',
            label: 'Amount',
            filterType: 'formattedNumber',
            render(value, row) {
              return <Typography fontSize="12px">{formatNumber(row.amount, 'INR')}</Typography>;
            },
          },
          {
            id: 'action',
            label: 'Action',
            isSort: false,
            isFilter: false,
            sticky: true,
            render(value, row: any) {
              return (
                <ThreeDotsActions
                  placement="right-top"
                  actions={({ popover }: any) => (
                    <MenuList>
                      <MenuItem
                        onClick={() => {
                          setIsClearCheck(false);
                          setSelectedEntry(row);

                          dialog.onTrue();
                          popover.onClose();
                        }}
                      >
                        <Iconify icon="fluent:check-24-regular" />
                        Bounce
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          setIsClearCheck(true);
                          setSelectedEntry(row);

                          dialog.onTrue();
                          popover.onClose();
                        }}
                      >
                        <Iconify icon="material-symbols-light:check" />
                        Clear
                      </MenuItem>
                    </MenuList>
                  )}
                />
              );
            },
          },
        ]}
        data={chequeTransectionData}
      />
      {dialog.value && selectedEntry && (
        <FinanceReconciliationClearAndBounceChequeDialog
          onSave={handleSave}
          dialogValue={dialog.value}
          onClose={closeDialog}
          data={selectedEntry}
          fromClearCheck={isClearCheck}
        />
      )}
    </>
  );
};

export default FinanceChequeTransectionScreen;
