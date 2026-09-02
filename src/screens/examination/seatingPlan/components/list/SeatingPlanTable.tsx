import { useResponsive } from 'src/hooks/use-responsive';
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
      noDataText={emptyState}
      isLoading={isLoading}
      handleRowClick={(row) => onRowClick(row as SeatingPlanListRow)}
      columns={buildSeatingPlanColumns(canAdd, onPrimaryAction)}
      data={rows}
      wrapperProps={{ sx: { height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column' } }}
      tableContainerProps={{ sx: { height: '100%' } }}
    />
  );
}
