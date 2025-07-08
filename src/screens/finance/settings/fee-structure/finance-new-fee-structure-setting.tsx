'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Add } from '@mui/icons-material';
import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Button, Switch, useTheme, IconButton, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { GlobalIcons } from 'src/utils/icons';
import { formatNumber } from 'src/utils/formate_number';

import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import initialData from 'src/json/finance/settings/fee-structure/feeStructureData.json';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
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
  const activeDialog = useBoolean();
  const theme = useTheme();
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();

  const [selectedEntry, setSelectedEntry] = useState<IFeeStructure | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [tableData, setTableData] = useState<IFeeStructure[]>(initialData);

  const [open, setOpen] = useState(false);

  const closeHandler = () => {
    setIsEdit(false);
    setOpen(false);
  };

  const newEntryHandler = () => {
    setIsEdit(false);
    setOpen(true);
  };

  // Handles closing the incident form
  const handleClose = (_e: any, isSubmit?: boolean) => {
    const resetState = () => {
      setTimeout(() => {
        setSelectedEntry(null);
        dispatch(setIsChanges(false));
      }, 200); // Adjust timing based on your dialog close animation
    };

    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      setOpen(false);
      setIsEdit(false);
      dialog.onFalse();
      financeEditFeeStructureDialog.onFalse();
      resetState();
    } else if (!isChanges) {
      setOpen(false);
      setIsEdit(false);
      dialog.onFalse();
      financeEditFeeStructureDialog.onFalse();
      setTimeout(() => {
        setSelectedEntry(null);
      }, 200);
    }
  };

  return (
    <>
      {!financeEditFeeStructureDialog.value && dialog.value && (
        <FinanceAddFeeCategorySettingDialog
          onSave={() => {}}
          dialogValue={dialog}
          onClose={handleClose}
          data={selectedEntry}
          isEdit={isEdit}
          allData={tableData}
          setSelectedEntry={setSelectedEntry}
        />
      )}
      {!financeEditFeeStructureDialog.value && !dialog.value && (
        <>
          <CustomBreadcrumbs
            heading="Fee Structure"
            links={[
              { name: 'Finance', href: '/finance/dashboard' },
              { name: 'Setting', href: '/finance/settings/create-fee-structure/' },
              { name: 'Fee Structure' },
            ]}
            description="This is the Fee Structure section, where you can create, enable, or disable fee structures as needed."
            sx={{ px: 1, mb: 2 }}
            action={
              <Button
                size="small"
                variant="contained"
                startIcon={<Add />}
                onClick={() => {
                  dialog.onTrue();
                  setIsEdit(false);
                }}
              >
                Fee Structure
              </Button>
            }
          />

          <CustomizableTable
            noDataText={
              <>
                No Fee Structure Data Found.
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
                render(value, row) {
                  const statusColor =
                    value === true ? theme.palette.success.main : theme.palette.text.secondary;
                  return (
                    <CustomTooltip
                      title={value === true ? 'Active' : 'InActive'}
                      arrow
                      placement="left"
                      PopperProps={{
                        modifiers: [
                          {
                            name: 'offset',
                            options: {
                              offset: [0, 0], // Try 0 or adjust closer
                            },
                          },
                        ],
                      }}
                    >
                      <IconButton
                        onClick={() => {
                          activeDialog.onTrue();
                          setSelectedEntry(row as any);
                        }}
                        sx={{
                          p: 0.6, // some padding for a more clickable area
                          borderRadius: '50%',
                          backgroundColor: 'rgba(0,0,0,0.06)', // light background to indicate clickability
                          transition: 'transform 0.2s ease-in-out, background-color 0.2s',
                          cursor: 'pointer',
                          '&:hover': {
                            transform: 'scale(1.1)',
                            backgroundColor: 'rgba(0,0,0,0.08)',
                          },
                        }}
                      >
                        <Iconify
                          icon={GlobalIcons.tick}
                          sx={{
                            width: 20,
                            height: 20,
                            color: statusColor,
                          }}
                        />
                      </IconButton>
                    </CustomTooltip>
                  );
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
                label: 'Actions',
                isFilter: false,
                isSort: false,
                sticky: true,
                align: 'left',
                minWidth: 70,
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
            <LoadingButton
              variant="contained"
              loading={false}
              color="error"
              onClick={() => {}}
              size="small"
            >
              Yes
            </LoadingButton>
          }
        />
      )}
      {financeEditFeeStructureDialog.value && (
        <FinanceEditFeeStructureSettingDialog
          data={selectedEntry}
          dialogValue={financeEditFeeStructureDialog}
          onClose={handleClose}
          setSelectedEntry={setSelectedEntry}
        />
      )}

      <ConfirmDialog
        open={activeDialog.value}
        onClose={() => {
          setTimeout(() => {
            setSelectedEntry(null);
            setIsEdit(false);
          }, 200); // Adjust delay (in ms) as needed
          activeDialog.onFalse();
        }}
        title={selectedEntry?.isActive === true ? 'InActive' : 'Active'}
        content={
          selectedEntry && Array.isArray(selectedEntry.applicableGrade) ? (
            <>
              Are you sure you want move <strong>Class {selectedEntry.applicableGrade}</strong> fee
              structure to {selectedEntry.isActive === true ? 'InActive' : 'Active'} ?
            </>
          ) : (
            <>
              Are you sure you want move <strong>Class {selectedEntry?.applicableGrade}</strong> fee
              structure to {selectedEntry?.isActive === true ? 'InActive' : 'Active'} ?
            </>
          )
        }
        action={
          <Button
            variant="contained"
            size="small"
            startIcon={
              <Iconify
                icon={
                  selectedEntry?.isActive === true ? GlobalIcons.draftIcon : GlobalIcons.publish
                }
              />
            }
            onClick={() => {
              const status = selectedEntry?.isActive === true ? 'InActive' : 'Active';
              shikshaMitraToast.success({
                message:
                  selectedEntry && Array.isArray(selectedEntry.applicableGrade) ? (
                    <>
                      Class {selectedEntry.applicableGrade} fee structure moved to {status}{' '}
                      successfully.
                    </>
                  ) : (
                    <>
                      Class {selectedEntry?.applicableGrade} fee structure moved to {status}{' '}
                      successfully.
                    </>
                  ),
              });
              setTimeout(() => {
                setSelectedEntry(null);
              }, 200); // Adjust delay (in ms) as needed
              activeDialog.onFalse();
            }}
          >
            {selectedEntry?.isActive === true ? 'InActive' : 'Active'}
          </Button>
        }
      />

      <CustomDialog
        maxWidth="xl"
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Detail Fee Structure Of Class 1</Typography>
            <CustomTooltip
              arrow
              placement="right"
              title="This is the detailed fee structure for Class 1, applicable to all students of that class except for specific scenarios."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
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
