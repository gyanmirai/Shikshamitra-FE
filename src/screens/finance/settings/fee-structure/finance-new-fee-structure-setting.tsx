'use client';

import React, { useState } from 'react';

import { Box, Button, Switch, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { formatNumber } from 'src/utils/formate_number';

import initialData from 'src/json/finance/settings/fee-structure/feeStructureData.json';

import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { DeleteConfirmationDialog } from 'src/components/delete-confirmation';

import FinanceAddFeeCategorySettingDialog from './component/finance-add-fee-category-setting-dialog';
import FinanceEditFeeStructureSettingDialog from './component/finance-edit-fee-structure-setting-dialog';

const FinanceNewFeeStructureSetting = () => {
  const dialog = useBoolean();
  const financeEditFeeStructureDialog = useBoolean();
  const dialogForDeleteConfirmation = useBoolean();

  const [selectedEntry, setSelectedEntry] = useState<any[]>(initialData);
  const [isEdit, setIsEdit] = useState(false);
  const [tableData, setTableData] = useState<any[]>(initialData);

  const [open, setOpen] = useState(false);

  const closeHandler = () => {
    setIsEdit(false);
    setOpen(false);
  };

  const newEntryHandler = () => {
    setIsEdit(false);
    setOpen(true);
  };

  return (
    <>
      {open ? (
        <FinanceAddFeeCategorySettingDialog
          onSave={() => {}}
          dialogValue={dialog.value}
          onClose={closeHandler}
          data={selectedEntry}
          isEdit={isEdit}
          allData={tableData}
        />
      ) : (
        <>
          <Box
            pb="20px"
            display="flex"
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <CustomBreadcrumbs
              heading="Fee Structure"
              links={[
                { name: 'Finance', href: '/finance/dashboard' },
                { name: 'Settings' },
                { name: 'Fee Structure' },
              ]}
              description="This is the Fee Structure section, where you can create, enable, or disable fee structures as needed."
              sx={{ px: 1, mb: 2 }}
            />
            <Box display="flex" flexDirection="row" justifyContent="flex-end">
              <Button
                startIcon={<Iconify icon="ic:outline-plus" />}
                onClick={newEntryHandler}
                variant="contained"
                size="small"
              >
                New Fee Structure
              </Button>
            </Box>
          </Box>

          <CustomizableTable
            noDataText={
              <>
                No Fee Structure Found.{' '}
                <Box
                  onClick={() => {
                    setIsEdit(false);
                    setOpen(true);
                  }}
                  color="primary.main"
                  fontWeight={600}
                  sx={{
                    '&:hover': {
                      cursor: 'pointer',
                      color: 'primary.main',
                      textDecoration: 'underline',
                    },
                  }}
                >
                  New Fee Structure
                </Box>
              </>
            }
            tableId="finance-fee-structure-setting-tab"
            searchFieldProps={{
              placeholder: 'Search by Class...',
              label: 'Search by Class...',
              sx: {
                maxWidth: '400px',
                width: '100%',
              },
            }}
            columns={[
              {
                id: 'bookRecipt',
                label: 'Receipt Book',
              },
              { id: 'applicableGrade', label: 'Applicable Class', filterType: 'number' },

              {
                id: 'grossFee',
                label: 'Gross Fees',
                filterType: 'number',
                render(value, row) {
                  return (
                    <Typography sx={{ fontSize: '12px' }}>{formatNumber(value, 'INR')}</Typography>
                  );
                },
              },
              {
                id: 'totaldiscountAmount',
                label: 'General Discount',
                filterType: 'number',
                render(value, row) {
                  return (
                    <Typography sx={{ fontSize: '12px' }}>{formatNumber(value, 'INR')}</Typography>
                  );
                },
              },
              {
                id: 'totalPayableFee',
                label: 'Payable Fees',
                filterType: 'number',
                render(value, row) {
                  return (
                    <Typography sx={{ fontSize: '12px' }}>{formatNumber(value, 'INR')}</Typography>
                  );
                },
              },

              {
                id: 'isActive',
                label: 'InActive/Active',
                isFilter: false,
                isSort: false,
                render(statusToggle) {
                  return <Switch value={statusToggle} />;
                },
              },
              {
                id: 'action',
                label: 'Action',
                isFilter: false,
                isSort: false,
                sticky: true,
                align: 'center',
                render(value, row: any) {
                  return (
                    <ThreeDotsActions
                      showThreeDots={false}
                      showDeleteIcon
                      handleDeleteClick={() => {
                        dialogForDeleteConfirmation.onTrue();

                        // handleDelete(row);
                      }}
                      showEditIcon
                      handleEditClick={() => {
                        setSelectedEntry(row);

                        dialog.onFalse();
                        financeEditFeeStructureDialog.onTrue();
                      }}
                    />
                  );
                },
              },
            ]}
            data={tableData}
          />
        </>
      )}

      {dialogForDeleteConfirmation.value && (
        <DeleteConfirmationDialog
          open={dialogForDeleteConfirmation.value}
          onClose={() => {
            dialogForDeleteConfirmation.onFalse();
          }}
          onConfirm={() => {}}
          title="Delete Item"
          description="Are you sure you want to delete this item? This action cannot be undone."
        />
      )}
      {financeEditFeeStructureDialog.value && (
        <FinanceEditFeeStructureSettingDialog
          data={selectedEntry}
          dialogValue={financeEditFeeStructureDialog.value}
          onClose={() => {
            financeEditFeeStructureDialog.onFalse();
          }}
        />
      )}
    </>
  );
};

export default FinanceNewFeeStructureSetting;
