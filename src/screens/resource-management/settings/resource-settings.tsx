'use client';

import React, { useMemo } from 'react';

import { Add } from '@mui/icons-material';
import { Box, Tab, Card, Button } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSearchParam } from 'src/hooks/use-search-param';

import CustomDialog from 'src/components/customDialog';
import { CustomTabs } from 'src/components/custom-tabs';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import ResourceCategoryConfiguration from './resource-category/resource-category-configuration';
import AddResourceCategoryDialog from './resource-category/component/add-resource-category-dialog';
import AddSubCategoryDialog from './resource-subcategory/component/add-resource-subcategory-dialog';
import ResourceSubCategoryConfiguration from './resource-subcategory/resource-subcategory-configuration';

import type { IResourceCategoryFormValues } from './resource-category/resource-category-interface';
import type { IResourceSubCategoryFormValues } from './resource-subcategory/resource-subcategory-interface';

const TABS = [
  {
    value: 'resourceCategoryConfiguration',
    label: 'Resource Category Configuration',
    component: () => <ResourceCategoryConfiguration />,
  },
  {
    value: 'resourceSubCategoryConfiguration',
    label: 'Resource Sub Category Configuration',
    component: () => <ResourceSubCategoryConfiguration />,
  },
];

const ResourceSetting = () => {
  const addResourceCategoryDialog = useBoolean();
  const addResourceSubCategoryDialog = useBoolean();

  const [searchParams, setSearchParams] = useSearchParam({ tab: 'resourceCategoryConfiguration' });

  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === searchParams?.tab),
    [searchParams.tab]
  );

  const breadcrumbTabName = TABS.find((tab) => tab.value === searchParams?.tab)?.label || '';

  // Function to determine the button text based on the active tab
  const handleButtonText = (tab: string) => {
    switch (tab) {
      case 'resourceCategoryConfiguration':
        return 'Add Resource Category';
      case 'resourceSubCategoryConfiguration':
        return 'Add Resource Sub Category';
      default:
        return '';
    }
  };

  // Handle button click to open the dialog based on the active tab
  const handleButtonClick = (tab: string) => {
    switch (tab) {
      case 'resourceCategoryConfiguration':
        addResourceCategoryDialog.onTrue();
        break;
      case 'resourceSubCategoryConfiguration':
        addResourceSubCategoryDialog.onTrue();
        break;
      default:
        return undefined;
    }

    return undefined;
  };

  return (
    <Box>
      <Box display="flex" flexDirection="row" justifyContent="space-between" alignItems="center">
        <CustomBreadcrumbs
          heading="Settings"
          links={[
            { name: 'Resource Management', href: '' },
            { name: 'Settings' },
            { name: breadcrumbTabName },
          ]}
          sx={{ px: 1, mb: 2 }}
        />
        {/* Button to trigger dialog based on selected tab */}
        <Button
          sx={{ px: 1, mb: 2 }}
          startIcon={<Add />}
          variant="contained"
          onClick={() => handleButtonClick(searchParams.tab)}
        >
          {handleButtonText(searchParams.tab)}
        </Button>
      </Box>

      <Card>
        <CustomTabs
          value={searchParams.tab}
          onChange={(e, value) => setSearchParams({ tab: value })}
          sx={{ '& .MuiTabs-flexContainer': { gap: 1.5 } }}
          role="tablist"
        >
          {TABS.map((tab) => (
            <Tab sx={{ fontSize: '12px' }} key={tab.value} value={tab.value} label={tab.label} />
          ))}
        </CustomTabs>
      </Card>

      <Box px={1} pt={2}>
        {currentActiveComponent?.component && <currentActiveComponent.component />}
      </Box>

      {/* Resource Category Dialog */}
      {addResourceCategoryDialog.value && (
        <CustomDialog
          title="Add Resource Category"
          open={addResourceCategoryDialog.value}
          handleClose={addResourceCategoryDialog.onFalse}
        >
          <AddResourceCategoryDialog
            isEdit={false}
            data={{ categoryName: '' } as IResourceCategoryFormValues}
          />
        </CustomDialog>
      )}

      {/* Resource SubCategory Dialog */}
      {addResourceSubCategoryDialog.value && (
        <CustomDialog
          title="Add Resource Sub Category"
          open={addResourceSubCategoryDialog.value}
          handleClose={addResourceSubCategoryDialog.onFalse}
        >
          <AddSubCategoryDialog
            isEdit={false}
            data={{ categoryName: '', subcategoryName: '' } as IResourceSubCategoryFormValues}
          />
        </CustomDialog>
      )}
    </Box>
  );
};

export default ResourceSetting;
