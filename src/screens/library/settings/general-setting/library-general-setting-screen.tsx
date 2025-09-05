'use client';

import React, { useMemo } from 'react';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Box, Tab, Card, Button } from '@mui/material';
import { CustomTabs } from 'src/components/custom-tabs';
import { useSearchParam } from 'src/hooks/use-search-param';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import LibraryLoanSetting from './component/library-loan-setting';
import LibraryTimingSetting from './component/library-timing-setting';
import LibraryAddCategoryDialog from './component/library-add-category-dialog';
import LibraryBookAndTagsSetting from './component/library-book-and-tags-setting';

const TABS = [
  {
    value: 'library-timings',
    label: 'Library Timings',
    icon: <Iconify icon="stash:feed-duotone" width={20} />,
    component: () => <LibraryTimingSetting />,
  },
  {
    value: 'loan-policies',
    label: 'Loan Policies',
    icon: <Iconify icon="fluent-mdl2:account-management" width={20} />,
    component: () => <LibraryLoanSetting />,
  },
  {
    value: 'book-categories-and-tags',
    label: 'Book Categories',
    icon: <Iconify icon="fluent-mdl2:account-management" width={20} />,
    component: () => <LibraryBookAndTagsSetting />,
  },
];

const LibraryGeneralSettingScreen = () => {
  // Hook to manage URL search parameters, initializing with 'library-timings' tab
  const [searchParams, setSearchParams] = useSearchParam({ tab: 'library-timings' });

  // Find and memoize the currently active tab component based on the URL search parameter
  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === searchParams?.tab),
    [searchParams.tab]
  );

  // Boolean state to control the visibility of add category dialog
  const addCategoryDialog = useBoolean();

  // Handler for the submit button click
  // Shows add category dialog for book categories tab
  // Saves library timing settings for library timings tab
  const handleSubmitButton = () => {
    if (searchParams.tab === 'book-categories-and-tags') {
      addCategoryDialog.onTrue();
    } else if (searchParams.tab === 'library-timings') {
      // TODO: Call save API for library timings
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
        <CustomBreadcrumbs
          heading="General Setting"
          links={[
            { name: 'Library', href: '/library/dashboard' },
            { name: 'Setting' },
            { name: 'General Setting' },
          ]}
          sx={{ px: 1, mb: 2 }}
          description="Manage library timings, fines, and other general configurations for the library module here"
        />

        {(searchParams.tab === 'library-timings' ||
          searchParams.tab === 'book-categories-and-tags') && (
          <Button
            startIcon={
              <Iconify
                icon={
                  searchParams.tab === 'library-timings'
                    ? 'material-symbols:save-sharp'
                    : 'material-symbols:add'
                }
              />
            }
            variant="outlined"
            onClick={handleSubmitButton}
            sx={{ mt: 2 }}
          >
            {searchParams.tab === 'library-timings' ? 'Save' : 'Add Category'}
          </Button>
        )}
      </Box>
      <Card>
        <CustomTabs
          value={searchParams.tab}
          onChange={(e, value) => setSearchParams({ tab: value })}
          sx={{ '& .MuiTabs-flexContainer': { gap: 1.5 } }}
          role="tablist"
        >
          {TABS.map((tab) => (
            <Tab
              sx={{ fontSize: '12px' }}
              icon={tab.icon}
              key={tab.value}
              value={tab.value}
              label={tab.label}
            />
          ))}
        </CustomTabs>
      </Card>
      <Box px={1} pt={2}>
        {currentActiveComponent?.component && (
          <currentActiveComponent.component
          // searchParams={searchParams}
          // setSearchParams={setSearchParams}
          />
        )}
      </Box>

      {addCategoryDialog.value && (
        <LibraryAddCategoryDialog
          open={addCategoryDialog.value}
          onClose={() => {
            addCategoryDialog.onFalse();
          }}
        />
      )}
    </Box>
  );
};

export default LibraryGeneralSettingScreen;
