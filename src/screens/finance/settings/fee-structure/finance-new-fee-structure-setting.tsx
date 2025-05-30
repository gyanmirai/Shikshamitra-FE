'use client';

import React, { useState } from 'react';

import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Button, Switch, Tooltip, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { formatNumber } from 'src/utils/formate_number';

import initialData from 'src/json/finance/settings/fee-structure/feeStructureData.json';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { ConfirmDialog } from 'src/components/confirm-dialog/confirm-dialog';

import { feestructureDummyData } from './data/fee-structure-data';
import ReadOnlyFeeStructureTable from './component/read-only-fee-structure-table';
import FinanceAddFeeCategorySettingDialog from './component/finance-add-fee-category-setting-dialog';
import FinanceEditFeeStructureSettingDialog from './component/finance-edit-fee-structure-setting-dialog';

const FinanceNewFeeStructureSetting = () => {
  const dialog = useBoolean();
  const financeEditFeeStructureDialog = useBoolean();
  const finanveViewFeeStructureDialog = useBoolean();
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
          <CustomBreadcrumbs
            heading="Create Fee Structure"
            links={[
              { name: 'Finance', href: '/finance/dashboard' },
              { name: 'Settings', href: '/finance/settings/create-fee-structure/' },
              { name: 'Create Fee Structure' },
            ]}
            description="This is the Fee Structure section, where you can create, enable, or disable fee structures as needed."
            sx={{ px: 1, mb: 2 }}
            action={
              <Button
                variant="contained"
                startIcon={<Iconify icon="ic:outline-plus" />}
                onClick={() => {
                  setIsEdit(false);
                  setOpen(true);
                }}
              >
                New Fee Structure
              </Button>
            }
          />

          <CustomizableTable
            noDataText={
              <>
                No Fee Structure Found.
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
              { id: 'applicableGrade', label: 'Class', filterType: 'number' },

              {
                id: 'grossFee',
                label: 'Gross Fees',
                filterType: 'formattedNumber',
                render(value, row) {
                  return (
                    <Typography sx={{ fontSize: '12px' }}>{formatNumber(value, 'INR')}</Typography>
                  );
                },
              },
              {
                id: 'totaldiscountAmount',
                label: 'General Discount',
                filterType: 'formattedNumber',
                render(value, row) {
                  return (
                    <Typography sx={{ fontSize: '12px' }}>{formatNumber(value, 'INR')}</Typography>
                  );
                },
              },
              {
                id: 'totalPayableFee',
                label: 'Payable Fees',
                filterType: 'formattedNumber',
                render(value, row) {
                  return (
                    <Typography sx={{ fontSize: '12px' }}>{formatNumber(value, 'INR')}</Typography>
                  );
                },
              },

              {
                id: 'isActive',
                label: 'Active',
                isFilter: false,
                isSort: false,
                render(statusToggle) {
                  return <Switch value={statusToggle} />;
                },
              },
              {
                id: 'isLocked',
                label: 'Locked',
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
                // align: 'center',
                render(value, row: any) {
                  return (
                    <ThreeDotsActions
                      showThreeDots={false}
                      showDeleteIcon
                      showViewIcon
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
                      handleViewClick={() => {
                        setSelectedEntry(row);
                        dialog.onFalse();
                        financeEditFeeStructureDialog.onFalse();
                        finanveViewFeeStructureDialog.onTrue();
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
        <ConfirmDialog
          open={dialogForDeleteConfirmation.value}
          onClose={() => {
            dialogForDeleteConfirmation.onFalse();
          }}
          title="Delete Item"
          content="Are you sure you want to delete?"
          action={
            <LoadingButton variant="contained" loading={false} color="error" onClick={() => {}}>
              Yes
            </LoadingButton>
          }
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

      <CustomDialog
        maxWidth="xl"
        title={
          <Box display="flex" flexDirection="row" gap={2} alignItems="center">
            <Typography variant="h5">Detail Fee Structure Of Class 1</Typography>
            <Tooltip
              arrow
              placement="right"
              title="This is the detailed fee structure for Class 1, applicable to all students of that class except for specific scenarios."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </Tooltip>
          </Box>
        }
        open={finanveViewFeeStructureDialog.value}
        handleClose={() => {
          finanveViewFeeStructureDialog.onFalse();
        }}
      >
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '600px' }}>
          <ReadOnlyFeeStructureTable data={feestructureDummyData} />
        </Scrollbar>
      </CustomDialog>
    </>
  );
};

export default FinanceNewFeeStructureSetting;
