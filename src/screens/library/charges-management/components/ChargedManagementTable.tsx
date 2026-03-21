import type { LabelColor } from 'src/components/label';
import type { UseBooleanReturn } from 'src/hooks/useBoolean';
import type { IColumn } from 'src/components/customizable-table/types';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import React, { useMemo, useState, useCallback } from 'react';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizable-table';
import { Box, Tab, Tabs, MenuItem, MenuList } from '@mui/material';
import { LibraryChargeStatusType } from 'src/enums/library_charges_type';
import { FormSlider } from 'src/screens/student/enrollment/register/register-form';

import type { ILibraryChargeData } from './type';

const TABS = [
  {
    label: 'Paid',
    value: LibraryChargeStatusType.Paid,
    color: 'success',
  },
  {
    label: 'Pending',
    value: LibraryChargeStatusType.Pending,
    color: 'warning',
  },
];

const LibraryChargesTable = ({
  data,
  addChargesDialog,
  onCollectCharges,
  onEditCharge,
  onDeleteCharge,
  onViewCharges,
}: {
  data: ILibraryChargeData[];
  addChargesDialog: UseBooleanReturn;
  onCollectCharges: (row: ILibraryChargeData) => void;
  onEditCharge: (row: ILibraryChargeData) => void;
  onDeleteCharge: (row: ILibraryChargeData) => void;
  onViewCharges: (row: ILibraryChargeData) => void;
}) => {
  const [tabValue, setTabValue] = useState(LibraryChargeStatusType.Paid);

  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <MenuList>
        <MenuItem
          onClick={() => {
            onCollectCharges(row);
            pop.onClose();
          }}
        >
          <Iconify icon="mdi:cash-multiple" sx={{ height: '16px', width: '16px' }} />
          Collect Charges
        </MenuItem>
      </MenuList>
    ),
    [onCollectCharges]
  );

  const columns: IColumn[] = useMemo(
    () => [
      {
        id: 'memberName',
        label: 'Member Name',
        align: 'left',
        minWidth: '150px',
        sticky: true,
      },
      { id: 'memberId', label: 'Member ID', align: 'left', minWidth: '130px' },
      { id: 'bookTitle', label: 'Book Title', align: 'left', minWidth: '150px' },
      { id: 'accessionNo', label: 'Accession No.', align: 'left', minWidth: '140px' },
      { id: 'role', label: 'Role', align: 'left' },
      { id: 'chargeCategory', label: 'Charge Category', align: 'left', minWidth: '160px' },
      { id: 'dueDate', label: 'Due Date', align: 'left', minWidth: '120px' },
      {
        id: 'fineAmount',
        label: 'Amount',
        align: 'left',
        filterType: 'number',
        render(value) {
          return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
          }).format(value);
        },
      },
      { id: 'rollNo', label: 'Roll No.', align: 'left', minWidth: 90 },
      { id: 'grNo', label: 'GR No.', align: 'left', minWidth: 90 },
      { id: 'classNo', label: 'Class', align: 'left', minWidth: '80px' },
      { id: 'division', label: 'Division', align: 'left', minWidth: '80px' },
      { id: 'contactNo', label: 'Contact No.', align: 'left', minWidth: '130px' },
      { id: 'reason', label: 'Reason', align: 'left' },
      {
        id: 'actions',
        label: 'Actions',
        align: 'left',
        isSort: false,
        isFilter: false,
        minWidth: 80,
        sticky: true,
        render(value, row) {
          return (
            <ThreeDotsActions
              actions={(prop) => actions({ ...prop, row })}
              placement="right-top"
              showThreeDots={row.status === LibraryChargeStatusType.Pending}
              showEditIcon
              handleEditClick={() => {
                onEditCharge(row as ILibraryChargeData);
              }}
              showDeleteIcon
              handleDeleteClick={() => {
                onDeleteCharge(row as ILibraryChargeData);
              }}
              showViewIcon
              handleViewClick={() => {
                onViewCharges(row as ILibraryChargeData);
              }}
            />
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const currentIndex = TABS.findIndex((tab) => tab.value === tabValue);

  // Calculate total paid and pending amounts
  const totals = useMemo(() => {
    const paid = data
      ?.filter((i) => i.status === LibraryChargeStatusType.Paid)
      .reduce((sum, i) => sum + (Number(i.fineAmount) || 0), 0);
    const pending = data
      ?.filter((i) => i.status === LibraryChargeStatusType.Pending)
      .reduce((sum, i) => sum + (Number(i.fineAmount) || 0), 0);
    return { paid, pending };
  }, [data]);

  // Count charges by status for tab labels
  const chargeCounts = useMemo(
    () => ({
      paid: data?.filter((i) => i.status === LibraryChargeStatusType.Paid)?.length || 0,
      pending: data?.filter((i) => i.status === LibraryChargeStatusType.Pending)?.length || 0,
    }),
    [data]
  );

  // Filter table data based on selected tab
  const tableData = useMemo(() => data?.filter((i) => i.status === tabValue), [data, tabValue]);
  const isBackClick = false;
  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ ml: 2, mt: 1 }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          orientation="horizontal"
          sx={{
            '& .MuiTabs-flexContainer': { gap: 2 },
            minWidth: 200,
            mb: 1,
          }}
        >
          {TABS.map((tab) => (
            <Tab
              key={tab.value}
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  {tab.label}
                  <Label color={tab.color as LabelColor}>
                    {tab.value === LibraryChargeStatusType.Paid
                      ? chargeCounts.paid
                      : chargeCounts.pending}
                  </Label>
                </Box>
              }
              value={tab.value}
              sx={{ fontSize: '12px' }}
            />
          ))}
        </Tabs>
        <Box>
          {tabValue === LibraryChargeStatusType.Paid ? (
            <Label variant="soft" color="success" sx={{ fontSize: '14px', px: 2, width: 180 }}>
              Total Paid: ₹{totals.paid}
            </Label>
          ) : (
            <Label variant="soft" color="warning" sx={{ fontSize: '14px', px: 2, width: 180 }}>
              Total Pending: ₹{totals.pending}
            </Label>
          )}
        </Box>
      </Box>
      <FormSlider
        steps={TABS}
        isBackClick={isBackClick}
        step={currentIndex}
        containerProps={{
          sx: {
            p: 0,
            minHeight: 0,
          },
        }}
      >
        <Box sx={{ height: '100%' }}>
          <CustomizableTable
            tableId="library-charges-table"
            noDataText="No Charges Data Found"
            columns={columns}
            data={tableData || []}
          />
        </Box>
      </FormSlider>
    </>
  );
};

export default LibraryChargesTable;
