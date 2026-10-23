import type { DragEndEvent } from '@dnd-kit/core';

import { CSS } from '@dnd-kit/utilities';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { formatNumber } from 'src/utils/formate_number';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, IconButton, Typography } from '@mui/material';
import {
  useSensor,
  DndContext,
  useSensors,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
} from '@dnd-kit/core';
import {
  useSortable,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

export interface SelectedCollectionRow {
  id: string;
  label: string;
  term: string;
  amount: number;
  onRemove?: () => void;
  remainingAmount?: number;
}

interface Props {
  fees: SelectedCollectionRow[];
  charges: SelectedCollectionRow[];
  disabled: boolean;
  onMoveFee: (from: number, to: number) => void;
  onMoveCharge: (from: number, to: number) => void;
  fixedFeeOrder?: boolean;
  showAllocation?: boolean;
  emptyText?: string;
}

const rowLayout = {
  display: 'grid',
  gridTemplateColumns: '24px minmax(0, 1fr) 64px 70px 28px',
  gap: 0.5,
  alignItems: 'center',
  px: 0.5,
} as const;

function SortableRow({
  row,
  disabled,
  order,
}: {
  row: SelectedCollectionRow;
  disabled: boolean;
  order?: number;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: row.id,
    disabled: disabled || order !== undefined,
  });
  const name = row.term === '—' ? row.label : `${row.label}, ${row.term}`;
  return (
    <Box
      ref={setNodeRef}
      role="row"
      aria-label={name}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      sx={{
        ...rowLayout,
        py: 0.75,
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: isDragging ? 'action.hover' : 'background.paper',
        position: 'relative',
        zIndex: isDragging ? 1 : 'auto',
        opacity: isDragging ? 0.7 : 1,
      }}
    >
      <Box role="cell">
        {order !== undefined ? (
          <Typography variant="caption" color="text.secondary">
            {order}
          </Typography>
        ) : (
          <CustomTooltip title={`Drag to reorder ${name}`}>
            <span>
              <IconButton
                {...attributes}
                {...listeners}
                aria-label={`Reorder ${name}`}
                disabled={disabled}
                size="small"
                sx={{ p: 0.5, touchAction: 'none', cursor: isDragging ? 'grabbing' : 'grab' }}
              >
                <Iconify icon="mdi:drag" width={16} />
              </IconButton>
            </span>
          </CustomTooltip>
        )}
      </Box>
      <Typography role="cell" variant="body2" sx={{ overflowWrap: 'anywhere' }}>
        {row.label}
      </Typography>
      <Typography role="cell" variant="caption" color="text.secondary">
        {row.term}
      </Typography>
      <Typography
        role="cell"
        variant="body2"
        sx={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}
      >
        {formatNumber(row.amount, 'INR')}
        {row.remainingAmount !== undefined && (
          <Typography
            component="span"
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block' }}
          >
            Remaining {formatNumber(row.remainingAmount, 'INR')}
          </Typography>
        )}
      </Typography>
      <Box role="cell">
        {row.onRemove && (
          <CustomTooltip title={`Remove ${name} from collection`}>
            <span>
              <IconButton
                aria-label={`Remove ${name} from collection`}
                disabled={disabled}
                size="small"
                onClick={row.onRemove}
                sx={{ p: 0.5, color: 'text.secondary' }}
              >
                <Iconify icon={GlobalIcons.cancel} width={18} />
              </IconButton>
            </span>
          </CustomTooltip>
        )}
      </Box>
    </Box>
  );
}

export default function SelectedCollectionItems({
  fees,
  charges,
  disabled,
  onMoveFee,
  onMoveCharge,
  fixedFeeOrder = false,
  showAllocation = false,
  emptyText = 'Select fees or charges from the ledger to start collecting.',
}: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const group = (rows: SelectedCollectionRow[], name: string, onMove: Props['onMoveFee']) => (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={({ active, over }: DragEndEvent) => {
        if (
          disabled ||
          (fixedFeeOrder && name === 'Selected fees') ||
          !over ||
          active.id === over.id
        )
          return;
        const from = rows.findIndex((row) => row.id === active.id);
        const to = rows.findIndex((row) => row.id === over.id);
        if (from >= 0 && to >= 0) onMove(from, to);
      }}
    >
      <SortableContext items={rows.map((row) => row.id)} strategy={verticalListSortingStrategy}>
        <Box role="rowgroup" aria-label={name}>
          {rows.map((row, index) => (
            <SortableRow
              key={row.id}
              row={row}
              disabled={disabled}
              order={fixedFeeOrder && name === 'Selected fees' ? index + 1 : undefined}
            />
          ))}
        </Box>
      </SortableContext>
    </DndContext>
  );
  return (
    <Box role="table" aria-label="Selected collection items" sx={{ minWidth: 0 }}>
      <Box role="rowgroup" sx={{ bgcolor: 'background.neutral', borderRadius: 1 }}>
        <Box role="row" sx={{ ...rowLayout, py: 0.75 }}>
          {[
            fixedFeeOrder ? 'Order' : 'Reorder',
            'Fee item',
            'Term',
            showAllocation ? 'Pay now' : 'Amount',
            'Remove',
          ].map((label, index) => (
            <Typography
              key={label}
              role="columnheader"
              aria-label={label}
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 600, textAlign: index === 3 ? 'right' : 'left' }}
            >
              {index === 0 || index === 4 ? '' : label}
            </Typography>
          ))}
        </Box>
      </Box>
      {fees.length > 0 && group(fees, 'Selected fees', onMoveFee)}
      {charges.length > 0 && (
        <>
          {fees.length > 0 && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', pt: 1 }}>
              Charges · allocated after fees
            </Typography>
          )}
          {group(charges, 'Selected charges', onMoveCharge)}
        </>
      )}
      {fees.length === 0 && charges.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
          {emptyText}
        </Typography>
      )}
    </Box>
  );
}
