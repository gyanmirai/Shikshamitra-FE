import React from 'react';

import { Box } from '@mui/material';

import CustomizableTable from 'src/components/customizabaleTable';

import { libararyCategoryDummyData } from '../data/general-setting-data';

const LibraryBookAndTagsSetting = () => {
  // Define table columns with category name and description fields
  const tableColumns = [
    { id: 'categoryName', label: 'Category Name' },
    { id: 'description', label: 'Description' },
  ];

  // Configuration object for the CustomizableTable component

  const tableConfig = {
    tableId: 'library-book-and-tags-setting',
    isFilter: false,
    isShowedDense: false,
    isSearch: false,
    columns: tableColumns,
    data: libararyCategoryDummyData,
  };

  return (
    <Box sx={{ padding: 3 }}>
      <CustomizableTable {...tableConfig} />
    </Box>
  );
};

export default LibraryBookAndTagsSetting;
