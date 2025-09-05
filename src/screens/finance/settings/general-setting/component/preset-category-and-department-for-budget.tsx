import React, { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Box, Grid, Typography } from '@mui/material';
import CustomDialog from 'src/components/customDialog';
import CustomTooltip from 'src/components/custom-tooltip';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { ConfirmDialog } from 'src/components/confirm-dialog/confirm-dialog';

import AddBudgetCategoryDialog from '../dialogs/finance-add-budget-category-dialog';

const PresetCategoryAndDepartmentForBudget = () => {
  // Dialog state for delete confirmation popup
  const dialogForDeleteConfirmation = useBoolean();
  const [selectedEntry, setSelectedEntry] = useState<any | null>(null);
  // Dialog state for edit/add category popup
  const editDialog = useBoolean();
  // State to track if we are in edit mode or add mode
  const [isEdit, setIsEdit] = useState(false);

  return (
    <Box>
      <Grid container display="flex" flexDirection="column" spacing={2}>
        <Grid size={{ xs: 12 }}>
          <CustomizableTable
            noDataText={
              <>
                No Budget Category Data Found
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
                  Add Budget Category
                </Box>
              </>
            }
            tableId="existing-categories-departments"
            isShowedDense={false}
            isPagination={false}
            isFilter={false}
            columns={[
              {
                id: 'budgetCategoryName',
                label: 'Categories',
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
                render(_, row) {
                  return (
                    <ThreeDotsActions
                      showThreeDots={false}
                      showEditIcon
                      handleEditClick={() => {
                        setSelectedEntry(row);
                        setIsEdit(true);
                        editDialog.onTrue();
                      }}
                      showDeleteIcon
                      handleDeleteClick={() => {
                        setSelectedEntry(row);
                        dialogForDeleteConfirmation.onTrue();
                      }}
                    />
                  );
                },
              },
            ]}
            data={[
              { id: 1, budgetCategoryName: 'salary' },
              { id: 2, budgetCategoryName: 'utilities' },
              { id: 3, budgetCategoryName: 'supplies' },
              { id: 4, budgetCategoryName: 'maintenance' },
              { id: 5, budgetCategoryName: 'transportation' },
            ]}
          />
        </Grid>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          open={dialogForDeleteConfirmation.value}
          onClose={() => {
            setSelectedEntry(null);
            dialogForDeleteConfirmation.onFalse();
          }}
          title="Delete"
          content={
            <>
              Are you sure you want to delete the budget category{' '}
              <strong>{selectedEntry?.budgetCategoryName}</strong>?
            </>
          }
          action={
            <LoadingButton
              variant="contained"
              color="error"
              size="small"
              onClick={() => {
                // handle delete logic here
              }}
            >
              Yes
            </LoadingButton>
          }
        />

        {/* Add/Edit Budget Category Dialog */}
        <CustomDialog
          open={editDialog.value}
          handleClose={() => {
            setSelectedEntry(null);
            editDialog.onFalse();
          }}
          title={
            <Box display="flex" flexDirection="row" gap={1} alignItems="center">
              <Typography variant="h5">{isEdit ? 'Update' : 'Add'} Budget Category</Typography>
              <CustomTooltip
                arrow
                placement="right"
                title={
                  isEdit
                    ? 'Update an existing budget category to modify how expenses are organized and tracked'
                    : 'Add a new budget category to organize and track different types of expenses like salary, utilities, or supplies'
                }
              >
                <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
              </CustomTooltip>
            </Box>
          }
        >
          <AddBudgetCategoryDialog
            onClose={() => {
              setSelectedEntry(null);
              editDialog.onFalse();
            }}
            isEditMode={isEdit}
            data={selectedEntry}
            onSave={() => {
              setSelectedEntry(null);
              editDialog.onFalse();
            }}
          />
        </CustomDialog>
      </Grid>
    </Box>
  );
};

export default PresetCategoryAndDepartmentForBudget;
