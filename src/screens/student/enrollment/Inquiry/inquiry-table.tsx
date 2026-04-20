'use client';

import type { UseBooleanReturn } from 'src/hooks/use-boolean';

import { Box } from '@mui/material';
import React, { useState } from 'react';
import sortQueryString from 'src/utils/sort-query-string';
import CustomizableTable from 'src/components/customizabaleTable';

import { useInquiryTableData } from './hooks/useInquiryTableData';
import { useInquiryTableColumns } from './hooks/useInquiryTableColumns';

import type { IInquiryResponse } from './type';

interface InquiryTableProps {
  followUpDialog: UseBooleanReturn;
  issueRegistrationFormDialog: UseBooleanReturn;
  // editData: null | IInquiryResponse;
  setEditData: React.Dispatch<React.SetStateAction<null | IInquiryResponse>>;
  inquiryDialog: UseBooleanReturn;
}

/**
 * Purpose:
 * Main specific container for the Inquiry Table.
 * Composes data fetching and column definitions to render the interactive table.
 *
 * Performance Notes:
 * - Uses memoized hooks for data and columns to minimize re-renders.
 * - `CustomizableTable` handles virtualization/pagination if implemented internally.
 *
 * Architectural Notes:
 * - Purely presentational/compositional layer. Contains no business logic or data transformation.
 */
const InquiryTable = ({
  followUpDialog,
  issueRegistrationFormDialog,
  setEditData,
  inquiryDialog,
}: InquiryTableProps) => {
  const { tableData, isLoading, isFetching } = useInquiryTableData();
  const columns = useInquiryTableColumns({
    inquiryDialog,
    issueRegistrationFormDialog,
    followUpDialog,
    setEditData,
  });

  const [query, setQuery] = useState({
    sorting: '',
    skipCount: 0,
    maxResultCount: 10,
  });

  const handleAddInquiry = () => {
    inquiryDialog.onTrue();
    setEditData(null);
  };

  const noDataText = (
    <>
      No Inquiry Found{' '}
      <Box
        component="span"
        onClick={handleAddInquiry}
        sx={{
          color: 'primary.main',
          fontWeight: 600,
          '&:hover': {
            cursor: 'pointer',
            textDecoration: 'underline',
          },
        }}
      >
        Add Inquiry
      </Box>
    </>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, flexGrow: 1 }}>
      <CustomizableTable
        tableTitle="Inquiry"
        showCheckbox
        isLoading={isLoading || isFetching}
        tableId="inquiry-table"
        noDataText={noDataText}
        columns={columns}
        serverSide
        onServerSort={(column, sortData) => {
          setQuery((prev) => ({
            ...prev,
            sorting: sortQueryString(sortData),
          }));
        }}
        onServerPagination={(page: number, rowsPerPage: number) => {
          setQuery((prev) => ({
            ...prev,
            skipCount: page * rowsPerPage,
            maxResultCount: rowsPerPage,
          }));
        }}
        data={tableData || []}
      />
    </Box>
  );
};

export default InquiryTable;
