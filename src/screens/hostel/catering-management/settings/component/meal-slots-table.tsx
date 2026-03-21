import React from 'react';
import { Box, Button } from '@mui/material';
import { useBoolean } from 'src/hooks/useBoolean';
import CustomDialog from 'src/components/custom-dialog';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizable-table';
import data from 'src/json/hostel/catering-management/meal-slots-data.json';

import AddMealSlotsDialog from './add-meal-slots-dialog';

import type { IAddMealSlotForm } from '../meal-slots-interfcae';

const MealSlotsTable = () => {
  const addMealSlotDialog = useBoolean();
  const deleteMealSlotDialog = useBoolean();
  const [selectedMeal, setSelectedMeal] = React.useState<IAddMealSlotForm | null>(null);

  const [isEdit, setIsEdit] = React.useState<boolean>(false);
  return (
    <>
      <CustomizableTable
        isSearch={false}
        isFilter={false}
        isShowedDense={false}
        noDataText={
          <>
            No Meal Slots Found{' '}
            <Box
              onClick={() => {
                setSelectedMeal(null);
                setIsEdit(false);
                addMealSlotDialog.onTrue();
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
              Add Slots
            </Box>{' '}
          </>
        }
        tableId="meal-slots-table"
        columns={[
          { id: 'mealSlotsName', label: 'Meal Slots Name' },
          { id: 'description', label: 'Description' },

          {
            id: 'action',
            label: 'Actions',
            align: 'left',
            minWidth: 100,
            sticky: true,
            isFilter: false,
            isSort: false,
            render(value, row) {
              return (
                <ThreeDotsActions
                  placement="right-top"
                  // showViewIcon
                  showThreeDots={false}
                  showDeleteIcon
                  showEditIcon
                  showViewIcon
                  handleEditClick={() => {
                    setSelectedMeal(row as IAddMealSlotForm);
                    setIsEdit(true);
                    addMealSlotDialog.onTrue();
                  }}
                  handleDeleteClick={() => {
                    setSelectedMeal(row as IAddMealSlotForm);
                    deleteMealSlotDialog.onTrue();
                  }}
                  handleViewClick={() => {
                    setSelectedMeal(row as IAddMealSlotForm);
                    setIsEdit(false);
                    addMealSlotDialog.onTrue();
                  }}
                />
              );
            },
          },
        ]}
        data={data}
      />

      {addMealSlotDialog.value && (
        <CustomDialog
          title="Add Meal Slots"
          open={addMealSlotDialog.value}
          handleClose={() => {
            addMealSlotDialog.onFalse();
          }}
        >
          <AddMealSlotsDialog
            isEdit={isEdit}
            onClose={() => {
              addMealSlotDialog.onFalse();
            }}
            data={selectedMeal}
          />
        </CustomDialog>
      )}

      {deleteMealSlotDialog.value && (
        <ConfirmDialog
          open={deleteMealSlotDialog.value}
          onClose={() => {
            deleteMealSlotDialog.onFalse();
          }}
          title="Delete"
          content="Are you sure you want to delete?"
          action={
            <Button variant="contained" color="error" onClick={() => {}}>
              Yes
            </Button>
          }
        />
      )}
    </>
  );
};

export default MealSlotsTable;
