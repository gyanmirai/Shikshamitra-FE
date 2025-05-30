import React, { useState } from 'react';

import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Grid, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import data from 'src/json/finance/settings/late-fee-type.json';

import CustomDialog from 'src/components/customDialog';
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
        <Grid item xs={12}>
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
            isShowedDense={false}
            isPagination={false}
            isFilter={false}
            isSearch={false}
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
                label: 'Action',
                isFilter: false,
                isSort: false,
                sticky: true,
                align: 'center',
                minWidth: 100,
                render(row, value) {
                  return (
                    <ThreeDotsActions
                      showThreeDots={false}
                      showDeleteIcon
                      showEditIcon
                      handleEditClick={() => {
                        setSelectedEntry(row);
                        setIsEdit(true);
                        editDialog.onTrue();
                      }}
                      handleDeleteClick={() => {
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

      {editDialog.value && (
        <CustomDialog
          open={editDialog.value}
          handleClose={() => {
            editDialog.onFalse();
          }}
          title={`${isEdit ? 'Edit' : 'Add'} Late Fee Type`}
          maxWidth="sm"
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
      )}
      {dialogForDeleteConfirmation.value && (
        <ConfirmDialog
          open={dialogForDeleteConfirmation.value}
          onClose={() => {
            dialogForDeleteConfirmation.onFalse();
          }}
          title="Delete Item"
          content="Are you sure want to delete?"
          action={
            <LoadingButton variant="contained" loading={false} color="error" onClick={() => {}}>
              Yes
            </LoadingButton>
          }
        />
      )}
    </Box>
  );
};

export default SetLateFeeTypeMethod;
