'use client';

import type { LabelColor } from 'src/components/label';

import React, { useMemo, useState } from 'react';

import { Add } from '@mui/icons-material';
import { Box, Tab, Tabs, Button, MenuItem, MenuList, Typography } from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';

import { GlobalIcons } from 'src/utils/icons';

import facilityData from 'src/json/ResourceManagement/facility/facilityData.json';
import {
  FacilityStatusType,
  FacilityStatusTypeColor,
  FacilityStatusTypeOptions,
} from 'src/enums/facility-statusType';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomizableTable from 'src/components/customizabaleTable';
import ThreeDotsActions from 'src/components/three-dots-actions';

import type { IFacility } from '../facilities-interface';

const AllFacilitiesTableSection = () => {
  const [selectedItem, setSelectedItem] = useState<IFacility>();
  const TABS = [
    {
      label: 'All', // Displays all items in the inventory
      value: 'all',
      count: 0,
      color: 'warning',
    },
    {
      label: 'Classroom',
      value: 'classroom',
      count: 0,
      color: 'success',
    },
    {
      label: 'Labs',
      value: 'lab',
      count: 0,
      color: 'info',
    },
    {
      label: 'Others',
      value: 'other',
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
      return facilityData;
    }

    // If the "Books" tab is selected, filter items by the "Book" type
    if (tabs.value === 'lab') {
      return facilityData.filter((item) => item.type.toLowerCase() === 'laboratory');
    }

    if (tabs.value === 'other') {
      return facilityData.filter(
        (item) =>
          item.type.toLowerCase() !== 'laboratory' && item.type.toLowerCase() !== 'classroom'
      );
    }

    // Otherwise, filter items by the selected type (e.g., IT, Sports, Stationary)
    return facilityData.filter((item) => item.type.toLowerCase() === tabs.value);
  }, [tabs.value]); // Re-run this logic whenever the selected tab value changes

  return (
    <>
      <Box>
        <Typography variant="h6" sx={{ mb: 2 }}>
          All Facilities
        </Typography>
      </Box>
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
                  <Label color={(tab?.color as LabelColor) || 'default'}>{tab.count}</Label>
                </Box>
              }
              // icon={tab.icon}
              value={tab.value}
            />
          ))}
        </Tabs>

        <Button variant="contained" size="small" startIcon={<Add />} onClick={() => {}}>
          Add Facility
        </Button>
      </Box>
      <CustomizableTable
        noDataText={
          <>
            No Facility Found.{' '}
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
              Add Facility
            </Box>
          </>
        }
        isFilter={false}
        isShowedDense={false}
        isSearch={false}
        tableId="facilities-allocation-overview"
        columns={[
          { id: 'id', label: 'ID' },

          { id: 'name', label: 'Name' },
          { id: 'type', label: 'Type' },
          { id: 'capacity', label: 'Capacity' },
          { id: 'location', label: 'Location' },
          {
            label: 'Status',
            id: 'status',
            minWidth: '100px',
            filterType: 'enum',
            enumOptions: FacilityStatusTypeOptions,
            render(value, row) {
              const color = FacilityStatusTypeColor[value as FacilityStatusType] as LabelColor;

              return <Label color={color}>{FacilityStatusType[value]}</Label>;
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
                  showEditIcon
                  showThreeDots
                  handleEditClick={() => {}}
                  actions={() => (
                    <MenuList>
                      <MenuItem>
                        <Iconify icon={GlobalIcons.calenderIcon} />
                        Book Facility
                      </MenuItem>
                    </MenuList>
                  )}
                />
              );
            },
          },
        ]}
        data={filteredData}
      />
    </>
  );
};

export default AllFacilitiesTableSection;
