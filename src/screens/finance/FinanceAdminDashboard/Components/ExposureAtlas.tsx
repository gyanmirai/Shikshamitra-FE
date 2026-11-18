'use client';

import type { RootState } from 'src/redux/store';
import type { BoardMediumOption } from 'src/components/boardMediumDropdown';

import { useSelector } from 'react-redux';
import { useMemo, useState, useEffect } from 'react';
import { formatNumber } from 'src/utils/formate_number';
import BoardMediumDropdown from 'src/components/boardMediumDropdown';
import CustomizableTable from 'src/components/customizabaleTable';
import CustomSelect from 'src/components/custom-select';
import { FormSectionCard } from 'src/components/form-section-card';
import { DashboardCard } from 'src/components/dashboard-card/dashboard-card';
import type { IColumn } from 'src/components/customizabaleTable/types';
import { Box, Stack, Typography } from '@mui/material';

import { financeExposurePreview } from '../finance-admin-dashboard-preview-data';
import { financeDashboardCardSx } from './finance-dashboard-card-styles';

const outstandingColumns: IColumn[] = [
  { id: 'className', label: 'Class', rowHeader: true, minWidth: 140, isFilter: true, isSort: true },
  ...[
    { id: 'outstanding', label: 'Outstanding' },
    { id: 'overdue', label: 'Overdue' },
    { id: 'charges', label: 'Separate Charges' },
  ].map((column): IColumn => ({
    ...column,
    minWidth: 150,
    align: 'right',
    headerAlign: 'left',
    filterType: 'number',
    valueType: 'money',
    isFilter: true,
    isSort: true,
    render: (value) => formatNumber(value, 'INR'),
  })),
  {
    id: 'students',
    label: 'Students With Overdue Fees',
    minWidth: 180,
    align: 'right',
    headerAlign: 'left',
    filterType: 'number',
    valueType: 'number',
    isFilter: true,
    isSort: true,
  },
];

export default function ExposureAtlas() {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const options = useMemo<BoardMediumOption[]>(
    () =>
      (currentYear?.boards ?? []).flatMap((board: any) =>
        (board.educationMediums ?? []).map((medium: any) => ({
          label: `${board.name} / ${medium.name}`,
          boardId: String(board.id),
          mediumId: String(medium.id),
        }))
      ),
    [currentYear?.boards]
  );
  const [selectedBoardMedium, setSelectedBoardMedium] = useState<BoardMediumOption | null>(null);
  const activeBoardMedium =
    options.find(
      (option) =>
        option.boardId === selectedBoardMedium?.boardId &&
        option.mediumId === selectedBoardMedium?.mediumId
    ) ??
    options[0] ??
    null;

  useEffect(() => {
    if (
      activeBoardMedium?.boardId !== selectedBoardMedium?.boardId ||
      activeBoardMedium?.mediumId !== selectedBoardMedium?.mediumId
    ) {
      setSelectedBoardMedium(activeBoardMedium);
    }
  }, [activeBoardMedium, selectedBoardMedium?.boardId, selectedBoardMedium?.mediumId]);

  const [selectedClass, setSelectedClass] = useState('all');
  const [page, setPage] = useState(0);
  const classOptions = [
    { label: 'All classes', value: 'all' },
    ...financeExposurePreview.classes.map((item) => ({
      label: item.className,
      value: item.className,
    })),
  ];
  const rows = financeExposurePreview.classes.filter(
    (item) => selectedClass === 'all' || item.className === selectedClass
  );

  return (
    <FormSectionCard
      title="Outstanding Fees by Class"
      descriptionTooltip="Outstanding and overdue fees for the selected academic year, independent of activity dates. Separate charges are shown separately. These preview rows are not scoped by board and medium. Use class, search or column filters to refine the table."
      sx={financeDashboardCardSx}
    >
      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
        {options.length > 0 && (
          <BoardMediumDropdown
            value={activeBoardMedium}
            onChange={setSelectedBoardMedium}
            minWidth={200}
          />
        )}
        <CustomSelect
          label="Class"
          value={selectedClass}
          onChange={(value) => {
            setSelectedClass(String(value));
            setPage(0);
          }}
          options={classOptions}
          size="small"
          sx={{ minWidth: 160 }}
        />
      </Stack>
      {!options.length && (
        <Typography role="status" variant="body2" color="text.secondary">
          No board and medium options are available for this year.
        </Typography>
      )}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' },
          gap: 2,
        }}
      >
        <DashboardCard
          title="Overdue"
          value={formatNumber(financeExposurePreview.overdue, 'INR')}
          icon="mdi:clock-alert-outline"
          titleInfo="Total overdue fees across the selected academic year; unaffected by table filters."
          density="compact"
        />
        <DashboardCard
          title="Students With Overdue Fees"
          value={financeExposurePreview.overdueStudents}
          icon="mdi:account-alert-outline"
          titleInfo="Students with overdue fees across the selected academic year; unaffected by table filters."
          density="compact"
        />
        <DashboardCard
          title="Separate Charges"
          value={formatNumber(financeExposurePreview.separateCharges, 'INR')}
          icon="mdi:receipt-text-outline"
          titleInfo="Separate charges across the selected academic year; unaffected by table filters."
          density="compact"
        />
      </Box>
      <CustomizableTable
        tableId="finance-outstanding-fees-by-class"
        tableTitle="Outstanding Fees by Class"
        columns={outstandingColumns}
        data={rows}
        page={page}
        onPaginationChange={(nextPage) => setPage(nextPage)}
        onSearchInputChange={() => setPage(0)}
        onFiltersChange={() => setPage(0)}
        onSortChange={() => setPage(0)}
        variant="embedded"
        exportScope="all"
        exportContext={[
          'Dashboard preview data',
          `Academic year: ${currentYear?.name ?? 'Selected year'}`,
        ]}
        searchableFields={['className']}
        searchFieldProps={{
          placeholder: 'Search classes...',
          inputProps: { 'aria-label': 'Search outstanding fees by class' },
        }}
        noDataText="No outstanding fees match these filters."
        wrapperProps={{ sx: { minWidth: 0 } }}
        tableContainerProps={{ sx: { maxHeight: 420 } }}
      />
    </FormSectionCard>
  );
}
