import type { LabelColor } from 'src/components/label';

import React from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Box, MenuList, MenuItem } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetDiscrepancyQuery } from 'src/redux/finance/reconciliation';
import {
  DiscrepancyStatusType,
  DiscrepancyStatusColor,
  DiscrepancyStatusOptions,
} from 'src/enums/finance-reconcilition-discrepancy-status';

const Discrepancy = () => {
  // Fetch discrepancy data using the custom hook pattern
  const { data: discrepancyApiData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetDiscrepancyQuery,
  });

  const typeOptions = discrepancyApiData?.typeOptions;
  const data = discrepancyApiData?.data;

  const handleMarkAsResolved = async (discrepancyId: string) => {};

  return (
    <Box>
      <Box>
        <CustomizableTable
          isLoading={isLoading}
          noDataText={<>No Discrepancy Data Found </>}
          tableId="discrepancy-table"
          columns={[
            {
              id: 'id',
              label: 'ID',
              minWidth: '80px',
              align: 'left',
              sticky: true,
              isFilter: true,
              filterType: 'string',
            },
            {
              id: 'type',
              label: 'Type',
              minWidth: '150px',
              align: 'left',
              isFilter: true,
              filterType: 'enum',
              enumOptions: typeOptions,
            },
            {
              id: 'student',
              label: 'Student',
              minWidth: '150px',
              align: 'left',
              isFilter: true,
              filterType: 'string',
            },
            {
              id: 'classDivision',
              label: 'Class/Division',
              minWidth: '130px',
              align: 'left',
              isFilter: true,
              filterType: 'string',
            },
            {
              id: 'amount',
              label: 'Amount',
              minWidth: '100px',
              align: 'left',
              isFilter: true,
              filterType: 'string',
            },
            {
              id: 'transactionId',
              label: 'Transaction ID',
              minWidth: '140px',
              align: 'left',
              isFilter: true,
              filterType: 'string',
            },
            {
              id: 'date',
              label: 'Date',
              minWidth: '100px',
              align: 'left',
              isFilter: true,
              filterType: 'date',
            },
            {
              id: 'status',
              label: 'Status',
              minWidth: '100px',
              align: 'left',
              isFilter: true,
              filterType: 'enum',
              enumOptions: DiscrepancyStatusOptions,
              render(value, row) {
                const color = DiscrepancyStatusColor[value as DiscrepancyStatusType] as LabelColor;
                return <Label color={color}>{DiscrepancyStatusType[value]}</Label>;
              },
            },
            {
              id: 'actions',
              label: 'Actions',
              isFilter: false,
              isSort: false,
              sticky: true,
              align: 'left',
              minWidth: '60px',
              render(value, row) {
                return (
                  <ThreeDotsActions
                    actions={({ popover }) => (
                      <MenuList>
                        <MenuItem
                          onClick={(e) => {
                            handleMarkAsResolved(row.id);
                            popover.onClose();
                          }}
                        >
                          <Iconify icon="mdi:check-circle" />
                          Mark as Resolved
                        </MenuItem>
                      </MenuList>
                    )}
                    placement="right-top"
                  />
                );
              },
            },
          ]}
          data={data || []}
        />
      </Box>
    </Box>
  );
};

export default Discrepancy;
