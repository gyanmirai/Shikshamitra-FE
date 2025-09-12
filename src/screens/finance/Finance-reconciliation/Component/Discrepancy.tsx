import type { RootState } from 'src/redux/store';

import { Iconify } from 'src/components/iconify';
import React, { useState, useEffect } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import { formatNumber } from 'src/utils/formate_number';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, MenuList, MenuItem, Typography } from '@mui/material';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { useGetDiscrepancyQuery } from 'src/redux/finance/reconciliation';

import FinanceReconciliationClearAndBounceChequeDialog from '../../reconciliation/component/finance-reconciliation-clear-cheque-dialog';

interface ReconciliationItem {
  srNo: number;
  studentName: string;
  class: string;
  chequeNo: string;
  bankName: string;
  chequeDate: string;
  amount: string;
  id: number;
  chargesAmount: string;
  feeHead: string;
  grNumber: number;
  receivedChequeDate: string;
}

const Discrepancy = () => {
  const [isClearCheck, setIsClearCheck] = useState<boolean>(false);
  const [selectedEntry, setSelectedEntry] = useState<ReconciliationItem>();
  const dialog = useBoolean();
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup); // Tracks unsaved changes
  const dispatch = useDispatch();

  // Fetch discrepancy data using the custom hook pattern
  const { data: discrepancyApiData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetDiscrepancyQuery,
  });

  // Function to reset states and close the dialog
  const closeDialog = () => {
    setIsClearCheck(false);
    dialog.onFalse();
  };
  const handleClose = (_e: any, isSubmit?: boolean) => {
    // Helper function to reset state after dialog closes
    const resetState = () => {
      setTimeout(() => {
        setIsClearCheck(false);
        dispatch(setIsChanges(false));
      }, 200);
    };

    // Handle different closing scenarios
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      dialog.onFalse();
      resetState();
    } else if (!isChanges) {
      dialog.onFalse();
      setTimeout(() => {
        dialog.onFalse();
      }, 200);
    }
  };

  const typeOptions = discrepancyApiData?.typeOptions;
  const data = discrepancyApiData?.data;

  const handleSave = () => {};

  // Effect to handle changes when selected entry or clear check status changes
  useEffect(() => {}, [selectedEntry, isClearCheck]);

  const handleMarkAsResolved = async (discrepancyId: string) => {};

  return (
    <Box>
      <Box>
        <CustomizableTable
          isLoading={isLoading}
          noDataText={<>No Discrepancy Data Found </>}
          tableId="discrepancy-table"
          columns={[
            {
              id: 'studentName',
              label: 'Student Name',
              minWidth: '150px',
              align: 'left',
              isFilter: true,
              filterType: 'string',
              sticky: true,
            },
            {
              id: 'class',
              label: 'Class',
              minWidth: '80px',
              align: 'left',
              isFilter: true,
              filterType: 'string',
            },
            {
              id: 'division',
              label: 'Division',
              minWidth: '100px',
              align: 'left',
              isFilter: true,
              filterType: 'string',
            },
            {
              id: 'grNumber',
              label: 'GR No.',
              minWidth: '120px',
              align: 'left',
              isFilter: true,
              filterType: 'number',
            },
            {
              id: 'rollNumber',
              label: 'Roll No.',
              minWidth: '120px',
              align: 'left',
              isFilter: true,
              filterType: 'number',
            },
            {
              id: 'chequeNo',
              label: 'Cheque No.',
              minWidth: '120px',
              align: 'left',
              isFilter: true,
              filterType: 'string',
            },
            {
              id: 'bankName',
              label: 'Bank Name',
              minWidth: '130px',
              align: 'left',
              isFilter: true,
              filterType: 'string',
            },
            {
              id: 'amount',
              label: 'Amount',
              minWidth: '80px',
              align: 'left',
              isFilter: true,
              filterType: 'string',
              render(value) {
                return <Typography fontSize="12px">{formatNumber(value, 'INR')}</Typography>;
              },
            },
            {
              id: 'chargesAmount',
              label: 'Charges Amount',
              minWidth: '160px',
              align: 'left',
              isFilter: true,
              filterType: 'string',
              render(value) {
                return <Typography fontSize="12px">{formatNumber(value, 'INR')}</Typography>;
              },
            },
            {
              id: 'receivedChequeDate',
              label: 'Received Cheque Date',
              minWidth: '200px',
              align: 'left',
              isFilter: true,
              filterType: 'date',
            },
            {
              id: 'action',
              label: 'Actions',
              isSort: false,
              isFilter: false,
              sticky: true,
              align: 'left',
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
          data={data || []}
        />
        {dialog.value && selectedEntry && (
          <FinanceReconciliationClearAndBounceChequeDialog
            onSave={handleSave}
            dialogValue={dialog.value}
            onClose={handleClose}
            data={selectedEntry}
            fromClearCheck={isClearCheck}
          />
        )}
      </Box>
    </Box>
  );
};

export default Discrepancy;
