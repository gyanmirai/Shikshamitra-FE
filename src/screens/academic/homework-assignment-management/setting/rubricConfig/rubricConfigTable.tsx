'use client';

import React from 'react';
import CustomizableTable from 'src/components/customizabaleTable';

import { RubricListError } from './components/RubricListError';
import { getRubricConfigColumns } from './rubricConfigColumns';
import { getRubricActionColumn } from './rubricConfigActionColumn';

import type { RubricConfigTableProps } from './types';

const RubricConfigTable: React.FC<RubricConfigTableProps> = (props) => {
  const { data, isLoading, isError = false, hasMedium = true, onRetry } = props;
  return (
    <CustomizableTable
      tableId="rubric-config-table"
      isLoading={isLoading}
      isPagination
      isSearch
      isFilter
      noDataText={
        hasMedium
          ? 'No Rubric Templates Found'
          : 'Select an Academic Year, Board and Medium to view rubric templates.'
      }
      errorContent={
        isError && onRetry ? <RubricListError isLoading={isLoading} onRetry={onRetry} /> : undefined
      }
      columns={[...getRubricConfigColumns(), getRubricActionColumn(props)]}
      data={data}
    />
  );
};
export default RubricConfigTable;
