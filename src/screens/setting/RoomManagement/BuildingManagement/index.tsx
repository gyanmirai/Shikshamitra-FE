'use client';

import { useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Box, Stack, Button } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';
import { instituteSetupPaths } from 'src/constants/institute-setup';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { InstituteFieldFormattingPopover } from 'src/components/institute-field-formatting/institute-field-formatting-popover';

import BuildingForm from './components/buildingForm';
import BuildingTable from './components/buildingTable';
import { DeleteBuildingDialog } from './components/delete-building-dialog';

import type { IBuilding } from './types';

const BuildingManagement = () => {
  const addBuildingDialog = useBoolean();
  const deleteBuildingDialog = useBoolean();
  const [selectedBuilding, setSelectedBuilding] = useState<IBuilding | null>(null);
  const openAddBuilding = () => {
    setSelectedBuilding(null);
    addBuildingDialog.onTrue();
  };
  const closeForm = () => {
    addBuildingDialog.onFalse();
    setSelectedBuilding(null);
  };
  return (
    <Box height="100%" minHeight={0} minWidth={0} display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="Buildings"
        description="Define and organize building infrastructure by setting up buildings, floors and rooms to ensure effective facility management."
        links={[
          { name: 'Institute Setup', href: instituteSetupPaths.academicSetup },
          { name: 'Rooms & Buildings', href: instituteSetupPaths.roomsManagement.building },
          { name: 'Buildings' },
        ]}
        sx={{ px: 1 }}
        action={
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <InstituteFieldFormattingPopover scope="buildings" />
            <Button
              type="button"
              variant="contained"
              color="inherit"
              size="small"
              aria-label="Add building"
              startIcon={<Iconify icon={GlobalIcons.addIcon} />}
              onClick={openAddBuilding}
            >
              Building
            </Button>
          </Stack>
        }
      />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          overflow: 'hidden',
        }}
      >
        <BuildingTable
          onDelete={(data) => {
            setSelectedBuilding(data);
            deleteBuildingDialog.onTrue();
          }}
          onEdit={(data) => {
            setSelectedBuilding(data);
            addBuildingDialog.onTrue();
          }}
          onAddBuilding={openAddBuilding}
        />
      </Box>
      {addBuildingDialog.value && (
        <BuildingForm open={addBuildingDialog} onClose={closeForm} editData={selectedBuilding} />
      )}
      <DeleteBuildingDialog
        open={deleteBuildingDialog.value}
        building={selectedBuilding}
        onClose={() => {
          deleteBuildingDialog.onFalse();
          setSelectedBuilding(null);
        }}
      />
    </Box>
  );
};

export default BuildingManagement;
