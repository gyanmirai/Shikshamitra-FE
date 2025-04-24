import type { LabelColor } from 'src/components/label';

import React, { useMemo, useState } from 'react';

import { Add } from '@mui/icons-material';
import { Box, Tab, Tabs, Paper, Button, Drawer, Typography, drawerClasses } from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';
import { useBoolean } from 'src/hooks/use-boolean';

import { paper, varAlpha } from 'src/theme/styles';
import inventoryItem from 'src/json/ResourceManagement/InventoryManagement/inventory-data-for-all-categories.json';
import {
  InventoryItemStatusType,
  InventoryItemStatusOptions,
  InventoryItemStatusTypeColor,
} from 'src/enums/inventory-item-status';

import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';
import { Iconify } from 'src/components/iconify/iconify';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import InventoryManagementDetailsView from './inventory-management-details-view';

import type { IInventoryItem } from '../inventory-interface';

const InventoryItemTable = () => {
  // State to store the selected inventory item
  const [selectedData, setSelectedData] = useState<IInventoryItem>();

  // Boolean state to manage delete action (used for toggling delete operation)
  const deleteItem = useBoolean();
  // Boolean state to control the visibility of the item details (e.g., when a user clicks to view details)
  const viewItemDetails = useBoolean();

  // Predefined tabs to categorize the inventory items
  const TABS = [
    {
      label: 'All', // Displays all items in the inventory
      value: 'all',
      count: 0,
      color: 'warning',
    },
    {
      label: 'Books',
      value: 'books',
      count: 0,
      color: 'success',
    },
    {
      label: 'IT',
      value: 'it',
      count: 0,
      color: 'error',
    },
    {
      label: 'Stationary',
      value: 'stationary',
      count: 0,
      color: 'error',
    },
    {
      label: 'Sports',
      value: 'sports',
      count: 0,
      color: 'error',
    },
  ];

  // Tabs state to handle the active tab (used with the custom hook `useTabs`)
  const tabs = useTabs('all');

  // Memoized filtering logic based on the selected tab
  const filteredData = useMemo(() => {
    // If the "All" tab is selected, return all inventory items
    if (tabs.value === 'all') {
      return inventoryItem;
    }

    // If the "Books" tab is selected, filter items by the "Book" category
    if (tabs.value === 'books') {
      return inventoryItem.filter((item) => item.category.toLowerCase() === 'book');
    }

    // Otherwise, filter items by the selected category (e.g., IT, Sports, Stationary)
    return inventoryItem.filter((item) => item.category.toLowerCase() === tabs.value);
  }, [tabs.value]); // Re-run this logic whenever the selected tab value changes

  return (
    <Box>
      <Typography variant="h6">Inventory Items</Typography>
      <Box display="flex" gap={1} alignItems="flex-start">
        <Tabs
          value={tabs.value}
          onChange={tabs.onChange}
          sx={{
            mb: 2,
            '& .MuiTabs-flexContainer': { gap: 2 },
            flexGrow: 1,
          }}
        >
          {TABS.map((tab) => (
            <Tab
              sx={{ fontSize: '12px' }}
              key={tab.value}
              label={
                <Box display="flex" justifyContent="center" gap={1} alignItems="center">
                  {tab.label}{' '}
                  <Label
                    // variant={tab.value === EmployeeAttendanceStatus.All ? 'filled' : 'soft'}
                    color={(tab?.color as LabelColor) || 'default'}
                  >
                    {tab.count}
                  </Label>
                </Box>
              }
              // icon={tab.icon}
              value={tab.value}
            />
          ))}
        </Tabs>

        <Button variant="contained" size="small" startIcon={<Add />} onClick={() => {}}>
          Add Resource
        </Button>
      </Box>

      <CustomizableTable
        tableId="inventory-item-table"
        searchFieldProps={{
          placeholder: 'Search by Inventory Code,Name...',
          label: 'Search by Inventory Code,Name...',
          sx: {
            maxWidth: '400px',
            width: '100%',
          },
        }}
        noDataText={
          <>
            No Inventory Item Found.
            <Box
              onClick={() => {}}
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
              Add Resource
            </Box>
          </>
        }
        columns={[
          {
            label: 'Item Code',
            id: 'itemCode',
            minWidth: '100px',
          },
          {
            label: 'Name',
            id: 'name',
            minWidth: '100px',
          },
          {
            label: 'Category',
            id: 'category',
            minWidth: '100px',
          },
          {
            label: 'Quantity',
            id: 'quantity',
            minWidth: '100px',
            filterType: 'number',
          },
          {
            label: 'Available',
            id: 'available',
            minWidth: '100px',
            filterType: 'number',
          },
          {
            label: 'Location',
            id: 'location',
            minWidth: '100px',
          },
          {
            label: 'Status',
            id: 'status',
            minWidth: '100px',
            filterType: 'enum',
            enumOptions: InventoryItemStatusOptions,
            render(value, row) {
              const color = InventoryItemStatusTypeColor[
                value as InventoryItemStatusType
              ] as LabelColor;

              return <Label color={color}>{InventoryItemStatusType[value]}</Label>;
            },
          },

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
                  showViewIcon
                  showDeleteIcon
                  showThreeDots={false}
                  handleViewClick={() => {
                    setSelectedData(row as IInventoryItem);
                    viewItemDetails.onTrue();
                  }}
                  handleDeleteClick={() => {
                    deleteItem.onTrue();
                  }}
                />
              );
            },
          },
        ]}
        data={filteredData}
      />

      {deleteItem.value && (
        <ConfirmDialog
          open={deleteItem.value}
          onClose={deleteItem.onFalse}
          title="Delete"
          content="Are you sure want to delete?"
          action={
            <Button
              variant="contained"
              color="error"
              onClick={async () => {
                deleteItem.onFalse();
              }}
            >
              Delete
            </Button>
          }
        />
      )}

      {
        <Drawer
          anchor="right"
          open={viewItemDetails.value}
          onClose={() => {
            viewItemDetails.onFalse();
          }}
          slotProps={{ backdrop: { invisible: true } }}
          sx={{
            [`& .${drawerClasses.paper}`]: (theme) => ({
              ...paper({
                theme,
                color: varAlpha(theme.vars.palette.background.defaultChannel, 0.9),
              }),
              width: 400,
            }),
          }}
        >
          <Paper
            elevation={12}
            component="button"
            autoFocus
            sx={{
              border: 'none',
              maxWidth: '400px',
              width: '100%',
              zIndex: 9999,
              height: '100%',
              textAlign: 'left',
              // transition: 'all 0.3s ease',
              // transform: viewItemDetails.value ? 'translateX(0)' : 'translateX(110%)',
            }}

            // ref={ref}
          >
            <Scrollbar sx={{ height: '100%', p: 2 }}>
              <Iconify
                icon="zondicons:close-outline"
                onClick={() => {
                  viewItemDetails.onFalse();
                }}
                sx={{ position: 'absolute', top: 10, right: 10, cursor: 'pointer' }}
              />
              {selectedData && <InventoryManagementDetailsView data={selectedData} />}
            </Scrollbar>
          </Paper>
        </Drawer>
      }
    </Box>
  );
};

export default InventoryItemTable;

function useBoolen() {
  throw new Error('Function not implemented.');
}
