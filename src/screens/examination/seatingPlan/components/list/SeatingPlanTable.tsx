import Link from 'next/link';
import { Box, Stack } from '@mui/material';
import { useResponsive } from 'src/hooks/use-responsive';
import { academicPaths } from 'src/constants/academic-menu';
import CustomizableTable from 'src/components/customizabaleTable';

import SeatingPlanEmptyState from './SeatingPlanEmptyState';
import SeatingPlanMobileList from './SeatingPlanMobileList';
import { buildSeatingPlanColumns } from './seating-plan-table-columns';

import type { SeatingPlanListRow } from '../../types';

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
        <Stack alignItems="center" spacing={0.5}>
          <Box component="span">
            {isFiltered ? 'No seating plans match this status' : 'Seating Plan Data Not Found'}
          </Box>
          {isFiltered ? (
            <Box
              component="button"
              type="button"
              onClick={onClearFilter}
              sx={{
                border: 0,
                p: 0,
                bgcolor: 'transparent',
                color: 'primary.main',
                font: 'inherit',
                fontWeight: 600,
                cursor: 'pointer',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Clear status filter
            </Box>
          ) : (
            <Box
              component={Link}
              href={academicPaths.examination.schedule}
              sx={{
                color: 'primary.main',
                fontWeight: 600,
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Open examination schedule
            </Box>
          )}
        </Stack>
      }
      isLoading={isLoading}
      handleRowClick={(row) => onRowClick(row as SeatingPlanListRow)}
      columns={buildSeatingPlanColumns(canAdd, onPrimaryAction)}
      data={rows}
      wrapperProps={{
        sx: { height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column' },
      }}
      tableContainerProps={{ sx: { height: '100%' } }}
    />
  );
}
