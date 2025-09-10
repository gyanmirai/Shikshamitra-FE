import React, { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Box, Grid, Typography } from '@mui/material';
import CustomDialog from 'src/components/customDialog';
import CustomTooltip from 'src/components/custom-tooltip';
import data from 'src/json/finance/settings/late-fee-type.json';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { ConfirmDialog } from 'src/components/confirm-dialog/confirm-dialog';

import AddLateFeeTypeDialog from '../dialogs/finance-add-late-fee-type-method-dialog';

import type { IFinanceAddLateFeeTypeInterface } from '../dialogs/finance-general-settings-interface';

const SetLateFeeTypeMethod = () => {
  // Dialog state for delete confirmation modal
  const dialogForDeleteConfirmation = useBoolean();
  // Dialog state for edit/add modal
  const editDialog = useBoolean();
  // State to track if we're in edit mode
  const [isEdit, setIsEdit] = useState(false);
  // State to store the currently selected late fee type entry
  const [selectedEntry, setSelectedEntry] = useState<IFinanceAddLateFeeTypeInterface | null>(null);

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Grid container spacing={2}>
        <Grid size={12}>
          <CustomizableTable
            noDataText={
              <>
                No Late Fee Type Found
                <Box
                  onClick={() => {
                    setIsEdit(false);
                    editDialog.onTrue();
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
                  Add Late Fee Type
                </Box>
              </>
            }
            isLoading={false}
            tableId="late-fee-type"
            columns={[
              {
                id: 'lateFeeTypeName',
                label: 'Late Fee Type',
                render(value) {
                  return (
                    <Typography fontSize="12px" sx={{ textTransform: 'capitalize' }}>
                      {value}
                    </Typography>
                  );
                },
              },
              {
                id: 'action',
                label: 'Actions',
                isFilter: false,
                isSort: false,
                sticky: true,
                align: 'left',
                minWidth: 50,
                render(value, row) {
                  return (
                    <ThreeDotsActions
                      showThreeDots={false}
                      showDeleteIcon
                      showEditIcon
                      handleEditClick={() => {
                        setSelectedEntry(row as IFinanceAddLateFeeTypeInterface);
                        setIsEdit(true);
                        editDialog.onTrue();
                      }}
                      handleDeleteClick={() => {
                        setSelectedEntry(row as IFinanceAddLateFeeTypeInterface);
                        dialogForDeleteConfirmation.onTrue();
                      }}
                    />
                  );
                },
              },
            ]}
            data={data}
          />
        </Grid>
      </Grid>

      <CustomDialog
        open={editDialog.value}
        handleClose={() => {
          editDialog.onFalse();
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {isEdit ? 'Update Late Fee Type' : 'Add Late Fee Type'}
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              title={
                isEdit
                  ? 'Update late fee type to modify how late fees are calculated for overdue payments'
                  : 'Add new late fee type to specify how late fees will be calculated for overdue payments'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <AddLateFeeTypeDialog
          onClose={() => {
            editDialog.onFalse();
          }}
          isEditMode={isEdit}
          data={selectedEntry}
          onSave={() => {
            editDialog.onFalse();
          }}
        />
      </CustomDialog>

      <ConfirmDialog
        open={dialogForDeleteConfirmation.value}
        onClose={() => {
          dialogForDeleteConfirmation.onFalse();
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete <strong>{selectedEntry?.lateFeeTypeName}</strong> late
            fee type?
          </>
        }
        action={
          <LoadingButton
            variant="contained"
            loading={false}
            size="small"
            color="error"
            onClick={() => {}}
          >
            Yes
          </LoadingButton>
        }
      />
    </Box>
  );
};

export default SetLateFeeTypeMethod;
