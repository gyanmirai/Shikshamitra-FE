'use client';

import React from 'react';
import { Add } from '@mui/icons-material';
import { Box, Button } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import MealSlotsTable from './component/meal-slots-table';
import AddMealSlotsDialog from './component/add-meal-slots-dialog';

const MealSlotConfigurationScreen = () => {
  const links = [
    { name: 'Catering Management', href: '' },
    { name: 'Settings', href: '' },
  ];

  const addMealSlotDialog = useBoolean();
  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="Settings"
        description="Here you can add slots and configure other settings related to catering management."
        links={links}
        sx={{ px: 1, mb: 2 }}
        action={
          <Button
            size="small"
            startIcon={<Add />}
            variant="contained"
            onClick={() => {
              addMealSlotDialog.onTrue();
            }}
          >
            Add Slots
          </Button>
        }
      />

      <MealSlotsTable />
      {addMealSlotDialog.value && (
        <CustomDialog
          title="Add Meal Slots"
          open={addMealSlotDialog.value}
          handleClose={() => {
            addMealSlotDialog.onFalse();
          }}
        >
          <AddMealSlotsDialog
            isEdit={false}
            onClose={() => {
              addMealSlotDialog.onFalse();
            }}
            data={null}
          />
        </CustomDialog>
      )}
    </Box>
  );
};

export default MealSlotConfigurationScreen;
