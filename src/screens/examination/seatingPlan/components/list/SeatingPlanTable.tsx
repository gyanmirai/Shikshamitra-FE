import { useResponsive } from 'src/hooks/use-responsive';
import CustomizableTable from 'src/components/customizabaleTable';

import SeatingPlanEmptyState from './SeatingPlanEmptyState';
import SeatingPlanMobileList from './SeatingPlanMobileList';
import { buildSeatingPlanColumns } from './seating-plan-table-columns';

import type { SeatingPlanListRow } from '../../types';
import { Box, Button, Typography } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import Link from 'next/link';
import { academicPaths } from 'src/constants/academic-menu';

interface Props {
  rows: SeatingPlanListRow[];
  isLoading?: boolean;
  canAdd: boolean;
  isFiltered: boolean;
  onClearFilter: () => void;
  onRowClick: (row: SeatingPlanListRow) => void;
  onPrimaryAction: (row: SeatingPlanListRow) => void;
}

export default function SeatingPlanTable({
  rows,
  isLoading,
  canAdd,
  isFiltered,
  onClearFilter,
  onRowClick,
  onPrimaryAction,
}: Props) {
  const isMobile = useResponsive('down', 'md');
  const emptyState = (
    <SeatingPlanEmptyState isFiltered={isFiltered} onClearFilter={onClearFilter} />
  );

  if (isMobile) {
    return (
      <SeatingPlanMobileList
        rows={rows}
        isLoading={isLoading}
        canAdd={canAdd}
        emptyState={emptyState}
        onPreview={onRowClick}
        onPrimaryAction={onPrimaryAction}
      />
    );
  }

  return (
    <CustomizableTable
      tableId="seating-plan-table"
      tableTitle="Examination seating plans"
      noDataText={
        <Box width="100%" display="flex" flexDirection="column" alignItems="center">
          <Typography variant="body1" color="text.secondary" mb={1}>
            {isFiltered ? 'No seating plans match this status' : 'No exams are ready for seating'}
          </Typography>
          {isFiltered ? (
            <Button
              size="small"
              variant="outlined"
              startIcon={<Iconify icon="mdi:filter-remove-outline" />}
              onClick={onClearFilter}
            >
              Clear status filter
            </Button>
          ) : (
            <Button
              component={Link}
              href={academicPaths.examination.schedule}
              size="small"
              variant="contained"
              startIcon={<Iconify icon="mdi:calendar-edit-outline" />}
            >
              Open examination schedule
            </Button>
          )}
        </Box>
      } isLoading={isLoading}
      handleRowClick={(row) => onRowClick(row as SeatingPlanListRow)}
      columns={buildSeatingPlanColumns(canAdd, onPrimaryAction)}
      data={rows}
      wrapperProps={{ sx: { height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column' } }}
      tableContainerProps={{ sx: { height: '100%' } }}
    />
  );
}
